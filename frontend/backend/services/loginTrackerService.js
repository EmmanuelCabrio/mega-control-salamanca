const ARCHIVO_LOGIN =
  "login-supervisores.json";


const NOMBRE_BUCKET =
  "Nombre: mega-data";


let registroMemoria = {

  version:
    1,

  dias:
    {},

};


let colaRegistro =
  Promise.resolve();


// ==================================================
// NORMALIZAR TEXTO
// ==================================================

function normalizarTexto(
  valor
) {

  return String(
    valor ?? ""
  )
    .trim()
    .toUpperCase()
    .normalize("NFD")
    .replace(
      /[\u0300-\u036f]/g,
      ""
    )
    .replace(
      /\s+/g,
      " "
    );

}


// ==================================================
// FECHA ACTUAL EN SALAMANCA
// ==================================================

function obtenerFechaMexico(
  fecha = new Date()
) {

  const partes =
    new Intl.DateTimeFormat(
      "en-CA",
      {

        timeZone:
          "America/Mexico_City",

        year:
          "numeric",

        month:
          "2-digit",

        day:
          "2-digit",

      }
    ).formatToParts(
      fecha
    );


  const obtener =
    (tipo) =>
      partes.find(
        (parte) =>
          parte.type === tipo
      )?.value;


  return [

    obtener(
      "year"
    ),

    obtener(
      "month"
    ),

    obtener(
      "day"
    ),

  ].join("-");

}


// ==================================================
// CONFIGURACIÓN DE SUPABASE
// ==================================================

function obtenerConfiguracion() {

  return {

    supabaseUrl:
      process.env.SUPABASE_URL,

    clave:
      process.env.SUPABASE_SECRET_KEY,

  };

}


// ==================================================
// REGISTRO VACÍO
// ==================================================

function crearRegistroVacio() {

  return {

    version:
      1,

    dias:
      {},

  };

}


// ==================================================
// LEER REGISTRO DESDE SUPABASE
// ==================================================

async function leerRegistro() {

  const {
    supabaseUrl,
    clave,
  } =
    obtenerConfiguracion();


  // En desarrollo local utiliza memoria.

  if (
    !supabaseUrl ||
    !clave
  ) {

    return registroMemoria;

  }


  const bucket =
    encodeURIComponent(
      NOMBRE_BUCKET
    );


  const archivo =
    encodeURIComponent(
      ARCHIVO_LOGIN
    );


  const url =
    `${supabaseUrl}/storage/v1/object/authenticated/${bucket}/${archivo}`;


  const respuesta =
    await fetch(
      url,
      {

        method:
          "GET",

        headers: {

          apikey:
            clave,

          Authorization:
            `Bearer ${clave}`,

        },

      }
    );


  // Cuando todavía no existe el archivo,
  // comenzamos con un registro vacío.

  if (
    !respuesta.ok
  ) {

    const mensaje =
      await respuesta.text();


    if (
      (
        respuesta.status === 400 ||
        respuesta.status === 404
      ) &&
      /not found|no encontrado/i.test(
        mensaje
      )
    ) {

      return crearRegistroVacio();

    }


    throw new Error(
      `No se pudo leer el registro de accesos: HTTP ${respuesta.status} ${mensaje}`
    );

  }


  const datos =
    await respuesta.json();


  return {

    version:
      1,

    dias:
      datos?.dias &&
      typeof datos.dias === "object"
        ? datos.dias
        : {},

  };

}


// ==================================================
// GUARDAR REGISTRO EN SUPABASE
// ==================================================

async function guardarRegistro(
  registro
) {

  const {
    supabaseUrl,
    clave,
  } =
    obtenerConfiguracion();


  // En desarrollo local utiliza memoria.

  if (
    !supabaseUrl ||
    !clave
  ) {

    registroMemoria =
      registro;

    return;

  }


  const bucket =
    encodeURIComponent(
      NOMBRE_BUCKET
    );


  const archivo =
    encodeURIComponent(
      ARCHIVO_LOGIN
    );


  const url =
    `${supabaseUrl}/storage/v1/object/${bucket}/${archivo}`;


  const respuesta =
    await fetch(
      url,
      {

        method:
          "POST",

        headers: {

          apikey:
            clave,

          Authorization:
            `Bearer ${clave}`,

          "Content-Type":
            "application/json",

          "x-upsert":
            "true",

        },

        body:
          JSON.stringify(
            registro
          ),

      }
    );


  if (
    !respuesta.ok
  ) {

    const mensaje =
      await respuesta.text();


    throw new Error(
      `No se pudo guardar el registro de accesos: HTTP ${respuesta.status} ${mensaje}`
    );

  }

}


// ==================================================
// REGISTRAR LOGIN
// ==================================================

async function registrarLoginInterno({

  supervisor,

  rol,

}) {

  // Solamente registrar supervisores comerciales.

  if (
    normalizarTexto(
      rol
    ) !== "SUPERVISOR"
  ) {

    return;

  }


  const nombre =
    normalizarTexto(
      supervisor
    );


  if (
    !nombre
  ) {

    return;

  }


  const ahora =
    new Date();


  const fecha =
    obtenerFechaMexico(
      ahora
    );


  const registro =
    await leerRegistro();


  if (
    !registro.dias[
      fecha
    ]
  ) {

    registro.dias[
      fecha
    ] = {};

  }


  const accesoAnterior =
    registro.dias[
      fecha
    ][
      nombre
    ];


  registro.dias[
    fecha
  ][
    nombre
  ] = {

    supervisor:
      nombre,

    primerAcceso:
      accesoAnterior
        ?.primerAcceso ||
      ahora.toISOString(),

    ultimoAcceso:
      ahora.toISOString(),

    accesos:
      Number(
        accesoAnterior
          ?.accesos ||
        0
      ) + 1,

  };


  // ================================================
  // CONSERVAR ÚNICAMENTE LOS ÚLTIMOS 45 DÍAS
  // ================================================

  const fechas =
    Object.keys(
      registro.dias
    )
      .sort()
      .reverse();


  for (
    const fechaAntigua
    of fechas.slice(45)
  ) {

    delete registro.dias[
      fechaAntigua
    ];

  }


  await guardarRegistro(
    registro
  );

}


// ==================================================
// COLA PARA EVITAR REGISTROS SIMULTÁNEOS
// ==================================================

function registrarLoginSupervisor(
  datos
) {

  const tarea =
    colaRegistro.then(
      () =>
        registrarLoginInterno(
          datos
        )
    );


  // Si una operación falla, la siguiente podrá continuar.

  colaRegistro =
    tarea.catch(
      () => {}
    );


  return tarea;

}


// ==================================================
// CONSULTAR ACCESOS DE HOY
// ==================================================

async function obtenerLoginsDelDia() {

  const fecha =
    obtenerFechaMexico();


  const registro =
    await leerRegistro();


  return {

    fecha,

    accesos:
      registro.dias[
        fecha
      ] || {},

  };

}


// ==================================================
// EXPORTACIONES
// ==================================================

module.exports = {

  registrarLoginSupervisor,

  obtenerLoginsDelDia,

};
