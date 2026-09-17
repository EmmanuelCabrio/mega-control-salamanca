import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  fetchProtegido,
} from "../services/authService";


// ==================================================
// FORMATEAR HORA DE ACCESO
// ==================================================

function formatearHora(
  fecha
) {

  if (
    !fecha
  ) {

    return "—";

  }


  return new Intl.DateTimeFormat(
    "es-MX",
    {

      timeZone:
        "America/Mexico_City",

      hour:
        "2-digit",

      minute:
        "2-digit",

      hour12:
        true,

    }
  ).format(
    new Date(
      fecha
    )
  );

}


function EstadoLoginSupervisores() {

  const [
    datos,
    setDatos,
  ] = useState(null);


  const [
    cargando,
    setCargando,
  ] = useState(true);


  const [
    error,
    setError,
  ] = useState("");


  // ==================================================
  // CONSULTAR ESTADO
  // ==================================================

  const cargarEstado =
    useCallback(
      async () => {

        try {

          setCargando(true);

          setError("");


          const respuesta =
            await fetchProtegido(
              "/api/direccion/logins-hoy"
            );


          const resultado =
            await respuesta.json();


          if (
            !respuesta.ok ||
            !resultado.correcto
          ) {

            throw new Error(
              resultado.mensaje ||
              "No se pudo consultar el estado"
            );

          }


          setDatos(
            resultado
          );

        } catch (errorCarga) {

          console.error(
            "❌ Error estado de logins:",
            errorCarga
          );


          setError(
            errorCarga.message ||
            "No se pudo consultar el estado"
          );

        } finally {

          setCargando(false);

        }

      },
      []
    );


  // ==================================================
  // CARGAR AL ABRIR EL PANEL
  // ==================================================

  useEffect(
    () => {

      cargarEstado();

    },
    [
      cargarEstado
    ]
  );


  // ==================================================
  // CARGANDO
  // ==================================================

  if (
    cargando &&
    !datos
  ) {

    return (

      <section
        className="
          login-supervisores-estado
        "
      >

        Consultando accesos de hoy…

      </section>

    );

  }


  // ==================================================
  // ERROR
  // ==================================================

  if (
    error &&
    !datos
  ) {

    return (

      <section
        className="
          login-supervisores-estado
          login-supervisores-error
        "
      >

        {error}

      </section>

    );

  }


  const logueados =
    datos?.logueados ||
    [];


  const pendientes =
    datos?.pendientes ||
    [];


  // ==================================================
  // RENDER
  // ==================================================

  return (

    <section
      className="
        login-supervisores-card
      "
    >


      {/* ==========================================
          ENCABEZADO
      ========================================== */}

      <div
        className="
          login-supervisores-header
        "
      >

        <div>

          <span>
            ACCESO DE SUPERVISORES
          </span>


          <h2>
            ¿Quién ya se logueó hoy?
          </h2>


          <p>
            Seguimiento diario de acceso al panel comercial.
          </p>

        </div>


        {/* ========================================
            RESUMEN
        ======================================== */}

        <div
          className="
            login-supervisores-resumen
          "
        >

          <strong>

            {
              datos?.totalLogueados ||
              0
            }

            <small>
              logueados
            </small>

          </strong>


          <strong>

            {
              datos?.totalPendientes ||
              0
            }

            <small>
              pendientes
            </small>

          </strong>


          <button

            type="button"

            onClick={
              cargarEstado
            }

            disabled={
              cargando
            }

          >

            {
              cargando
                ? "Actualizando…"
                : "Actualizar"
            }

          </button>

        </div>

      </div>


      {/* ==========================================
          COLUMNAS
      ========================================== */}

      <div
        className="
          login-supervisores-columnas
        "
      >


        {/* ========================================
            YA SE LOGUEARON
        ======================================== */}

        <article
          className="
            login-supervisores-lista
            login-supervisores-lista-ok
          "
        >

          <div>

            <span>
              YA SE LOGUEARON
            </span>

            <strong>
              {logueados.length}
            </strong>

          </div>


          {
            logueados.length > 0
              ? (

                <ul>

                  {logueados.map(
                    (registro) => (

                      <li
                        key={
                          registro.clave
                        }
                      >

                        <span>
                          ✓
                        </span>


                        <div>

                          <strong>

                            {registro.supervisor}

                          </strong>


                          <small>

                            Primer acceso:{" "}

                            {formatearHora(
                              registro.primerAcceso
                            )}

                          </small>

                        </div>

                      </li>

                    )
                  )}

                </ul>

              )
              : (

                <p>

                  Ningún supervisor se ha logueado todavía.

                </p>

              )
          }

        </article>


        {/* ========================================
            PENDIENTES
        ======================================== */}

        <article
          className="
            login-supervisores-lista
            login-supervisores-lista-pendiente
          "
        >

          <div>

            <span>
              NO SE HAN LOGUEADO
            </span>

            <strong>
              {pendientes.length}
            </strong>

          </div>


          {
            pendientes.length > 0
              ? (

                <ul>

                  {pendientes.map(
                    (registro) => (

                      <li
                        key={
                          registro.clave
                        }
                      >

                        <span>
                          !
                        </span>


                        <div>

                          <strong>

                            {registro.supervisor}

                          </strong>


                          <small>
                            Sin acceso registrado hoy
                          </small>

                        </div>

                      </li>

                    )
                  )}

                </ul>

              )
              : (

                <p>

                  Todos los supervisores ya ingresaron.

                </p>

              )
          }

        </article>

      </div>


    </section>

  );

}


export default EstadoLoginSupervisores;
