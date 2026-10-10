import fs from 'node:fs';

const source = JSON.parse(fs.readFileSync(new URL('../anatojson.md', import.meta.url), 'utf8')).exam;
const quote = value => `'${String(value).replaceAll("'", "''")}'`;
const slug = 'simulado-anatoplus-3';
const values = source.questions.map(q => `(
  exam_row.id, ${quote(q.externalId)}, ${q.order}, ${quote(q.text)},
  ${quote(JSON.stringify(q.options))}::jsonb, ${quote(q.correctOptionId)}, ${quote(q.explanation)}, null
)`).join(',\n');
const sql = `-- Generated from anatojson.md. Run after supabase_exam_setup.sql.
do $seed$
declare exam_row public.exams;
begin
  insert into public.exams(slug,title,description,instructions,duration_minutes,max_attempts,shuffle_questions,shuffle_options,show_score_after_submission,show_answers_after_submission,published)
  values(${quote(slug)},${quote(source.title)},${quote(source.description)},${quote(JSON.stringify(source.instructions))}::jsonb,${source.durationMinutes},${source.maxAttempts},${source.shuffleQuestions},${source.shuffleOptions},${source.showScoreAfterSubmission},${source.showAnswersAfterSubmission},true)
  on conflict(slug) do update set title=excluded.title,description=excluded.description,instructions=excluded.instructions,duration_minutes=excluded.duration_minutes,max_attempts=excluded.max_attempts,shuffle_questions=excluded.shuffle_questions,shuffle_options=excluded.shuffle_options,show_score_after_submission=excluded.show_score_after_submission,show_answers_after_submission=excluded.show_answers_after_submission,updated_at=now()
  returning * into exam_row;
  if exists(select 1 from public.exam_attempts where exam_id=exam_row.id) then
    raise exception 'Cannot reseed an exam after attempts exist';
  end if;
  delete from public.exam_questions where exam_id=exam_row.id;
  insert into public.exam_questions(exam_id,external_id,display_order,question_text,options,correct_option_id,explanation,image_url) values
${values};
end $seed$;
`;
fs.writeFileSync(new URL('../supabase_simulado3_seed.sql', import.meta.url), sql);
console.log(`Generated supabase_simulado3_seed.sql with ${source.questions.length} questions.`);
