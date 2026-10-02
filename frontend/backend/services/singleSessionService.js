const {
  createHash,
  randomUUID,
} = require(
  "node:crypto"
);


// ==================================================
// CONFIGURACIÓN
// ==================================================

const NOMBRE_BUCKET =
  "Nombre: mega-data";

const CARPETA_SESIONES =
  "sesiones-unicas/v1";

const LIMITE_INACTIVIDAD =
  10 *
  60 *
  1000;


// Respaldo para desarrollo local.

const sesionesMemoria =
  new Map();


// Serializa aperturas de sesión para impedir
// dos inicios simultáneos en el mismo servidor.

let colaSesiones =
  Promise.resolve();


// ==================================================
// NORMALIZAR USUARIO
// ==================================================

function normalizarUsuario(
  valor
) {

  return String(
    valor ?? ""
  )
    .trim()
    .toUpperCase();

}


// ==================================================
// CREAR CLAVE PRIVADA DEL USUARIO
// ==================================================

function crearClaveUsuario(
  usuario
) {

  return createHash(
    "sha256"
  )
    .update(
      normalizarUsuario(
        usuario
      )
    )
    .digest(
      "hex"
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
// VALIDAR RESPUESTA
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
    `Sesión única HTTP ${respuesta.status}: ${mensaje.slice(
      0,
      300
    )}`
  );

}


// ==================================================
// RUTA DEL ARCHIVO DE SESIÓN
// ==================================================

function crearRutaSesion(
  usuario
) {

  return `${CARPETA_SESIONES}/${crearClaveUsuario(
    usuario
  )}.json`;

}


// ==================================================
// LEER SESIÓN
// ==================================================

async function leerSesion(
  usuario
) {

  const usuarioNormalizado =
    normalizarUsuario(
      usuario
    );


  if (
    !usuarioNormalizado
  ) {

    return null;

  }


  const configuracion =
    obtenerConfiguracion();


  if (
    !configuracion
  ) {

    return (
      sesionesMemoria.get(
        usuarioNormalizado
      ) ||
      null
    );

  }


  const ruta =
    crearRutaSesion(
      usuarioNormalizado
    );


  const url =
    `${configuracion.supabaseUrl}/storage/v1/object/authenticated/${encodeURIComponent(
      NOMBRE_BUCKET
    )}/${ruta
      .split("/")
      .map(
        encodeURIComponent
      )
      .join("/")}`;


  const respuesta =
    await fetch(
      url,
      {

        method:
          "GET",

        headers:
          crearHeaders(
            configuracion.clave
          ),

      }
    );


  if (
    respuesta.status === 400 ||
    respuesta.status === 404
  ) {

    return null;

  }


  await validarRespuesta(
    respuesta
  );


  return respuesta.json();

}


// ==================================================
// GUARDAR SESIÓN
// ==================================================

async function guardarSesion(
  sesion
) {

  const configuracion =
    obtenerConfiguracion();


  if (
    !configuracion
  ) {

    sesionesMemoria.set(
      normalizarUsuario(
        sesion.usuario
      ),
      sesion
    );

    return;

  }


  const ruta =
    crearRutaSesion(
      sesion.usuario
    );


  const url =
    `${configuracion.supabaseUrl}/storage/v1/object/${encodeURIComponent(
      NOMBRE_BUCKET
    )}/${ruta
      .split("/")
      .map(
        encodeURIComponent
      )
      .join("/")}`;


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
                "true",

            }
          ),

        body:
          JSON.stringify(
            sesion
          ),

      }
    );


  await validarRespuesta(
    respuesta
  );

}


// ==================================================
// ELIMINAR SESIÓN
// ==================================================

async function eliminarSesion(
  usuario
) {

  const usuarioNormalizado =
    normalizarUsuario(
      usuario
    );


  const configuracion =
    obtenerConfiguracion();


  if (
    !configuracion
  ) {

    sesionesMemoria.delete(
      usuarioNormalizado
    );

    return;

  }


  const ruta =
    crearRutaSesion(
      usuarioNormalizado
    );


  const url =
    `${configuracion.supabaseUrl}/storage/v1/object/${encodeURIComponent(
      NOMBRE_BUCKET
    )}/${ruta
      .split("/")
      .map(
        encodeURIComponent
      )
      .join("/")}`;


  const respuesta =
    await fetch(
      url,
      {

        method:
          "DELETE",

        headers:
          crearHeaders(
            configuracion.clave
          ),

      }
    );


  if (
    respuesta.status === 400 ||
    respuesta.status === 404
  ) {

    return;

  }


  await validarRespuesta(
    respuesta
  );

}


// ==================================================
// DETERMINAR SI LA SESIÓN ESTÁ ACTIVA
// ==================================================

function sesionEstaActiva(
  sesion
) {

  const ultimaActividad =
    Date.parse(
      sesion?.ultimaActividad
    );


  if (
    !Number.isFinite(
      ultimaActividad
    )
  ) {

    return false;

  }


  return (
    Date.now() -
    ultimaActividad
  ) <=
    LIMITE_INACTIVIDAD;

}


// ==================================================
// CREAR O REANUDAR SESIÓN ÚNICA
// ==================================================

async function crearSesionUnicaInterna({

  usuario,

  dispositivoId,

  rol,

  supervisor,

}) {

  const usuarioNormalizado =
    normalizarUsuario(
      usuario
    );


  const dispositivoNormalizado =
    String(
      dispositivoId ?? ""
    ).trim();


  if (
    !usuarioNormalizado ||
    dispositivoNormalizado.length < 10 ||
    dispositivoNormalizado.length > 150
  ) {

    return {

      permitida:
        false,

      codigo:
        "DISPOSITIVO_INVALIDO",

      mensaje:
        "No se pudo identificar este dispositivo",

    };

  }


  const existente =
    await leerSesion(
      usuarioNormalizado
    );


  const mismaSesionDeDispositivo =
    existente &&
    String(
      existente.dispositivoId ?? ""
    ) ===
      dispositivoNormalizado;


  if (
    existente &&
    sesionEstaActiva(
      existente
    ) &&
    !mismaSesionDeDispositivo
  ) {

    return {

      permitida:
        false,

      codigo:
        "SESION_ACTIVA_OTRO_DISPOSITIVO",

      mensaje:
        "Este usuario ya tiene una sesión activa en otro dispositivo o navegador.",

      sesion: {

        inicio:
          existente.inicio,

        ultimaActividad:
          existente.ultimaActividad,

        rol:
          existente.rol,

        supervisor:
          existente.supervisor,

      },

    };

  }


  const ahora =
    new Date().toISOString();


  const sesion = {

    version:
      1,

    usuario:
      usuarioNormalizado,

    sesionId:
      mismaSesionDeDispositivo &&
      existente?.sesionId
        ? existente.sesionId
        : randomUUID(),

    dispositivoId:
      dispositivoNormalizado,

    rol:
      String(
        rol ?? ""
      ).trim(),

    supervisor:
      String(
        supervisor ?? ""
      ).trim(),

    inicio:
      mismaSesionDeDispositivo &&
      existente?.inicio
        ? existente.inicio
        : ahora,

    ultimaActividad:
      ahora,

  };


  await guardarSesion(
    sesion
  );


  return {

    permitida:
      true,

    sesion,

  };

}


// ==================================================
// COLA DE CREACIÓN
// ==================================================

function crearSesionUnica(
  datos
) {

  const tarea =
    colaSesiones.then(
      () =>
        crearSesionUnicaInterna(
          datos
        )
    );


  colaSesiones =
    tarea.catch(
      () => {}
    );


  return tarea;

}


// ==================================================
// VALIDAR SESIÓN ÚNICA
// ==================================================

async function validarSesionUnica({

  usuario,

  sesionId,

  dispositivoId,

}) {

  const sesion =
    await leerSesion(
      usuario
    );


  if (
    !sesion ||
    !sesionEstaActiva(
      sesion
    )
  ) {

    return {

      valida:
        false,

      codigo:
        "SESION_INACTIVA",

    };

  }


  const coincideSesion =
    String(
      sesion.sesionId ?? ""
    ) ===
    String(
      sesionId ?? ""
    );


  const coincideDispositivo =
    String(
      sesion.dispositivoId ?? ""
    ) ===
    String(
      dispositivoId ?? ""
    );


  if (
    !coincideSesion ||
    !coincideDispositivo
  ) {

    return {

      valida:
        false,

      codigo:
        "SESION_REEMPLAZADA",

    };

  }


  return {

    valida:
      true,

    sesion,

  };

}


// ==================================================
// RENOVAR ACTIVIDAD
// ==================================================

async function renovarSesionUnica({

  usuario,

  sesionId,

  dispositivoId,

}) {

  const validacion =
    await validarSesionUnica({

      usuario,

      sesionId,

      dispositivoId,

    });


  if (
    !validacion.valida
  ) {

    return validacion;

  }


  const sesionActualizada = {

    ...validacion.sesion,

    ultimaActividad:
      new Date().toISOString(),

  };


  await guardarSesion(
    sesionActualizada
  );


  return {

    valida:
      true,

    sesion:
      sesionActualizada,

  };

}


// ==================================================
// CERRAR SESIÓN ÚNICA
// ==================================================

async function cerrarSesionUnica({

  usuario,

  sesionId,

  dispositivoId,

}) {

  const sesion =
    await leerSesion(
      usuario
    );


  if (
    !sesion
  ) {

    return true;

  }


  const coincideSesion =
    String(
      sesion.sesionId ?? ""
    ) ===
    String(
      sesionId ?? ""
    );


  const coincideDispositivo =
    String(
      sesion.dispositivoId ?? ""
    ) ===
    String(
      dispositivoId ?? ""
    );


  // Un token anterior nunca puede cerrar
  // la sesión activa de otro dispositivo.

  if (
    !coincideSesion ||
    !coincideDispositivo
  ) {

    return false;

  }


  await eliminarSesion(
    usuario
  );


  return true;

}



// ==================================================
// LISTAR SESIONES PARA DIRECCIÓN
// ==================================================

async function listarSesionesUnicas() {

  const configuracion =
    obtenerConfiguracion();


  // ================================================
  // DESARROLLO LOCAL
  // ================================================

  if (
    !configuracion
  ) {

    return [
      ...sesionesMemoria.values(),
    ]
      .map(
        (sesion) => ({

          usuario:
            sesion.usuario,

          rol:
            sesion.rol,

          supervisor:
            sesion.supervisor,

          inicio:
            sesion.inicio,

          ultimaActividad:
            sesion.ultimaActividad,

          activa:
            sesionEstaActiva(
              sesion
            ),

        })
      )
      .sort(
        (a, b) =>
          String(
            b.ultimaActividad
          ).localeCompare(
            String(
              a.ultimaActividad
            )
          )
      );

  }


  // ================================================
  // LISTAR ARCHIVOS EN SUPABASE
  // ================================================

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
              CARPETA_SESIONES,

            limit:
              1000,

            offset:
              0,

            sortBy: {

              column:
                "updated_at",

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
        archivo?.name &&
        String(
          archivo.name
        ).endsWith(
          ".json"
        )
    );


  const sesiones = [];


  for (
    const archivo
    of archivos
  ) {

    const ruta =
      `${CARPETA_SESIONES}/${archivo.name}`;


    const url =
      `${configuracion.supabaseUrl}/storage/v1/object/authenticated/${encodeURIComponent(
        NOMBRE_BUCKET
      )}/${ruta
        .split("/")
        .map(
          encodeURIComponent
        )
        .join("/")}`;


    const respuesta =
      await fetch(
        url,
        {

          method:
            "GET",

          headers:
            crearHeaders(
              configuracion.clave
            ),

        }
      );


    if (
      !respuesta.ok
    ) {

      continue;

    }


    const sesion =
      await respuesta.json();


    if (
      !sesion?.usuario
    ) {

      continue;

    }


    sesiones.push({

      usuario:
        sesion.usuario,

      rol:
        sesion.rol,

      supervisor:
        sesion.supervisor,

      inicio:
        sesion.inicio,

      ultimaActividad:
        sesion.ultimaActividad,

      activa:
        sesionEstaActiva(
          sesion
        ),

    });

  }


  return sesiones.sort(
    (a, b) =>
      String(
        b.ultimaActividad
      ).localeCompare(
        String(
          a.ultimaActividad
        )
      )
  );

}


// ==================================================
// LIBERAR SESIÓN DESDE DIRECCIÓN
// ==================================================

async function cerrarSesionPorDireccion({

  usuario,

}) {

  const usuarioNormalizado =
    normalizarUsuario(
      usuario
    );


  if (
    !usuarioNormalizado
  ) {

    return false;

  }


  const sesion =
    await leerSesion(
      usuarioNormalizado
    );


  if (
    !sesion
  ) {

    return false;

  }


  await eliminarSesion(
    usuarioNormalizado
  );


  return true;

}


// ==================================================
// EXPORTACIONES
// ==================================================

module.exports = {

  crearSesionUnica,

  validarSesionUnica,

  renovarSesionUnica,

  cerrarSesionUnica,

  listarSesionesUnicas,

  cerrarSesionPorDireccion,

};
