import { useEffect, useState } from "react";

import {
  iniciarSesion,
} from "../services/authService";


// ==================================================
// FRASES DE VALIDACIÓN
// ==================================================

const frasesValidacion = [

  "🔐 Validando tus credenciales...",

  "🚀 Conectando con SEGUIMIENTO 2.0...",

  "🛡️ Verificando acceso seguro...",

  "📊 Preparando tu sesión comercial...",

  "🎯 Validando permisos de acceso...",

  "⚡ Conectando con el servidor MEGA...",

  "🧠 Verificando tu información de supervisor...",

  "🏆 Preparando tu acceso al tablero comercial...",

  "💼 Confirmando tu perfil de supervisor...",

  "🔥 Casi listo, estamos validando tu acceso...",

];


// ==================================================
// LOGIN
// ==================================================

function Login({ onLogin }) {

  // ==================================================
  // ESTADO DEL LOGIN
  // ==================================================

  const [usuario, setUsuario] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [error, setError] =
    useState("");

  const [cargando, setCargando] =
    useState(false);


  // ==================================================
  // FRASE DE VALIDACIÓN
  // ==================================================

  const [frase, setFrase] =
    useState(
      frasesValidacion[
        Math.floor(
          Math.random() *
          frasesValidacion.length
        )
      ]
    );


  // ==================================================
  // CAMBIAR FRASE MIENTRAS VALIDA
  // ==================================================

  useEffect(() => {

    if (!cargando) {

      return;

    }


    const intervalo =
      setInterval(() => {

        setFrase(
          frasesValidacion[
            Math.floor(
              Math.random() *
              frasesValidacion.length
            )
          ]
        );

      }, 1800);


    return () => {

      clearInterval(
        intervalo
      );

    };

  }, [cargando]);


  // ==================================================
  // PROCESAR LOGIN
  // ==================================================

  async function manejarLogin(evento) {

    evento.preventDefault();

    setError("");


    // ================================================
    // EVITAR DOBLE ENVÍO
    // ================================================

    if (cargando) {

      return;

    }


    // ================================================
    // VALIDAR CAMPOS
    // ================================================

    if (
      !usuario.trim() ||
      !password
    ) {

      setError(
        "Ingresa tu usuario y contraseña"
      );

      return;

    }


    // ================================================
    // ACTIVAR VALIDACIÓN
    // ================================================

    setCargando(true);


    try {

      // ==============================================
      // CONSULTAR BACKEND
      // ==============================================

      const resultado =
        await iniciarSesion(
          usuario,
          password
        );


      // ==============================================
      // LOGIN INCORRECTO
      // ==============================================

      if (
        !resultado.correcto
      ) {

        setError(
          resultado.mensaje ||
          "Usuario o contraseña incorrectos"
        );

        return;

      }


      // ==============================================
      // LOGIN CORRECTO
      // ==============================================

      onLogin(
        resultado
      );


    } catch (error) {

      console.error(
        "❌ Error en el login:",
        error
      );


      setError(
        "No se pudo conectar con el servidor"
      );


    } finally {

      // ==============================================
      // FINALIZAR VALIDACIÓN
      // ==============================================

      setCargando(false);

    }

  }


  // ==================================================
  // RENDER
  // ==================================================

  return (

    <div className="login-container">

      <div className="login-card">


        {/* ==========================================
            LOGO
        ========================================== */}

        <div className="login-logo">
          MEGA
        </div>


        {/* ==========================================
            TÍTULO
        ========================================== */}

        <h1>
          🔐 MEGA CONTROL
        </h1>


        <p className="login-subtitulo">
          Salamanca · Supervisores
        </p>


        {/* ==========================================
            VALIDANDO ACCESO
        ========================================== */}

        {cargando ? (

          <div className="login-validando">

            {/* CÍRCULO ANIMADO */}

            <div className="loading-spinner">
              <div></div>
            </div>


            {/* TÍTULO */}

            <h2>
              SEGUIMIENTO 2.0
            </h2>


            {/* FRASE DINÁMICA */}

            <p
              key={frase}
              className="loading-frase"
            >
              {frase}
            </p>


            {/* ESTADO */}

            <span className="loading-status">
              Validando acceso...
            </span>

          </div>

        ) : (

          /* ========================================
             FORMULARIO
          ======================================== */

          <form
            onSubmit={manejarLogin}
          >


            {/* USUARIO */}

            <label>
              Usuario
            </label>


            <input
              type="text"
              placeholder="Ingresa tu usuario"
              value={usuario}
              autoComplete="username"
              disabled={cargando}
              onChange={(evento) =>
                setUsuario(
                  evento.target.value
                )
              }
            />


            {/* CONTRASEÑA */}

            <label>
              Contraseña
            </label>


            <input
              type="password"
              placeholder="Ingresa tu contraseña"
              value={password}
              autoComplete="current-password"
              disabled={cargando}
              onChange={(evento) =>
                setPassword(
                  evento.target.value
                )
              }
            />


            {/* ======================================
                ERROR
            ====================================== */}

            {error && (

              <p className="login-error">
                ⚠️ {error}
              </p>

            )}


            {/* ======================================
                BOTÓN
            ====================================== */}

            <button
              type="submit"
              className="login-button"
              disabled={cargando}
            >

              INICIAR SESIÓN

            </button>


          </form>

        )}

      </div>

    </div>

  );

}


export default Login;
