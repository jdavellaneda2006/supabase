-- Permite que "Guardar cambios" y "Eliminar" de admin.html funcionen.
-- Pégalo completo en Supabase → SQL Editor → Run.
--
-- Sin esto, el RLS de productos_practica bloquea el UPDATE en silencio:
-- Supabase responde sin error pero con 0 filas cambiadas.
--
-- Solo pueden editar/eliminar los usuarios que hayan iniciado sesión y
-- tengan su fila en la tabla admins (la que llena el registro de
-- admin.html). Se puede ejecutar más de una vez.

begin;

-- 1. ¿El usuario actual es administrador? "security definer" hace que la
--    función consulte admins con permisos del dueño, así funciona aunque
--    el RLS de admins no deje leer esa tabla desde fuera.
create or replace function public.es_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admins where id = auth.uid());
$$;

grant execute on function public.es_admin() to anon, authenticated;

alter table public.productos_practica enable row level security;

-- 2. El catálogo lo puede leer cualquiera (con o sin sesión). Hace falta
--    también para el UPDATE: Postgres solo actualiza filas que puede ver.
drop policy if exists "productos_visibles_para_todos" on public.productos_practica;
create policy "productos_visibles_para_todos"
  on public.productos_practica
  for select
  to anon, authenticated
  using (true);

-- 3. Editar y eliminar: solo admins.
grant update, delete on public.productos_practica to authenticated;

drop policy if exists "admins_editan_productos" on public.productos_practica;
create policy "admins_editan_productos"
  on public.productos_practica
  for update
  to authenticated
  using (public.es_admin())
  with check (public.es_admin());

drop policy if exists "admins_eliminan_productos" on public.productos_practica;
create policy "admins_eliminan_productos"
  on public.productos_practica
  for delete
  to authenticated
  using (public.es_admin());

commit;

notify pgrst, 'reload schema';
