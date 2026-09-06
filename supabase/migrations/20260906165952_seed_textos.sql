-- Claves de texto que el sitio espera. Contenido vacio: se carga desde el admin.
insert into public.textos (clave, titulo, contenido) values
  ('bio.corta',       'Biografía breve',        ''),
  ('bio.larga',       'Biografía',              ''),
  ('statement',       'Statement',              ''),
  ('libro.sinopsis',  'El Aprendiz — sinopsis', ''),
  ('musica.intro',    'Música',                 ''),
  ('arquitectura.intro','Arquitectura',         ''),
  ('contacto.texto',  'Contacto',               '')
on conflict (clave) do nothing;
