-- La tabla hero_banner (single-row) fue reemplazada por banners (multi-row pool).
-- Esta migracion limpia la tabla obsoleta.
drop table if exists hero_banner cascade;
