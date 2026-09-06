-- ------------------------------------------------------------
-- Carga del canal de YouTube de Santiago (@Santiazcuy), 29 piezas.
--
-- Los titulos se normalizaron: en YouTube arrastran el sufijo "CLIP" o
-- "Full Album" porque ahi no hay secciones que lo digan. Aca la seccion ya lo
-- dice, asi que repetirlo en cada tarjeta era ruido. Los originales estan en el
-- canal si hiciera falta volver atras.
--
-- Criterio de tipo: el marcador del titulo manda, y ademas cualquier pieza de
-- 15 minutos o mas entra como album aunque no lo diga ("Medicina · 432 Hz",
-- 21:01, se escucha como disco, no como tema suelto).
--
-- El audiolibro (19RGiUN_2fY) queda deliberadamente afuera: no es musica, vive
-- en la pagina del libro.
-- ------------------------------------------------------------

alter table public.musica
  add column if not exists miniatura text not null default 'mqdefault';

comment on column public.musica.miniatura is
  'Variante de i.ytimg.com verificada como existente: "maxresdefault" o "mqdefault".';

insert into public.musica (tipo, titulo, recurso, plataforma, duracion, miniatura, orden) values
  ('album','Desintegra · 432 Hz','7bXI3Stp9Vk','youtube','38:44','maxresdefault',1),
  ('album','Constelación 4D · 432 Hz','I0ecKz86Ct8','youtube','35:50','maxresdefault',2),
  ('album','Jai Gurudev Bhajans','jzsuSya_et0','youtube','35:59','maxresdefault',3),
  ('album','Shanti Bhajans','vTn6oDvW6bw','youtube','35:22','maxresdefault',4),
  ('album','Conexión 4D','uU2yx1KIjEk','youtube','34:37','mqdefault',5),
  ('album','Victoria 5D','zTLwhtOLQro','youtube','25:48','maxresdefault',6),
  ('album','Juglar · 432 Hz','S55pzpqY5UI','youtube','23:35','mqdefault',7),
  ('album','Medicina · 432 Hz','My9YYwuMwFA','youtube','21:01','maxresdefault',8),
  ('clip','Desintegra','NPLr3BuKmQU','youtube','1:53','maxresdefault',20),
  ('clip','Mundo Gris','7TewfUUkYsk','youtube','5:19','maxresdefault',21),
  ('clip','Hare Krishna','o1xl-uebeQY','youtube','5:14','maxresdefault',22),
  ('clip','Acercándome al cielo 4D','dBGy7kNGYyQ','youtube','3:39','maxresdefault',23),
  ('clip','Tu magia veo','nFPlVmIdpAs','youtube','2:28','mqdefault',24),
  ('clip','Transgresión','M7HEiFEaOA8','youtube','3:35','mqdefault',25),
  ('clip','Santo lugar','QcsLxYro05k','youtube','3:33','mqdefault',26),
  ('clip','Constant Moment','ItWwaE3OW0U','youtube','5:13','mqdefault',27),
  ('clip','La voz de la consciencia','pdiSNpWjiB8','youtube','3:22','mqdefault',28),
  ('clip','Eclipse lunar','rdCmYnL8LRs','youtube','5:06','mqdefault',29),
  ('tema','Acercándome al cielo · Juglar 432 Hz','siHuoVEaQLw','youtube','3:35','maxresdefault',40),
  ('tema','Tal vez mañana · Juglar 432 Hz','XvkWkGL-FKE','youtube','3:45','maxresdefault',41),
  ('tema','Es por ti · Juglar 432 Hz','dc9WZwFjIEc','youtube','3:21','maxresdefault',42),
  ('tema','Neptuno 5D','r9h1BIjh_7U','youtube','5:43','maxresdefault',43),
  ('tema','Confesiones de invierno','edja08ttmcQ','youtube','4:09','maxresdefault',44),
  ('tema','¡Todo va a estar bien!','P4FHKfFD1ls','youtube','1:54','mqdefault',45),
  ('tema','Ganapati Om Ganesha','Tp5xGmDlcus','youtube','5:08','maxresdefault',46),
  ('tema','Lokah Samastah Sukhino Bhavantu','QKtFIlF9LqU','youtube','5:31','mqdefault',47),
  ('tema','Om Gurú','fuVBiEpkXEY','youtube','5:59','maxresdefault',48),
  ('tema','/Universo Azcuy/','-IMHipuYtL8','youtube','2:55','maxresdefault',49),
  ('entrevista','Entrevista, 2023','Mapv6_mrFCA','youtube','15:40','maxresdefault',60)
on conflict do nothing;
