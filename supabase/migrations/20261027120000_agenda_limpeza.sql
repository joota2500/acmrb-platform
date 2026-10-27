-- ==========================================================
-- ACMRB — Agenda a limpeza automática (24 h dos anônimos)
-- ----------------------------------------------------------
-- Rode DEPOIS de 20261027110000_seguranca_limites_auditoria.sql.
-- Pode ser rodado mais de uma vez.
--
-- Usa o pg_cron do Supabase (roda de hora em hora, dentro do banco):
--   • acessos_limpar(24): apaga acessos de quem não fez login após 24 h
--     (antes guarda só totais por dia, sem identificar ninguém)
--   • seguranca_limpar(): apaga contadores velhos e logs com mais de 90 dias
--
-- Se o pg_cron NÃO estiver disponível, este arquivo não dá erro: avisa e
-- você usa a alternativa pronta no código — Vercel Cron chamando
-- /api/cron/limpeza (arquivo vercel.json + variável CRON_SECRET).
-- Para ligar o pg_cron: Supabase → Database → Extensions → pg_cron → Enable.
-- ==========================================================

do $$
begin
  if not exists (select 1 from pg_available_extensions where name = 'pg_cron') then
    raise notice 'pg_cron não está disponível neste projeto. Use o Vercel Cron (/api/cron/limpeza).';
    return;
  end if;

  begin
    create extension if not exists pg_cron;
  exception when others then
    raise notice 'Não foi possível ativar o pg_cron (%). Ative em Database → Extensions ou use o Vercel Cron.', sqlerrm;
    return;
  end;

  -- Reagenda sem duplicar
  perform cron.unschedule(jobid) from cron.job where jobname in ('acmrb_limpar_acessos', 'acmrb_limpar_seguranca');
  perform cron.schedule('acmrb_limpar_acessos', '7 * * * *', $job$select public.acessos_limpar(24)$job$);
  perform cron.schedule('acmrb_limpar_seguranca', '37 3 * * *', $job$select public.seguranca_limpar()$job$);
  raise notice 'pg_cron agendado: acmrb_limpar_acessos (de hora em hora) e acmrb_limpar_seguranca (diário).';
exception when others then
  raise notice 'Agendamento não concluído (%). Use o Vercel Cron como alternativa.', sqlerrm;
end $$;

-- Para conferir depois (só se o pg_cron estiver ativo):
--   select jobname, schedule, active from cron.job where jobname like 'acmrb_%';
