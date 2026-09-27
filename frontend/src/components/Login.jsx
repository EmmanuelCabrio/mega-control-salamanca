import { useEffect, useState } from "react";

import {
  iniciarSesion,
} from "../services/authService";


// ==================================================
// FRASES DE VALIDACIÓN
// ==================================================

const frasesValidacion = [

  "Validando tus credenciales...",

  "Conectando con SEGUIMIENTO 2.0...",

  "Verificando acceso seguro...",

  "Preparando tu sesión comercial...",

  "Validando permisos de acceso...",

  "Conectando con el servidor MEGA...",

  "Verificando tu información de usuario...",

  "Preparando tu tablero comercial...",

  "Confirmando tu perfil de acceso...",

  "Finalizando configuración de tu sesión...",

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

  const [
    mostrarPassword,
    setMostrarPassword,
  ] = useState(false);


  // ==================================================
  // FRASE DE VALIDACIÓN
  // ==================================================

  const [frase, setFrase] =
    useState(() => {

      return frasesValidacion[
        Math.floor(
          Math.random() *
          frasesValidacion.length
        )
      ];

    });


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
  // ICONO ESCUDO
  // ==================================================

  const IconoEscudo = () => (

    <svg
      viewBox="0 0 64 72"
      fill="none"
      aria-hidden="true"
    >

      <path
        d="
          M32 3
          C40 9 49 11 58 12
          V31
          C58 48 48 61 32 68
          C16 61 6 48 6 31
          V12
          C15 11 24 9 32 3Z
        "
        fill="currentColor"
      />

      <path
        d="
          M32 19
          C26.5 19 22 23.5 22 29
          V33
          H19
          C17.3 33 16 34.3 16 36
          V49
          C16 50.7 17.3 52 19 52
          H45
          C46.7 52 48 50.7 48 49
          V36
          C48 34.3 46.7 33 45 33
          H42
          V29
          C42 23.5 37.5 19 32 19Z
        "
        fill="white"
        fillOpacity="0.95"
      />

      <path
        d="
          M27 33
          V29
          C27 26.2 29.2 24 32 24
          C34.8 24 37 26.2 37 29
          V33
        "
        stroke="#1769E0"
        strokeWidth="3"
        strokeLinecap="round"
      />

      <circle
        cx="32"
        cy="42"
        r="3"
        fill="#1769E0"
      />

      <path
        d="M32 44V47"
        stroke="#1769E0"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

    </svg>

  );


  // ==================================================
  // ICONO USUARIO
  // ==================================================

  const IconoUsuario = () => (

    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >

      <circle
        cx="12"
        cy="8"
        r="4"
        stroke="currentColor"
        strokeWidth="2"
      />

      <path
        d="
          M4.5 20
          C5.5 15.8 8 14 12 14
          C16 14 18.5 15.8 19.5 20
        "
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />

    </svg>

  );


  // ==================================================
  // ICONO CONTRASEÑA
  // ==================================================

  const IconoCandado = () => (

    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >

      <rect
        x="5"
        y="10"
        width="14"
        height="10"
        rx="2.5"
        stroke="currentColor"
        strokeWidth="2"
      />

      <path
        d="
          M8 10
          V7
          C8 4.8 9.8 3 12 3
          C14.2 3 16 4.8 16 7
          V10
        "
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />

      <circle
        cx="12"
        cy="15"
        r="1.5"
        fill="currentColor"
      />

    </svg>

  );


  // ==================================================
  // ICONO OJO
  // ==================================================

  const IconoOjo = () => (

    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >

      <path
        d="
          M2.5 12
          C4.7 7.8 7.8 5.5 12 5.5
          C16.2 5.5 19.3 7.8 21.5 12
          C19.3 16.2 16.2 18.5 12 18.5
          C7.8 18.5 4.7 16.2 2.5 12Z
        "
        stroke="currentColor"
        strokeWidth="1.8"
      />

      <circle
        cx="12"
        cy="12"
        r="3"
        stroke="currentColor"
        strokeWidth="1.8"
      />

    </svg>

  );


  // ==================================================
  // ICONO ANALÍTICA
  // ==================================================

  const IconoAnalitica = () => (

    <svg
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
    >

      <path
        d="M7 25V18"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinecap="round"
      />

      <path
        d="M16 25V12"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinecap="round"
      />

      <path
        d="M25 25V6"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinecap="round"
      />

    </svg>

  );


  // ==================================================
  // RENDER
  // ==================================================

  return (

    <div className="login-container">


      {/* ============================================
          FONDO DECORATIVO
      ============================================ */}

      <div
        className="
          login-background-grid
        "
      />

      <div
        className="
          login-background-glow
          login-background-glow-1
        "
      />

      <div
        className="
          login-background-glow
          login-background-glow-2
        "
      />

      <div
        className="
          login-background-line
          login-background-line-1
        "
      />

      <div
        className="
          login-background-line
          login-background-line-2
        "
      />


      {/* ============================================
          TARJETA PRINCIPAL
      ============================================ */}

      <div className="login-card">


        {/* ==========================================
            ENCABEZADO / MARCA
        ========================================== */}

        <div className="login-header">

          <div className="login-logo">
            MEGA
          </div>


          <div className="login-security-wrapper">

            <div className="login-security-halo">

              <div className="login-security-icon">

                <IconoEscudo />

              </div>

            </div>

          </div>


          <h1 className="login-title">
            MEGA CONTROL
          </h1>


          <p className="login-subtitulo">
            Salamanca · Supervisores
          </p>


          <div className="login-divider">

            <span />

            <strong />

            <span />

          </div>

        </div>


        {/* ==========================================
            VALIDANDO ACCESO
        ========================================== */}

        {cargando ? (

          <div className="login-validando">


            {/* ======================================
                LOADER EJECUTIVO
            ====================================== */}

            <div className="login-loader-wrapper">

              <div className="login-loader">

                <div
                  className="
                    login-loader-track
                  "
                />

                <div
                  className="
                    login-loader-progress
                  "
                />

                <div
                  className="
                    login-loader-center
                  "
                >

                  <IconoAnalitica />

                </div>

              </div>

            </div>


            {/* ======================================
                SISTEMA
            ====================================== */}

            <h2 className="login-system-title">
              SEGUIMIENTO 2.0
            </h2>


            <p className="login-system-subtitle">
              Inteligencia comercial en tiempo real
            </p>


            {/* ======================================
                MENSAJE DINÁMICO
            ====================================== */}

            <div className="login-loading-message">

              <div className="login-loading-icon">

                <IconoAnalitica />

              </div>


              <p
                key={frase}
                className="loading-frase"
              >
                {frase}
              </p>

            </div>


            {/* ======================================
                ESTADO
            ====================================== */}

            <div className="login-loading-status">

              <span className="login-status-dot" />

              <span>
                Validando acceso seguro
              </span>

            </div>


            {/* ======================================
                PUNTOS ANIMADOS
            ====================================== */}

            <div className="login-loading-dots">

              <span />

              <span />

              <span />

            </div>


          </div>

        ) : (

          /* ========================================
             FORMULARIO
          ======================================== */

          <div className="login-form-wrapper">


            <div className="login-welcome">

              <h2>
                Bienvenido
              </h2>


              <p>
                Ingresa tus credenciales para continuar
              </p>

            </div>


            <form
              onSubmit={manejarLogin}
              className="login-form"
            >


              {/* ====================================
                  USUARIO
              ==================================== */}

              <div className="login-field">

                <label
                  htmlFor="usuario"
                  className="login-label"
                >
                  Usuario
                </label>


                <div className="login-input-wrapper">

                  <div className="login-input-icon">

                    <IconoUsuario />

                  </div>


                  <input
                    id="usuario"
                    name="usuario"
                    type="text"
                    placeholder="Ingresa tu usuario"
                    value={usuario}
                    autoComplete="username"
                    disabled={cargando}
                    autoFocus
                    onChange={(evento) =>
                      setUsuario(
                        evento.target.value
                      )
                    }
                  />

                </div>

              </div>


              {/* ====================================
                  CONTRASEÑA
              ==================================== */}

              <div className="login-field">

                <label
                  htmlFor="password"
                  className="login-label"
                >
                  Contraseña
                </label>


                <div className="login-input-wrapper">

                  <div className="login-input-icon">

                    <IconoCandado />

                  </div>


                  <input
                    id="password"
                    name="password"
                    type={
                      mostrarPassword
                        ? "text"
                        : "password"
                    }
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


                  <button
                    type="button"
                    className="login-password-toggle"
                    aria-label={
                      mostrarPassword
                        ? "Ocultar contraseña"
                        : "Mostrar contraseña"
                    }
                    title={
                      mostrarPassword
                        ? "Ocultar contraseña"
                        : "Mostrar contraseña"
                    }
                    onClick={() =>
                      setMostrarPassword(
                        (valorAnterior) =>
                          !valorAnterior
                      )
                    }
                  >

                    <IconoOjo />

                  </button>

                </div>

              </div>


              {/* ====================================
                  ERROR
              ==================================== */}

              {error && (

                <div
                  className="login-error"
                  role="alert"
                >

                  <div className="login-error-icon">
                    !
                  </div>


                  <span>
                    {error}
                  </span>

                </div>

              )}


              {/* ====================================
                  BOTÓN
              ==================================== */}

              <button
                type="submit"
                className="login-button"
                disabled={cargando}
              >

                <span>
                  INICIAR SESIÓN
                </span>


                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                >

                  <path
                    d="M5 12H19"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />

                  <path
                    d="M14 7L19 12L14 17"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                </svg>

              </button>


              {/* ====================================
                  SEGURIDAD
              ==================================== */}

              <div className="login-security-text">

                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                >

                  <path
                    d="
                      M12 3
                      L19 6
                      V11
                      C19 15.6
                      16.2 19.3
                      12 21
                      C7.8 19.3
                      5 15.6
                      5 11
                      V6
                      L12 3Z
                    "
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinejoin="round"
                  />

                  <path
                    d="M9 12L11 14L15 10"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                </svg>


                <span>
                  Acceso protegido · Uso interno
                </span>

              </div>


            </form>

          </div>

        )}


        {/* ==========================================
            FOOTER
        ========================================== */}

        <div className="login-footer">

          <span className="login-footer-line" />

          <span>
            MEGA · INTELIGENCIA COMERCIAL
          </span>

          <span className="login-footer-line" />

        </div>


      </div>

    </div>

  );

}


export default Login;
