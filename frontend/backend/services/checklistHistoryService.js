const {
  createHash,
  randomUUID,
} = require("node:crypto");


// ==================================================
// CONFIGURACIÓN
// ==================================================

const NOMBRE_BUCKET =
  "Nombre: mega-data";

const CARPETA_CHECKLISTS =
  "checklists-foco-rojo/v1";

const CARPETA_SESIONES =
  "checklists-foco-rojo/sesiones";

const CARPETA_SESIONES_ABORTADAS =
  "checklists-foco-rojo/sesiones-abortadas";

// Respaldo para desarrollo local sin Supabase.

const historialMemoria =
  new Map();

const sesionesMemoria =
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
// CREAR CLAVE PRIVADA SUPERVISOR + PROMOTOR
// ==================================================

function crearClave(
  supervisor,
  promotor
) {

  const identidad =
    [
      normalizarTexto(
        supervisor
      ),

      normalizarTexto(
        promotor
      ),
    ].join(
      "\0"
    );


  return createHash(
    "sha256"
  )
    .update(
      identidad
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
    (
      !supabaseUrl ||
      !clave
    ) &&
    process.env.NODE_ENV === "production"
  ) {

    throw new Error(
      "Falta la configuración de Supabase para  los checklists"
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
// VALIDAR RESPUESTA DE SUPABASE
// ==================================================

async function validarRespuesta(
  respuesta
) {

  if (
    respuesta.ok
  ) {

    return respuesta;

  }


  const mensaje =
    await respuesta.text();


  throw new Error(
    `Checklist Storage HTTP ${respuesta.status}: ${mensaje.slice(
      0,
      300
    )}`
  );

}


// ==================================================
// CONSTRUIR RUTA SEGURA PARA SUPABASE
// ==================================================

function codificarRuta(
  ruta
) {

  return ruta
    .split(
      "/"
    )
    .map(
      encodeURIComponent
    )
    .join(
      "/"
    );

}


// ==================================================
// INICIAR SESIÓN DEL CHECKLIST
// ==================================================

async function iniciarChecklist({

  supervisor,

  promotor,

  usuario,

}) {

  const sesion = {

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

    usuario:
      String(
        usuario ?? ""
      ).trim(),

    inicio:
      new Date().toISOString(),

  };


  const configuracion =
    obtenerConfiguracion();


  // Desarrollo local.

  if (
    !configuracion
  ) {

    sesionesMemoria.set(
      sesion.id,
      sesion
    );

    return sesion.id;

  }


  const ruta =
    `${CARPETA_SESIONES}/${sesion.id}.json`;


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
                "false",

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


  return sesion.id;

}


// ==================================================
// OBTENER SESIÓN DEL CHECKLIST
// ==================================================

async function obtenerSesion({

  sesionId,

  supervisor,

  promotor,

  usuario,

}) {

  if (
    typeof sesionId !== "string" ||
    !/^[a-f0-9-]{36}$/i.test(
      sesionId
    )
  ) {

    return null;

  }


  const configuracion =
    obtenerConfiguracion();

  let sesion;


  // Desarrollo local.

  if (
    !configuracion
  ) {

    sesion =
      sesionesMemoria.get(
        sesionId
      );

  } else {

    const ruta =
      `${CARPETA_SESIONES}/${sesionId}.json`;


    const url =
      `${configuracion.supabaseUrl}/storage/v1/object/authenticated/${encodeURIComponent(
        NOMBRE_BUCKET
      )}/${codificarRuta(
        ruta
      )}`;


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


    sesion =
      await respuesta.json();

  }


  if (
    !sesion
  ) {

    return null;

  }


  const mismaIdentidad =
    crearClave(
      sesion.supervisor,
      sesion.promotor
    ) ===
    crearClave(
      supervisor,
      promotor
    );


  const mismoUsuario =
    String(
      sesion.usuario ?? ""
    ).trim() ===
    String(
      usuario ?? ""
    ).trim();


  if (
    !mismaIdentidad ||
    !mismoUsuario
  ) {

    return null;

  }


  return sesion;

}


// ==================================================
// ABORTAR SESIÓN PENDIENTE DEL CHECKLIST
// ==================================================

async function abortarSesionChecklist({

  sesionId,

  abortadoPor,

  motivo = "",

}) {

  if (
    typeof sesionId !== "string" ||
    !/^[a-f0-9-]{36}$/i.test(
      sesionId
    )
  ) {

    return null;

  }


  const configuracion =
    obtenerConfiguracion();


  // ================================================
  // DESARROLLO LOCAL
  // ================================================

  if (
    !configuracion
  ) {

    const sesion =
      sesionesMemoria.get(
        sesionId
      );


    if (
      !sesion
    ) {

      return null;

    }


    const sesionAbortada = {

      ...sesion,

      estado:
        "ABORTADA",

      abortadoPor:
        String(
          abortadoPor ?? ""
        ).trim(),

      motivo:
        String(
          motivo ?? ""
        )
          .trim()
          .slice(
            0,
            500
          ),

      abortadaEn:
        new Date().toISOString(),

    };


    sesionesMemoria.delete(
      sesionId
    );


    return sesionAbortada;

  }


  // ================================================
  // LEER LA SESIÓN ACTIVA
  // ================================================

  const rutaActiva =
    `${CARPETA_SESIONES}/${sesionId}.json`;


  const urlLectura =
    `${configuracion.supabaseUrl}/storage/v1/object/authenticated/${encodeURIComponent(
      NOMBRE_BUCKET
    )}/${codificarRuta(
      rutaActiva
    )}`;


  const respuestaLectura =
    await fetch(
      urlLectura,
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
    respuestaLectura.status === 400 ||
    respuestaLectura.status === 404
  ) {

    return null;

  }


  await validarRespuesta(
    respuestaLectura
  );


  const sesion =
    await respuestaLectura.json();


  // ================================================
  // CREAR REGISTRO DE AUDITORÍA
  // ================================================

  const sesionAbortada = {

    ...sesion,

    estado:
      "ABORTADA",

    abortadoPor:
      String(
        abortadoPor ?? ""
      ).trim(),

    motivo:
      String(
        motivo ?? ""
      )
        .trim()
        .slice(
          0,
          500
        ),

    abortadaEn:
      new Date().toISOString(),

  };


  const rutaAbortada =
    `${CARPETA_SESIONES_ABORTADAS}/${sesionId}.json`;


  const urlAbortada =
    `${configuracion.supabaseUrl}/storage/v1/object/${encodeURIComponent(
      NOMBRE_BUCKET
    )}/${codificarRuta(
      rutaAbortada
    )}`;


  const respuestaAbortada =
    await fetch(
      urlAbortada,
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
            sesionAbortada
          ),

      }
    );


  await validarRespuesta(
    respuestaAbortada
  );


  // ================================================
  // ELIMINAR ÚNICAMENTE LA SESIÓN ACTIVA
  // ================================================

  const urlEliminar =
    `${configuracion.supabaseUrl}/storage/v1/object/${encodeURIComponent(
      NOMBRE_BUCKET
    )}/${codificarRuta(
      rutaActiva
    )}`;


  const respuestaEliminar =
    await fetch(
      urlEliminar,
      {

        method:
          "DELETE",

        headers:
          crearHeaders(
            configuracion.clave
          ),

      }
    );


  await validarRespuesta(
    respuestaEliminar
  );


  return sesionAbortada;

}




// ==================================================
// CONSULTAR ESTADO DE UNA SESIÓN DE CHECKLIST
// ==================================================

async function obtenerEstadoSesionChecklist({

  sesionId,

  supervisor,

  promotor,

  usuario,

}) {

  if (
    typeof sesionId !== "string" ||
    !/^[a-f0-9-]{36}$/i.test(
      sesionId
    )
  ) {

    return {

      estado:
        "NO_ENCONTRADA",

    };

  }


  // Primero buscamos la sesión activa usando
  // todas las validaciones de identidad existentes.

  const sesionActiva =
    await obtenerSesion({

      sesionId,

      supervisor,

      promotor,

      usuario,

    });


  if (
    sesionActiva
  ) {

    const antiguedad =
      Date.now() -
      Date.parse(
        sesionActiva.inicio
      );


    const expirada =
      !Number.isFinite(
        antiguedad
      ) ||
      antiguedad >
        24 *
        60 *
        60 *
        1000;


    return {

      estado:
        expirada
          ? "EXPIRADA"
          : "ACTIVA",

      inicio:
        sesionActiva.inicio,

      expirada,

    };

  }


  const configuracion =
    obtenerConfiguracion();


  // En desarrollo local, las sesiones abortadas
  // ya no permanecen en el mapa activo.

  if (
    !configuracion
  ) {

    return {

      estado:
        "NO_ENCONTRADA",

    };

  }


  // Consultar el respaldo de auditoría para saber
  // si Dirección abortó esta sesión.

  const rutaAbortada =
    `${CARPETA_SESIONES_ABORTADAS}/${sesionId}.json`;


  const urlAbortada =
    `${configuracion.supabaseUrl}/storage/v1/object/authenticated/${encodeURIComponent(
      NOMBRE_BUCKET
    )}/${codificarRuta(
      rutaAbortada
    )}`;


  const respuestaAbortada =
    await fetch(
      urlAbortada,
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
    respuestaAbortada.status === 400 ||
    respuestaAbortada.status === 404
  ) {

    return {

      estado:
        "NO_ENCONTRADA",

    };

  }


  await validarRespuesta(
    respuestaAbortada
  );


  const sesionAbortada =
    await respuestaAbortada.json();


  const mismaIdentidad =
    crearClave(
      sesionAbortada.supervisor,
      sesionAbortada.promotor
    ) ===
    crearClave(
      supervisor,
      promotor
    );


  const mismoUsuario =
    String(
      sesionAbortada.usuario ?? ""
    ).trim() ===
    String(
      usuario ?? ""
    ).trim();


  if (
    !mismaIdentidad ||
    !mismoUsuario
  ) {

    return {

      estado:
        "NO_ENCONTRADA",

    };

  }


  return {

    estado:
      "ABORTADA",

    abortadaEn:
      sesionAbortada.abortadaEn,

    motivo:
      sesionAbortada.motivo || "",

  };

}



// ==================================================
// LISTAR SESIONES PENDIENTES DE CHECKLIST
// ==================================================

async function listarSesionesPendientes() {

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
        (sesion) => {

          const antiguedad =
            Date.now() -
            Date.parse(
              sesion.inicio
            );


          return {

            id:
              sesion.id,

            supervisor:
              sesion.supervisor,

            promotor:
              sesion.promotor,

            usuario:
              sesion.usuario,

            inicio:
              sesion.inicio,

            expirada:
              !Number.isFinite(
                antiguedad
              ) ||
              antiguedad >
                24 *
                60 *
                60 *
                1000,

          };

        }
      )
      .sort(
        (a, b) =>
          String(
            b.inicio
          ).localeCompare(
            String(
              a.inicio
            )
          )
      );

  }


  // ================================================
  // LISTAR ARCHIVOS DE SESIONES EN SUPABASE
  // ================================================

  const sesiones = [];

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
                CARPETA_SESIONES,

              limit:
                100,

              offset,

              sortBy: {

                column:
                  "created_at",

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


    for (
      const archivo
      of archivos
    ) {

      const rutaSesion =
        `${CARPETA_SESIONES}/${archivo.name}`;


      const urlSesion =
        `${configuracion.supabaseUrl}/storage/v1/object/authenticated/${encodeURIComponent(
          NOMBRE_BUCKET
        )}/${codificarRuta(
          rutaSesion
        )}`;


      const respuestaSesion =
        await fetch(
          urlSesion,
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
        !respuestaSesion.ok
      ) {

        continue;

      }


      const sesion =
        await respuestaSesion.json();


      if (
        !sesion?.id ||
        !sesion?.supervisor ||
        !sesion?.promotor
      ) {

        continue;

      }


      // Verificar si esta sesión ya generó
      // un checklist terminado.

      const clavePromotor =
        crearClave(
          sesion.supervisor,
          sesion.promotor
        );


      const rutaChecklist =
        `${CARPETA_CHECKLISTS}/${clavePromotor}/${sesion.id}.json`;


      const urlChecklist =
        `${configuracion.supabaseUrl}/storage/v1/object/authenticated/${encodeURIComponent(
          NOMBRE_BUCKET
        )}/${codificarRuta(
          rutaChecklist
        )}`;


      const respuestaChecklist =
        await fetch(
          urlChecklist,
          {

            method:
              "GET",

            headers:
              crearHeaders(
                configuracion.clave
              ),

          }
        );


      // Si ya existe un resultado terminado,
      // la sesión no está pendiente.

      if (
        respuestaChecklist.ok
      ) {

        continue;

      }


      const antiguedad =
        Date.now() -
        Date.parse(
          sesion.inicio
        );


      sesiones.push({

        id:
          sesion.id,

        supervisor:
          normalizarTexto(
            sesion.supervisor
          ),

        promotor:
          normalizarTexto(
            sesion.promotor
          ),

        usuario:
          String(
            sesion.usuario ?? ""
          ).trim(),

        inicio:
          sesion.inicio,

        expirada:
          !Number.isFinite(
            antiguedad
          ) ||
          antiguedad >
            24 *
            60 *
            60 *
            1000,

      });

    }


    if (
      archivos.length < 100
    ) {

      break;

    }


    offset +=
      100;

  }


  return sesiones.sort(
    (a, b) =>
      String(
        b.inicio
      ).localeCompare(
        String(
          a.inicio
        )
      )
  );

}


// ==================================================
// GUARDAR CHECKLIST TERMINADO
// ==================================================

async function guardarChecklist(
  datos
) {

  const clavePromotor =
    crearClave(
      datos.supervisor,
      datos.promotor
    );


  const fechaFin =
    new Date().toISOString();


  const registro = {

    ...datos,

    id:
      datos.sesionId ||
      randomUUID(),

    fechaHora:
      fechaFin,

    fin:
      fechaFin,

  };


  const configuracion =
    obtenerConfiguracion();


  // Desarrollo local.

  if (
    !configuracion
  ) {

    const anteriores =
      historialMemoria.get(
        clavePromotor
      ) || [];


    const duplicado =
      anteriores.some(
        (item) =>
          item.id === registro.id
      );


    if (
      duplicado
    ) {

      throw new Error(
        "Esta sesión del checklist ya fue guardada"
      );

    }


    historialMemoria.set(
      clavePromotor,
      [
        ...anteriores,
        registro,
      ]
    );


    return registro;

  }


  const ruta =
    `${CARPETA_CHECKLISTS}/${clavePromotor}/${registro.id}.json`;


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
                "false",

            }
          ),

        body:
          JSON.stringify(
            registro
          ),

      }
    );


  await validarRespuesta(
    respuesta
  );


  return registro;

}


// ==================================================
// LEER HISTORIAL DEL PROMOTOR
// ==================================================

async function obtenerHistorial({

  supervisor,

  promotor,

}) {

  const clavePromotor =
    crearClave(
      supervisor,
      promotor
    );


  const configuracion =
    obtenerConfiguracion();


  // Desarrollo local.

  if (
    !configuracion
  ) {

    return [
      ...(
        historialMemoria.get(
          clavePromotor
        ) || []
      ),
    ].sort(
      (a, b) =>
        String(
          a.fechaHora
        ).localeCompare(
          String(
            b.fechaHora
          )
        )
    );

  }


  const prefijo =
    `${CARPETA_CHECKLISTS}/${clavePromotor}`;


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
                prefijo,

              limit:
                100,

              offset,

              sortBy: {

                column:
                  "name",

                order:
                  "asc",

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
        `${prefijo}/${archivo.name}`;


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


      const registro =
        await respuestaArchivo.json();


      registros.push(
        registro
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
        a.fechaHora
      ).localeCompare(
        String(
          b.fechaHora
        )
      )
  );

}


// ==================================================
// EXPORTACIONES
// ==================================================

module.exports = {

  iniciarChecklist,

  obtenerSesion,

  abortarSesionChecklist,

  obtenerEstadoSesionChecklist,

  listarSesionesPendientes,

  guardarChecklist,

  obtenerHistorial,

};
