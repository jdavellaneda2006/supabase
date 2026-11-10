-- Pone las fotos elegidas para el PS5 Slim, la Xbox Series X y la torre RGB.
-- Pégalo completo en Supabase → SQL Editor → Run.
--
-- El id 1 vuelve a llamarse "PlayStation 5 Slim", porque la foto nueva es la
-- del modelo Slim. Se puede ejecutar más de una vez.

begin;

update public.productos_practica set
  "Nombre" = 'PlayStation 5 Slim',
  descripcion = 'Consola PS5 Slim de 1 TB con lector de discos y control DualSense',
  image_url = 'https://raw.githubusercontent.com/jdavellaneda2006/supabase/e7ea5b7a42e7078b903bdda262b3dc17d97af051/img/productos/ps5-slim.jpg'
where id = 1;

update public.productos_practica
set image_url = 'https://raw.githubusercontent.com/jdavellaneda2006/supabase/e7ea5b7a42e7078b903bdda262b3dc17d97af051/img/productos/xbox-series-x.jpg'
where id = 8;   -- Xbox Series X

update public.productos_practica
set image_url = 'https://raw.githubusercontent.com/jdavellaneda2006/supabase/e7ea5b7a42e7078b903bdda262b3dc17d97af051/img/productos/pc-gamer-torre.jpg'
where id = 15;  -- PC Gamer Torre RGB

commit;

-- Para revisar
select id, "Nombre", image_url
from public.productos_practica
where id in (1, 8, 15)
order by id;
