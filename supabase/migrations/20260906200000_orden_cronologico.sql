-- ------------------------------------------------------------
-- Orden cronologico de las obras, de la mas nueva a la mas vieja.
--
-- Se reescribe la columna `orden` en vez de cambiar el ORDER BY de las
-- consultas: asi `orden` sigue siendo la unica fuente de verdad y el panel
-- puede pisar cualquier posicion a mano. Si se ordenara por `anio` en la
-- query, el control de orden del admin quedaria muerto.
--
-- Por que no un simple "order by anio desc nulls last": el dato de anio salia
-- del nombre del archivo y no esta parejo. Los dibujos lo traen todos (32/32),
-- los figurativos a medias (44/80) y los abstractos ninguno (0/38). Un orden
-- cronologico global mandaria los 38 abstractos en bloque al final: eso no es
-- cronologia, es "los que no tienen el dato, ultimos", y hunde justo la parte
-- mas distintiva de la obra por un accidente de como se nombraron los archivos.
--
-- Entonces: cada categoria se ordena cronologicamente por su cuenta, y las tres
-- listas se intercalan en proporcion a su tamano. Cada obra recibe su posicion
-- relativa dentro de su categoria como fraccion de 0 a 1, y el orden global
-- sale de esa fraccion. Filtrando por categoria se ve cronologia pura;
-- en "Todo" las tres avanzan a la par y ninguna queda arrinconada.
-- ------------------------------------------------------------

with posicion as (
  select
    id,
    categoria,
    -- Dentro de la categoria: mas nueva primero. Las que no tienen anio van al
    -- final de SU categoria, conservando el orden que ya tenian entre ellas.
    (row_number() over (
       partition by categoria
       order by anio desc nulls last, orden, slug
     ) - 0.5)
    / count(*) over (partition by categoria) as fraccion
  from public.obras
),
global as (
  select id, row_number() over (order by fraccion, categoria) as nuevo
  from posicion
)
update public.obras o
set orden = g.nuevo
from global g
where o.id = g.id;
