-- Safe to run after the Simulado 3 setup. Does not modify questions or attempts.
update public.exams
set duration_minutes = 90,
    updated_at = now()
where slug = 'simulado-anatoplus-3';
