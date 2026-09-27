import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  fetchProtegido,
} from "../services/authService";


// ==================================================
// FORMATEAR FECHA Y HORA DE MÉXICO
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
// FORMATEAR DURACIÓN
// ==================================================

function formatearDuracion(
  segundos
) {

  const totalSegundos =
    Number(
      segundos
    );


  if (
    !Number.isFinite(
      totalSegundos
    )
  ) {

    return "—";

  }


  const totalMinutos =
    Math.max(
      0,
      Math.round(
        totalSegundos /
        60
      )
    );


  const horas =
    Math.floor(
      totalMinutos /
      60
    );


  const minutos =
    totalMinutos %
    60;


  if (
    horas > 0
  ) {

    return `${horas} h ${minutos} min`;

  }


  return `${minutos} min`;

}


// ==================================================
// HISTORIAL PRIVADO DE CHECKLISTS
// ==================================================

function HistorialChecklistsDireccion({
  registros = [],
}) {


  const [
    supervisorSeleccionado,
    setSupervisorSeleccionado,
  ] = useState("");

  const [
    promotorSeleccionado,
    setPromotorSeleccionado,
  ] = useState("");

  const [
    historial,
    setHistorial,
  ] = useState([]);

  const [
    comparativa,
    setComparativa,
  ] = useState(null);

  // El equipo ya llega cargado desde App.jsx.

const cargandoEquipo =
  false;

  const [
    cargandoHistorial,
    setCargandoHistorial,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");



  // ==================================================
  // LISTA DE SUPERVISORES
  // ==================================================

  const supervisores =
    useMemo(
      () => {

        return [
          ...new Set(

            registros
              .map(
                (registro) =>
                  String(
                    registro.supervisor ??
                    ""
                  ).trim()
              )
              .filter(
                (nombre) =>
                  nombre &&
                  nombre !== "0"
              )

          ),
        ].sort(
          (
            a,
            b
          ) =>
            a.localeCompare(
              b,
              "es"
            )
        );

      },
      [
        registros,
      ]
    );


  // ==================================================
  // PROMOTORES DEL SUPERVISOR SELECCIONADO
  // ==================================================

  const promotores =
    useMemo(
      () => {

        if (
          !supervisorSeleccionado
        ) {

          return [];

        }


        return [
          ...new Set(

            registros
              .filter(
                (registro) =>
                  String(
                    registro.supervisor ??
                    ""
                  ).trim() ===
                  supervisorSeleccionado
              )
              .map(
                (registro) =>
                  String(
                    registro.nombre ??
                    ""
                  ).trim()
              )
              .filter(
                (nombre) =>
                  nombre &&
                  nombre !== "0" &&
                  !nombre
                    .toUpperCase()
                    .includes(
                      "VACANTE"
                    )
              )

          ),
        ].sort(
          (
            a,
            b
          ) =>
            a.localeCompare(
              b,
              "es"
            )
        );

      },
      [
        registros,
        supervisorSeleccionado,
      ]
    );


  // ==================================================
  // CONSULTAR HISTORIAL DEL PROMOTOR
  // ==================================================

  useEffect(
    () => {

      if (
        !supervisorSeleccionado ||
        !promotorSeleccionado
      ) {

        setHistorial(
          []
        );

        setComparativa(
          null
        );

        return;

      }


      let componenteActivo =
        true;


      async function cargarHistorial() {

        try {

          setCargandoHistorial(
            true
          );

          setError(
            ""
          );


          const respuesta =
            await fetchProtegido(
              `/api/checklists-foco-rojo?supervisor=${encodeURIComponent(
                supervisorSeleccionado
              )}&promotor=${encodeURIComponent(
                promotorSeleccionado
              )}`
            );


          const datos =
            await respuesta.json();


          if (
            !respuesta.ok
          ) {

            throw new Error(
              datos.mensaje ||
              "No se pudo consultar el historial"
            );

          }


          if (
            componenteActivo
          ) {

            setHistorial(
              datos.historial || []
            );

            setComparativa(
              datos.comparativa || null
            );

          }

        } catch (
          errorCarga
        ) {

          console.error(
            "❌ Error al cargar historial de Dirección:",
            errorCarga
          );


          if (
            componenteActivo
          ) {

            setHistorial(
              []
            );

            setComparativa(
              null
            );

            setError(
              errorCarga.message ||
              "No se pudo consultar el historial."
            );

          }

        } finally {

          if (
            componenteActivo
          ) {

            setCargandoHistorial(
              false
            );

          }

        }

      }


      cargarHistorial();


      return () => {

        componenteActivo =
          false;

      };

    },
    [
      supervisorSeleccionado,
      promotorSeleccionado,
    ]
  );


  // ==================================================
  // CAMBIAR SUPERVISOR
  // ==================================================

  function cambiarSupervisor(
    evento
  ) {

    setSupervisorSeleccionado(
      evento.target.value
    );

    setPromotorSeleccionado(
      ""
    );

    setHistorial(
      []
    );

    setComparativa(
      null
    );

  }


  // ==================================================
  // ESTILOS
  // ==================================================

  const selectStyle = {

    width:
      "100%",

    marginTop:
      "7px",

    padding:
      "12px 14px",

    border:
      "1px solid #cbd5e1",

    borderRadius:
      "10px",

    background:
      "#ffffff",

    color:
      "#172033",

    font:
      "inherit",

    fontWeight:
      "700",

    outline:
      "none",

  };


  const indicadorStyle = {

    padding:
      "17px",

    borderRadius:
      "14px",

    background:
      "#f8fafc",

    border:
      "1px solid #e2e8f0",

  };


  // ==================================================
  // RENDER
  // ==================================================

  return (

    <section
      style={{
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
          "1px solid #dbe4ee",

        boxShadow:
          "0 12px 32px rgba(15, 23, 42, 0.08)",
      }}
    >

      {/* =============================================
          ENCABEZADO
      ============================================= */}

      <div
        style={{
          display:
            "flex",

          alignItems:
            "center",

          gap:
            "14px",

          marginBottom:
            "20px",
        }}
      >

        <div
          style={{
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
              "#172554",

            color:
              "#ffffff",

            fontSize:
              "22px",
          }}
        >
          🕒
        </div>

        <div>

          <div
            style={{
              color:
                "#2563eb",

              fontSize:
                "12px",

              fontWeight:
                "900",

              letterSpacing:
                "0.8px",

              textTransform:
                "uppercase",
            }}
          >
            Información exclusiva de Dirección
          </div>

          <h2
            style={{
              margin:
                "3px 0 0",

              color:
                "#172033",

              fontSize:
                "22px",
            }}
          >
            Seguimiento de checklists
          </h2>

          <p
            style={{
              margin:
                "5px 0 0",

              color:
                "#64748b",
            }}
          >
            Consulta horarios, duración y evolución de cada foco rojo.
          </p>

        </div>

      </div>


      {/* =============================================
          FILTROS
      ============================================= */}

      <div
        style={{
          display:
            "grid",

          gridTemplateColumns:
            "repeat(auto-fit, minmax(240px, 1fr))",

          gap:
            "16px",

          marginBottom:
            "20px",
        }}
      >

        <label
          style={{
            color:
              "#334155",

            fontSize:
              "13px",

            fontWeight:
              "900",
          }}
        >
          SUPERVISOR

          <select
            value={
              supervisorSeleccionado
            }
            onChange={
              cambiarSupervisor
            }
            disabled={
              cargandoEquipo
            }
            style={
              selectStyle
            }
          >

            <option value="">
              {cargandoEquipo
                ? "Cargando supervisores..."
                : "Selecciona un supervisor"}
            </option>

            {supervisores.map(
              (supervisor) => (

                <option
                  key={
                    supervisor
                  }
                  value={
                    supervisor
                  }
                >
                  {supervisor}
                </option>

              )
            )}

          </select>

        </label>


        <label
          style={{
            color:
              "#334155",

            fontSize:
              "13px",

            fontWeight:
              "900",
          }}
        >
          PROMOTOR

          <select
            value={
              promotorSeleccionado
            }
            onChange={
              (
                evento
              ) =>
                setPromotorSeleccionado(
                  evento.target.value
                )
            }
            disabled={
              !supervisorSeleccionado
            }
            style={{
              ...selectStyle,

              opacity:
                supervisorSeleccionado
                  ? 1
                  : 0.6,
            }}
          >

            <option value="">
              Selecciona un promotor
            </option>

            {promotores.map(
              (promotor) => (

                <option
                  key={
                    promotor
                  }
                  value={
                    promotor
                  }
                >
                  {promotor}
                </option>

              )
            )}

          </select>

        </label>

      </div>


      {/* =============================================
          ERROR
      ============================================= */}

      {error && (

        <div
          role="alert"
          style={{
            marginBottom:
              "18px",

            padding:
              "13px 15px",

            borderRadius:
              "10px",

            background:
              "#fef2f2",

            color:
              "#991b1b",

            border:
              "1px solid #fecaca",

            fontWeight:
              "700",
          }}
        >
          ⚠️ {error}
        </div>

      )}


      {/* =============================================
          CARGANDO
      ============================================= */}

      {cargandoHistorial && (

        <div
          style={{
            padding:
              "28px",

            textAlign:
              "center",

            color:
              "#64748b",

            fontWeight:
              "800",
          }}
        >
          Consultando historial...
        </div>

      )}


      {/* =============================================
          RESUMEN
      ============================================= */}

      {!cargandoHistorial &&
        promotorSeleccionado && (

          <>

            <div
              style={{
                display:
                  "grid",

                gridTemplateColumns:
                  "repeat(auto-fit, minmax(170px, 1fr))",

                gap:
                  "13px",

                marginBottom:
                  "20px",
              }}
            >

              <div style={indicadorStyle}>

                <div
                  style={{
                    color:
                      "#64748b",

                    fontSize:
                      "12px",

                    fontWeight:
                      "900",
                  }}
                >
                  CHECKLISTS
                </div>

                <div
                  style={{
                    marginTop:
                      "5px",

                    fontSize:
                      "29px",

                    fontWeight:
                      "900",
                  }}
                >
                  {historial.length}
                </div>

              </div>


              <div style={indicadorStyle}>

                <div
                  style={{
                    color:
                      "#64748b",

                    fontSize:
                      "12px",

                    fontWeight:
                      "900",
                  }}
                >
                  PRODUCTIVIDAD INICIAL
                </div>

                <div
                  style={{
                    marginTop:
                      "5px",

                    fontSize:
                      "29px",

                    fontWeight:
                      "900",
                  }}
                >
                  {comparativa?.productividadInicial !== null &&
                  comparativa?.productividadInicial !== undefined
                    ? Number(
                        comparativa.productividadInicial
                      ).toFixed(
                        2
                      )
                    : "—"}
                </div>

              </div>


              <div style={indicadorStyle}>

                <div
                  style={{
                    color:
                      "#64748b",

                    fontSize:
                      "12px",

                    fontWeight:
                      "900",
                  }}
                >
                  ÚLTIMA PRODUCTIVIDAD
                </div>

                <div
                  style={{
                    marginTop:
                      "5px",

                    fontSize:
                      "29px",

                    fontWeight:
                      "900",
                  }}
                >
                  {comparativa?.productividadUltima !== null &&
                  comparativa?.productividadUltima !== undefined
                    ? Number(
                        comparativa.productividadUltima
                      ).toFixed(
                        2
                      )
                    : "—"}
                </div>

              </div>


              <div
                style={{
                  ...indicadorStyle,

                  background:
                    comparativa?.resultado === "MEJORÓ"
                      ? "#ecfdf5"
                      : comparativa?.resultado === "DISMINUYÓ"
                        ? "#fef2f2"
                        : "#f8fafc",

                  color:
                    comparativa?.resultado === "MEJORÓ"
                      ? "#166534"
                      : comparativa?.resultado === "DISMINUYÓ"
                        ? "#991b1b"
                        : "#334155",
                }}
              >

                <div
                  style={{
                    fontSize:
                      "12px",

                    fontWeight:
                      "900",
                  }}
                >
                  EVOLUCIÓN
                </div>

                <div
                  style={{
                    marginTop:
                      "5px",

                    fontSize:
                      "21px",

                    fontWeight:
                      "900",
                  }}
                >
                  {comparativa?.resultado ||
                    "SIN HISTORIAL"}
                </div>

                {comparativa?.diferencia !== null &&
                  comparativa?.diferencia !== undefined && (

                    <div
                      style={{
                        marginTop:
                          "4px",

                        fontWeight:
                          "900",
                      }}
                    >
                      {Number(
                        comparativa.diferencia
                      ) > 0
                        ? "+"
                        : ""}

                      {Number(
                        comparativa.diferencia
                      ).toFixed(
                        2
                      )}
                    </div>

                  )}

              </div>

            </div>


            {/* =======================================
                TABLA PRIVADA
            ======================================= */}

            {historial.length > 0 ? (

              <div
                style={{
                  overflowX:
                    "auto",

                  borderRadius:
                    "14px",

                  border:
                    "1px solid #e2e8f0",
                }}
              >

                <table
                  style={{
                    width:
                      "100%",

                    minWidth:
                      "760px",

                    borderCollapse:
                      "collapse",

                    background:
                      "#ffffff",
                  }}
                >

                  <thead>

                    <tr
                      style={{
                        background:
                          "#172554",

                        color:
                          "#ffffff",
                      }}
                    >

                      {[
                        "#",
                        "Inicio",
                        "Término",
                        "Duración",
                        "Productividad",
                        "Resultado",
                      ].map(
                        (
                          encabezado
                        ) => (

                          <th
                            key={
                              encabezado
                            }
                            style={{
                              padding:
                                "13px 14px",

                              textAlign:
                                "left",

                              fontSize:
                                "12px",

                              letterSpacing:
                                "0.4px",
                            }}
                          >
                            {encabezado}
                          </th>

                        )
                      )}

                    </tr>

                  </thead>


                  <tbody>

                    {historial.map(
                      (
                        registro,
                        index
                      ) => {

                        const productividadAnterior =
                          index > 0
                            ? Number(
                                historial[
                                  index - 1
                                ]?.productividad ??
                                0
                              )
                            : null;


                        const productividadActual =
                          Number(
                            registro.productividad ??
                            0
                          );


                        const diferencia =
                          productividadAnterior === null
                            ? null
                            : productividadActual -
                              productividadAnterior;


                        return (

                          <tr
                            key={
                              registro.id ||
                              index
                            }
                            style={{
                              borderBottom:
                                "1px solid #e2e8f0",
                            }}
                          >

                            <td
                              style={{
                                padding:
                                  "13px 14px",

                                fontWeight:
                                  "900",
                              }}
                            >
                              {index + 1}
                            </td>

                            <td
                              style={{
                                padding:
                                  "13px 14px",

                                whiteSpace:
                                  "nowrap",
                              }}
                            >
                              {formatearFechaHora(
                                registro.inicio
                              )}
                            </td>

                            <td
                              style={{
                                padding:
                                  "13px 14px",

                                whiteSpace:
                                  "nowrap",
                              }}
                            >
                              {formatearFechaHora(
                                registro.fin ||
                                registro.fechaHora
                              )}
                            </td>

                            <td
                              style={{
                                padding:
                                  "13px 14px",

                                fontWeight:
                                  "900",
                              }}
                            >
                              {formatearDuracion(
                                registro.duracionSegundos
                              )}
                            </td>

                            <td
                              style={{
                                padding:
                                  "13px 14px",

                                fontWeight:
                                  "900",
                              }}
                            >
                              {productividadActual.toFixed(
                                2
                              )}
                            </td>

                            <td
                              style={{
                                padding:
                                  "13px 14px",

                                color:
                                  diferencia === null
                                    ? "#64748b"
                                    : diferencia > 0
                                      ? "#166534"
                                      : diferencia < 0
                                        ? "#991b1b"
                                        : "#334155",

                                fontWeight:
                                  "900",
                              }}
                            >
                              {diferencia === null
                                ? "PRIMER CHECK"
                                : diferencia > 0
                                  ? `MEJORÓ +${diferencia.toFixed(
                                      2
                                    )}`
                                  : diferencia < 0
                                    ? `DISMINUYÓ ${diferencia.toFixed(
                                        2
                                      )}`
                                    : "SIN CAMBIO"}
                            </td>

                          </tr>

                        );

                      }
                    )}

                  </tbody>

                </table>

              </div>

            ) : (

              <div
                style={{
                  padding:
                    "28px",

                  textAlign:
                    "center",

                  borderRadius:
                    "14px",

                  background:
                    "#f8fafc",

                  color:
                    "#64748b",

                  border:
                    "1px dashed #cbd5e1",

                  fontWeight:
                    "800",
                }}
              >
                Este promotor todavía no tiene checklists registrados.
              </div>

            )}

          </>

        )}

    </section>

  );

}

export default HistorialChecklistsDireccion;
