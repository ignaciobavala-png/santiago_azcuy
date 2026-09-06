-- El indice estaba sobre lower(email), una expresion. Postgres no puede usar
-- un indice de expresion para resolver ON CONFLICT (email), asi que el upsert
-- fallaba con 42P10 y no se guardaba ningun lead.
--
-- La route ya normaliza a minusculas antes de escribir, asi que el unique va
-- directo sobre la columna.
drop index if exists public.libro_leads_email_idx;

create unique index libro_leads_email_idx on public.libro_leads (email);
