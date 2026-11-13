// ===== Acceso de administradores =====
// La página arranca mostrando SOLO el login. La gestión de productos
// (#panel-admin) se muestra cuando hay sesión Y esa cuenta tiene su fila
// en la tabla "admins". Ocultar el panel es solo visual: lo que de verdad
// protege los datos son las políticas RLS de Supabase.

const zonaAcceso   = document.getElementById('zona-acceso-admin');
const panelAdmin   = document.getElementById('panel-admin');
const formLogin    = document.getElementById('form-login-admin');
const formRegistro = document.getElementById('form-registro-admin');
const estadoAdmin  = document.getElementById('estado-sesion-admin');

// Cambia entre el cuadro de login y el de registro
function mostrarFormulario(cual) {
  formLogin.hidden    = cual !== 'login';
  formRegistro.hidden = cual !== 'registro';
}

document.getElementById('btn-ir-registro').addEventListener('click', () => {
  estadoAdmin.innerText = 'Crea tu cuenta de administrador.';
  mostrarFormulario('registro');
});

document.getElementById('btn-ir-login').addEventListener('click', () => {
  estadoAdmin.innerText = 'Inicia sesión para gestionar los productos.';
  mostrarFormulario('login');
});

formRegistro.addEventListener('submit', async (evento) => {
  evento.preventDefault();
  const form = evento.target;

  const { data, error } = await db.auth.signUp({
    email: form.elements['admin-registro-correo'].value,
    password: form.elements['admin-registro-password'].value,
  });

  if (error) {
    estadoAdmin.innerText = 'Error al registrar: ' + error.message;
    return;
  }

  const { error: errorPerfil } = await db.from('admins').insert([{
    id: data.user.id,
    nombre: form.elements['admin-registro-nombre'].value.trim(),
    correo: form.elements['admin-registro-correo'].value.trim(),
  }]);

  if (errorPerfil) {
    estadoAdmin.innerText = 'Cuenta creada, pero falló el perfil: ' + errorPerfil.message;
    return;
  }

  form.reset();

  // Si Supabase ya abrió la sesión al registrar, entramos directo al panel.
  // Si pide confirmar el correo, no hay sesión todavía: volvemos al login.
  if (data.session) {
    mostrarEstadoSesionAdmin();
  } else {
    mostrarFormulario('login');
    estadoAdmin.innerText = 'Cuenta de administrador creada. Ya puedes iniciar sesión.';
  }
});

formLogin.addEventListener('submit', async (evento) => {
  evento.preventDefault();
  const form = evento.target;

  const { error } = await db.auth.signInWithPassword({
    email: form.elements['admin-login-correo'].value,
    password: form.elements['admin-login-password'].value,
  });

  if (error) {
    estadoAdmin.innerText = 'Error al iniciar sesión: ' + error.message;
    return;
  }

  form.reset();
  mostrarEstadoSesionAdmin();
});

// Muestra el login o el panel según la sesión actual
async function mostrarEstadoSesionAdmin() {
  const { data } = await db.auth.getUser();

  if (!data.user) {
    bloquearPanel('Inicia sesión para gestionar los productos.');
    return;
  }

  // Importante: tener sesión no basta — confirmamos que además exista
  // su fila en admins. maybeSingle() devuelve null (sin error) si no hay fila.
  const { data: perfil } = await db
    .from('admins')
    .select('nombre')
    .eq('id', data.user.id)
    .maybeSingle();

  if (!perfil) {
    // Es una cuenta válida pero no de administrador (por ejemplo, un
    // cliente): cerramos su sesión para que pueda entrar con otra
    await db.auth.signOut();
    bloquearPanel('Esa cuenta no es de administrador.');
    return;
  }

  document.getElementById('nombre-admin').innerText = 'Admin: ' + perfil.nombre;
  zonaAcceso.hidden = true;
  panelAdmin.hidden = false;
  cargarProductos();   // el catálogo aparece ya cargado al entrar
}

function bloquearPanel(mensaje) {
  panelAdmin.hidden = true;
  zonaAcceso.hidden = false;
  mostrarFormulario('login');
  estadoAdmin.innerText = mensaje;
}

document.getElementById('btn-logout-admin').addEventListener('click', async () => {
  await db.auth.signOut();
  mostrarEstadoSesionAdmin();
});

mostrarEstadoSesionAdmin();

// La lectura de productos ahora es una función con nombre, para poder
// volver a llamarla después de editar un producto (y refrescar la lista)
async function cargarProductos() {

  // Mismo "async" que en el Paso 2: esta función necesita "await" para
  // esperar la respuesta real de Supabase antes de seguir.
  const { data, error } = await db.from('productos_practica').select('*').order('id');
  // ↑ El código se DETIENE en esta línea hasta que la base de datos
  //   responde. Compáralo con localStorage.getItem('productos'): esa
  //   llamada te devuelve el valor guardado EN EL MISMO INSTANTE, sin
  //   esperar nada, porque no sale de tu computador. Esta línea sí
  //   puede tardar (viaja a internet y vuelve) — por eso necesita await.

  if (error) {
    // Revisamos "error" ANTES de tocar "data": si la consulta falló,
    // "data" llega como null, y usar null más adelante (ej. null.map())
    // rompería el script. Mismo patrón de "validar antes de operar"
    // que ya usaste en el CRUD de la semana 7.
    document.getElementById('resultado').textContent = 'Error: ' + error.message;
    return;
  }

  // Ya no mostramos el JSON completo en la página: #resultado queda solo
  // para errores, así que lo vaciamos por si quedó un error anterior
  document.getElementById('resultado').textContent = '';

 const nombres = data.map(producto => producto.Nombre);
 console.log(nombres);
 const precios = data.map(producto => producto.precio);
 console.log(precios);
 const descuentos = data.map(producto => producto.descuento);
 console.log(descuentos);
  document.getElementById('resultado2').innerHTML =
    '<ul>' + nombres.map(n => `<li>${n}</li>`).join('') + '</ul>';
    document.getElementById('resultado3').innerHTML =
    '<ul>' + precios.map(n => `<li>${n}</li>`).join('') + '</ul>';
  document.getElementById('resultado4').innerHTML =
    '<ul>' + descuentos.map(d => `<li>${d}</li>`).join('') + '</ul>';

  // Cards de todos los productos, cada una con su botón "Editar"
  document.getElementById('lista-productos').innerHTML =
    '<div class="grid-cards">' + data.map(crearCardAdmin).join('') + '</div>';
}

document.getElementById('btn-traer').addEventListener('click', cargarProductos);

// ===== Cards de productos =====
// crearCard(), escaparHTML() y formatearPrecio() están en js/cards.js
// (compartido con la tienda de cliente.html). Aquí solo ponemos los botones
// de administración: Editar y Eliminar. El botón guarda el id en data-id
// para saber qué producto abrir en el modal.
function crearCardAdmin(producto) {
  return crearCard(producto, `
    <button class="btn-editar" data-id="${producto.id}">Editar</button>
    <button class="btn-eliminar" data-id="${producto.id}" data-nombre="${escaparHTML(producto.Nombre)}">Eliminar</button>`);
}
// ANTES (si lo hubieras hecho con localStorage, como en la semana 7):
// (queda comentado: usa siguienteId, productos y guardarProductos, que no
//  existen en este proyecto, y se llama igual que la versión de Supabase)
//
// function agregarProducto(datos) {
//   const nuevo = { id: siguienteId, ...datos };
//   siguienteId++;
//   productos.push(nuevo);
//   guardarProductos();
//   return nuevo;
// }

// AHORA (Supabase):
async function agregarProducto(datos) {

  const { data, error } = await db
    .from('productos_practica')  // la tabla
    .insert([datos])             // insert() siempre recibe un ARRAY de objetos,
                                  // aunque insertes uno solo
    .select();                    // .select() le pide a Supabase que te
                                   // devuelva la fila ya creada (con su id
                                   // nuevo) — sin esto, insert() no te
                                   // devuelve nada útil

  if (error) {
    console.log("Error al agregar:", error);
    return null;
  }

  return data[0];   // data siempre es un array — tomamos el primer
                     // elemento, que es la fila recién creada
}


document.getElementById('form-agregar').addEventListener('submit', async (evento) => {
  evento.preventDefault();   // evita que el formulario recargue la página

  // Los nombres de las propiedades deben coincidir con las columnas de la tabla
  const unidades = Number(document.getElementById('input-unidades').value);
  const producto = {
    Nombre: document.getElementById('input-nombre').value,
    descripcion: document.getElementById('input-descripcion').value,
    precio: Number(document.getElementById('input-precio').value),
    unidades: unidades,
    // En la tabla el descuento se guarda como fracción (0.1 = 10%),
    // así que convertimos el porcentaje que escribe el usuario
    descuento: Number(document.getElementById('input-descuento').value) / 100,
    disponible: unidades > 0
  };

  // "await" solo funciona dentro de una función async, por eso va aquí dentro
  const respuesta = await agregarProducto(producto);

  if (respuesta) {
    document.getElementById('notificacion').innerText = 'Producto agregado con ID: ' + respuesta.id;
    evento.target.reset();
  } else {
    document.getElementById('notificacion').innerText = 'Error al agregar el producto.';
  }
});

// ANTES (localStorage):
// (queda comentado por la misma razón: usa "productos", que no existe aquí)
//
// function buscarProductoPorId(id) {
//   return productos.find(p => p.id === id);
// }
// function buscarProductosPorNombre(texto) {
//   const t = texto.toLowerCase();
//   return productos.filter(p => p.nombre.toLowerCase().includes(t));
// }

// AHORA (Supabase):
async function buscarProductoPorId(id) {
  const { data, error } = await db
    .from('productos_practica')
    .select('*')
    .eq('id', id)    // eq = "equal" (igual a) — equivalente a find(p => p.id === id)
    .single();         // single() = "espero exactamente una fila, dámela
                        // como objeto, no como array de un elemento"

  if (error) return null;
  return data;
}

async function buscarProductosPorNombre(texto) {
  const { data, error } = await db
    .from('productos_practica')
    .select('*')
    .ilike('Nombre', `%${texto}%`);
    // ilike = "like" insensible a mayúsculas/minúsculas.
    // los símbolos % significan "cualquier texto antes/después" —
    // equivalente a .toLowerCase().includes(texto)
    // 'Nombre' con N mayúscula: así se llama la columna en tu tabla
    // (es la misma que lees arriba con producto.Nombre)

  if (error) return [];
  return data;
}

// Convierte una lista de productos en cards para mostrarla en pantalla
function mostrarBusqueda(lista) {
  const div = document.getElementById('resultado-busqueda');
  if (lista.length === 0) {
    div.innerText = 'No se encontraron productos.';
    return;
  }
  div.innerHTML = '<div class="grid-cards">' + lista.map(crearCardAdmin).join('') + '</div>';
}

document.getElementById('form-buscar-id').addEventListener('submit', async (evento) => {
  evento.preventDefault();
  const id = Number(document.getElementById('input-buscar-id').value);
  const producto = await buscarProductoPorId(id);
  // single() devuelve un objeto (o null), así que lo metemos en un array
  // para reutilizar mostrarBusqueda()
  mostrarBusqueda(producto ? [producto] : []);
});

document.getElementById('form-buscar-nombre').addEventListener('submit', async (evento) => {
  evento.preventDefault();
  const texto = document.getElementById('input-buscar-nombre').value;
  const productos = await buscarProductosPorNombre(texto);
  mostrarBusqueda(productos);
});


// ANTES (2 pasos: encontrar posición, luego actualizar):
// (queda comentado: usa "productos" y guardarProductos, que no existen aquí)
//
// function modificarProducto(id, cambios) {
//   const indice = productos.findIndex(p => p.id === id);
//   if (indice === -1) return null;
//   Object.assign(productos[indice], cambios);
//   guardarProductos();
//   return productos[indice];
// }
// AHORA (Supabase resuelve "encontrar y actualizar" en una sola instrucción):
async function modificarProducto(id, cambios) {

  const { data, error } = await db
    .from('productos_practica')
    .update(cambios)   // solo actualiza las propiedades que vengan en "cambios"
    .eq('id', id)        // ...de la fila donde el id coincida
    .select();

  // Devolvemos un objeto con el error para poder mostrar POR QUÉ falló
  if (error) {
    console.log('Error al modificar:', error);
    return { error: error.message };
  }

  // Ojo: si el RLS de Supabase no te deja editar, NO llega un error, sino
  // un array vacío (0 filas cambiadas). Por eso lo revisamos aparte.
  if (data.length === 0) {
    return { error: 'No tienes permiso para editar (inicia sesión con una cuenta admin) o el producto ya no existe.' };
  }

  return { producto: data[0] };
}

// ===== Modal de edición =====
const modal = document.getElementById('modal-editar');

// Abre el modal con los datos ACTUALES del producto (los pide a Supabase
// con buscarProductoPorId, así no editas datos viejos)
async function abrirModalEditar(id) {
  const producto = await buscarProductoPorId(id);
  if (!producto) {
    document.getElementById('notificacion-mod').innerText = 'No se encontró el producto #' + id + '.';
    return;
  }

  document.getElementById('modal-titulo-id').innerText = '#' + producto.id;
  document.getElementById('edit-id').value = producto.id;
  document.getElementById('edit-nombre').value = producto.Nombre ?? '';
  document.getElementById('edit-descripcion').value = producto.descripcion ?? '';
  document.getElementById('edit-precio').value = producto.precio ?? '';
  document.getElementById('edit-unidades').value = producto.unidades ?? '';
  // En la tabla el descuento es fracción (0.1); en el modal se ve como % (10)
  document.getElementById('edit-descuento').value =
    producto.descuento == null ? '' : Math.round(producto.descuento * 100);

  document.getElementById('aviso-editar').innerText = '';   // limpia el aviso anterior
  modal.showModal();   // showModal() lo abre encima de todo y oscurece el fondo
}

// Un solo listener para TODOS los botones "Editar", aunque se creen después
// con innerHTML: escuchamos los clics en el documento y revisamos si el
// clic fue en un .btn-editar (esto se llama "delegación de eventos")
document.addEventListener('click', (evento) => {
  const boton = evento.target.closest('.btn-editar');
  if (boton) abrirModalEditar(Number(boton.dataset.id));

  const botonEliminar = evento.target.closest('.btn-eliminar');
  if (botonEliminar) abrirModalEliminar(Number(botonEliminar.dataset.id), botonEliminar.dataset.nombre);
});

document.getElementById('btn-cancelar').addEventListener('click', () => modal.close());

document.getElementById('form-editar').addEventListener('submit', async (evento) => {
  evento.preventDefault();
  const id = Number(document.getElementById('edit-id').value);
  const unidades = Number(document.getElementById('edit-unidades').value);

  // Como el modal ya trae todos los valores cargados, mandamos todos los campos
  const cambios = {
    Nombre: document.getElementById('edit-nombre').value,
    descripcion: document.getElementById('edit-descripcion').value,
    precio: Number(document.getElementById('edit-precio').value),
    unidades: unidades,
    descuento: Number(document.getElementById('edit-descuento').value) / 100,   // % → fracción
    disponible: unidades > 0
  };

  const resultado = await modificarProducto(id, cambios);

  if (resultado.producto) {
    const actualizado = resultado.producto;
    document.getElementById('notificacion-mod').innerText =
      'Producto #' + actualizado.id + ' modificado: ' + actualizado.Nombre;
    modal.close();
    cargarProductos();   // refresca la lista con los datos nuevos
    document.getElementById('resultado-busqueda').innerHTML = '';   // la búsqueda quedó desactualizada
  } else {
    // El modal sigue abierto, así que el aviso va DENTRO de él
    document.getElementById('aviso-editar').innerText = resultado.error;
  }
});


// ===== Eliminar producto =====
async function eliminarProducto(id) {

  const { data, error } = await db
    .from('productos_practica')
    .delete()
    .eq('id', id)
    .select();   // devuelve las filas borradas: si el RLS lo bloquea, llega vacío

  // true solo si NO hubo error Y de verdad se borró una fila
  return !error && data.length > 0;
}

// Borrar no se puede deshacer, así que antes de llamar a eliminarProducto()
// pedimos confirmación con un segundo modal
const modalEliminar = document.getElementById('modal-eliminar');

function abrirModalEliminar(id, nombre) {
  document.getElementById('eliminar-id').value = id;
  document.getElementById('eliminar-nombre').innerText = '#' + id + ' ' + nombre;
  modalEliminar.showModal();
}

document.getElementById('btn-cancelar-eliminar').addEventListener('click', () => modalEliminar.close());

document.getElementById('form-eliminar').addEventListener('submit', async (evento) => {
  evento.preventDefault();
  const id = Number(document.getElementById('eliminar-id').value);
  const borrado = await eliminarProducto(id);
  const aviso = document.getElementById('notificacion-mod');

  modalEliminar.close();
  if (borrado) {
    aviso.innerText = 'Producto #' + id + ' eliminado.';
    cargarProductos();   // refresca las cards: la del producto borrado desaparece
    document.getElementById('resultado-busqueda').innerHTML = '';
  } else {
    aviso.innerText = 'No se pudo eliminar el producto #' + id + '.';
  }
});
