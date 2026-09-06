-- El Aprendiz: la novela en HTML + captura de mails.
-- El PDF de 248 paginas se convierte a texto y se guarda por capitulo: pesa
-- ~440 KB de HTML contra 872 KB del PDF, se lee en el navegador sin descargar
-- nada y es indexable.

create table public.libro_capitulos (
  id            uuid primary key default gen_random_uuid(),
  numero        int,                      -- null para el prologo
  titulo        text not null,
  contenido     text not null,            -- HTML: solo <p>
  palabras      int  not null default 0,
  orden         int  not null,
  creado_at     timestamptz not null default now()
);

create unique index libro_capitulos_orden_idx on public.libro_capitulos (orden);

create table public.libro_leads (
  id            uuid primary key default gen_random_uuid(),
  email         text not null,
  creado_at     timestamptz not null default now()
);

alter table public.libro_capitulos enable row level security;
alter table public.libro_leads     enable row level security;

-- El texto de la novela NO se expone en la API publica: no hay policy de
-- select para anon. Se sirve desde una route del server con la service key,
-- despues de registrar el mail. Sin esto el "dejá tu mail" seria decorativo:
-- cualquiera leeria la novela pegandole directo al endpoint de Supabase.
create policy "admin gestiona capitulos"
  on public.libro_capitulos for all to authenticated using (true) with check (true);

create policy "cualquiera deja su mail"
  on public.libro_leads for insert to anon, authenticated with check (true);

create policy "admin lee los leads"
  on public.libro_leads for select to authenticated using (true);

create policy "admin borra leads"
  on public.libro_leads for delete to authenticated using (true);
