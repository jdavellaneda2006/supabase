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

  // JSON.stringify(data, null, 2) convierte el array completo a texto,
  // con sangría (el "2") para que se lea ordenado. Esta línea SÍ es
  // sincrónica (no necesita await) — ya no estamos esperando nada de
  // Supabase, solo transformando el array "data" que ya llegó.
  document.getElementById('resultado').textContent = JSON.stringify(data, null, 2);

 const nombres = data.map(producto => producto.Nombre);
 console.log(nombres);
 const precios = data.map(producto => producto.precio);
 console.log(precios);

  document.getElementById('resultado2').innerHTML =
    '<ul>' + nombres.map(n => `<li>${n}</li>`).join('') + '</ul>';
    document.getElementById('resultado3').innerHTML =
    '<ul>' + precios.map(n => `<li>${n}</li>`).join('') + '</ul>';
});
