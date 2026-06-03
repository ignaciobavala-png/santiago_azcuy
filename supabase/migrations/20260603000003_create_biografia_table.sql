create table if not exists biografia (
  id      integer primary key default 1,
  texto   text,
  updated_at timestamptz default now()
);

-- Solo puede existir una fila
create unique index if not exists biografia_single_row on biografia ((id));

-- Insertar fila vacía inicial
insert into biografia (id, texto) values (1, '')
on conflict (id) do nothing;

-- RLS
alter table biografia enable row level security;

create policy "biografia_public_read"
  on biografia for select
  to anon, authenticated
  using (true);
