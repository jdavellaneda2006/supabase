-- Cambia el catálogo de productos_practica a una tienda de videojuegos y gaming.
-- Pégalo completo en Supabase → SQL Editor → Run.
--
-- GTA 6 (id 7) no se toca.
-- Los ids 1, 8, 10, 11 y 12 se reutilizan con productos nuevos (UPDATE)
-- y se agregan 9 productos más (INSERT), para un total de 15.
-- El descuento va como fracción (0.1 = 10%), igual que en js/admin.js.
-- Se puede ejecutar más de una vez: el INSERT salta los nombres que ya existen.

begin;

-- 1. Reemplaza los productos de prueba que había
update public.productos_practica set
  "Nombre" = 'PlayStation 5 Slim',
  descripcion = 'Consola PS5 Slim de 1 TB con lector de discos y control DualSense',
  precio = 2899000, unidades = 8, descuento = 0.10, disponible = true,
  categoria = '["consolas","playstation"]',
  image_url = 'https://images.unsplash.com/photo-1607853202273-797f1c22a38e?w=600'
where id = 1;

update public.productos_practica set
  "Nombre" = 'Xbox Series X',
  descripcion = 'Consola Xbox Series X de 1 TB, juegos en 4K a 120 FPS',
  precio = 2799000, unidades = 5, descuento = 0.05, disponible = true,
  categoria = '["consolas","xbox"]',
  image_url = 'https://images.unsplash.com/photo-1621259182978-fbf93132d53d?w=600'
where id = 8;

update public.productos_practica set
  "Nombre" = 'Nintendo Switch OLED',
  descripcion = 'Pantalla OLED de 7 pulgadas, juega en casa o donde quieras',
  precio = 1699000, unidades = 12, descuento = 0, disponible = true,
  categoria = '["consolas","nintendo"]',
  image_url = 'https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=600'
where id = 10;

update public.productos_practica set
  "Nombre" = 'Control DualSense Blanco',
  descripcion = 'Control inalámbrico para PS5 con gatillos adaptativos',
  precio = 349000, unidades = 20, descuento = 0.15, disponible = true,
  categoria = '["controles","playstation"]',
  image_url = 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=600'
where id = 11;

update public.productos_practica set
  "Nombre" = 'Diadema Gamer RGB 7.1',
  descripcion = 'Sonido envolvente 7.1, micrófono desmontable y luces RGB',
  precio = 289000, unidades = 15, descuento = 0.20, disponible = true,
  categoria = '["audio","periféricos"]',
  image_url = 'https://images.unsplash.com/photo-1629429407756-4a7703614972?w=600'
where id = 12;

-- 2. Agrega los productos nuevos
insert into public.productos_practica
  ("Nombre", descripcion, precio, unidades, descuento, disponible, categoria, image_url)
select v.* from (values
  ('Xbox Series S',
   'Consola digital compacta de 512 GB, ideal para Game Pass',
   1599000, 10, 0.10, true, '["consolas","xbox"]'::json,
   'https://images.unsplash.com/photo-1605901309584-818e25960a8f?w=600'),
  ('Control Inalámbrico Xbox Negro',
   'Control oficial Xbox con Bluetooth, compatible con PC',
   279000, 18, 0, true, '["controles","xbox"]'::json,
   'https://images.unsplash.com/photo-1600861194942-f883de0dfe96?w=600'),
  ('Joy-Con Neón (par)',
   'Par de Joy-Con rojo y azul neón para Nintendo Switch',
   389000, 9, 0.10, true, '["controles","nintendo"]'::json,
   'https://images.unsplash.com/photo-1617096200347-cb04ae810b1d?w=600'),
  ('Control DualShock 4 Azul',
   'Control inalámbrico para PS4 con panel táctil y barra de luz',
   219000, 0, 0.25, false, '["controles","playstation"]'::json,
   'https://images.unsplash.com/photo-1593118247619-e2d6f056869e?w=600'),
  ('Mouse Gamer Logitech G502',
   'Sensor HERO de 25K DPI, 11 botones programables y pesas ajustables',
   229000, 14, 0.12, true, '["periféricos","pc"]'::json,
   'https://images.unsplash.com/photo-1563297007-0686b7003af7?w=600'),
  ('Mouse Inalámbrico G305 Blanco',
   'Mouse ligero inalámbrico LIGHTSPEED con 250 horas de batería',
   169000, 22, 0, true, '["periféricos","pc"]'::json,
   'https://images.unsplash.com/photo-1527814050087-3793815479db?w=600'),
  ('PC Gamer Torre RGB',
   'Ryzen 7, RTX 4070, 32 GB de RAM y refrigeración líquida',
   7499000, 3, 0.08, true, '["pc","equipos"]'::json,
   'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=600'),
  ('Laptop Gamer 15.6" RTX',
   'Portátil con RTX 4060, pantalla de 144 Hz y teclado retroiluminado',
   5299000, 4, 0.10, true, '["pc","equipos"]'::json,
   'https://images.unsplash.com/photo-1640955014216-75201056c829?w=600'),
  ('Consola Retro 8-bit',
   'Consola retro con 500 juegos clásicos y dos controles',
   189000, 25, 0.30, true, '["consolas","retro"]'::json,
   'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600')
) as v("Nombre", descripcion, precio, unidades, descuento, disponible, categoria, image_url)
where not exists (
  select 1 from public.productos_practica p where p."Nombre" = v."Nombre"
);

commit;

-- Para revisar: deberían salir 15 filas
select id, "Nombre", precio, unidades, descuento, disponible
from public.productos_practica
order by id;
