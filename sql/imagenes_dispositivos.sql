-- Cambia las imágenes de los dispositivos (consolas, controles, periféricos
-- y PC) por fotos de producto con fondo blanco o transparente, y le pone a
-- GTA 6 su nombre completo y una descripción.
-- Pégalo completo en Supabase → SQL Editor → Run.
--
-- Las fotos vienen de Wikimedia Commons (licencias libres).
-- En la diadema y los dos mouse también cambian el nombre y la descripción,
-- para que coincidan con el modelo que aparece en la foto.
-- Se puede ejecutar más de una vez.

begin;

-- 1. GTA 6: nombre completo y descripción
update public.productos_practica set
  "Nombre" = 'Grand Theft Auto VI',
  descripcion = 'Regresa a Vice City con Lucia y Jason en el mundo abierto más grande de Rockstar Games'
where id = 7;

-- 2. Consolas
update public.productos_practica
set image_url = 'https://upload.wikimedia.org/wikipedia/commons/4/4b/Playstation_5_mod%C3%A8le_slim_%28%C3%A9dition_standard_avec_lecteur_de_disque_amovible.png'
where id = 1;   -- PlayStation 5 Slim

update public.productos_practica
set image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/Xbox_Series_X_2.jpg/960px-Xbox_Series_X_2.jpg'
where id = 8;   -- Xbox Series X

update public.productos_practica
set image_url = 'https://upload.wikimedia.org/wikipedia/commons/9/96/Nintendo-Switch-OLED-Docked.jpg'
where id = 10;  -- Nintendo Switch OLED

update public.productos_practica
set image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/54/Xbox_Series_S_with_controller.jpg/960px-Xbox_Series_S_with_controller.jpg'
where id = 18;  -- Xbox Series S

update public.productos_practica
set image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/NES_Classic_Edition_with_controller.jpg/960px-NES_Classic_Edition_with_controller.jpg'
where id = 17;  -- Consola Retro 8-bit

-- 3. Controles
update public.productos_practica
set image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Playstation_DualSense_Controller.png/960px-Playstation_DualSense_Controller.png'
where id = 11;  -- Control DualSense Blanco

update public.productos_practica
set image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Microsoft-Xbox-One-controller.jpg/960px-Microsoft-Xbox-One-controller.jpg'
where id = 21;  -- Control Inalámbrico Xbox Negro

update public.productos_practica
set image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/Nintendo-Switch-wJoyCons-BlRd-Standing-FL.png/960px-Nintendo-Switch-wJoyCons-BlRd-Standing-FL.png'
where id = 16;  -- Joy-Con Neón (par)

update public.productos_practica
set image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Sony_DualShock_4_wireless_controller_%28metallic_blue%29_-_three-quarter_view.jpg/960px-Sony_DualShock_4_wireless_controller_%28metallic_blue%29_-_three-quarter_view.jpg'
where id = 19;  -- Control DualShock 4 Azul

-- 4. Audio y periféricos (nombre y descripción según el modelo de la foto)
update public.productos_practica set
  "Nombre" = 'Diadema Xbox Chat con Micrófono',
  descripcion = 'Diadema ligera de un auricular para hablar con tu equipo en Xbox',
  precio = 99000,
  image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/da/Xbox_One_Chat_Headset.jpg/960px-Xbox_One_Chat_Headset.jpg'
where id = 12;

update public.productos_practica set
  "Nombre" = 'Mouse Gamer Logitech G903',
  descripcion = 'Mouse inalámbrico LIGHTSPEED con sensor HERO de 25K DPI y luces RGB',
  image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/71/2023_Mysz_komputerowa_Logitech_G903_Lightspeed.jpg/960px-2023_Mysz_komputerowa_Logitech_G903_Lightspeed.jpg'
where id = 20;

update public.productos_practica set
  "Nombre" = 'Mouse Gamer CM Storm Inferno',
  descripcion = 'Mouse con 11 botones programables, sensor de 4000 DPI y luz roja',
  image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/CM_Storm_Inferno_Gaming_Mouse.jpg/960px-CM_Storm_Inferno_Gaming_Mouse.jpg'
where id = 13;

-- 5. PC
update public.productos_practica
set image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/NZXT_H500i_case_empty_10-13-2018.jpg/960px-NZXT_H500i_case_empty_10-13-2018.jpg'
where id = 15;  -- PC Gamer Torre RGB

update public.productos_practica
set image_url = 'https://upload.wikimedia.org/wikipedia/commons/6/67/HP_Victus_15_gaming_laptop_side_view.jpg'
where id = 14;  -- Laptop Gamer 15.6" RTX

commit;

-- Para revisar
select id, "Nombre", descripcion, image_url
from public.productos_practica
where id in (1, 7, 8, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21)
order by id;
