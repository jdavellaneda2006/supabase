// La lectura de productos ahora es una función con nombre, para poder
// volver a llamarla después de editar un producto (y refrescar la lista)
async function cargarProductos() {

  // Mismo "async" que en el Paso 2: esta función necesita "await" para
  // esperar la respuesta real de Supabase antes de seguir.
  const { data, error } = await db.from('productos_practica').select('*');
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

  // Lista completa, con un botón "Editar" por producto
  document.getElementById('lista-productos').innerHTML =
    '<ul>' + data.map(filaProducto).join('') + '</ul>';
}

document.getElementById('btn-traer').addEventListener('click', cargarProductos);

// Arma el <li> de un producto con su botón "Editar". El botón guarda el id
// en data-id para saber qué producto abrir en el modal.
// (?? '—' muestra una raya si el campo viene null en la tabla)
function filaProducto(p) {
  const descuento = p.descuento == null ? '—' : Math.round(p.descuento * 100) + '%';
  return `<li>
    <span>#${p.id} — ${p.Nombre} — $${p.precio} (descuento: ${descuento}) — ${p.unidades ?? '—'} unidades</span>
    <button class="btn-editar" data-id="${p.id}">Editar</button>
  </li>`;
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

// Convierte una lista de productos en <li> para mostrarla en pantalla
function mostrarBusqueda(lista) {
  const div = document.getElementById('resultado-busqueda');
  if (lista.length === 0) {
    div.innerText = 'No se encontraron productos.';
    return;
  }
  div.innerHTML = '<ul>' + lista.map(filaProducto).join('') + '</ul>';
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

  if (error) return null;
  return data[0];
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

  modal.showModal();   // showModal() lo abre encima de todo y oscurece el fondo
}

// Un solo listener para TODOS los botones "Editar", aunque se creen después
// con innerHTML: escuchamos los clics en el documento y revisamos si el
// clic fue en un .btn-editar (esto se llama "delegación de eventos")
document.addEventListener('click', (evento) => {
  const boton = evento.target.closest('.btn-editar');
  if (boton) abrirModalEditar(Number(boton.dataset.id));
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

  const actualizado = await modificarProducto(id, cambios);
  const aviso = document.getElementById('notificacion-mod');

  // Si ningún id coincide, Supabase no da error: devuelve un array vacío
  // y data[0] queda undefined — por eso basta con revisar "actualizado"
  if (actualizado) {
    aviso.innerText = 'Producto #' + actualizado.id + ' modificado: ' + actualizado.Nombre;
    modal.close();
    cargarProductos();   // refresca la lista con los datos nuevos
    document.getElementById('resultado-busqueda').innerHTML = '';   // la búsqueda quedó desactualizada
  } else {
    aviso.innerText = 'No se pudo modificar el producto #' + id + '.';
  }
});
