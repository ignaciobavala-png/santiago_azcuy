-- El admin necesita leer y gestionar las consultas recibidas via service_role.
-- La tabla ya tenia politica de insert publico (consultas_public_insert).
create policy "consultas_admin_all"
  on consultas
  to service_role
  using (true)
  with check (true);
