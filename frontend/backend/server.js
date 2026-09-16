const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();

const {
  validarUsuario,
  leerExcel,
  leerVentaVsMesAnterior,
  leerPlantilla,
  leerProductividadPorCanal,
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


    if (
      !datos.supervisor &&
      rol !== "DIRECCIÓN"
    ) {

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


      const token =
        jwt.sign(

          {

            usuario:
              String(usuario)
                .trim()
                .toUpperCase(),

            supervisor,

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


      return res.json({

        correcto: true,

        token,

        supervisor,

        empleado:
          resultado.empleado,

        rol:
          normalizarRol(
            resultado.rol
          ),

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


// ==================================================
// PRODUCTIVIDAD POR CANAL
// ==================================================

app.get(
  "/api/productividad-por-canal",
  autenticarToken,
  async (req, res) => {

    try {

      console.log(
        "📊 CONSULTANDO PRODUCTIVIDAD POR CANAL..."
      );


      const datos =
        leerProductividadPorCanal();


      return res.json({

        correcto: true,

        registros:
          datos.registros || [],

      });

    } catch (error) {

      console.error(
        "❌ Error en /api/productividad-por-canal:"
      );

      console.error(
        error
      );


      return res.status(500).json({

        correcto: false,

        mensaje:
          "No se pudo cargar la productividad por canal",

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
