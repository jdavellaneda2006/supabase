-- Permite que cada cliente edite SUS datos desde "Mis datos" (js/cliente.js,
-- función actualizarCliente). Pégalo completo en Supabase → SQL Editor → Run.
--
-- Requiere haber corrido antes arreglar_clientes_prueba.sql (columna auth_id
-- y RLS activado). Se puede ejecutar más de una vez.

begin;

-- 1. Solo se pueden modificar estas 4 columnas. Supabase da por defecto
--    permiso de UPDATE sobre TODA la tabla, así que primero se quita y luego
--    se da solo por columna: así nadie puede cambiarse el rol a 'admin',
--    ni el correo, ni el auth_id, aunque lo intente desde la consola.
revoke update on public."clientes_Prueba" from anon, authenticated;
grant update (nombre, telefono, direccion, ciudad)
  on public."clientes_Prueba" to authenticated;

-- 2. Política de RLS: cada persona solo puede actualizar su propia fila.
--    using      → qué filas puede tocar (las suyas)
--    with check → cómo debe quedar la fila después (sigue siendo suya)
drop policy if exists "clientes_actualizan_su_perfil" on public."clientes_Prueba";
create policy "clientes_actualizan_su_perfil"
  on public."clientes_Prueba"
  for update
  to authenticated
  using (auth.uid() = auth_id)
  with check (auth.uid() = auth_id);

commit;

notify pgrst, 'reload schema';
