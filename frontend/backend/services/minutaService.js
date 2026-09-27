const {
  randomUUID,
} = require("node:crypto");


// ==================================================
// CONFIGURACIÓN
// ==================================================

const NOMBRE_BUCKET =
  "Nombre: mega-data";

const CARPETA_MINUTAS =
  "minutas-direccion/v1";


// Respaldo para desarrollo local sin Supabase.

const minutasMemoria =
  new Map();


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
// CONFIGURACIÓN DE SUPABASE
// ==================================================

function obtenerConfiguracion() {

  const supabaseUrl =
    process.env.SUPABASE_URL;

  const clave =
    process.env.SUPABASE_SECRET_KEY;


  if (
    (
      !supabaseUrl ||
      !clave
    ) &&
    process.env.NODE_ENV === "production"
  ) {

    throw new Error(
      "Falta la configuración de Supabase para guardar las minutas"
    );

  }


  if (
    !supabaseUrl ||
    !clave
  ) {

    return null;

  }


  return {

    supabaseUrl:
      supabaseUrl.replace(
        /\/$/,
        ""
      ),

    clave,

  };

}


// ==================================================
// ENCABEZADOS DE SUPABASE
// ==================================================

function crearHeaders(
  clave,
  adicionales = {}
) {

  return {

    apikey:
      clave,

    Authorization:
      `Bearer ${clave}`,

    ...adicionales,

  };

}


// ==================================================
// CODIFICAR RUTA DE STORAGE
// ==================================================

function codificarRuta(
  ruta
) {

  return ruta
    .split("/")
    .map(
      encodeURIComponent
    )
    .join("/");

}


// ==================================================
// VALIDAR RESPUESTA DE SUPABASE
// ==================================================

async function validarRespuesta(
  respuesta
) {

  if (
    respuesta.ok
  ) {

    return;

  }


  const mensaje =
    await respuesta.text();


  throw new Error(
    `Minutas Storage HTTP ${respuesta.status}: ${mensaje.slice(
      0,
      300
    )}`
  );

}


// ==================================================
// CONSTRUIR RUTA DE UNA MINUTA
// ==================================================

function obtenerRutaMinuta(
  id
) {

  return `${CARPETA_MINUTAS}/${id}.json`;

}


// ==================================================
// GUARDAR ARCHIVO DE MINUTA
// ==================================================

async function guardarArchivo(
  minuta,
  sobrescribir = false
) {

  const configuracion =
    obtenerConfiguracion();


  // ================================================
  // DESARROLLO LOCAL
  // ================================================

  if (
    !configuracion
  ) {

    if (
      !sobrescribir &&
      minutasMemoria.has(
        minuta.id
      )
    ) {

      throw new Error(
        "La minuta ya existe"
      );

    }


    minutasMemoria.set(
      minuta.id,
      {
        ...minuta,
      }
    );


    return minuta;

  }


  // ================================================
  // SUPABASE STORAGE
  // ================================================

  const ruta =
    obtenerRutaMinuta(
      minuta.id
    );


  const url =
    `${configuracion.supabaseUrl}/storage/v1/object/${encodeURIComponent(
      NOMBRE_BUCKET
    )}/${codificarRuta(
      ruta
    )}`;


  const respuesta =
    await fetch(
      url,
      {

        method:
          "POST",

        headers:
          crearHeaders(
            configuracion.clave,
            {

              "Content-Type":
                "application/json",

              "x-upsert":
                sobrescribir
                  ? "true"
                  : "false",

            }
          ),

        body:
          JSON.stringify(
            minuta
          ),

      }
    );


  await validarRespuesta(
    respuesta
  );


  return minuta;

}


// ==================================================
// CREAR MINUTA NUEVA
// ==================================================

async function crearMinuta({

  supervisor,

  promotor,

  compromiso,

  creadaPor,

  metricas,

}) {

  const fechaActual =
    new Date().toISOString();


  const minuta = {

    id:
      randomUUID(),

    supervisor:
      normalizarTexto(
        supervisor
      ),

    promotor:
      normalizarTexto(
        promotor
      ),

    compromiso:
      String(
        compromiso ?? ""
      ).trim(),

    metricas: {

      productividad:
        Number(
          metricas?.productividad
        ) || 0,

      diasSinVenta:
        Number(
          metricas?.diasSinVenta
        ) || 0,

      apps:
        Number(
          metricas?.apps
        ) || 0,

      rx:
        Number(
          metricas?.rx
        ) || 0,

      movil:
        Number(
          metricas?.movil
        ) || 0,

    },

    estado:
      "PENDIENTE_FIRMA",

    creadaPor:
      String(
        creadaPor ?? ""
      ).trim(),

    creadaEn:
      fechaActual,

    enviadaEn:
      fechaActual,

    firmaSupervisor:
      null,

    firmadaEn:
      null,

    resultado:
      null,

    resueltaEn:
      null,

    resueltaPor:
      null,

  };


  return guardarArchivo(
    minuta,
    false
  );

}


// ==================================================
// LISTAR TODAS LAS MINUTAS
// ==================================================

async function listarMinutas() {

  const configuracion =
    obtenerConfiguracion();


  // ================================================
  // DESARROLLO LOCAL
  // ================================================

  if (
    !configuracion
  ) {

    return Array.from(
      minutasMemoria.values()
    )
      .map(
        (minuta) => ({
          ...minuta,
        })
      )
      .sort(
        (a, b) =>
          String(
            b.creadaEn
          ).localeCompare(
            String(
              a.creadaEn
            )
          )
      );

  }


  // ================================================
  // SUPABASE STORAGE
  // ================================================

  const registros = [];

  let offset =
    0;


  while (
    true
  ) {

    const urlListado =
      `${configuracion.supabaseUrl}/storage/v1/object/list/${encodeURIComponent(
        NOMBRE_BUCKET
      )}`;


    const respuestaListado =
      await fetch(
        urlListado,
        {

          method:
            "POST",

          headers:
            crearHeaders(
              configuracion.clave,
              {

                "Content-Type":
                  "application/json",

              }
            ),

          body:
            JSON.stringify({

              prefix:
                CARPETA_MINUTAS,

              limit:
                100,

              offset,

              sortBy: {

                column:
                  "name",

                order:
                  "desc",

              },

            }),

        }
      );


    await validarRespuesta(
      respuestaListado
    );


    const archivos =
      (
        await respuestaListado.json()
      ).filter(
        (archivo) =>
          String(
            archivo.name
          ).endsWith(
            ".json"
          )
      );


    for (
      const archivo
      of archivos
    ) {

      const ruta =
        `${CARPETA_MINUTAS}/${archivo.name}`;


      const urlArchivo =
        `${configuracion.supabaseUrl}/storage/v1/object/authenticated/${encodeURIComponent(
          NOMBRE_BUCKET
        )}/${codificarRuta(
          ruta
        )}`;


      const respuestaArchivo =
        await fetch(
          urlArchivo,
          {

            method:
              "GET",

            headers:
              crearHeaders(
                configuracion.clave
              ),

          }
        );


      await validarRespuesta(
        respuestaArchivo
      );


      const minuta =
        await respuestaArchivo.json();


      registros.push(
        minuta
      );

    }


    if (
      archivos.length < 100
    ) {

      break;

    }


    offset +=
      100;

  }


  return registros.sort(
    (a, b) =>
      String(
        b.creadaEn
      ).localeCompare(
        String(
          a.creadaEn
        )
      )
  );

}


// ==================================================
// BUSCAR UNA MINUTA POR ID
// ==================================================

async function obtenerMinuta(
  id
) {

  const minutas =
    await listarMinutas();


  return minutas.find(
    (minuta) =>
      minuta.id === id
  ) || null;

}


// ==================================================
// FIRMAR MINUTA POR EL SUPERVISOR
// ==================================================

async function firmarMinuta({

  id,

  firmaSupervisor,

}) {

  const minuta =
    await obtenerMinuta(
      id
    );


  if (
    !minuta
  ) {

    return null;

  }


  if (
    minuta.estado !==
    "PENDIENTE_FIRMA"
  ) {

    throw new Error(
      "La minuta ya fue firmada o resuelta"
    );

  }


  const minutaActualizada = {

    ...minuta,

    firmaSupervisor,

    firmadaEn:
      new Date().toISOString(),

    estado:
      "FIRMADA",

  };


  return guardarArchivo(
    minutaActualizada,
    true
  );

}


// ==================================================
// MARCAR COMPROMISO CUMPLIDO O NO CUMPLIDO
// ==================================================

async function resolverMinuta({

  id,

  resultado,

  usuario,

}) {

  const minuta =
    await obtenerMinuta(
      id
    );


  if (
    !minuta
  ) {

    return null;

  }


  if (
    minuta.estado ===
    "PENDIENTE_FIRMA"
  ) {

    throw new Error(
      "El supervisor debe firmar la minuta antes de resolverla"
    );

  }


  if (
    minuta.estado ===
    "RESUELTA"
  ) {

    throw new Error(
      "La minuta ya fue resuelta"
    );

  }


  const minutaActualizada = {

    ...minuta,

    estado:
      "RESUELTA",

    resultado,

    resueltaEn:
      new Date().toISOString(),

    resueltaPor:
      String(
        usuario ?? ""
      ).trim(),

  };


  return guardarArchivo(
    minutaActualizada,
    true
  );

}


// ==================================================
// EXPORTACIONES
// ==================================================

module.exports = {

  normalizarTexto,

  crearMinuta,

  listarMinutas,

  firmarMinuta,

  resolverMinuta,

};
