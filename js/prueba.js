document.getElementById('btn-traer').addEventListener('click', async () => {

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
});
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
  div.innerHTML = '<ul>' + lista.map(p =>
    `<li>#${p.id} — ${p.Nombre} — $${p.precio} (descuento: ${p.descuento * 100}%) — ${p.unidades} unidades</li>`
  ).join('') + '</ul>';
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
document.getElementById('form-modificar').addEventListener('submit', async (evento) => {
  evento.preventDefault();
  const id = Number(document.getElementById('input-mod-id').value);

  // Solo metemos en "cambios" los campos que el usuario llenó, para que
  // update() no borre los demás valores de la fila
  const cambios = {};
  const nombre = document.getElementById('input-mod-nombre').value;
  const precio = document.getElementById('input-mod-precio').value;
  const unidades = document.getElementById('input-mod-unidades').value;
  const descuento = document.getElementById('input-mod-descuento').value;

  if (nombre !== '') cambios.Nombre = nombre;
  if (precio !== '') cambios.precio = Number(precio);
  if (unidades !== '') {
    cambios.unidades = Number(unidades);
    cambios.disponible = Number(unidades) > 0;
  }
  if (descuento !== '') cambios.descuento = Number(descuento) / 100;   // % → fracción

  const aviso = document.getElementById('notificacion-mod');
  if (Object.keys(cambios).length === 0) {
    aviso.innerText = 'Escribe al menos un campo para modificar.';
    return;
  }

  const actualizado = await modificarProducto(id, cambios);

  // Si ningún id coincide, Supabase no da error: devuelve un array vacío
  // y data[0] queda undefined — por eso basta con revisar "actualizado"
  if (actualizado) {
    aviso.innerText = 'Producto #' + actualizado.id + ' modificado: ' + actualizado.Nombre;
    evento.target.reset();
  } else {
    aviso.innerText = 'No se pudo modificar el producto #' + id + '.';
  }
});
