// ===== Cards de productos: compartidas por admin.html y cliente.html =====
// Cada página decide qué botones lleva la card (Editar/Eliminar en admin,
// "Agregar al carrito" en la tienda) y se los pasa a crearCard().

// Evita que un texto de la tabla (ej. un nombre con "<") se interprete como
// HTML al meterlo con innerHTML
function escaparHTML(texto) {
  return String(texto ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatearPrecio(valor) {
  return Number(valor).toLocaleString('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0
  });
}

// Precio con el descuento aplicado (en la tabla el descuento es fracción: 0.1 = 10%)
function precioConDescuento(producto) {
  const descuento = Number(producto.descuento) || 0;
  return producto.precio * (1 - descuento);
}

// Arma la card de un producto. "botones" es el HTML de los botones que van
// al final de la card (cada página pone los suyos).
function crearCard(producto, botones = '') {
  const descuento = Number(producto.descuento) || 0;
  const precioFinal = precioConDescuento(producto);

  const tieneImagen = /^https?:\/\//.test(producto.image_url || '');
  const imagen = tieneImagen
    ? `<img src="${escaparHTML(producto.image_url)}" alt="${escaparHTML(producto.Nombre)}">`
    : `<div class="card-sin-imagen">Sin imagen</div>`;

  const etiquetaDescuento = descuento > 0
    ? `<span class="card-descuento">-${Math.round(descuento * 100)}%</span>`
    : '';

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
        <h3>#${producto.id} ${escaparHTML(producto.Nombre)}</h3>
        ${producto.descripcion ? `<p class="card-descripcion">${escaparHTML(producto.descripcion)}</p>` : ''}
        <div class="card-categorias">${categorias}</div>
        <div class="card-precio">${precio}</div>
        <div class="card-pie">
          ${estado}
          <span>${producto.unidades ?? 0} unidades</span>
        </div>
        <div class="card-botones">${botones}</div>
      </div>
    </article>`;
}
