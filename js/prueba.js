document.getElementById('btn-agregar').addEventListener('click', async () => {
  const nombre = document.getElementById('input-nombre').value.trim();
  const precio = Number(document.getElementById('input-precio').value);
  // La imagen es opcional: si el campo queda vacío guardamos null.
  const image_url = document.getElementById('input-imagen').value.trim() || null;
  const mensaje = document.getElementById('mensaje');

  // Validamos antes de enviar: sin nombre o con precio inválido no
  // tiene sentido gastar un viaje a Supabase.
  if (!nombre || isNaN(precio) || precio < 0) {
    mensaje.textContent = 'Escribe un nombre y un precio válido.';
    return;
  }

  // insert() recibe un array de filas; las llaves deben coincidir con
  // los nombres de las columnas de la tabla ("Nombre" con N mayúscula).
  // .select() hace que Supabase devuelva la fila recién creada,
  // así podemos leer el id que le asignó la base de datos.
  const { data, error } = await db.from('productos_practica').insert([{ Nombre: nombre, precio, image_url }]).select();

  if (error) {
    mensaje.textContent = 'Error: ' + error.message;
    return;
  }

  mensaje.textContent = 'Producto agregado a id: ' + data[0].id;
  document.getElementById('input-nombre').value = '';
  document.getElementById('input-precio').value = '';
  document.getElementById('input-imagen').value = '';
  // Volvemos a traer la lista para que se vea el producto nuevo.
  document.getElementById('btn-traer').click();
  mostrarProductos();
});

// Producto escrito directamente en el código: las llaves del objeto
// son los nombres de las columnas de la tabla productos_practica.
const productoNuevo = {
  Nombre: 'Reloj Inteligente S10',
  descripcion: 'Reloj inteligente con monitor de ritmo cardíaco y GPS',
  precio: 320000,
  unidades: 15,
  descuento: 0.05,
  disponible: true,
  categoria: ['tecnología', 'accesorios'],
  image_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600'
};

document.getElementById('btn-producto-nuevo').addEventListener('click', async () => {
  const mensaje = document.getElementById('mensaje');

  // Antes de insertar buscamos si ya hay un producto con ese nombre;
  // así el botón no crea una copia nueva cada vez que se pulsa.
  const { data: existentes, error: errorBusqueda } = await db
    .from('productos_practica')
    .select('id')
    .eq('Nombre', productoNuevo.Nombre);

  if (errorBusqueda) {
    mensaje.textContent = 'Error: ' + errorBusqueda.message;
    return;
  }

  if (existentes.length > 0) {
    mensaje.textContent = 'El producto ya existe en id: ' + existentes[0].id;
    return;
  }

  const { data, error } = await db.from('productos_practica').insert([productoNuevo]).select();

  if (error) {
    mensaje.textContent = 'Error: ' + error.message;
    return;
  }

  mensaje.textContent = 'Producto agregado a id: ' + data[0].id;
  document.getElementById('btn-traer').click();
  mostrarProductos();
});

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

  // Si antes hubo un error, lo borramos ahora que la consulta funcionó.
  document.getElementById('resultado').textContent = '';

 const nombres = data.map(producto => producto.Nombre);
 console.log(nombres);
 const precios = data.map(producto => producto.precio);
 console.log(precios);

  document.getElementById('resultado2').innerHTML =
    '<ul>' + nombres.map(n => `<li>${n}</li>`).join('') + '</ul>';
    document.getElementById('resultado3').innerHTML =
    '<ul>' + precios.map(n => `<li>${n}</li>`).join('') + '</ul>';
});


// ===== READ del CRUD: productos como cards =====

// Los datos vienen de la base de datos y los metemos en innerHTML, así
// que escapamos los caracteres especiales: si un nombre trae "<script>",
// se muestra como texto en vez de ejecutarse.
function escaparHTML(texto) {
  return String(texto ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// 320000 → "$ 320.000" (formato de pesos colombianos)
function formatearPrecio(valor) {
  return Number(valor).toLocaleString('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0
  });
}

// Recibe UN producto (una fila de la tabla) y devuelve el HTML de su card.
function crearCard(producto) {
  const descuento = Number(producto.descuento) || 0;
  const precioFinal = producto.precio * (1 - descuento);

  // Solo usamos la imagen si es un enlace http(s) válido.
  const tieneImagen = /^https?:\/\//.test(producto.image_url || '');
  const imagen = tieneImagen
    ? `<img src="${escaparHTML(producto.image_url)}" alt="${escaparHTML(producto.Nombre)}">`
    : `<div class="card-sin-imagen">Sin imagen</div>`;

  const etiquetaDescuento = descuento > 0
    ? `<span class="card-descuento">-${Math.round(descuento * 100)}%</span>`
    : '';

  // Si hay descuento mostramos el precio original tachado.
  const precio = descuento > 0
    ? `<s>${formatearPrecio(producto.precio)}</s>${formatearPrecio(precioFinal)}`
    : formatearPrecio(producto.precio);

  const categorias = (producto.categoria || [])
    .map(c => `<span>${escaparHTML(c)}</span>`)
    .join('');

  const estado = producto.disponible
    ? '<span class="disponible">● Disponible</span>'
    : '<span class="agotado">● Agotado</span>';

  return `
    <article class="card">
      <div class="card-imagen">${imagen}${etiquetaDescuento}</div>
      <div class="card-cuerpo">
        <h3>${escaparHTML(producto.Nombre)}</h3>
        ${producto.descripcion ? `<p class="card-descripcion">${escaparHTML(producto.descripcion)}</p>` : ''}
        <div class="card-categorias">${categorias}</div>
        <div class="card-precio">${precio}</div>
        <div class="card-pie">
          ${estado}
          <span>${producto.unidades ?? 0} unidades</span>
        </div>
      </div>
    </article>`;
}

async function mostrarProductos() {
  const contenedor = document.getElementById('productos');
  const mensaje = document.getElementById('mensaje-productos');

  mensaje.textContent = 'Cargando productos...';

  // order('id') para que las cards salgan siempre en el mismo orden.
  const { data, error } = await db.from('productos_practica').select('*').order('id');

  if (error) {
    mensaje.textContent = 'Error: ' + error.message;
    return;
  }

  if (data.length === 0) {
    mensaje.textContent = 'No hay productos todavía.';
    contenedor.innerHTML = '';
    return;
  }

  mensaje.textContent = data.length + ' productos';
  // map() convierte cada producto en el HTML de su card; join('') las une.
  contenedor.innerHTML = data.map(crearCard).join('');
}

document.getElementById('btn-ver').addEventListener('click', mostrarProductos);

//espacio para formulario de agregar producto
document.getElementById('form-producto').addEventListener('submit', async (evento) => {
  // Sin esto el navegador recarga la página al enviar el formulario.
  evento.preventDefault();

  const form = evento.target;
  const mensaje = document.getElementById('mensaje-form');

  // Armamos un objeto con la MISMA forma que productoNuevo, pero con
  // los valores escritos en el formulario. Los inputs siempre entregan
  // texto, por eso convertimos números, el checkbox y las categorías.
  const producto = {
    Nombre: form.Nombre.value.trim(),
    descripcion: form.descripcion.value.trim() || null,
    precio: Number(form.precio.value),
    unidades: Number(form.unidades.value),
    descuento: Number(form.descuento.value),
    disponible: form.disponible.checked,
    categoria: form.categoria.value.split(',').map(c => c.trim()).filter(c => c !== ''),
    image_url: form.image_url.value.trim() || null
  };

  // Igual que con productoNuevo: no insertamos si el nombre ya existe.
  const { data: existentes, error: errorBusqueda } = await db
    .from('productos_practica')
    .select('id')
    .eq('Nombre', producto.Nombre);

  if (errorBusqueda) {
    mensaje.textContent = 'Error: ' + errorBusqueda.message;
    return;
  }

  if (existentes.length > 0) {
    mensaje.textContent = 'El producto ya existe en id: ' + existentes[0].id;
    return;
  }

  const { data, error } = await db.from('productos_practica').insert([producto]).select();

  if (error) {
    mensaje.textContent = 'Error: ' + error.message;
    return;
  }

  mensaje.textContent = 'Producto agregado a id: ' + data[0].id;
  form.reset();
  document.getElementById('btn-traer').click();
  mostrarProductos();
});
