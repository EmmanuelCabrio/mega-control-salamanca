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


      // ==========================================
      // CREAR TOKEN
      // ==========================================

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
            resultado.rol,


      });

    } catch (error) {

      console.error(
        "❌ Error en /auth/login:"
      );

      console.error(error);


      return res.status(500).json({

        correcto: false,

        mensaje:
          "Error interno del ",

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

      console.error(error);


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

      console.error(error);


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

      console.error(error);


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


      // ==========================================
      // ROL DEL USUARIO
      // ==========================================

      const rol =
        normalizarRol(
          req.rol
        );


      // ==========================================
      // 👔 DIRECCIÓN
      // ==========================================
      // Dirección necesita TODOS los registros
      // para poder detectar el foco más crítico
      // de cada supervisor.
      // ==========================================

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


      // ==========================================
      // 👨‍💼 SUPERVISOR
      // ==========================================
      // Los supervisores solamente reciben
      // los registros de su propio equipo.
      // ==========================================

      const supervisor =
        req.supervisor;


      const registros =
        (datos.registros || [])
          .filter(

            (registro) =>

              normalizarSupervisor(
                registro.supervisor
              ) ===
              supervisor

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

      console.error(error);


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

      console.error(error);


      return res.status(500).json({

        correcto: false,

        mensaje:
          "No se pudo cargar el Plan de Trabajo",

      });

    }

  }
);

// ==================================================
// 🏆 TOP 3 CL SALAMANCA
// ==================================================

app.get(
  "/api/ranking-cl",
  autenticarToken,
  async (req, res) => {

    try {

      const datos =
        await leerExcel();


      // ==========================================
      // FILTRAR Y EXCLUIR A BENJAMÍN
      // ==========================================

      const registros =
        (datos.registros || [])
          .filter(
            (registro) =>
              String(
                registro.supervisor
              )
                .trim()
                .toUpperCase() !==
              "MORALES PEREZ BENJAMIN"
          );


      // ==========================================
      // ORDENAR PRODUCTIVIDAD
      // MAYOR → MENOR
      // ==========================================

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


      // ==========================================
      // DEVOLVER SOLO LO NECESARIO
      // ==========================================

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
        "❌ Error en /api/ranking-cl:",
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
// 🏆 RANKING COMPLETO CL SALAMANCA
// ==================================================

app.get(
  "/api/ranking-cl-completo",
  autenticarToken,
  async (req, res) => {

    try {

      const datos =
        await leerExcel();


      // ==========================================
      // FILTRAR PROMOTORES QUE NO PERTENECEN AL CL
      // ==========================================

      const registros =
        (datos.registros || [])
          .filter(
            (registro) =>
              String(
                registro.supervisor
              )
                .trim()
                .toUpperCase() !==
              "MORALES PEREZ BENJAMIN"
          );


      // ==========================================
      // ORDENAR POR PRODUCTIVIDAD
      // MAYOR → MENOR
      // ==========================================

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


      // ==========================================
      // DEVOLVER SOLO DATOS NECESARIOS
      // ==========================================

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
        "❌ Error en /api/ranking-cl-completo:",
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
// 📊 VENTA VS MES ANTERIOR
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
// 👥 STATUS DE PLANTILLA
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
// 📊 PRODUCTIVIDAD POR CANAL
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
// 👥 CARTERA POR DÍA
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
// 📊 PROYECCIÓN DE CIERRE — DIRECCIÓN
// ==================================================

app.get(
  "/api/proyeccion",
  autenticarToken,
  (req, res) => {

    // ==============================================
    // ACCESO EXCLUSIVO PARA DIRECCIÓN
    // ==============================================

    if (req.rol !== "DIRECCIÓN") {

      return res.status(403).json({

        correcto: false,

        mensaje:
          "Acceso exclusivo de Dirección",

      });

    }

    try {

      // ============================================
      // LEER LA TABLA DEL EXCEL
      // ============================================

      const datos = leerProyeccion();

      // ============================================
      // ENVIAR ENCABEZADOS E INDICADORES AL PANEL
      // ============================================

      return res.json({

        correcto: true,

        encabezados:
          datos.encabezados,

        filas:
          datos.filas,

      });

    } catch (error) {

      // ============================================
      // REGISTRAR EL ERROR EN RENDER
      // ============================================

      console.error(
        "❌ Error en /api/proyeccion:",
        error
      );

      // ============================================
      // INFORMAR AL PANEL QUE FALLÓ LA CONSULTA
      // ============================================

      return res.status(500).json({

        correcto: false,

        mensaje:
          "No se pudo cargar la proyección",

      });

    }

  }
);


// ==================================================
// 🔄 ACTUALIZAR DATOS — SOLO DIRECCIÓN
// ==================================================

app.post(
  "/api/actualizar-datos",
  autenticarToken,
  async (req, res) => {

    if (req.rol !== "DIRECCIÓN") {

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
        "❌ Error al actualizar datos:",
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
// 📤 REEMPLAZAR EXCEL — SOLO DIRECCIÓN
// ==================================================

app.post(
  "/api/subir-excel",

  // Verificar primero la sesión.
  autenticarToken,

  // Recibir el Excel como archivo binario.
  // El límite será de 10 MB.
  express.raw({

    type:
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",

    limit:
      "10mb",

  }),

  async (req, res) => {

    // ==============================================
    // ACCESO EXCLUSIVO PARA DIRECCIÓN
    // ==============================================

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

      // ============================================
      // RECUPERAR EL NOMBRE DEL ARCHIVO
      // ============================================

      const nombreArchivo =
        decodeURIComponent(
          String(
            req.headers[
              "x-file-name"
            ] || ""
          )
        );


      // ============================================
      // VALIDAR LA EXTENSIÓN
      // ============================================

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


      // ============================================
      // REEMPLAZAR EXCEL Y RENOVAR CACHÉ
      // ============================================

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
        "❌ Error al reemplazar el Excel:",
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

    return next(error);

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

    console.error(error);

    process.exit(1);

  }

}


iniciarServidor();
