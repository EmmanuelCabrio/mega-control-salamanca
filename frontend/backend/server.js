const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();

const {
  obtenerUsuarios,
  validarUsuario,
  leerExcel,
  leerVentaVsMesAnterior,
  leerPlantilla,
  leerProductividadAntiguedad,
  leerPromotoresProductividadBaja,
  leerCeroVentasPorCanal,
  leerCarteraPorDia,
  leerProyeccion,
  leerDetalleVentaMensual,
  leerComparativaRecuperacionMesAnterior,
  leerGestionOdc,
  leerRecuperacionYCortes,
  leerRecuperacionVsPresupuesto,
  leerVisitasPorTipoGestion,
  leerAnalisisSabanaRecuperacion,
  actualizarDatosDesdeSupabase,
  reemplazarExcelEnSupabase,
  descargarExcelDesdeSupabase,
} = require("./services/excelService");

const {
  registrarLoginSupervisor,
  obtenerLoginsDelDia,
} = require(
  "./services/loginTrackerService"
);

// ==================================================
// CONFIGURACIÓN
// ==================================================

const app = express();

const PORT =
  process.env.PORT || 3001;

const JWT_SECRET =
  process.env.JWT_SECRET;


// ==================================================
// VALIDAR CONFIGURACIÓN
// ==================================================

if (!JWT_SECRET) {

  console.error(
    "❌ ERROR: Falta JWT_SECRET en el archivo .env"
  );

  process.exit(1);

}


// ==================================================
// MIDDLEWARE
// ==================================================

app.use(
  cors({

    origin: [

      "http://localhost:5173",

      "http://localhost:3000",

      "https://mega-control-salamanca-frontend.onrender.com",

      process.env.FRONTEND_URL,

    ].filter(Boolean),

    methods: [
      "GET",
      "POST",
      "OPTIONS",
    ],

    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-File-Name",
    ],

  })
);


app.use(
  express.json()
);


// ==================================================
// FUNCIONES AUXILIARES
// ==================================================

function normalizarSupervisor(
  supervisor
) {

  return String(
    supervisor || ""
  )
    .trim()
    .toUpperCase();

}


// ==================================================
// NORMALIZAR ROL
// ==================================================

function normalizarRol(
  rol
) {

  return String(
    rol || ""
  )
    .trim()
    .toUpperCase();

}


// ==================================================
// ACCESO AL PANEL DE RECUPERACIÓN
// ==================================================

function puedeAccederRecuperacion(
  rol
) {

  const rolNormalizado =
    normalizarRol(
      rol
    );


  return (
    rolNormalizado === "RECUPERACION" ||
    rolNormalizado === "DIRECCIÓN"
  );

}


// ==================================================
// AUTENTICACIÓN
// ==================================================

function autenticarToken(
  req,
  res,
  next
) {

  try {

    const encabezado =
      req.headers.authorization;


    if (
      !encabezado ||
      !encabezado.startsWith(
        "Bearer "
      )
    ) {

      return res.status(401).json({

        correcto: false,

        mensaje:
          "No autorizado",

      });

    }


    const token =
      encabezado.substring(7);


    const datos =
      jwt.verify(
        token,
        JWT_SECRET
      );


    const rol =
      normalizarRol(
        datos.rol
      );


   const tieneSupervisor =
  Boolean(
    normalizarSupervisor(
      datos.supervisor
    )
  );

const tieneSupervisorPromotor =
  Boolean(
    normalizarSupervisor(
      datos.supervisorPromotor
    )
  );

const tokenValido =
  rol === "DIRECCIÓN" ||
  rol === "RECUPERACION" ||
  (
    rol === "SUPERVISOR" &&
    tieneSupervisor
  ) ||
  (
    rol === "PROMOTOR" &&
    tieneSupervisorPromotor &&
    datos.empleado
  );


if (!tokenValido) {

  return res.status(401).json({

    correcto: false,

    mensaje:
      "Token inválido",

  });

}


    req.supervisor =
      normalizarSupervisor(
        datos.supervisor
      );

    req.supervisorPromotor =
  normalizarSupervisor(
    datos.supervisorPromotor
  );

req.empleado =
  String(
    datos.empleado ?? ""
  ).trim();


    req.usuario =
      datos.usuario || "";

    req.rol =
      rol;


    next();

  } catch (error) {

    return res.status(401).json({

      correcto: false,

      mensaje:
        "Sesión inválida o expirada",

    });

  }

}


// ==================================================
// RUTA PRINCIPAL
// ==================================================

app.get(
  "/",
  (req, res) => {

    res.json({

      correcto: true,

      mensaje:
        "🚀 Backend SEGUIMIENTO 2.0 funcionando",

    });

  }
);


// ==================================================
// LOGIN
// ==================================================

app.post(
  "/auth/login",
  async (req, res) => {

    try {

      const {
        usuario,
        password,
      } = req.body;


      if (
        !usuario ||
        !password
      ) {

        return res.status(400).json({

          correcto: false,

          mensaje:
            "Usuario y contraseña son obligatorios",

        });

      }


      const resultado =
        validarUsuario(
          usuario,
          password
        );


      if (
        !resultado.correcto
      ) {

        return res.status(401).json(
          resultado
        );

      }


    await leerExcel();

const supervisor =
  normalizarSupervisor(
    resultado.supervisor
  );

const supervisorPromotor =
  normalizarSupervisor(
    resultado.supervisorPromotor
  );

const empleado =
  String(
    resultado.empleado ?? ""
  ).trim();


       const rol =
       normalizarRol(
        resultado.rol
  );


      const token =
  jwt.sign(

    {

      usuario:
        String(usuario)
          .trim()
          .toUpperCase(),

      supervisor,

      supervisorPromotor,

      empleado,

      rol:
        normalizarRol(
          resultado.rol
        ),

    },

    JWT_SECRET,

    {

      expiresIn:
        "12h",

    }

  );





      // ==========================================
// REGISTRAR ACCESO DEL SUPERVISOR
// ==========================================

try {

  await registrarLoginSupervisor({

    supervisor,

    rol,

  });

} catch (errorRegistro) {

  // Un problema con el registro no debe
  // impedir que el supervisor inicie sesión.

  console.error(
    "⚠️ No se pudo registrar el login:"
  );

  console.error(
    errorRegistro
  );

}


      return res.json({

        correcto: true,

        token,

        supervisor,

        empleado:
          resultado.empleado,

        rol,
      });

    } catch (error) {

      console.error(
        "❌ Error en /auth/login:"
      );

      console.error(
        error
      );


      return res.status(500).json({

        correcto: false,

        mensaje:
          "Error interno del servidor",

      });

    }

  }
);


// ==================================================
// 👑 DIRECCIÓN — LOGIN DE SUPERVISORES HOY
// ==================================================

app.get(
  "/api/direccion/logins-hoy",
  autenticarToken,
  async (req, res) => {

    try {

      // ============================================
      // ACCESO EXCLUSIVO PARA DIRECCIÓN
      // ============================================

      if (
        normalizarRol(
          req.rol
        ) !== "DIRECCIÓN"
      ) {

        return res
          .status(403)
          .json({

            correcto: false,

            mensaje:
              "Acceso exclusivo para Dirección",

          });

      }


      // ============================================
      // USUARIOS ACTIVOS DEL EXCEL
      // ============================================

      const usuarios =
        obtenerUsuarios();


      // ============================================
      // ACCESOS REGISTRADOS HOY
      // ============================================

      const {
        fecha,
        accesos,
      } =
        await obtenerLoginsDelDia();


      const mapaSupervisores =
        new Map();


      // ============================================
      // SOLO SUPERVISORES ACTIVOS
      // ============================================

      for (
        const usuario
        of usuarios
      ) {

        const estado =
          String(
            usuario.estado || ""
          )
            .trim()
            .toUpperCase();


        const rol =
          normalizarRol(
            usuario.rol
          );


        const supervisor =
          String(
            usuario.supervisor || ""
          ).trim();


        const clave =
          normalizarSupervisor(
            supervisor
          );


        if (
          estado !== "ACTIVO" ||
          rol !== "SUPERVISOR" ||
          !clave
        ) {

          continue;

        }


        const acceso =
          accesos[
            clave
          ] || null;


        mapaSupervisores.set(
          clave,
          {

            clave,

            supervisor,

            logueado:
              Boolean(
                acceso
              ),

            primerAcceso:
              acceso?.primerAcceso ||
              null,

            ultimoAcceso:
              acceso?.ultimoAcceso ||
              null,

            accesos:
              Number(
                acceso?.accesos || 0
              ),

          }
        );

      }


      const supervisores =
        Array.from(
          mapaSupervisores.values()
        );


      // ============================================
      // YA SE LOGUEARON
      // ============================================

      const logueados =
        supervisores
          .filter(
            (registro) =>
              registro.logueado
          )
          .sort(
            (
              registroA,
              registroB
            ) =>

              new Date(
                registroA.primerAcceso
              ) -

              new Date(
                registroB.primerAcceso
              )
          );


      // ============================================
      // PENDIENTES
      // ============================================

      const pendientes =
        supervisores
          .filter(
            (registro) =>
              !registro.logueado
          )
          .sort(
            (
              registroA,
              registroB
            ) =>

              registroA.supervisor
                .localeCompare(
                  registroB.supervisor,
                  "es"
                )
          );


      // ============================================
      // RESPUESTA
      // ============================================

      return res.json({

        correcto: true,

        fecha,

        total:
          supervisores.length,

        totalLogueados:
          logueados.length,

        totalPendientes:
          pendientes.length,

        logueados,

        pendientes,

      });


    } catch (error) {

      console.error(
        "❌ Error en /api/direccion/logins-hoy:"
      );

      console.error(
        error
      );


      return res
        .status(500)
        .json({

          correcto: false,

          mensaje:
            "No se pudo consultar el estado de los accesos",

        });

    }

  }
);


// ==================================================
// PENETRACIÓN POR COLONIA
// ==================================================

app.get(
  "/api/penetracion",
  autenticarToken,
  async (req, res) => {

    try {

      const datos =
        await leerExcel();


      return res.json({

        correcto: true,

        registros:
          datos.penetracion || [],

      });

    } catch (error) {

      console.error(
        "❌ Error en /api/penetracion:"
      );

      console.error(
        error
      );


      return res.status(500).json({

        correcto: false,

        mensaje:
          "No se pudo cargar la información de penetración",

      });

    }

  }
);


// ==================================================
// AVANCE SEMANAL
// ==================================================

app.get(
  "/api/avance-semanal",
  autenticarToken,
  async (req, res) => {

    try {

      const datos =
        await leerExcel();

      const supervisor =
        req.supervisor;

      const registros =
        (datos.avanceSemanal || [])
          .filter(
            (item) =>
              normalizarSupervisor(
                item.supervisor
              ) === supervisor
          );


      return res.json({

        correcto: true,

        supervisor,

        registros,

      });

    } catch (error) {

      console.error(
        "❌ Error en /api/avance-semanal:"
      );

      console.error(
        error
      );


      return res.status(500).json({

        correcto: false,

        mensaje:
          "No se pudo cargar el avance semanal",

      });

    }

  }
);


// ==================================================
// RANKING DE SUPERVISORES
// ==================================================

app.get(
  "/api/ranking-supervisores",
  autenticarToken,
  async (req, res) => {

    try {

      const datos =
        await leerExcel();


      const ranking =
        (datos.rankingSupervisores || [])

          .filter(
            (item) =>
              normalizarSupervisor(
                item.supervisor
              ) !==
              "MORALES PEREZ BENJAMIN"
          )

          .map(
            (item) => ({

              supervisor:
                item.supervisor,

              productividad:
                Number(
                  item.productividad || 0
                ),

              posicion:
                item.posicion,

              movil:
                Number(
                  item.movil || 0
                ),

              netflix:
                Number(
                  item.netflix || 0
                ),

              disney:
                Number(
                  item.disney || 0
                ),

              max:
                Number(
                  item.max || 0
                ),

            })
          );


      return res.json({

        correcto: true,

        ranking,

      });

    } catch (error) {

      console.error(
        "❌ Error en /api/ranking-supervisores:"
      );

      console.error(
        error
      );


      return res.status(500).json({

        correcto: false,

        mensaje:
          "No se pudo cargar el ranking de supervisores",

      });

    }

  }
);


// ==================================================
// REGISTROS DEL EQUIPO
// ==================================================

app.get(
  "/api/registros",
  autenticarToken,
  async (req, res) => {

    try {

      const datos =
        await leerExcel();


      const rol =
        normalizarRol(
          req.rol
        );


      // Dirección recibe todos los registros.
      if (
        rol === "DIRECCIÓN"
      ) {

        const registros =
          datos.registros || [];


        console.log(
          "👔 DIRECCIÓN - REGISTROS TOTALES:",
          registros.length
        );


        return res.json({

          correcto: true,

          rol,

          registros,

        });

      }


      const supervisor =
        req.supervisor;


      const registros =
        (datos.registros || [])
          .filter(
            (registro) =>
              normalizarSupervisor(
                registro.supervisor
              ) === supervisor
          );


      console.log(
        "👨‍💼 SUPERVISOR:",
        supervisor
      );

      console.log(
        "👥 REGISTROS DE SU EQUIPO:",
        registros.length
      );


      return res.json({

        correcto: true,

        rol,

        supervisor,

        registros,

      });

    } catch (error) {

      console.error(
        "❌ Error en /api/registros:"
      );

      console.error(
        error
      );


      return res.status(500).json({

        correcto: false,

        mensaje:
          "No se pudieron cargar los registros",

      });

    }

  }
);


// ==================================================
// RECUPERACIONES VS MISMO DÍA DEL MES ANTERIOR
// ==================================================

app.get(
  "/api/recuperaciones-vs-mes-anterior",
  autenticarToken,
  async (req, res) => {

    try {

      const rol =
        normalizarRol(
          req.rol
        );


      // ============================================
      // PREPARAR EL RESUMEN DE UN SUPERVISOR
      // ============================================

      const crearResumen =
        (
          supervisor,
          comparativa
        ) => ({

          supervisor,

          clave:
            normalizarSupervisor(
              supervisor
            ),

          actual:
            Number(
              comparativa.totalActual ||
              0
            ),

          anterior:
            Number(
              comparativa.totalAnteriorMismoDia ||
              0
            ),

          diferencia:
            Number(
              comparativa.diferencia ||
              0
            ),

          variacionPorcentaje:
            comparativa.variacionPorcentaje,

        });


      // ============================================
      // DIRECCIÓN — TODOS LOS SUPERVISORES
      // ============================================

      if (
        rol === "DIRECCIÓN"
      ) {

        const datosExcel =
          await leerExcel();

        const mapaSupervisores =
          new Map();


        for (
          const registro of
          datosExcel.registros || []
        ) {

          const supervisor =
            String(
              registro.supervisor ?? ""
            ).trim();

          const clave =
            normalizarSupervisor(
              supervisor
            );


          if (
            !clave ||
            clave === "0" ||
            clave === "SUPERVISOR" ||
            clave === "TOTAL"
          ) {

            continue;

          }


          mapaSupervisores.set(
            clave,
            supervisor
          );

        }


        const supervisores = [];

        let referencia =
          null;


        for (
          const supervisor of
          mapaSupervisores.values()
        ) {

          const comparativa =
            leerComparativaRecuperacionMesAnterior(
              supervisor
            );


          referencia =
            referencia ||
            comparativa;


          supervisores.push(
            crearResumen(
              supervisor,
              comparativa
            )
          );

        }


        // ==========================================
        // MAYOR DÉFICIT PRIMERO
        // ==========================================

        supervisores.sort(
          (
            registroA,
            registroB
          ) => {

            if (
              registroA.diferencia !==
              registroB.diferencia
            ) {

              return (
                registroA.diferencia -
                registroB.diferencia
              );

            }


            return (
              registroB.actual -
              registroA.actual
            );

          }
        );


        return res.json({

          correcto: true,

          fechaCorte:
            referencia?.fechaCorte ||
            null,

          mesActual:
            referencia?.mesActual ||
            null,

          mesAnterior:
            referencia?.mesAnterior ||
            null,

          supervisores,

        });

      }


      // ============================================
      // SUPERVISOR — ÚNICAMENTE SU RESULTADO
      // ============================================

      const comparativa =
        leerComparativaRecuperacionMesAnterior(
          req.supervisor
        );


      const resumen =
        crearResumen(
          req.supervisor,
          comparativa
        );


     return res.json({

  correcto: true,

  fechaCorte:
    comparativa.fechaCorte,

  mesActual:
    comparativa.mesActual,

  mesAnterior:
    comparativa.mesAnterior,

  resumen,

  integrantes:
    comparativa.comparativaIntegrantes ||
    [],

});

    } catch (error) {

      console.error(
        "❌ Error en Recuperaciones vs Mes Anterior:"
      );

      console.error(
        error
      );


      return res.status(500).json({

        correcto: false,

        mensaje:
          "No se pudo cargar Recuperaciones vs Mes Anterior",

      });

    }

  }
);

// ==================================================
// GESTIÓN DE ÓRDENES DE COBRANZA
// ==================================================

app.get(
  "/api/recuperacion/gestion-odc",
  autenticarToken,
  async (req, res) => {

    if (
      !puedeAccederRecuperacion(
        req.rol
      )
    ) {

      return res.status(403).json({

        correcto: false,

        mensaje:
          "Acceso exclusivo del equipo de Recuperación",

      });

    }


    try {

      const gestion =
        leerGestionOdc();


      return res.json({

        correcto: true,

        ...gestion,

      });

    } catch (error) {

      console.error(
        "❌ Error en Gestión de ODC:"
      );

      console.error(
        error
      );


      return res.status(500).json({

        correcto: false,

        mensaje:
          "No se pudo cargar la Gestión de ODC",

      });

    }

  }
);


// ==================================================
// RECUPERACIÓN CON/SIN ESFUERZO Y CORTES
// ==================================================

app.get(
  "/api/recuperacion/recuperacion-cortes",
  autenticarToken,
  async (req, res) => {

    if (
      !puedeAccederRecuperacion(
        req.rol
      )
    ) {

      return res.status(403).json({

        correcto: false,

        mensaje:
          "Acceso exclusivo del equipo de Recuperación",

      });

    }


    try {

      const panorama =
        leerRecuperacionYCortes();


      return res.json({

        correcto: true,

        ...panorama,

      });

    } catch (error) {

      console.error(
        "❌ Error en Recuperación y Cortes:"
      );

      console.error(
        error
      );


      return res.status(500).json({

        correcto: false,

        mensaje:
          "No se pudo cargar Recuperación y Cortes",

      });

    }

  }
);


// ==================================================
// RECUPERACIÓN VS PRESUPUESTO
// ==================================================

app.get(
  "/api/recuperacion/presupuesto",
  autenticarToken,
  async (req, res) => {

    if (
      !puedeAccederRecuperacion(
        req.rol
      )
    ) {

      return res.status(403).json({

        correcto: false,

        mensaje:
          "Acceso exclusivo del equipo de Recuperación",

      });

    }


    try {

      const presupuesto =
        leerRecuperacionVsPresupuesto();


      return res.json({

        correcto: true,

        ...presupuesto,

      });

    } catch (error) {

      console.error(
        "❌ Error en Recuperación vs Presupuesto:"
      );

      console.error(
        error
      );


      return res.status(500).json({

        correcto: false,

        mensaje:
          "No se pudo cargar Recuperación vs Presupuesto",

      });

    }

  }
);


// ==================================================
// VISITAS POR TIPO DE GESTIÓN
// ==================================================

app.get(
  "/api/recuperacion/gestion-por-motivo",
  autenticarToken,
  async (req, res) => {

    if (
      !puedeAccederRecuperacion(
        req.rol
      )
    ) {

      return res.status(403).json({

        correcto: false,

        mensaje:
          "Acceso exclusivo del equipo de Recuperación",

      });

    }


    try {

      const gestion =
        leerVisitasPorTipoGestion();


      return res.json({

        correcto: true,

        ...gestion,

      });

    } catch (error) {

      console.error(
        "❌ Error en Visitas por Tipo de Gestión:"
      );

      console.error(
        error
      );


      return res.status(500).json({

        correcto: false,

        mensaje:
          "No se pudo cargar la gestión por motivo",

      });

    }

  }
);


// ==================================================
// ANÁLISIS DE SÁBANA DE RECUPERACIÓN
// ==================================================

app.get(
  "/api/recuperacion/analisis-sabana",
  autenticarToken,
  async (req, res) => {

    if (
      !puedeAccederRecuperacion(
        req.rol
      )
    ) {

      return res.status(403).json({

        correcto: false,

        mensaje:
          "Acceso exclusivo del equipo de Recuperación",

      });

    }


    try {

      const analisis =
        leerAnalisisSabanaRecuperacion();


      return res.json({

        correcto: true,

        ...analisis,

      });

    } catch (error) {

      console.error(
        "❌ Error en Análisis de Sábana de Recuperación:"
      );

      console.error(
        error
      );


      return res.status(500).json({

        correcto: false,

        mensaje:
          "No se pudo cargar el análisis de la Sábana de Recuperación",

      });

    }

  }
);


// ==================================================
// RECUPERACIÓN VS MISMO DÍA DEL MES ANTERIOR
// ==================================================

app.get(
  "/api/recuperacion/comparativa-mes-anterior",
  autenticarToken,
  async (req, res) => {

    if (
      !puedeAccederRecuperacion(
        req.rol
      )
    ) {

      return res.status(403).json({

        correcto: false,

        mensaje:
          "Acceso exclusivo del equipo de Recuperación",

      });

    }


    try {

      const supervisorRecuperacion =
        normalizarRol(
          req.rol
        ) === "DIRECCIÓN"
          ? "MORALES PEREZ BENJAMIN"
          : req.supervisor;


      const comparativa =
        leerComparativaRecuperacionMesAnterior(
          supervisorRecuperacion
        );


      return res.json({

        correcto: true,

        ...comparativa,

      });

    } catch (error) {

      console.error(
        "❌ Error en comparativa de Recuperación:"
      );

      console.error(
        error
      );


      return res.status(500).json({

        correcto: false,

        mensaje:
          "No se pudo cargar la comparativa de Recuperación",

      });

    }

  }
);


// ==================================================
// TOP 3 CL SALAMANCA
// ==================================================

app.get(
  "/api/top3-cl",
  autenticarToken,
  async (req, res) => {

    try {

      const datos =
        await leerExcel();


      const ranking =
        (datos.registros || [])

          .filter(
            (registro) =>
              normalizarSupervisor(
                registro.supervisor
              ) !==
              "MORALES PEREZ BENJAMIN"
          )

          .sort(
            (a, b) =>
              Number(
                b.productividad || 0
              ) -
              Number(
                a.productividad || 0
              )
          )

          .slice(0, 3)

          .map(
            (registro, index) => ({

              posicion:
                index + 1,

              nombre:
                registro.nombre,

              productividad:
                Number(
                  registro.productividad || 0
                ),

            })
          );


      return res.json({

        correcto: true,

        ranking,

      });

    } catch (error) {

      console.error(
        "❌ Error en /api/top3-cl:"
      );

      console.error(
        error
      );


      return res.status(500).json({

        correcto: false,

        mensaje:
          "No se pudo cargar el Top 3 CL",

      });

    }

  }
);


// ==================================================
// PLAN DE TRABAJO
// ==================================================

app.get(
  "/api/plan-trabajo",
  autenticarToken,
  async (req, res) => {

    try {

      const datos =
        await leerExcel();

      const supervisor =
        req.supervisor;

      const registros =
        (datos.planTrabajo || [])
          .filter(
            (registro) =>
              normalizarSupervisor(
                registro.supervisor
              ) === supervisor
          );


      return res.json({

        correcto: true,

        registros,

      });

    } catch (error) {

      console.error(
        "❌ Error en /api/plan-trabajo:"
      );

      console.error(
        error
      );


      return res.status(500).json({

        correcto: false,

        mensaje:
          "No se pudo cargar el Plan de Trabajo",

      });

    }

  }
);


// ==================================================
// AVANCE VS PLAN DE TRABAJO
// ==================================================

app.get(
  "/api/avance-plan-trabajo",
  autenticarToken,
  async (req, res) => {

    try {

      const datos =
        await leerExcel();


      const planTrabajo =
        datos.planTrabajo || [];


      const resumen =
        datos.resumenPlanTrabajo || [];


      // ============================================
      // CONSTRUIR RESUMEN DE CADA SUPERVISOR
      // ============================================

      const construirRegistro =
        (
          registroResumen
        ) => {

          const claveSupervisor =
            normalizarSupervisor(
              registroResumen.supervisor
            );


          // Colonias detalladas en PLAN DE TRABAJO.

          const colonias =
            planTrabajo.filter(
              (registro) =>
                normalizarSupervisor(
                  registro.supervisor
                ) ===
                claveSupervisor
            );


          const potenciales =
            colonias.reduce(
              (
                total,
                registro
              ) =>
                total +
                Number(
                  registro.potenciales ||
                  0
                ),
              0
            );


          const porVender =
            colonias.reduce(
              (
                total,
                registro
              ) =>
                total +
                Number(
                  registro.porVender ||
                  0
                ),
              0
            );


          return {

            ...registroResumen,

            claveSupervisor,

            // Indicadores de PLAN DE TRABAJO.

            colonias:
              colonias.length,

            potenciales,

            porVender,

          };

        };


      const supervisores =
        resumen.map(
          construirRegistro
        );


      
      // ============================================
      // DIRECCIÓN — TODOS LOS SUPERVISORES
      // ============================================

      if (
        normalizarRol(
          req.rol
        ) === "DIRECCIÓN"
      ) {

        const totales =
          supervisores.reduce(
            (
              acumulado,
              registro
            ) => ({

              colonias:
                acumulado.colonias +
                registro.colonias,

              coloniasAsignadas:
                acumulado.coloniasAsignadas +
                registro.coloniasAsignadas,

              potenciales:
                acumulado.potenciales +
                registro.potenciales,

              porVender:
                acumulado.porVender +
                registro.porVender,

              ventasPlan:
                acumulado.ventasPlan +
                registro.ventasPlan,

              ventasGeneral:
                acumulado.ventasGeneral +
                registro.ventasGeneral,

              meta:
                acumulado.meta +
                registro.meta,

              diferencia:
                acumulado.diferencia +
                registro.diferencia,

            }),
            {

              colonias: 0,

              coloniasAsignadas: 0,

              potenciales: 0,

              porVender: 0,

              ventasPlan: 0,

              ventasGeneral: 0,

              meta: 0,

              diferencia: 0,

            }
          );


        totales.avancePorcentaje =
          totales.meta > 0
            ? (
                totales.ventasPlan /
                totales.meta
              ) * 100
            : null;


        return res.json({

          correcto: true,

          supervisores,

          totales,

        });

      }


      // ============================================
      // SUPERVISOR — ÚNICAMENTE SU INFORMACIÓN
      // ============================================

      const supervisor =
        supervisores.find(
          (registro) =>
            registro.claveSupervisor ===
            req.supervisor
        );


      return res.json({

        correcto: true,

        supervisor:
          supervisor || null,

      });

    } catch (error) {

      console.error(
        "❌ Error en /api/avance-plan-trabajo:"
      );

      console.error(error);


      return res.status(500).json({

        correcto: false,

        mensaje:
          "No se pudo cargar el avance del Plan de Trabajo",

      });

    }

  }
);



// ==================================================
// META DEL MISMO DÍA DE LA SEMANA ANTERIOR
// ==================================================

app.get(
  "/api/meta-semana-anterior",
  autenticarToken,
  async (req, res) => {

    try {

      const datos =
        await leerExcel();


      const resultado =
        datos
          .resultadoMismoDiaSemanaAnterior ||
        {

          fechaReferencia:
            null,

          total:
            0,

          supervisores:
            [],

        };


      // ============================================
      // RESULTADOS ENCONTRADOS EN LA BASE DE VENTA
      // ============================================

      const mapaResultados =
        new Map(

          resultado.supervisores.map(
            (registro) => [

              normalizarSupervisor(
                registro.supervisor
              ),

              Number(
                registro.resultado ||
                0
              ),

            ]
          )

        );


      // ============================================
      // OBTENER TODOS LOS SUPERVISORES
      // ============================================
      //
      // Se toman desde registros para también incluir
      // a quienes tuvieron cero ventas ese día.
      //
      // ============================================

      const mapaSupervisores =
        new Map();


      for (
        const registro
        of datos.registros || []
      ) {

        const supervisor =
          String(
            registro.supervisor ||
            ""
          ).trim();


        const clave =
          normalizarSupervisor(
            supervisor
          );


        // ==========================================
        // FILTRAR VALORES INVÁLIDOS Y RECUPERACIÓN
        // ==========================================

        if (
          !clave ||
          clave === "0" ||
          clave === "SUPERVISOR" ||
          clave === "TOTAL" ||
          clave ===
            "MORALES PEREZ BENJAMIN"
        ) {

          continue;

        }


        mapaSupervisores.set(
          clave,
          supervisor
        );

      }


      // ============================================
      // CONSTRUIR TABLA DE RESULTADOS
      // ============================================

      const supervisores =
        Array.from(
          mapaSupervisores.entries()
        )
          .map(
            (
              [
                clave,
                supervisor
              ]
            ) => ({

              clave,

              supervisor,

              resultado:
                mapaResultados.get(
                  clave
                ) || 0,

            })
          )
          .sort(
            (
              registroA,
              registroB
            ) =>

              registroB.resultado -
                registroA.resultado ||

              registroA.supervisor
                .localeCompare(
                  registroB.supervisor,
                  "es"
                )
          );


      // ============================================
      // DIRECCIÓN — TODOS LOS SUPERVISORES
      // ============================================

      if (
        normalizarRol(
          req.rol
        ) === "DIRECCIÓN"
      ) {

        const total =
          supervisores.reduce(
            (
              acumulado,
              registro
            ) =>
              acumulado +
              registro.resultado,
            0
          );


        return res.json({

          correcto:
            true,

          fechaReferencia:
            resultado.fechaReferencia,

          total,

          supervisores,

        });

      }


      // ============================================
      // SUPERVISOR — SOLAMENTE SU RESULTADO
      // ============================================

      const supervisor =
        supervisores.find(
          (registro) =>
            registro.clave ===
            req.supervisor
        );


      return res.json({

        correcto:
          true,

        fechaReferencia:
          resultado.fechaReferencia,

        supervisor: {

          nombre:
            supervisor?.supervisor ||
            req.supervisor,

          resultado:
            supervisor?.resultado ||
            0,

        },

      });

    } catch (error) {

      console.error(
        "❌ Error en /api/meta-semana-anterior:"
      );

      console.error(
        error
      );


      return res
        .status(500)
        .json({

          correcto:
            false,

          mensaje:
            "No se pudo cargar la meta del mismo día de la semana anterior",

        });

    }

  }
);

// ==================================================
// RANKING CL SALAMANCA
// ==================================================

app.get(
  "/api/ranking-cl",
  autenticarToken,
  async (req, res) => {

    try {

      const datos =
        await leerExcel();


      const registros =
        (datos.registros || [])
          .filter(
            (registro) =>
              normalizarSupervisor(
                registro.supervisor
              ) !==
              "MORALES PEREZ BENJAMIN"
          );


      const ranking =
        [...registros]
          .sort(
            (a, b) =>
              Number(
                b.productividad || 0
              ) -
              Number(
                a.productividad || 0
              )
          )
          .slice(0, 3);


      return res.json({

        correcto: true,

        ranking:
          ranking.map(
            (registro, indice) => ({

              posicion:
                indice + 1,

              nombre:
                registro.nombre,

              productividad:
                Number(
                  registro.productividad || 0
                ),

            })
          ),

      });

    } catch (error) {

      console.error(
        "❌ Error en /api/ranking-cl:"
      );

      console.error(
        error
      );


      return res.status(500).json({

        correcto: false,

        mensaje:
          "No se pudo cargar el Top 3 CL",

      });

    }

  }
);


// ==================================================
// RANKING COMPLETO CL SALAMANCA
// ==================================================

app.get(
  "/api/ranking-cl-completo",
  autenticarToken,
  async (req, res) => {

    try {

      const datos =
        await leerExcel();


      const registros =
        (datos.registros || [])
          .filter(
            (registro) =>
              normalizarSupervisor(
                registro.supervisor
              ) !==
              "MORALES PEREZ BENJAMIN"
          );


      const ranking =
        [...registros]
          .sort(
            (a, b) =>
              Number(
                b.productividad || 0
              ) -
              Number(
                a.productividad || 0
              )
          );


      return res.json({

        correcto: true,

        ranking:
          ranking.map(
            (registro, indice) => ({

              posicion:
                indice + 1,

              supervisor:
                registro.supervisor,

              nombre:
                registro.nombre,

              productividad:
                Number(
                  registro.productividad || 0
                ),

              ventasMesPromotor:
                Number(
                  registro.ventasMesPromotor || 0
                ),

              recuperaciones:
                Number(
                  registro.recuperaciones || 0
                ),

            })
          ),

      });

    } catch (error) {

      console.error(
        "❌ Error en /api/ranking-cl-completo:"
      );

      console.error(
        error
      );


      return res.status(500).json({

        correcto: false,

        mensaje:
          "No se pudo cargar el Ranking CL",

      });

    }

  }
);


// ==================================================
// 👤 RESUMEN PERSONAL DEL PROMOTOR
// ==================================================

app.get(
  "/api/promotor/resumen",
  autenticarToken,
  async (req, res) => {

    try {

      // ==========================================
      // VALIDAR ROL
      // ==========================================

      if (
        req.rol !== "PROMOTOR"
      ) {

        return res.status(403).json({

          correcto: false,

          mensaje:
            "Acceso exclusivo para promotores",

        });

      }


      // ==========================================
      // DATOS DEL PROMOTOR DESDE EL TOKEN
      // ==========================================

      const empleado =
        String(
          req.empleado ?? ""
        )
          .trim()
          .toUpperCase();


      const supervisorPromotor =
        String(
          req.supervisorPromotor ?? ""
        )
          .trim()
          .toUpperCase();


      if (!empleado) {

        return res.status(400).json({

          correcto: false,

          mensaje:
            "No se encontró el empleado en la sesión",

        });

      }


      // ==========================================
      // CARGAR EXCEL DESDE MEMORIA
      // ==========================================

      const datos =
        await leerExcel();


      // ==========================================
      // NORMALIZAR NOMBRES
      // ==========================================

     const normalizarNombreComparacion =
  (valor) =>
    String(
      valor ?? ""
    )
      .normalize("NFD")

      // Quitar acentos
      .replace(
        /[\u0300-\u036f]/g,
        ""
      )

      // Espacios raros de Excel
      .replace(
        /\s+/g,
        " "
      )

      .trim()
      .toUpperCase();


    // ==========================================
// IDENTIDADES POSIBLES DEL PROMOTOR
// ==========================================

const empleadoNormalizado =
  normalizarNombreComparacion(
    req.empleado
  );

const nombreDesdeSupervisor =
  normalizarNombreComparacion(
    req.supervisor
  );


const identidadesPromotor =
  [
    empleadoNormalizado,
    nombreDesdeSupervisor,
  ]
    .filter(
      (valor) =>
        valor &&
        valor !== "0"
    );


console.log(
  "👤 IDENTIDADES PROMOTOR:",
  identidadesPromotor
);


      // ==========================================
      // CONSTRUIR MISMO RANKING CL
      // ==========================================

      const registrosRanking =
        (datos.registros || [])

          .filter(
            (registro) => {

              const nombre =
                String(
                  registro.nombre ?? ""
                ).trim();

              const supervisor =
                String(
                  registro.supervisor ?? ""
                )
                  .trim()
                  .toUpperCase();


              if (
                !nombre ||
                nombre === "0"
              ) {

                return false;

              }


              if (
                supervisor ===
                "MORALES PEREZ BENJAMIN"
              ) {

                return false;

              }


              const nombreNormalizado =
                normalizarNombreComparacion(
                  nombre
                );


              // EXCLUIR VACANTES
              if (
                nombreNormalizado.includes(
                  "VACANTE"
                )
              ) {

                return false;

              }


              return true;

            }
          )

          .sort(
            (a, b) =>
              Number(
                b.productividad || 0
              ) -
              Number(
                a.productividad || 0
              )
          );


      // ==========================================
      // BUSCAR PROMOTOR DENTRO DEL RANKING
      // ==========================================





      console.log(
  "👤 PROMOTOR BUSCADO:",
  empleadoNormalizado
);

console.log(
  "🏆 TOTAL RANKING:",
  registrosRanking.length
);

console.log(
  "🔎 COINCIDENCIAS GALLEGOS:",
  registrosRanking
    .filter(
      (registro) =>
        normalizarNombreComparacion(
          registro.nombre
        ).includes(
          "GALLEGOS"
        )
    )
    .map(
      (registro) => ({
        nombre:
          registro.nombre,
        supervisor:
          registro.supervisor,
        productividad:
          registro.productividad,
      })
    )
);
      const indicePromotor =
  registrosRanking.findIndex(
    (registro) => {

      const nombreRegistro =
        normalizarNombreComparacion(
          registro.nombre
        );


      return identidadesPromotor.includes(
        nombreRegistro
      );

    }
  );


      if (
        indicePromotor === -1
      ) {

        return res.status(404).json({

          correcto: false,

          mensaje:
            "No se encontró al promotor dentro del Ranking CL",

        });

      }


      const promotor =
        registrosRanking[
          indicePromotor
        ];


      // ==========================================
      // RESPUESTA
      // ==========================================

      return res.json({

        correcto: true,

        promotor: {

          nombre:
            promotor.nombre,

          supervisor:
            supervisorPromotor,

          posicion:
            indicePromotor + 1,

          totalPromotores:
            registrosRanking.length,

          ventas:
            Number(
              promotor.ventasMesPromotor ?? 0
            ),

          recuperaciones:
            Number(
              promotor.recuperaciones ?? 0
            ),

          productividad:
  Number(
    promotor.productividad ?? 0
  ),

ventasMesAnteriorMismoDia:
  Number(
    promotor.ventasMesAnteriorMismoDia ?? 0
  ),

diferenciaVsMesAnterior:
  Number(
    promotor.diferenciaVsMesAnterior ?? 0

    ),  
        },

      });


    } catch (error) {

      console.error(
        "❌ Error en /api/promotor/resumen:"
      );

      console.error(
        error
      );


      return res.status(500).json({

        correcto: false,

        mensaje:
          "No se pudo cargar el resumen del promotor",

      });

    }

  }
);


// ==================================================
// 📅 AVANCE SEMANAL PERSONAL DEL PROMOTOR
// ==================================================

app.get(
  "/api/promotor/avance-semanal",
  autenticarToken,
  async (req, res) => {

    try {

      // ==========================================
      // SOLO PROMOTORES
      // ==========================================

      if (
        req.rol !== "PROMOTOR"
      ) {

        return res.status(403).json({

          correcto: false,

          mensaje:
            "Acceso exclusivo para promotores",

        });

      }


      // ==========================================
      // NORMALIZAR NOMBRES
      // ==========================================

      const normalizarNombrePromotor =
        (valor) =>
          String(
            valor ?? ""
          )
            .normalize("NFD")
            .replace(
              /[\u0300-\u036f]/g,
              ""
            )
            .replace(
              /\s+/g,
              " "
            )
            .trim()
            .toUpperCase();


      // ==========================================
      // IDENTIDADES POSIBLES DEL PROMOTOR
      // ==========================================

      const identidadesPromotor =
        [
          normalizarNombrePromotor(
            req.empleado
          ),

          normalizarNombrePromotor(
            req.supervisor
          ),
        ]
          .filter(
            (valor) =>
              valor &&
              valor !== "0"
          );


      const supervisorPromotor =
        normalizarNombrePromotor(
          req.supervisorPromotor
        );


      // ==========================================
      // CARGAR DATOS
      // ==========================================

      const datos =
        await leerExcel();


      const avanceSemanal =
        datos.avanceSemanal || [];


      // ==========================================
      // BUSCAR AL PROMOTOR
      // ==========================================

      const coincidencias =
        avanceSemanal.filter(
          (item) => {

            const nombre =
              normalizarNombrePromotor(
                item.nombre
              );


            return (
              identidadesPromotor.includes(
                nombre
              )
            );

          }
        );


      // ==========================================
      // SI HAY MÁS DE UNA COINCIDENCIA,
      // USAR SU SUPERVISOR COMO RESPALDO
      // ==========================================

      let registroPromotor =
        coincidencias.find(
          (item) =>

            normalizarNombrePromotor(
              item.supervisor
            ) ===
            supervisorPromotor
        );


      // Si no encontró por supervisor,
      // usar la primera coincidencia por nombre.

      if (!registroPromotor) {

        registroPromotor =
          coincidencias[0];

      }


      // ==========================================
      // NO ENCONTRADO
      // ==========================================

      if (!registroPromotor) {

        return res.status(404).json({

          correcto: false,

          mensaje:
            "No se encontró el avance semanal del promotor",

        });

      }


      // ==========================================
      // RESPUESTA
      // ==========================================

      return res.json({

        correcto: true,

        avance: {

          nombre:
            registroPromotor.nombre,

          supervisor:
            registroPromotor.supervisor,

          productividad:
            Number(
              registroPromotor.productividad ?? 0
            ),

          dobles:
            Number(
              registroPromotor.dobles ?? 0
            ),

          triples:
            Number(
              registroPromotor.triples ?? 0
            ),

          movil:
            Number(
              registroPromotor.movil ?? 0
            ),

          netflix:
            Number(
              registroPromotor.netflix ?? 0
            ),

          disney:
            Number(
              registroPromotor.disney ?? 0
            ),

          max:
            Number(
              registroPromotor.max ?? 0
            ),

          rx:
            Number(
              registroPromotor.rx ?? 0
            ),

        },

      });


    } catch (error) {

      console.error(
        "❌ Error en /api/promotor/avance-semanal:"
      );

      console.error(
        error
      );


      return res.status(500).json({

        correcto: false,

        mensaje:
          "No se pudo cargar el avance semanal del promotor",

      });

    }

  }
);


// ==================================================
// VENTA VS MES ANTERIOR
// ==================================================

app.get(
  "/api/venta-vs-mes-anterior",
  autenticarToken,
  async (req, res) => {

    try {

      console.log(
        "📊 CONSULTANDO VENTA VS MES ANTERIOR..."
      );


      const datos =
        leerVentaVsMesAnterior();


      return res.json({

        correcto: true,

        registros:
          datos.registros || [],

        servicios:
          datos.servicios || [],

        canales:
          datos.canales || [],

        meses:
          datos.meses || [],

      });

    } catch (error) {

      console.error(
        "❌ Error en /api/venta-vs-mes-anterior:"
      );

      console.error(
        error
      );


      return res.status(500).json({

        correcto: false,

        mensaje:
          "No se pudo cargar Venta vs Mes Anterior",

      });

    }

  }
);


// ==================================================
// STATUS DE PLANTILLA
// ==================================================

app.get(
  "/api/plantilla",
  autenticarToken,
  async (req, res) => {

    try {

      console.log(
        "👥 CONSULTANDO STATUS DE PLANTILLA..."
      );


      const datos =
        leerPlantilla();


      return res.json({

        correcto: true,

        registros:
          datos.registros || [],

        total:
          datos.total || 0,

        activos:
          datos.activos || 0,

        vacantes:
          datos.vacantes || 0,

        cobertura:
          Number(
            datos.cobertura || 0
          ),

      });

    } catch (error) {

      console.error(
        "❌ Error en /api/plantilla:"
      );

      console.error(
        error
      );


      return res.status(500).json({

        correcto: false,

        mensaje:
          "No se pudo cargar el status de plantilla",

      });

    }

  }
);



// PRODUCTIVIDAD POR ANTIGÜEDAD — DIRECCIÓN
app.get(
  "/api/productividad-antiguedad",
  autenticarToken,
  (req, res) => {
    try {
      return res.json({
        correcto: true,
        ...leerProductividadAntiguedad(),
      });
    } catch (error) {
      console.error(
        "Error en /api/productividad-antiguedad:",
        error
      );

      return res.status(500).json({
        correcto: false,
        mensaje:
          "No se pudo cargar la productividad por antigüedad",
      });
    }
  }
);


// PROMOTORES CON PRODUCTIVIDAD MENOR A 0.80 — DIRECCIÓN
app.get(
  "/api/promotores-productividad-baja",
  autenticarToken,
  async (req, res) => {
    if (normalizarRol(req.rol) !== "DIRECCIÓN") {
      return res.status(403).json({
        correcto: false,
        mensaje: "Acceso exclusivo de Dirección",
      });
    }

    try {
      const datos = await leerPromotoresProductividadBaja();

      return res.json({
        correcto: true,
        ...datos,
      });
    } catch (error) {
      console.error(
        "Error en /api/promotores-productividad-baja:",
        error
      );

      return res.status(500).json({
        correcto: false,
        mensaje:
          "No se pudo cargar el análisis de productividad",
      });
    }
  }
);


// ==================================================
// PROMOTORES CON CERO VENTAS POR DÍA Y CANAL
// ==================================================

app.get(
  "/api/cero-ventas-por-canal",
  autenticarToken,
  async (req, res) => {

    try {

      const rol =
        normalizarRol(
          req.rol
        );


      if (
        rol !== "DIRECCIÓN"
      ) {

        return res.status(403).json({

          correcto: false,

          mensaje:
            "Acceso exclusivo para Dirección",

        });

      }


      const datos =
        leerCeroVentasPorCanal();


      return res.json({

        correcto: true,

        fechaCorte:
          datos.fechaCorte,

        canales:
          datos.canales || [],

      });

    } catch (error) {

      console.error(
        "❌ Error en /api/cero-ventas-por-canal:"
      );

      console.error(
        error
      );


      return res.status(500).json({

        correcto: false,

        mensaje:
          "No se pudo cargar el análisis de promotores con cero ventas",

      });

    }

  }
);


// ==================================================
// CARTERA POR DÍA
// ==================================================

app.get(
  "/api/cartera-por-dia",
  autenticarToken,
  async (req, res) => {

    try {

      console.log(
        "👥 CONSULTANDO CARTERA POR DÍA..."
      );


      const datos =
        leerCarteraPorDia();


      return res.json({

        correcto: true,

        dias:
          datos.dias || [],

      });

    } catch (error) {

      console.error(
        "❌ Error en /api/cartera-por-dia:"
      );

      console.error(
        error
      );


      return res.status(500).json({

        correcto: false,

        mensaje:
          "No se pudo cargar la cartera por día",

      });

    }

  }
);


// ==================================================
// PROYECCIÓN DE CIERRE — DIRECCIÓN
// ==================================================

app.get(
  "/api/proyeccion",
  autenticarToken,
  (req, res) => {

    if (
      req.rol !== "DIRECCIÓN"
    ) {

      return res.status(403).json({

        correcto: false,

        mensaje:
          "Acceso exclusivo de Dirección",

      });

    }


    try {

      const datos =
        leerProyeccion();


      return res.json({

        correcto: true,

        encabezados:
          datos.encabezados,

        filas:
          datos.filas,

      });

    } catch (error) {

      console.error(
        "❌ Error en /api/proyeccion:"
      );

      console.error(
        error
      );


      return res.status(500).json({

        correcto: false,

        mensaje:
          "No se pudo cargar la proyección",

      });

    }

  }
);


// ==================================================
// DETALLE DE VENTA MENSUAL — DIRECCIÓN
// ==================================================

app.get(
  "/api/detalle-venta-mensual",
  autenticarToken,
  async (req, res) => {

    try {

      const rol =
        normalizarRol(
          req.rol
        );


      if (
        rol !== "DIRECCIÓN"
      ) {

        return res
          .status(403)
          .json({

            correcto: false,

            mensaje:
              "Acceso exclusivo de Dirección",

          });

      }


      const registros =
        leerDetalleVentaMensual();


      return res.json({

        correcto: true,

        registros,

      });

    } catch (error) {

      console.error(
        "❌ Error en /api/detalle-venta-mensual:"
      );

      console.error(
        error
      );


      return res
        .status(500)
        .json({

          correcto: false,

          mensaje:
            "No se pudo cargar el detalle de venta mensual",

        });

    }

  }
);


// ==================================================
// ACTUALIZAR DATOS — SOLO DIRECCIÓN
// ==================================================

app.post(
  "/api/actualizar-datos",
  autenticarToken,
  async (req, res) => {

    if (
      req.rol !== "DIRECCIÓN"
    ) {

      return res.status(403).json({

        correcto: false,

        mensaje:
          "Acceso exclusivo de Dirección",

      });

    }


    try {

      const resultado =
        await actualizarDatosDesdeSupabase();


      return res.json({

        correcto: true,

        mensaje:
          "Excel y caché actualizados correctamente",

        actualizadoEn:
          resultado.actualizadoEn,

      });

    } catch (error) {

      console.error(
        "❌ Error al actualizar datos:"
      );

      console.error(
        error
      );


      return res.status(500).json({

        correcto: false,

        mensaje:
          "No se pudo actualizar. Se conservan los datos anteriores. Revisa el Excel y vuelve a intentarlo.",

      });

    }

  }
);


// ==================================================
// REEMPLAZAR EXCEL — SOLO DIRECCIÓN
// ==================================================

app.post(
  "/api/subir-excel",

  autenticarToken,

  express.raw({

    type:
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",

    limit:
      "10mb",

  }),

  async (req, res) => {

    if (
      req.rol !== "DIRECCIÓN"
    ) {

      return res.status(403).json({

        correcto:
          false,

        mensaje:
          "Acceso exclusivo de Dirección",

      });

    }


    try {

      const nombreArchivo =
        decodeURIComponent(
          String(
            req.headers[
              "x-file-name"
            ] || ""
          )
        );


      if (
        !nombreArchivo
          .toLowerCase()
          .endsWith(".xlsx")
      ) {

        return res.status(400).json({

          correcto:
            false,

          mensaje:
            "Selecciona un archivo con extensión .xlsx",

        });

      }


      const resultado =
        await reemplazarExcelEnSupabase(
          req.body
        );


      return res.json({

        correcto:
          true,

        mensaje:
          "Excel reemplazado y caché actualizada correctamente",

        actualizadoEn:
          resultado.actualizadoEn,

        tamanoBytes:
          resultado.tamanoBytes,

      });

    } catch (error) {

      console.error(
        "❌ Error al reemplazar el Excel:"
      );

      console.error(
        error
      );


      const ocupada =
        error.codigo ===
        "ACTUALIZACION_EN_CURSO";


      return res
        .status(
          ocupada
            ? 409
            : 400
        )
        .json({

          correcto:
            false,

          mensaje:
            ocupada
              ? "Ya existe una actualización en curso. Espera unos segundos."
              : error.message ||
                "No se pudo reemplazar el Excel",

        });

    }

  }
);


// ==================================================
// ARCHIVO MAYOR A 10 MB
// ==================================================

app.use(
  (
    error,
    req,
    res,
    next
  ) => {

    if (
      error?.type ===
      "entity.too.large"
    ) {

      return res.status(413).json({

        correcto:
          false,

        mensaje:
          "El archivo supera el límite de 10 MB",

      });

    }


    return next(
      error
    );

  }
);


// ==================================================
// INICIAR SERVIDOR
// ==================================================

async function iniciarServidor() {

  try {

    console.log(
      "☁️ Preparando datos desde Supabase..."
    );


    await descargarExcelDesdeSupabase();


    console.log(
      "✅ Excel listo para utilizar"
    );


    app.listen(
      PORT,
      "0.0.0.0",
      () => {

        console.log(
          "=========================================="
        );

        console.log(
          "🚀 BACKEND SEGUIMIENTO 2.0"
        );

        console.log(
          `🌐 Puerto: ${PORT}`
        );

        console.log(
          "🔐 Autenticación JWT ACTIVADA"
        );

        console.log(
          "🛡️ APIs protegidas"
        );

        console.log(
          "☁️ Excel sincronizado desde Supabase"
        );

        console.log(
          "=========================================="
        );

      }
    );

  } catch (error) {

    console.error(
      "❌ ERROR AL INICIAR EL BACKEND:"
    );

    console.error(
      error
    );

    process.exit(1);

  }

}


iniciarServidor();
