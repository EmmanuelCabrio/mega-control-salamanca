import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  fetchProtegido,
} from "../services/authService";


// ==================================================
// FORMATEAR FECHA Y HORA
// ==================================================

function formatearFechaHora(
  valor
) {

  if (
    !valor
  ) {

    return "—";

  }


  const fecha =
    new Date(
      valor
    );


  if (
    Number.isNaN(
      fecha.getTime()
    )
  ) {

    return "—";

  }


  return new Intl.DateTimeFormat(
    "es-MX",
    {

      timeZone:
        "America/Mexico_City",

      day:
        "2-digit",

      month:
        "2-digit",

      year:
        "numeric",

      hour:
        "2-digit",

      minute:
        "2-digit",

      second:
        "2-digit",

      hour12:
        true,

    }
  ).format(
    fecha
  );

}


// ==================================================
// SESIONES ACTIVAS — DIRECCIÓN
// ==================================================

function SesionesActivasDireccion() {

  const [
    sesiones,
    setSesiones,
  ] = useState([]);

  const [
    cargando,
    setCargando,
  ] = useState(true);

  const [
    liberando,
    setLiberando,
  ] = useState("");

  const [
    mensaje,
    setMensaje,
  ] = useState("");

  const [
    hayError,
    setHayError,
  ] = useState(false);


  // ==================================================
  // CARGAR SESIONES
  // ==================================================

  const cargarSesiones =
    useCallback(
      async () => {

        try {

          setCargando(
            true
          );

          setMensaje(
            ""
          );

          setHayError(
            false
          );


          const respuesta =
            await fetchProtegido(
              "/api/sesiones-activas"
            );


          const datos =
            await respuesta.json();


          if (
            !respuesta.ok ||
            !datos.correcto
          ) {

            throw new Error(
              datos.mensaje ||
              "No se pudieron consultar las sesiones"
            );

          }


          setSesiones(
            Array.isArray(
              datos.sesiones
            )
              ? datos.sesiones
              : []
          );

        } catch (
          error
        ) {

          console.error(
            "❌ Error al cargar sesiones activas:",
            error
          );


          setSesiones(
            []
          );

          setHayError(
            true
          );

          setMensaje(
            error.message ||
            "No se pudieron cargar las sesiones."
          );

        } finally {

          setCargando(
            false
          );

        }

      },
      []
    );


  useEffect(
    () => {

      cargarSesiones();

    },
    [
      cargarSesiones,
    ]
  );


  // ==================================================
  // LIBERAR SESIÓN
  // ==================================================

  async function liberarSesion(
    sesion
  ) {

    if (
      liberando
    ) {

      return;

    }


    const confirmar =
      window.confirm(
        `¿Liberar la sesión de este usuario?\n\nUsuario: ${sesion.usuario}\nSupervisor: ${sesion.supervisor || "—"}\n\nEl usuario será expulsado de su sesión actual y podrá ingresar nuevamente desde otro dispositivo.`
      );


    if (
      !confirmar
    ) {

      return;

    }


    try {

      setLiberando(
        sesion.usuario
      );

      setMensaje(
        ""
      );

      setHayError(
        false
      );


      const respuesta =
        await fetchProtegido(
          "/api/sesiones-activas/liberar",
          {

            method:
              "POST",

            headers: {

              "Content-Type":
                "application/json",

            },

            body:
              JSON.stringify({

                usuario:
                  sesion.usuario,

              }),

          }
        );


      const datos =
        await respuesta.json();


      if (
        !respuesta.ok ||
        !datos.correcto
      ) {

        throw new Error(
          datos.mensaje ||
          "No se pudo liberar la sesión"
        );

      }


      setSesiones(
        (
          sesionesActuales
        ) =>
          sesionesActuales.filter(
            (
              sesionActual
            ) =>
              sesionActual.usuario !==
              sesion.usuario
          )
      );


      setMensaje(
        `✅ Sesión de ${sesion.usuario} liberada correctamente.`
      );

    } catch (
      error
    ) {

      console.error(
        "❌ Error al liberar sesión:",
        error
      );


      setHayError(
        true
      );

      setMensaje(
        error.message ||
        "No se pudo liberar la sesión."
      );

    } finally {

      setLiberando(
        ""
      );

    }

  }


  // ==================================================
  // RENDER
  // ==================================================

  return (

    <section
      style={styles.contenedor}
    >

      <div
        style={styles.encabezado}
      >

        <div
          style={styles.icono}
        >
          🔐
        </div>

        <div
          style={styles.encabezadoTexto}
        >

          <div
            style={styles.etiqueta}
          >
            SEGURIDAD DE ACCESO
          </div>

          <h2
            style={styles.titulo}
          >
            Sesiones de supervisores
          </h2>

          <p
            style={styles.descripcion}
          >
            Controla los usuarios abiertos y libera accesos trabados.
          </p>

        </div>


        <button
          type="button"
          onClick={
            cargarSesiones
          }
          disabled={
            cargando ||
            Boolean(
              liberando
            )
          }
          style={styles.actualizar}
        >
          {cargando
            ? "⏳ Consultando..."
            : "🔄 Actualizar"}
        </button>

      </div>


      <div
        style={styles.resumen}
      >

        <div
          style={styles.resumenItem}
        >

          <span
            style={styles.resumenNumero}
          >
            {
              sesiones.filter(
                (sesion) =>
                  sesion.activa
              ).length
            }
          </span>

          <span>
            Activas
          </span>

        </div>


        <div
          style={styles.resumenItem}
        >

          <span
            style={styles.resumenNumero}
          >
            {
              sesiones.filter(
                (sesion) =>
                  !sesion.activa
              ).length
            }
          </span>

          <span>
            Inactivas
          </span>

        </div>

      </div>


      {mensaje && (

        <div
          role={
            hayError
              ? "alert"
              : "status"
          }
          style={{

            ...styles.mensaje,

            background:
              hayError
                ? "#fef2f2"
                : "#ecfdf5",

            borderColor:
              hayError
                ? "#fecaca"
                : "#a7f3d0",

            color:
              hayError
                ? "#991b1b"
                : "#065f46",

          }}
        >
          {mensaje}
        </div>

      )}


      {!cargando &&
        sesiones.length === 0 && (

          <div
            style={styles.vacio}
          >
            No hay sesiones de supervisores registradas.
          </div>

        )}


      {sesiones.length > 0 && (

        <div
          style={styles.tablaContenedor}
        >

          <table
            style={styles.tabla}
          >

            <thead>

              <tr>

                <th style={styles.th}>
                  Estado
                </th>

                <th style={styles.th}>
                  Usuario
                </th>

                <th style={styles.th}>
                  Supervisor
                </th>

                <th style={styles.th}>
                  Inicio
                </th>

                <th style={styles.th}>
                  Última actividad
                </th>

                <th style={styles.th}>
                  Acción
                </th>

              </tr>

            </thead>


            <tbody>

              {sesiones.map(
                (
                  sesion
                ) => (

                  <tr
                    key={
                      sesion.usuario
                    }
                  >

                    <td style={styles.td}>

                      <span
                        style={{

                          ...styles.estado,

                          background:
                            sesion.activa
                              ? "#dcfce7"
                              : "#f1f5f9",

                          color:
                            sesion.activa
                              ? "#166534"
                              : "#475569",

                        }}
                      >
                        {sesion.activa
                          ? "🟢 ACTIVA"
                          : "⚪ INACTIVA"}
                      </span>

                    </td>

                    <td style={styles.td}>
                      {sesion.usuario}
                    </td>

                    <td style={styles.td}>
                      {sesion.supervisor || "—"}
                    </td>

                    <td style={styles.td}>
                      {formatearFechaHora(
                        sesion.inicio
                      )}
                    </td>

                    <td style={styles.td}>
                      {formatearFechaHora(
                        sesion.ultimaActividad
                      )}
                    </td>

                    <td style={styles.td}>

                      <button
                        type="button"
                        onClick={
                          () =>
                            liberarSesion(
                              sesion
                            )
                        }
                        disabled={
                          Boolean(
                            liberando
                          )
                        }
                        style={{

                          ...styles.liberar,

                          opacity:
                            liberando
                              ? 0.65
                              : 1,

                        }}
                      >
                        {liberando ===
                        sesion.usuario
                          ? "⏳ Liberando..."
                          : "🔓 Liberar sesión"}
                      </button>

                    </td>

                  </tr>

                )
              )}

            </tbody>

          </table>

        </div>

      )}

    </section>

  );

}


// ==================================================
// ESTILOS
// ==================================================

const styles = {

  contenedor: {

    margin:
      "22px 0",

    padding:
      "24px",

    borderRadius:
      "18px",

    background:
      "#ffffff",

    color:
      "#172033",

    border:
      "1px solid #bfdbfe",

    boxShadow:
      "0 12px 32px rgba(15, 23, 42, 0.08)",

  },

  encabezado: {

    display:
      "flex",

    alignItems:
      "center",

    flexWrap:
      "wrap",

    gap:
      "14px",

    marginBottom:
      "18px",

  },

  icono: {

    display:
      "grid",

    placeItems:
      "center",

    width:
      "48px",

    height:
      "48px",

    borderRadius:
      "14px",

    background:
      "#1d4ed8",

    color:
      "#ffffff",

    fontSize:
      "22px",

  },

  encabezadoTexto: {

    flex:
      1,

    minWidth:
      "220px",

  },

  etiqueta: {

    color:
      "#2563eb",

    fontSize:
      "12px",

    fontWeight:
      "900",

    letterSpacing:
      "0.8px",

  },

  titulo: {

    margin:
      "3px 0 0",

    fontSize:
      "22px",

  },

  descripcion: {

    margin:
      "5px 0 0",

    color:
      "#64748b",

  },

  actualizar: {

    padding:
      "10px 15px",

    border:
      "1px solid #cbd5e1",

    borderRadius:
      "10px",

    background:
      "#f8fafc",

    color:
      "#172033",

    font:
      "inherit",

    fontWeight:
      "800",

    cursor:
      "pointer",

  },

  resumen: {

    display:
      "flex",

    flexWrap:
      "wrap",

    gap:
      "12px",

    marginBottom:
      "16px",

  },

  resumenItem: {

    display:
      "flex",

    alignItems:
      "center",

    gap:
      "8px",

    minWidth:
      "135px",

    padding:
      "12px 15px",

    borderRadius:
      "12px",

    background:
      "#f8fafc",

    border:
      "1px solid #e2e8f0",

    color:
      "#475569",

    fontWeight:
      "800",

  },

  resumenNumero: {

    color:
      "#1d4ed8",

    fontSize:
      "22px",

    fontWeight:
      "950",

  },

  mensaje: {

    marginBottom:
      "16px",

    padding:
      "13px 15px",

    border:
      "1px solid",

    borderRadius:
      "10px",

    fontWeight:
      "700",

  },

  vacio: {

    padding:
      "20px",

    borderRadius:
      "12px",

    background:
      "#f8fafc",

    color:
      "#475569",

    fontWeight:
      "800",

    textAlign:
      "center",

  },

  tablaContenedor: {

    overflowX:
      "auto",

  },

  tabla: {

    width:
      "100%",

    minWidth:
      "900px",

    borderCollapse:
      "collapse",

  },

  th: {

    padding:
      "12px",

    background:
      "#172554",

    color:
      "#ffffff",

    fontSize:
      "12px",

    textAlign:
      "left",

  },

  td: {

    padding:
      "12px",

    borderBottom:
      "1px solid #e2e8f0",

    color:
      "#172033",

    fontSize:
      "13px",

    fontWeight:
      "650",

  },

  estado: {

    display:
      "inline-block",

    padding:
      "6px 9px",

    borderRadius:
      "999px",

    fontSize:
      "11px",

    fontWeight:
      "900",

    whiteSpace:
      "nowrap",

  },

  liberar: {

    padding:
      "9px 12px",

    border:
      "none",

    borderRadius:
      "9px",

    background:
      "#dc2626",

    color:
      "#ffffff",

    font:
      "inherit",

    fontWeight:
      "850",

    cursor:
      "pointer",

    whiteSpace:
      "nowrap",

  },

};


export default SesionesActivasDireccion;
