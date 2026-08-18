// ==================================================
// AUTENTICACIÓN — SEGUIMIENTO 2.0
// ==================================================


// ==================================================
// URL DEL BACKEND
// ==================================================

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:3001";


// ==================================================
// VALIDAR LOGIN
// ==================================================

export async function iniciarSesion(
  usuario,
  password
) {

  try {

    // ----------------------------------------------
    // NORMALIZAR DATOS
    // ----------------------------------------------

    const usuarioNormalizado =
      String(
        usuario ?? ""
      )
        .trim();


    const passwordNormalizada =
      String(
        password ?? ""
      );


    // ----------------------------------------------
    // VALIDAR CAMPOS
    // ----------------------------------------------

    if (
      !usuarioNormalizado ||
      !passwordNormalizada
    ) {

      return {

        correcto: false,

        mensaje:
          "Usuario y contraseña son obligatorios",

      };

    }


    // ----------------------------------------------
    // CONSULTAR BACKEND
    // ----------------------------------------------

    const respuesta =
      await fetch(
        `${API_URL}/auth/login`,
        {

          method: "POST",

          headers: {

            "Content-Type":
              "application/json",

          },

          body:
            JSON.stringify({

              usuario:
                usuarioNormalizado,

              password:
                passwordNormalizada,

            }),

        }
      );


    // ----------------------------------------------
    // LEER RESPUESTA
    // ----------------------------------------------

    const resultado =
      await respuesta.json();


    // ----------------------------------------------
    // LOGIN CORRECTO
    // ----------------------------------------------

    if (
      resultado.correcto &&
      resultado.token
    ) {

      localStorage.setItem(
        "mega_token",
        resultado.token
      );

    }


    // ----------------------------------------------
    // DEVOLVER RESULTADO
    // ----------------------------------------------

    return resultado;


  } catch (error) {

    console.error(
      "❌ Error conectando con el backend:",
      error
    );


    return {

      correcto: false,

      mensaje:
        "No se pudo conectar con el servidor",

    };

  }

}

// ==================================================
// TOKEN JWT
// ==================================================

export function obtenerToken() {

  return localStorage.getItem(
    "mega_token"
  );

}


// ==================================================
// FETCH PROTEGIDO
// ==================================================

export async function fetchProtegido(
  url,
  opciones = {}
) {

  const token =
    obtenerToken();


  return fetch(
    url,
    {

      ...opciones,

      headers: {

        ...(opciones.headers || {}),

        Authorization:
          `Bearer ${token}`,

      },

    }
  );

}
