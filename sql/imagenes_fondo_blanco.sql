-- Cambia las fotos de los 14 dispositivos por versiones con fondo blanco,
-- centradas en 800x600 para que la card 4:3 las muestre completas.
-- Pégalo completo en Supabase → SQL Editor → Run.
--
-- Las imágenes están en img/productos/ de este repositorio y se sirven desde
-- GitHub con la URL fijada a un commit, para que no cambien ni se rompan.
-- Se puede ejecutar más de una vez.

begin;

-- Consolas
update public.productos_practica set
  "Nombre" = 'PlayStation 5',
  descripcion = 'Consola PS5 de 825 GB con lector de discos y control DualSense',
  image_url = 'https://raw.githubusercontent.com/jdavellaneda2006/supabase/ca5bdb8e4e6362060477a4164abb4823919659b8/img/productos/playstation-5.jpg'
where id = 1;

update public.productos_practica
set image_url = 'https://raw.githubusercontent.com/jdavellaneda2006/supabase/ca5bdb8e4e6362060477a4164abb4823919659b8/img/productos/xbox-series-x.jpg'
where id = 8;

update public.productos_practica
set image_url = 'https://raw.githubusercontent.com/jdavellaneda2006/supabase/ca5bdb8e4e6362060477a4164abb4823919659b8/img/productos/nintendo-switch-oled.jpg'
where id = 10;

update public.productos_practica
set image_url = 'https://raw.githubusercontent.com/jdavellaneda2006/supabase/ca5bdb8e4e6362060477a4164abb4823919659b8/img/productos/xbox-series-s.jpg'
where id = 18;

update public.productos_practica
set image_url = 'https://raw.githubusercontent.com/jdavellaneda2006/supabase/ca5bdb8e4e6362060477a4164abb4823919659b8/img/productos/consola-retro.jpg'
where id = 17;

-- Controles
update public.productos_practica
set image_url = 'https://raw.githubusercontent.com/jdavellaneda2006/supabase/ca5bdb8e4e6362060477a4164abb4823919659b8/img/productos/control-dualsense.jpg'
where id = 11;

update public.productos_practica
set image_url = 'https://raw.githubusercontent.com/jdavellaneda2006/supabase/ca5bdb8e4e6362060477a4164abb4823919659b8/img/productos/control-xbox-negro.jpg'
where id = 21;

update public.productos_practica
set image_url = 'https://raw.githubusercontent.com/jdavellaneda2006/supabase/ca5bdb8e4e6362060477a4164abb4823919659b8/img/productos/joy-con-neon.jpg'
where id = 16;

update public.productos_practica set
  "Nombre" = 'Control DualShock 4 Negro',
  image_url = 'https://raw.githubusercontent.com/jdavellaneda2006/supabase/ca5bdb8e4e6362060477a4164abb4823919659b8/img/productos/control-dualshock4.jpg'
where id = 19;

-- Audio y periféricos
update public.productos_practica
set image_url = 'https://raw.githubusercontent.com/jdavellaneda2006/supabase/ca5bdb8e4e6362060477a4164abb4823919659b8/img/productos/diadema-xbox-chat.jpg'
where id = 12;

update public.productos_practica
set image_url = 'https://raw.githubusercontent.com/jdavellaneda2006/supabase/ca5bdb8e4e6362060477a4164abb4823919659b8/img/productos/mouse-logitech-g903.jpg'
where id = 20;

update public.productos_practica
set image_url = 'https://raw.githubusercontent.com/jdavellaneda2006/supabase/ca5bdb8e4e6362060477a4164abb4823919659b8/img/productos/mouse-cm-storm-inferno.jpg'
where id = 13;

-- PC
update public.productos_practica
set image_url = 'https://raw.githubusercontent.com/jdavellaneda2006/supabase/ca5bdb8e4e6362060477a4164abb4823919659b8/img/productos/pc-gamer-torre.jpg'
where id = 15;

update public.productos_practica
set image_url = 'https://raw.githubusercontent.com/jdavellaneda2006/supabase/ca5bdb8e4e6362060477a4164abb4823919659b8/img/productos/laptop-gamer.jpg'
where id = 14;

commit;

-- Para revisar: deberían salir 14 filas
select id, "Nombre", image_url
from public.productos_practica
where image_url like '%raw.githubusercontent.com%'
order by id;
