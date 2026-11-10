-- Agrega videojuegos al catálogo de productos_practica, cada uno con la
-- carátula de su caja, y cambia la imagen de GTA 6 por su portada oficial.
-- Pégalo completo en Supabase → SQL Editor → Run.
--
-- Las carátulas vienen de Wikipedia (upload.wikimedia.org).
-- El descuento va como fracción (0.1 = 10%), igual que en js/prueba.js.
-- Se puede ejecutar más de una vez: el INSERT salta los nombres que ya existen.

begin;

-- 1. GTA 6 (id 7): solo cambia la imagen, el resto queda igual
update public.productos_practica
set image_url = 'https://upload.wikimedia.org/wikipedia/en/4/46/Grand_Theft_Auto_VI.png'
where id = 7;

-- 2. Videojuegos nuevos
insert into public.productos_practica
  ("Nombre", descripcion, precio, unidades, descuento, disponible, categoria, image_url)
select v.* from (values
  ('Grand Theft Auto V',
   'Explora Los Santos con Michael, Franklin y Trevor. Incluye GTA Online',
   129000, 30, 0.40, true, '["videojuegos","mundo abierto"]'::json,
   'https://upload.wikimedia.org/wikipedia/en/a/a5/Grand_Theft_Auto_V.png'),
  ('Red Dead Redemption 2',
   'Vive el ocaso del Viejo Oeste junto a Arthur Morgan y la banda Van der Linde',
   159000, 20, 0.30, true, '["videojuegos","mundo abierto"]'::json,
   'https://upload.wikimedia.org/wikipedia/en/4/44/Red_Dead_Redemption_II.jpg'),
  ('EA Sports FC 26',
   'El fútbol más real, con ligas, clubes y el modo Ultimate Team',
   299000, 25, 0.10, true, '["videojuegos","deportes"]'::json,
   'https://upload.wikimedia.org/wikipedia/en/2/2f/FC_26_Cover.png'),
  ('Zelda: Tears of the Kingdom',
   'Link explora los cielos y las profundidades de Hyrule. Exclusivo de Nintendo Switch',
   289000, 12, 0, true, '["videojuegos","nintendo"]'::json,
   'https://upload.wikimedia.org/wikipedia/en/f/fb/The_Legend_of_Zelda_Tears_of_the_Kingdom_cover.jpg'),
  ('Elden Ring',
   'RPG de acción en las Tierras Intermedias, de FromSoftware',
   199000, 15, 0.20, true, '["videojuegos","rpg"]'::json,
   'https://upload.wikimedia.org/wikipedia/en/b/b9/Elden_Ring_Box_art.jpg'),
  ('Marvel''s Spider-Man 2',
   'Peter Parker y Miles Morales contra Venom en Nueva York. Exclusivo de PS5',
   269000, 18, 0.15, true, '["videojuegos","playstation"]'::json,
   'https://upload.wikimedia.org/wikipedia/en/0/0f/SpiderMan2PS5BoxArt.jpeg'),
  ('Hogwarts Legacy',
   'Asiste a Hogwarts en el siglo XIX y aprende hechizos en un mundo abierto',
   179000, 14, 0.25, true, '["videojuegos","aventura"]'::json,
   'https://upload.wikimedia.org/wikipedia/en/f/fb/Hogwarts_legacyboxart.png'),
  ('Call of Duty: Black Ops 7',
   'Campaña, multijugador y zombis en la nueva entrega de Black Ops',
   319000, 22, 0, true, '["videojuegos","shooter"]'::json,
   'https://upload.wikimedia.org/wikipedia/en/a/a3/Call_of_Duty_Black_Ops_7_Key_Art.png'),
  ('Cyberpunk 2077',
   'RPG de mundo abierto en Night City, con la expansión Phantom Liberty',
   149000, 10, 0.35, true, '["videojuegos","rpg"]'::json,
   'https://upload.wikimedia.org/wikipedia/en/9/9f/Cyberpunk_2077_box_art.jpg'),
  ('Super Mario Bros. Wonder',
   'Mario y sus amigos en un mundo de plataformas lleno de sorpresas',
   259000, 16, 0, true, '["videojuegos","nintendo"]'::json,
   'https://upload.wikimedia.org/wikipedia/en/a/a3/Mariowonder.png'),
  ('God of War Ragnarök',
   'Kratos y Atreus enfrentan el fin del mundo nórdico',
   219000, 0, 0.20, false, '["videojuegos","playstation"]'::json,
   'https://upload.wikimedia.org/wikipedia/en/e/ee/God_of_War_Ragnar%C3%B6k_cover.jpg'),
  ('Mario Kart 8 Deluxe',
   'Carreras para hasta 4 jugadores en la misma consola, con 48 pistas',
   249000, 20, 0.10, true, '["videojuegos","nintendo"]'::json,
   'https://upload.wikimedia.org/wikipedia/en/b/b5/MarioKart8Boxart.jpg'),
  ('Ghost of Yōtei',
   'Aventura de samuráis en el Japón de 1603, alrededor del monte Yōtei. Exclusivo de PS5',
   299000, 8, 0, true, '["videojuegos","playstation"]'::json,
   'https://upload.wikimedia.org/wikipedia/en/1/18/Ghost_of_Y%C5%8Dtei_cover_art.png')
) as v("Nombre", descripcion, precio, unidades, descuento, disponible, categoria, image_url)
where not exists (
  select 1 from public.productos_practica p where p."Nombre" = v."Nombre"
);

commit;

-- Para revisar: deberían salir los 14 videojuegos (GTA 6 + 13 nuevos)
select id, "Nombre", precio, unidades, descuento, image_url
from public.productos_practica
where categoria::text like '%videojuegos%' or id = 7
order by id;
