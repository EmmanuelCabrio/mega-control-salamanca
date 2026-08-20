const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();

const {
  validarUsuario,
  leerExcel,
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


    if (
      !datos.supervisor
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
  (req, res) => {

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

      });

    } catch (error) {

      console.error(
        "❌ Error en /auth/login:"
      );

      console.error(error);


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


      const supervisor =
        req.supervisor;


      // ==========================================
      // SOLO EQUIPO DEL SUPERVISOR
      // ==========================================

      const registros =
        (datos.registros || [])
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
        "❌ Error en /api/registros:"
      );

      console.error(error);


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
// INICIAR SERVIDOR
// ==================================================

async function iniciarServidor() {

  try {

    console.log(
      "☁️ Preparando datos desde Supabase..."
    );

    await descargarExcelDesdeSupabase();
    
    console.log(
  "⚙️ Procesando datos del Excel..."
);

await leerExcel();

console.log(
  "✅ Datos procesados y listos"
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
