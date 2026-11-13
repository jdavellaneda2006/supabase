// ===== Tienda y carrito de compras (cliente.html) =====
// Las cards se dibujan con crearCard() de js/cards.js, igual que en
// admin.html, pero con el botón "Agregar al carrito".
//
// El carrito se guarda en localStorage: así no se pierde al recargar la
// página. Es un array de { id, nombre, precio, cantidad, maximo }, donde
// "precio" ya lleva el descuento aplicado y "maximo" son las unidades que
// hay en la tienda (no se puede pedir más de las que hay).

let productosTienda = [];          // lo último que llegó de Supabase
let carrito = leerCarrito();

function leerCarrito() {
  try {
    return JSON.parse(localStorage.getItem('carrito')) || [];
  } catch {
    return [];   // si lo guardado está dañado, empezamos con el carrito vacío
  }
}

function guardarCarrito() {
  localStorage.setItem('carrito', JSON.stringify(carrito));
}

// ----- Productos de la tienda -----

async function cargarTienda() {
  const lista = document.getElementById('lista-tienda');

  const { data, error } = await db.from('productos_practica').select('*').order('id');

  if (error) {
    lista.innerHTML = '<p class="aviso-tienda">No se pudieron cargar los productos: ' +
      escaparHTML(error.message) + '</p>';
    return;
  }

  productosTienda = data;
  pintarTienda();
}

function pintarTienda() {
  document.getElementById('lista-tienda').innerHTML =
    '<div class="grid-cards">' + productosTienda.map(crearCardTienda).join('') + '</div>';
}

// La card de la tienda: en vez de Editar/Eliminar lleva "Agregar al carrito".
// El botón se desactiva si no hay unidades o si ya están todas en el carrito.
function crearCardTienda(producto) {
  const unidades = producto.unidades ?? 0;
  const enCarrito = carrito.find(item => item.id === producto.id)?.cantidad ?? 0;

  let texto = 'Agregar al carrito';
  let desactivado = '';
  if (!producto.disponible || unidades <= 0) {
    texto = 'Agotado';
    desactivado = 'disabled';
  } else if (enCarrito >= unidades) {
    texto = 'Sin más unidades';
    desactivado = 'disabled';
  } else if (enCarrito > 0) {
    texto = `Agregar otro (${enCarrito} en el carrito)`;
  }

  return crearCard(producto,
    `<button class="btn-agregar-carrito" data-id="${producto.id}" ${desactivado}>${texto}</button>`);
}

// ----- Carrito -----

function agregarAlCarrito(id) {
  const producto = productosTienda.find(p => p.id === id);
  if (!producto) return;

  const item = carrito.find(i => i.id === id);
  if (item) {
    if (item.cantidad < item.maximo) item.cantidad++;
  } else {
    carrito.push({
      id: producto.id,
      nombre: producto.Nombre,
      precio: precioConDescuento(producto),
      cantidad: 1,
      maximo: producto.unidades ?? 0
    });
  }

  actualizarCarrito();
}

// Suma o resta unidades; si llega a 0, el producto sale del carrito
function cambiarCantidad(id, cambio) {
  const item = carrito.find(i => i.id === id);
  if (!item) return;

  item.cantidad = Math.min(item.cantidad + cambio, item.maximo);
  if (item.cantidad <= 0) carrito = carrito.filter(i => i.id !== id);

  actualizarCarrito();
}

function quitarDelCarrito(id) {
  carrito = carrito.filter(i => i.id !== id);
  actualizarCarrito();
}

function vaciarCarrito() {
  carrito = [];
  actualizarCarrito();
}

// Guarda el carrito y vuelve a dibujar todo lo que depende de él
function actualizarCarrito() {
  guardarCarrito();
  pintarCarrito();
  pintarTienda();   // los botones de las cards cambian según lo que hay en el carrito
}

function pintarCarrito() {
  const lista = document.getElementById('lista-carrito');
  const totalUnidades = carrito.reduce((suma, i) => suma + i.cantidad, 0);
  const total = carrito.reduce((suma, i) => suma + i.precio * i.cantidad, 0);

  // Contador del menú: "Carrito (3)"
  document.getElementById('contador-carrito').innerText = totalUnidades;

  if (carrito.length === 0) {
    lista.innerHTML = '<p class="aviso-tienda">Tu carrito está vacío. Agrega productos desde la tienda.</p>';
    document.getElementById('resumen-carrito').hidden = true;
    return;
  }

  lista.innerHTML = carrito.map(item => `
    <div class="item-carrito">
      <span class="item-nombre">${escaparHTML(item.nombre)}</span>
      <span class="item-precio">${formatearPrecio(item.precio)}</span>
      <div class="item-cantidad">
        <button class="btn-cantidad" data-id="${item.id}" data-cambio="-1" aria-label="Quitar una unidad">−</button>
        <span>${item.cantidad}</span>
        <button class="btn-cantidad" data-id="${item.id}" data-cambio="1" aria-label="Agregar una unidad"
          ${item.cantidad >= item.maximo ? 'disabled' : ''}>+</button>
      </div>
      <span class="item-subtotal">${formatearPrecio(item.precio * item.cantidad)}</span>
      <button class="btn-quitar" data-id="${item.id}" aria-label="Quitar ${escaparHTML(item.nombre)}">&times;</button>
    </div>`).join('');

  document.getElementById('total-carrito').innerText = formatearPrecio(total);
  document.getElementById('resumen-carrito').hidden = false;
}

// ----- Eventos -----
// Delegación de eventos (como en admin.js): un solo listener sirve para
// todos los botones, aunque se creen después con innerHTML.
document.addEventListener('click', (evento) => {
  const agregar = evento.target.closest('.btn-agregar-carrito');
  if (agregar) agregarAlCarrito(Number(agregar.dataset.id));

  const cantidad = evento.target.closest('.btn-cantidad');
  if (cantidad) cambiarCantidad(Number(cantidad.dataset.id), Number(cantidad.dataset.cambio));

  const quitar = evento.target.closest('.btn-quitar');
  if (quitar) quitarDelCarrito(Number(quitar.dataset.id));
});

document.getElementById('btn-vaciar-carrito').addEventListener('click', vaciarCarrito);

pintarCarrito();
cargarTienda();
