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

      hour12:
        true,

    }
  ).format(
    fecha
  );

}


// ==================================================
// CHECKS PENDIENTES — DIRECCIÓN
// ==================================================

function ChecksPendientesDireccion() {

  const [
    sesiones,
    setSesiones,
  ] = useState([]);

  const [
    cargando,
    setCargando,
  ] = useState(true);

  const [
    abortandoId,
    setAbortandoId,
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
  // CARGAR SESIONES PENDIENTES
  // ==================================================

  const cargarSesiones =
    useCallback(
      async () => {

        try {

          setCargando(
            true
          );

          setHayError(
            false
          );


          const respuesta =
            await fetchProtegido(
              "/api/checklists-foco-rojo/pendientes"
            );


          const datos =
            await respuesta.json();


          if (
            !respuesta.ok ||
            !datos.correcto
          ) {

            throw new Error(
              datos.mensaje ||
              "No se pudieron consultar los checks pendientes"
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
            "❌ Error al cargar checks pendientes:",
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
            "No se pudieron cargar los checks pendientes."
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
  // ABORTAR CHECK
  // ==================================================

  async function abortarCheck(
    sesion
  ) {

    if (
      abortandoId
    ) {

      return;

    }


    const motivo =
      window.prompt(
        `Motivo para abortar el check de ${sesion.promotor}:`,
        sesion.expirada
          ? "Sesión expirada"
          : "Check de prueba o sesión trabada"
      );


    if (
      motivo === null
    ) {

      return;

    }


    const motivoLimpio =
      motivo.trim();


    if (
      motivoLimpio.length < 3
    ) {

      window.alert(
        "Escribe un motivo de al menos 3 caracteres."
      );

      return;

    }


    const confirmar =
      window.confirm(
        `¿Seguro que deseas abortar este check?\n\nSupervisor: ${sesion.supervisor}\nPromotor: ${sesion.promotor}\n\nEsta acción liberará el seguimiento pendiente, pero no eliminará checks terminados.`
      );


    if (
      !confirmar
    ) {

      return;

    }


    try {

      setAbortandoId(
        sesion.id
      );

      setMensaje(
        ""
      );

      setHayError(
        false
      );


      const respuesta =
        await fetchProtegido(
          "/api/checklists-foco-rojo/abortar",
          {

            method:
              "POST",

            headers: {

              "Content-Type":
                "application/json",

            },

            body:
              JSON.stringify({

                sesionId:
                  sesion.id,

                motivo:
                  motivoLimpio,

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
          "No se pudo abortar el check"
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
              sesionActual.id !==
              sesion.id
          )
      );


      setMensaje(
        `✅ Check de ${sesion.promotor} abortado correctamente.`
      );


      window.alert(
        "✅ Check abortado correctamente.\n\nEl supervisor será liberado al entrar, recargar o durante los próximos 30 segundos."
      );

    } catch (
      error
    ) {

      console.error(
        "❌ Error al abortar el check:",
        error
      );


      setHayError(
        true
      );

      setMensaje(
        error.message ||
        "No se pudo abortar el check."
      );

    } finally {

      setAbortandoId(
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
          🛑
        </div>

        <div
          style={{
            flex:
              1,
          }}
        >

          <div
            style={styles.etiqueta}
          >
            CONTROL EXCLUSIVO DE DIRECCIÓN
          </div>

          <h2
            style={styles.titulo}
          >
            Checks pendientes
          </h2>

          <p
            style={styles.descripcion}
          >
            Libera sesiones de prueba, expiradas o que hayan quedado trabadas.
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
              abortandoId
            )
          }
          style={styles.actualizar}
        >
          {cargando
            ? "⏳ Consultando..."
            : "🔄 Actualizar"}
        </button>

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
            ✅ No hay checks pendientes o trabados.
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
                  Supervisor
                </th>

                <th style={styles.th}>
                  Promotor
                </th>

                <th style={styles.th}>
                  Usuario
                </th>

                <th style={styles.th}>
                  Inicio
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
                      sesion.id
                    }
                  >

                    <td style={styles.td}>

                      <span
                        style={{

                          ...styles.estado,

                          background:
                            sesion.expirada
                              ? "#fee2e2"
                              : "#fef3c7",

                          color:
                            sesion.expirada
                              ? "#991b1b"
                              : "#92400e",

                        }}
                      >
                        {sesion.expirada
                          ? "EXPIRADO"
                          : "PENDIENTE"}
                      </span>

                    </td>

                    <td style={styles.td}>
                      {sesion.supervisor}
                    </td>

                    <td style={styles.td}>
                      {sesion.promotor}
                    </td>

                    <td style={styles.td}>
                      {sesion.usuario || "—"}
                    </td>

                    <td style={styles.td}>
                      {formatearFechaHora(
                        sesion.inicio
                      )}
                    </td>

                    <td style={styles.td}>

                      <button
                        type="button"
                        onClick={
                          () =>
                            abortarCheck(
                              sesion
                            )
                        }
                        disabled={
                          Boolean(
                            abortandoId
                          )
                        }
                        style={{

                          ...styles.abortar,

                          opacity:
                            abortandoId
                              ? 0.65
                              : 1,

                        }}
                      >
                        {abortandoId ===
                        sesion.id
                          ? "⏳ Abortando..."
                          : "🛑 Abortar check"}
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
      "1px solid #fecaca",

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
      "20px",

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
      "#991b1b",

    color:
      "#ffffff",

    fontSize:
      "22px",

  },

  etiqueta: {

    color:
      "#dc2626",

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
      "#ecfdf5",

    color:
      "#065f46",

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
      "850px",

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

  },

  abortar: {

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


export default ChecksPendientesDireccion;
