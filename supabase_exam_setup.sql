-- Run this file once in the Supabase SQL Editor before the generated seed file.
create extension if not exists pgcrypto;

create table if not exists public.exams (
  id uuid primary key default gen_random_uuid(), slug text unique not null, title text not null,
  description text not null default '', instructions jsonb not null default '[]',
  duration_minutes int not null check (duration_minutes > 0), max_attempts int not null default 1 check (max_attempts > 0),
  shuffle_questions boolean not null default false, shuffle_options boolean not null default false,
  show_score_after_submission boolean not null default true, show_answers_after_submission boolean not null default false,
  opens_at timestamptz, closes_at timestamptz, published boolean not null default false,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.exam_questions (
  id uuid primary key default gen_random_uuid(), exam_id uuid not null references public.exams(id) on delete cascade,
  external_id text not null, display_order int not null, question_text text not null,
  options jsonb not null, correct_option_id text not null, explanation text not null default '', image_url text,
  unique(exam_id, external_id), unique(exam_id, display_order)
);
create table if not exists public.exam_attempts (
  id uuid primary key default gen_random_uuid(), exam_id uuid not null references public.exams(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'in_progress' check(status in ('in_progress','submitted','expired')),
  started_at timestamptz not null default now(), submitted_at timestamptz, score int, total_questions int not null default 0,
  unique(exam_id,user_id,started_at)
);
create table if not exists public.exam_answers (
  attempt_id uuid not null references public.exam_attempts(id) on delete cascade,
  question_id uuid not null references public.exam_questions(id) on delete cascade,
  selected_option_id text not null, is_correct boolean, saved_at timestamptz not null default now(),
  primary key(attempt_id,question_id)
);
create table if not exists public.exam_attempt_allowances (
  exam_id uuid not null references public.exams(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  additional_attempts int not null default 0 check(additional_attempts >= 0),
  updated_at timestamptz not null default now(), primary key(exam_id,user_id)
);
create index if not exists exam_attempts_user_idx on public.exam_attempts(user_id,exam_id);
create index if not exists exam_answers_attempt_idx on public.exam_answers(attempt_id);

alter table public.exams enable row level security;
alter table public.exam_questions enable row level security;
alter table public.exam_attempts enable row level security;
alter table public.exam_answers enable row level security;
alter table public.exam_attempt_allowances enable row level security;
revoke all on public.exams, public.exam_questions, public.exam_attempts, public.exam_answers, public.exam_attempt_allowances from anon, authenticated;

create or replace function public.is_exam_admin() returns boolean language sql stable security definer set search_path=public as $$
  select exists(select 1 from profiles where id=auth.uid() and role='admin');
$$;

create or replace function public.get_published_exam(p_slug text) returns jsonb language plpgsql security definer set search_path=public as $$
declare e exams; result jsonb; a exam_attempts; attempt_json jsonb; review_json jsonb := '[]'; used int; allowed int;
begin
  select * into e from exams where slug=p_slug and published and (opens_at is null or opens_at<=now()) and (closes_at is null or closes_at>=now());
  if not found then return null; end if;
  select * into a from exam_attempts where exam_id=e.id and user_id=auth.uid() order by started_at desc limit 1;
  select count(*) into used from exam_attempts where exam_id=e.id and user_id=auth.uid();
  allowed:=e.max_attempts+coalesce((select additional_attempts from exam_attempt_allowances where exam_id=e.id and user_id=auth.uid()),0);
  if found then
    if a.status='in_progress' and a.started_at+make_interval(mins=>e.duration_minutes)<=now() then
      update exam_answers x set is_correct=(x.selected_option_id=q.correct_option_id) from exam_questions q where x.attempt_id=a.id and q.id=x.question_id;
      update exam_attempts set status='expired',submitted_at=now(),score=(select count(*) from exam_answers where attempt_id=a.id and is_correct) where id=a.id returning * into a;
    end if;
    attempt_json:=jsonb_build_object('id',a.id,'examId',a.exam_id,'status',a.status,'startedAt',a.started_at,'submittedAt',a.submitted_at,'score',case when e.show_score_after_submission then a.score else null end,'totalQuestions',a.total_questions,'answers',coalesce((select jsonb_object_agg(question_id,selected_option_id) from exam_answers where attempt_id=a.id),'{}'));
    if e.show_answers_after_submission and a.status<>'in_progress' then
      select coalesce(jsonb_agg(jsonb_build_object('externalId',q.external_id,'order',q.display_order,'text',q.question_text,'selectedOptionId',x.selected_option_id,'selectedText',(select o->>'text' from jsonb_array_elements(q.options)o where o->>'id'=x.selected_option_id),'correctOptionId',q.correct_option_id,'correctText',(select o->>'text' from jsonb_array_elements(q.options)o where o->>'id'=q.correct_option_id),'isCorrect',coalesce(x.is_correct,false),'explanation',q.explanation) order by q.display_order),'[]') into review_json from exam_questions q left join exam_answers x on x.question_id=q.id and x.attempt_id=a.id where q.exam_id=e.id;
    end if;
  end if;
  select jsonb_build_object('exam',jsonb_build_object('id',e.id,'title',e.title,'description',e.description,'instructions',e.instructions,'durationMinutes',e.duration_minutes,'maxAttempts',e.max_attempts,'showScoreAfterSubmission',e.show_score_after_submission,'showAnswersAfterSubmission',e.show_answers_after_submission,'questionCount',count(q.id)),
    'questions',coalesce(jsonb_agg(jsonb_build_object('id',q.id,'externalId',q.external_id,'order',q.display_order,'text',q.question_text,'options',q.options,'imageUrl',q.image_url) order by q.display_order),'[]'),'latestAttempt',attempt_json,'review',review_json,'canStartNew',used<allowed) into result
  from exam_questions q where q.exam_id=e.id;
  return result;
end $$;

create or replace function public.start_exam_attempt(p_exam_id uuid) returns jsonb language plpgsql security definer set search_path=public as $$
declare e exams; a exam_attempts; used int;
begin
  if auth.uid() is null then raise exception 'Debes iniciar sesión'; end if;
  select * into e from exams where id=p_exam_id and published and (opens_at is null or opens_at<=now()) and (closes_at is null or closes_at>=now());
  if not found then raise exception 'El simulado no está disponible'; end if;
  select * into a from exam_attempts where exam_id=p_exam_id and user_id=auth.uid() and status='in_progress' order by started_at desc limit 1;
  if found and a.started_at + make_interval(mins=>e.duration_minutes) > now() then
    return jsonb_build_object('id',a.id,'examId',a.exam_id,'status',a.status,'startedAt',a.started_at,'totalQuestions',a.total_questions,'answers',coalesce((select jsonb_object_agg(question_id,selected_option_id) from exam_answers where attempt_id=a.id),'{}'));
  elsif found then update exam_attempts set status='expired',submitted_at=now() where id=a.id; end if;
  select count(*) into used from exam_attempts where exam_id=p_exam_id and user_id=auth.uid();
  if used>=e.max_attempts+coalesce((select additional_attempts from exam_attempt_allowances where exam_id=p_exam_id and user_id=auth.uid()),0) then raise exception 'Ya utilizaste todos los intentos permitidos'; end if;
  insert into exam_attempts(exam_id,user_id,total_questions) values(p_exam_id,auth.uid(),(select count(*) from exam_questions where exam_id=p_exam_id)) returning * into a;
  return jsonb_build_object('id',a.id,'examId',a.exam_id,'status',a.status,'startedAt',a.started_at,'totalQuestions',a.total_questions,'answers','{}'::jsonb);
end $$;

create or replace function public.save_exam_answer(p_attempt_id uuid,p_question_id uuid,p_option_id text) returns void language plpgsql security definer set search_path=public as $$
declare a exam_attempts; e exams; q exam_questions;
begin
 select * into a from exam_attempts where id=p_attempt_id and user_id=auth.uid() and status='in_progress'; if not found then raise exception 'Intento inválido'; end if;
 select * into e from exams where id=a.exam_id; if a.started_at+make_interval(mins=>e.duration_minutes)<=now() then perform submit_exam_attempt(a.id); raise exception 'El tiempo terminó'; end if;
 select * into q from exam_questions where id=p_question_id and exam_id=a.exam_id; if not found or not(q.options @> jsonb_build_array(jsonb_build_object('id',p_option_id))) then raise exception 'Opción inválida'; end if;
 insert into exam_answers(attempt_id,question_id,selected_option_id,is_correct,saved_at) values(a.id,q.id,p_option_id,null,now()) on conflict(attempt_id,question_id) do update set selected_option_id=excluded.selected_option_id,is_correct=null,saved_at=now();
end $$;

create or replace function public.submit_exam_attempt(p_attempt_id uuid) returns jsonb language plpgsql security definer set search_path=public as $$
declare a exam_attempts; e exams;
begin
 select * into a from exam_attempts where id=p_attempt_id and user_id=auth.uid(); if not found then raise exception 'Intento inválido'; end if;
 select * into e from exams where id=a.exam_id;
 update exam_answers x set is_correct=(x.selected_option_id=q.correct_option_id) from exam_questions q where x.attempt_id=a.id and q.id=x.question_id;
 update exam_attempts set status=case when started_at+make_interval(mins=>e.duration_minutes)<now() then 'expired' else 'submitted' end,submitted_at=coalesce(submitted_at,now()),score=(select count(*) from exam_answers where attempt_id=a.id and is_correct) where id=a.id returning * into a;
 return jsonb_build_object('id',a.id,'examId',a.exam_id,'status',a.status,'startedAt',a.started_at,'submittedAt',a.submitted_at,'score',case when e.show_score_after_submission then a.score else null end,'totalQuestions',a.total_questions,'answers','{}'::jsonb);
end $$;

create or replace function public.admin_exam_results() returns jsonb language plpgsql security definer set search_path=public as $$
begin if not is_exam_admin() then raise exception 'Acceso denegado'; end if;
 return coalesce((select jsonb_agg(jsonb_build_object('attemptId',a.id,'examId',e.id,'userId',a.user_id,'examTitle',e.title,'resultsPublished',e.show_answers_after_submission,'studentName',coalesce(p.full_name,p.email),'studentEmail',p.email,'status',a.status,'score',a.score,'totalQuestions',a.total_questions,'startedAt',a.started_at,'submittedAt',a.submitted_at) order by a.started_at desc) from exam_attempts a join exams e on e.id=a.exam_id left join profiles p on p.id=a.user_id),'[]'); end $$;

create or replace function public.admin_exam_attempt_detail(p_attempt_id uuid) returns jsonb language plpgsql security definer set search_path=public as $$
begin if not is_exam_admin() then raise exception 'Acceso denegado'; end if;
 return jsonb_build_object('attemptId',p_attempt_id,'questions',coalesce((select jsonb_agg(jsonb_build_object('externalId',q.external_id,'order',q.display_order,'text',q.question_text,'selectedOptionId',a.selected_option_id,'selectedText',(select o->>'text' from jsonb_array_elements(q.options)o where o->>'id'=a.selected_option_id),'correctOptionId',q.correct_option_id,'correctText',(select o->>'text' from jsonb_array_elements(q.options)o where o->>'id'=q.correct_option_id),'isCorrect',coalesce(a.is_correct,false)) order by q.display_order) from exam_attempts t join exam_questions q on q.exam_id=t.exam_id left join exam_answers a on a.attempt_id=t.id and a.question_id=q.id where t.id=p_attempt_id),'[]'));
end $$;

create or replace function public.admin_publish_exam_results(p_exam_id uuid,p_published boolean) returns void language plpgsql security definer set search_path=public as $$
begin if not is_exam_admin() then raise exception 'Acceso denegado'; end if; update exams set show_answers_after_submission=p_published,updated_at=now() where id=p_exam_id; end $$;
create or replace function public.admin_grant_exam_retry(p_exam_id uuid,p_user_id uuid) returns void language plpgsql security definer set search_path=public as $$
begin if not is_exam_admin() then raise exception 'Acceso denegado'; end if; insert into exam_attempt_allowances(exam_id,user_id,additional_attempts) values(p_exam_id,p_user_id,1) on conflict(exam_id,user_id) do update set additional_attempts=exam_attempt_allowances.additional_attempts+1,updated_at=now(); end $$;
revoke all on function public.get_published_exam(text),public.start_exam_attempt(uuid),public.save_exam_answer(uuid,uuid,text),public.submit_exam_attempt(uuid),public.admin_exam_results(),public.admin_exam_attempt_detail(uuid),public.admin_publish_exam_results(uuid,boolean),public.admin_grant_exam_retry(uuid,uuid) from public, anon;
grant execute on function public.get_published_exam(text),public.start_exam_attempt(uuid),public.save_exam_answer(uuid,uuid,text),public.submit_exam_attempt(uuid),public.admin_exam_results(),public.admin_exam_attempt_detail(uuid),public.admin_publish_exam_results(uuid,boolean),public.admin_grant_exam_retry(uuid,uuid) to authenticated;
