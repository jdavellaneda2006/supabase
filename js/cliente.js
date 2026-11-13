async function registrarCliente(nombre, correo, contrasena) {

  // db.auth.signUp() NO toca ninguna tabla tuya todavía — habla directo con
  // el sistema de autenticación interno de Supabase (algo así como una
  // tabla especial, auth.users, que tú no administras a mano). Le mandas
  // correo y contraseña, y Supabase por detrás: valida el formato del
  // correo, guarda la contraseña de forma segura (nunca en texto plano),
  // y crea un identificador único nuevo (un uuid) para esta persona.
  //
  // El resultado llega en dos partes, igual que en todas las llamadas a
  // Supabase que ya conoces (data / error):
  //   - data.user   → los datos del usuario recién creado. data.user.id
  //                   es el uuid real — EL MISMO que vamos a guardar como auth_id
  //                   en clientes_Prueba, más abajo.
  //   - data.session → si tu proyecto exige confirmar el correo antes de
  //                   dejar entrar (ver guía, sección 7), esto llega en
  //                   null: el usuario ya existe, pero todavía no hay
  //                   sesión iniciada hasta que confirme.
  const { data, error } = await db.auth.signUp({
    email: correo,
    password: contrasena,
  });

  // Mismo patrón de "revisar error antes de seguir" que ya usaste en el
  // CRUD de productos — si signUp() falló (correo repetido, contraseña
  // muy corta, etc.), ni siquiera intentamos el segundo paso.
  if (error) {
    console.log('Error al registrar:', error);
    return { error: error.message };
  }

  // Ahora sí tocamos una tabla tuya: clientes_Prueba. Este insert() es
  // igual al que ya usaste en agregarProducto() — la única diferencia es
  // que aquí también mandamos auth_id (data.user.id), que enlaza esta fila
  // con el usuario de Auth. La columna id sigue siendo el número automático
  // de la tabla, así que no la enviamos.
  const { data: cliente, error: errorCliente } = await db
    .from('clientes_Prueba')
    .insert([{ auth_id: data.user.id, nombre, correo, rol: 'cliente' }])
    .select();

  if (errorCliente) {
    console.log('Error al crear el perfil:', errorCliente);
    return { error: errorCliente.message };
  }

  return { cliente: cliente[0] };
}

// 'submit' es el evento que dispara un <form> cuando alguien hace clic en
// su botón de tipo submit (o presiona Enter dentro de un campo). Por
// defecto, ese evento hace que el navegador RECARGUE la página entera —
// comportamiento heredado de cuando los formularios mandaban sus datos a
// otra página de servidor, décadas atrás. Como aquí todo lo manejamos con
// JavaScript (sin recargar nada), hay que apagar ese comportamiento a
// propósito.
// El "?." hace que esta línea no falle en páginas sin formulario de
// registro (admin.html solo tiene el de iniciar sesión).
document.getElementById('form-registro')?.addEventListener('submit', async (event) => {

  // event.preventDefault() le dice al navegador "no hagas lo que harías
  // normalmente con este evento" — en este caso, no recargues la página.
  // Sin esta línea, la página se refrescaría apenas se hiciera clic en
  // "Crear cuenta", y perderías cualquier mensaje que fueras a mostrar.
  event.preventDefault();

  // event.target es el elemento que disparó el evento — en un 'submit',
  // siempre es el propio <form>. Lo guardamos en una variable para poder
  // usarlo más abajo (form.reset()) sin tener que volver a buscarlo.
  const form = event.target;

  const { cliente, error } = await registrarCliente(
    document.getElementById('registro-nombre').value.trim(),
    document.getElementById('registro-correo').value.trim(),
    document.getElementById('registro-password').value
  );

  if (cliente) {
    form.reset(); // vacía los 3 campos del formulario, para la próxima persona
    await mostrarEstadoSesion(); // signUp() ya dejó la sesión iniciada
    document.getElementById('estado-sesion').textContent =
      'Cuenta creada. Registro completado.';
  } else {
    document.getElementById('estado-sesion').textContent =
      `No se pudo crear la cuenta: ${error}`;
  }
});

async function iniciarSesion(correo, contrasena) {

  // db.auth.signInWithPassword() es para alguien que YA se registró antes
  // (sección 4.1) — no crea ningún usuario nuevo, solo verifica que el
  // correo y la contraseña coincidan con uno que ya existe en Auth.
  //
  // Lo importante pasa "por detrás", sin que se vea en este código: si la
  // verificación sale bien, el cliente de Supabase (la variable db, la
  // misma de siempre) GUARDA la sesión internamente — normalmente en el
  // almacenamiento del navegador — y, desde este momento, la adjunta sola
  // a cada petición futura que hagas con db, sea a productos_practica, a
  // clientes_practica o a cualquier otra tabla. No hay que "pasarle" el
  // usuario a mano a ninguna otra función.
  const { data, error } = await db.auth.signInWithPassword({
    email: correo,
    password: contrasena,
  });

  if (error) {
    console.log('Error al iniciar sesión:', error);
    return null;
  }

  // Aquí data.user también trae el id real del usuario — el mismo valor
  // que auth.uid() va a devolver dentro de cualquier política de RLS
  // mientras esta sesión siga activa.
  return data.user;
}

// Mismo patrón explicado en el formulario de registro: 'submit' es el
// evento del <form>, y hay que apagar la recarga automática de página.
document.getElementById('form-login').addEventListener('submit', async (event) => {
  event.preventDefault(); // evita que el navegador recargue la página
  const form = event.target; // el propio <form>, guardado para usar después

  const usuario = await iniciarSesion(
    document.getElementById('login-correo').value.trim(),
    document.getElementById('login-password').value
  );

  if (usuario) {
    form.reset();
    mostrarEstadoSesion(); // definida en la sección 5
  } else {
    document.getElementById('estado-sesion').textContent =
      'Correo o contraseña incorrectos.';
  }
});
document.getElementById('btn-logout').addEventListener('click', async () => {
  await db.auth.signOut();
  mostrarEstadoSesion();
});
// Usuario de Auth y fila de clientes_Prueba de la sesión actual. Los
// guardamos para rellenar el formulario de edición sin volver a consultar.
let usuarioActual = null;
let clienteActual = null;

const COLUMNAS_CLIENTE = 'nombre, correo, telefono, direccion, ciudad, rol';

async function mostrarEstadoSesion() {
  const { data } = await db.auth.getUser();
  const estado = document.getElementById('estado-sesion');

  // Con sesión se ven los datos; sin sesión, los formularios.
  document.getElementById('formularios-cuenta').hidden = Boolean(data.user);
  document.getElementById('mis-datos').hidden = !data.user;
  cerrarEdicion(); // siempre se vuelve a la vista de datos

  // El icono VI brilla en turquesa mientras hay sesión (solo en admin.html)
  document.getElementById('btn-cuenta')?.classList.toggle('con-sesion', Boolean(data.user));

  usuarioActual = data.user;
  if (data.user) {
    estado.textContent = `Sesión iniciada como ${data.user.email}`;
    await mostrarMisDatos(data.user);
  } else {
    clienteActual = null;
    estado.textContent = 'No has iniciado sesión.';
  }
}

// Trae la fila de esta persona en clientes_Prueba. La política de RLS ya
// impide leer filas ajenas; el .eq() indica cuál de las propias queremos.
async function mostrarMisDatos(usuario) {
  const { data: cliente, error } = await db
    .from('clientes_Prueba')
    .select(COLUMNAS_CLIENTE)
    .eq('auth_id', usuario.id)
    .maybeSingle(); // devuelve null, sin error, si la cuenta no tiene fila

  if (error) {
    console.log('Error al leer tus datos:', error);
  }

  pintarMisDatos(cliente, usuario);
}

// Dibuja la lista "Mis datos". Se separa de mostrarMisDatos() para poder
// reutilizarla después del UPDATE con la fila que devuelve Supabase.
function pintarMisDatos(cliente, usuario) {
  clienteActual = cliente;

  // Sin fila en clientes_Prueba no hay nada que editar
  const botonEditar = document.getElementById('btn-editar-datos');
  if (botonEditar) botonEditar.hidden = !cliente;

  const datos = [
    ['Nombre', cliente?.nombre],
    ['Correo', cliente?.correo ?? usuario.email],
    ['Teléfono', cliente?.telefono],
    ['Dirección', cliente?.direccion],
    ['Ciudad', cliente?.ciudad],
    ['Rol', cliente?.rol],
  ];

  const lista = document.getElementById('lista-datos');
  lista.replaceChildren(); // vacía los datos de la sesión anterior

  // textContent, no innerHTML: lo que alguien escriba en su nombre se muestra
  // como texto y nunca se ejecuta como código en la página.
  for (const [etiqueta, valor] of datos) {
    const titulo = document.createElement('dt');
    titulo.textContent = etiqueta;

    const contenido = document.createElement('dd');
    contenido.textContent = valor || 'Sin registrar';

    lista.append(titulo, contenido);
  }
}

// ===== UPDATE: editar los datos del cliente =====

// Igual que modificarProducto() en admin.js: .update() con los cambios y
// .eq() para elegir la fila. Aquí la fila se busca por auth_id (el uuid de
// la sesión), no por id, y la política de RLS solo deja tocar la propia.
async function actualizarCliente(authId, cambios) {
  const { data, error } = await db
    .from('clientes_Prueba')
    .update(cambios)
    .eq('auth_id', authId)
    .select(COLUMNAS_CLIENTE);

  if (error) {
    console.log('Error al actualizar tus datos:', error);
    return { error: error.message };
  }

  // Si RLS no deja actualizar la fila, Supabase NO da error: devuelve un
  // array vacío. Por eso hay que revisar que haya llegado algo.
  if (data.length === 0) {
    return { error: 'no se encontró tu perfil o no tienes permiso para editarlo' };
  }

  return { cliente: data[0] };
}

// Muestra el formulario con los valores actuales del cliente
function abrirEdicion() {
  if (!clienteActual) return;

  document.getElementById('editar-cliente-nombre').value = clienteActual.nombre ?? '';
  document.getElementById('editar-cliente-telefono').value = clienteActual.telefono ?? '';
  document.getElementById('editar-cliente-ciudad').value = clienteActual.ciudad ?? '';
  document.getElementById('editar-cliente-direccion').value = clienteActual.direccion ?? '';

  document.getElementById('vista-datos').hidden = true;
  document.getElementById('form-editar-cliente').hidden = false;
  document.getElementById('editar-cliente-nombre').focus();
}

// Vuelve a la lista de datos. El "?." es porque cliente.html no tiene
// formulario de edición.
function cerrarEdicion() {
  const form = document.getElementById('form-editar-cliente');
  if (!form) return;
  form.hidden = true;
  document.getElementById('vista-datos').hidden = false;
}

document.getElementById('btn-editar-datos')?.addEventListener('click', abrirEdicion);
document.getElementById('btn-cancelar-edicion')?.addEventListener('click', cerrarEdicion);

document.getElementById('form-editar-cliente')?.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!usuarioActual) return;

  // Un campo vacío se guarda como null ("Sin registrar"), no como texto vacío
  const valor = (id) => document.getElementById(id).value.trim() || null;

  // Solo estas 4 columnas: correo, rol y auth_id no se cambian desde aquí
  const cambios = {
    nombre: valor('editar-cliente-nombre'),
    telefono: valor('editar-cliente-telefono'),
    ciudad: valor('editar-cliente-ciudad'),
    direccion: valor('editar-cliente-direccion'),
  };

  const { cliente, error } = await actualizarCliente(usuarioActual.id, cambios);
  const estado = document.getElementById('estado-sesion');

  if (cliente) {
    pintarMisDatos(cliente, usuarioActual);
    cerrarEdicion();
    estado.textContent = 'Datos actualizados.';
  } else {
    estado.textContent = `No se pudieron guardar los cambios: ${error}`;
  }
});

// ===== Ventana "Mi cuenta" (icono VI de la barra superior, admin.html) =====
const modalCuenta = document.getElementById('modal-cuenta');

document.getElementById('btn-cuenta')?.addEventListener('click', () => {
  modalCuenta.showModal();
});

document.getElementById('btn-cerrar-cuenta')?.addEventListener('click', () => {
  modalCuenta.close();
});

// Un clic en el fondo oscuro (fuera de la ventana) también la cierra
modalCuenta?.addEventListener('click', (event) => {
  if (event.target === modalCuenta) modalCuenta.close();
});

// Al cargar la página, revisa si ya había una sesión activa
mostrarEstadoSesion();