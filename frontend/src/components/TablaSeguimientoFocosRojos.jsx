import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  fetchProtegido,
} from "../services/authService";

import {
  calcularPrioridades,
  filtrarFocosRojos,
  ordenarPorPrioridad,
} from "../utils/prioridades";


// ==================================================
// TABLA DE SEGUIMIENTO DE FOCOS ROJOS
// ==================================================

function TablaSeguimientoFocosRojos({

  registros = [],

  supervisorSeleccionado = "",

  onIniciarSeguimiento,

}) {

  const [
    seguimiento,
    setSeguimiento,
  ] = useState({});

  const [
    cargando,
    setCargando,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");


  // ==================================================
  // EQUIPO DEL SUPERVISOR
  // ==================================================

  const equipo =
    useMemo(
      () => {

        return registros.filter(
          (promotor) => {

            const supervisorPromotor =
              String(
                promotor.supervisor ??
                ""
              ).trim();


            const nombrePromotor =
              String(
                promotor.nombre ??
                ""
              ).trim();


            return (
              supervisorPromotor ===
                String(
                  supervisorSeleccionado ??
                  ""
                ).trim() &&

              nombrePromotor !== "" &&

              nombrePromotor !== "0" &&

              !nombrePromotor
                .toUpperCase()
                .includes(
                  "VACANTE"
                )
            );

          }
        );

      },
      [
        registros,
        supervisorSeleccionado,
      ]
    );


  // ==================================================
  // FOCOS ROJOS DEL EQUIPO
  // ==================================================

  const focosRojos =
    useMemo(
      () => {

        const calculados =
          calcularPrioridades(
            equipo
          );


        const filtrados =
          filtrarFocosRojos(
            calculados
          );


        return ordenarPorPrioridad(
          [
            ...filtrados,
          ]
        );

      },
      [
        equipo,
      ]
    );


  // ==================================================
  // CARGAR HISTORIAL DE CADA FOCO ROJO
  // ==================================================

  useEffect(
    () => {

      let componenteActivo =
        true;


      async function cargarSeguimiento() {

        if (
          !supervisorSeleccionado ||
          focosRojos.length === 0
        ) {

          setSeguimiento(
            {}
          );

          setCargando(
            false
          );

          return;

        }


        try {

          setCargando(
            true
          );

          setError(
            ""
          );


          const resultados =
            await Promise.all(

              focosRojos.map(
                async (
                  promotor
                ) => {

                  const nombre =
                    String(
                      promotor.nombre ??
                      ""
                    ).trim();


                  try {

                    const respuesta =
                      await fetchProtegido(
                        `/api/checklists-foco-rojo?supervisor=${encodeURIComponent(
                          supervisorSeleccionado
                        )}&promotor=${encodeURIComponent(
                          nombre
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


                    return {

                      nombre,

                      correcto:
                        true,

                      totalChecklists:
                        Number(
                          datos.totalChecklists ||
                          0
                        ),

                      comparativa:
                        datos.comparativa ||
                        null,

                      historial:
                        datos.historial ||
                        [],

                    };

                  } catch (
                    errorPromotor
                  ) {

                    console.error(
                      `❌ Error al consultar a ${nombre}:`,
                      errorPromotor
                    );


                    return {

                      nombre,

                      correcto:
                        false,

                      totalChecklists:
                        0,

                      comparativa:
                        null,

                      historial:
                        [],

                    };

                  }

                }
              )

            );


          if (
            !componenteActivo
          ) {

            return;

          }


          const seguimientoPorPromotor =
            {};


          resultados.forEach(
            (
              resultado
            ) => {

              seguimientoPorPromotor[
                resultado.nombre
              ] = resultado;

            }
          );


          setSeguimiento(
            seguimientoPorPromotor
          );


          const consultasConError =
            resultados.filter(
              (resultado) =>
                !resultado.correcto
            ).length;


          if (
            consultasConError > 0
          ) {

            setError(
              `No se pudo consultar el historial de ${consultasConError} ${
                consultasConError === 1
                  ? "promotor"
                  : "promotores"
              }.`
            );

          }

        } catch (
          errorCarga
        ) {

          console.error(
            "❌ Error al cargar la tabla de focos rojos:",
            errorCarga
          );


          if (
            componenteActivo
          ) {

            setError(
              "No se pudo cargar el seguimiento de focos rojos."
            );

          }

        } finally {

          if (
            componenteActivo
          ) {

            setCargando(
              false
            );

          }

        }

      }


      cargarSeguimiento();


      return () => {

        componenteActivo =
          false;

      };

    },
    [
      focosRojos,
      supervisorSeleccionado,
    ]
  );


  // ==================================================
  // ABRIR CHECKLIST
  // ==================================================

  function iniciarSeguimiento(
    promotor
  ) {

    if (
      typeof onIniciarSeguimiento ===
      "function"
    ) {

      onIniciarSeguimiento(
        promotor
      );

    }

  }


  // ==================================================
  // OBTENER FECHA DEL ÚLTIMO CHECKLIST
  // ==================================================

  function obtenerUltimaFecha(
    historial = []
  ) {

    if (
      historial.length === 0
    ) {

      return "Sin seguimiento";

    }


    const ultimoRegistro =
      historial[
        historial.length - 1
      ];


    return (
      ultimoRegistro?.fecha ||
      "Fecha no disponible"
    );

  }


  // ==================================================
  // ESTILO DEL RESULTADO
  // ==================================================

  function obtenerEstiloResultado(
    resultado
  ) {

    if (
      resultado === "MEJORÓ"
    ) {

      return {

        background:
          "#dcfce7",

        color:
          "#166534",

        border:
          "1px solid #86efac",

      };

    }


    if (
      resultado === "DISMINUYÓ"
    ) {

      return {

        background:
          "#fee2e2",

        color:
          "#991b1b",

        border:
          "1px solid #fca5a5",

      };

    }


    if (
      resultado === "SIN CAMBIO"
    ) {

      return {

        background:
          "#fef3c7",

        color:
          "#92400e",

        border:
          "1px solid #fcd34d",

      };

    }


    return {

      background:
        "#f1f5f9",

      color:
        "#475569",

      border:
        "1px solid #cbd5e1",

    };

  }


  // ==================================================
  // RENDER
  // ==================================================

  return (

    <section
      style={{
        margin:
          "22px 0",

        padding:
          "22px",

        borderRadius:
          "18px",

        background:
          "#ffffff",

        color:
          "#172033",

        border:
          "1px solid #dbe4ee",

        boxShadow:
          "0 10px 28px rgba(15, 23, 42, 0.08)",

        gridColumn:
          "1 / -1",
      }}
    >

      {/* ============================================
          ENCABEZADO
      ============================================ */}

      <div
        style={{
          display:
            "flex",

          justifyContent:
            "space-between",

          alignItems:
            "center",

          flexWrap:
            "wrap",

          gap:
            "12px",

          marginBottom:
            "18px",
        }}
      >

        <div
          style={{
            display:
              "flex",

            alignItems:
              "center",

            gap:
              "13px",
          }}
        >

          <div
            style={{
              display:
                "grid",

              placeItems:
                "center",

              width:
                "46px",

              height:
                "46px",

              borderRadius:
                "13px",

              background:
                "linear-gradient(135deg, #dc2626, #991b1b)",

              color:
                "#ffffff",

              fontSize:
                "21px",

              boxShadow:
                "0 7px 18px rgba(220, 38, 38, 0.25)",
            }}
          >
            📋
          </div>

          <div>

            <h2
              style={{
                margin:
                  0,

                color:
                  "#172033",

                fontSize:
                  "21px",

                fontWeight:
                  "900",
              }}
            >
              Seguimiento de focos rojos
            </h2>

            <p
              style={{
                margin:
                  "5px 0 0",

                color:
                  "#64748b",

                fontSize:
                  "13px",
              }}
            >
              Control de acompañamientos y evolución de productividad.
            </p>

          </div>

        </div>


        <div
          style={{
            padding:
              "9px 14px",

            borderRadius:
              "999px",

            background:
              "#fff1f2",

            color:
              "#be123c",

            border:
              "1px solid #fecdd3",

            fontSize:
              "13px",

            fontWeight:
              "900",
          }}
        >
          🔴 {focosRojos.length}{" "}

          {focosRojos.length === 1
            ? "foco rojo"
            : "focos rojos"}
        </div>

      </div>


      {/* ============================================
          MENSAJE DE ERROR
      ============================================ */}

      {error && (

        <div
          role="alert"
          style={{
            marginBottom:
              "16px",

            padding:
              "12px 14px",

            borderRadius:
              "10px",

            background:
              "#fff7ed",

            color:
              "#9a3412",

            border:
              "1px solid #fed7aa",

            fontWeight:
              "700",
          }}
        >
          ⚠️ {error}
        </div>

      )}


      {/* ============================================
          CARGANDO
      ============================================ */}

      {cargando ? (

        <div
          style={{
            padding:
              "30px",

            textAlign:
              "center",

            color:
              "#64748b",

            fontWeight:
              "800",
          }}
        >
          Consultando seguimiento de focos rojos...
        </div>

      ) : focosRojos.length === 0 ? (

        <div
          style={{
            padding:
              "28px",

            textAlign:
              "center",

            borderRadius:
              "14px",

            background:
              "#ecfdf5",

            color:
              "#166534",

            border:
              "1px solid #a7f3d0",

            fontWeight:
              "900",
          }}
        >
          🟢 El equipo no tiene focos rojos actualmente.
        </div>

      ) : (

        // ============================================
        // TABLA
        // ============================================

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
                "1050px",

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
                    "linear-gradient(135deg, #172554, #1e3a8a)",

                  color:
                    "#ffffff",
                }}
              >

                {[
                  "#",
                  "Promotor",
                  "Productividad actual",
                  "Checklists",
                  "Primer check",
                  "Último check",
                  "Diferencia",
                  "Resultado",
                  "Último seguimiento",
                  "Acción",
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
                          "13px 12px",

                        textAlign:
                          encabezado ===
                          "Promotor"
                            ? "left"
                            : "center",

                        fontSize:
                          "11px",

                        letterSpacing:
                          "0.4px",

                        textTransform:
                          "uppercase",

                        whiteSpace:
                          "nowrap",
                      }}
                    >
                      {encabezado}
                    </th>

                  )
                )}

              </tr>

            </thead>


            <tbody>

              {focosRojos.map(
                (
                  promotor,
                  index
                ) => {

                  const nombre =
                    String(
                      promotor.nombre ??
                      ""
                    ).trim();


                  const datos =
                    seguimiento[
                      nombre
                    ] || {};


                  const comparativa =
                    datos.comparativa ||
                    {};


                  const resultado =
                    comparativa.resultado ||
                    "SIN HISTORIAL";


                  const diferencia =
                    comparativa.diferencia;


                  const estiloResultado =
                    obtenerEstiloResultado(
                      resultado
                    );


                  return (

                    <tr
                      key={
                        nombre
                      }
                      style={{
                        borderBottom:
                          "1px solid #e2e8f0",

                        background:
                          index % 2 === 0
                            ? "#ffffff"
                            : "#f8fafc",
                      }}
                    >

                      <td
                        style={{
                          padding:
                            "13px 12px",

                          textAlign:
                            "center",

                          color:
                            "#64748b",

                          fontWeight:
                            "900",
                        }}
                      >
                        {index + 1}
                      </td>


                      <td
                        style={{
                          padding:
                            "13px 12px",

                          color:
                            "#172033",

                          fontWeight:
                            "900",
                        }}
                      >
                        {nombre}
                      </td>


                      <td
                        style={{
                          padding:
                            "13px 12px",

                          textAlign:
                            "center",

                          color:
                            "#b91c1c",

                          fontSize:
                            "16px",

                          fontWeight:
                            "900",
                        }}
                      >
                        {Number(
                          promotor.productividad ??
                          0
                        ).toFixed(
                          2
                        )}
                      </td>


                      <td
                        style={{
                          padding:
                            "13px 12px",

                          textAlign:
                            "center",

                          color:
                            "#1d4ed8",

                          fontSize:
                            "17px",

                          fontWeight:
                            "900",
                        }}
                      >
                        {Number(
                          datos.totalChecklists ||
                          0
                        )}
                      </td>


                      <td
                        style={{
                          padding:
                            "13px 12px",

                          textAlign:
                            "center",

                          fontWeight:
                            "800",
                        }}
                      >
                        {comparativa.productividadInicial !==
                          null &&
                        comparativa.productividadInicial !==
                          undefined
                          ? Number(
                              comparativa.productividadInicial
                            ).toFixed(
                              2
                            )
                          : "—"}
                      </td>


                      <td
                        style={{
                          padding:
                            "13px 12px",

                          textAlign:
                            "center",

                          fontWeight:
                            "800",
                        }}
                      >
                        {comparativa.productividadUltima !==
                          null &&
                        comparativa.productividadUltima !==
                          undefined
                          ? Number(
                              comparativa.productividadUltima
                            ).toFixed(
                              2
                            )
                          : "—"}
                      </td>


                      <td
                        style={{
                          padding:
                            "13px 12px",

                          textAlign:
                            "center",

                          color:
                            Number(
                              diferencia
                            ) > 0
                              ? "#166534"
                              : Number(
                                  diferencia
                                ) < 0
                                ? "#991b1b"
                                : "#475569",

                          fontWeight:
                            "900",
                        }}
                      >
                        {diferencia !== null &&
                        diferencia !== undefined
                          ? `${Number(
                              diferencia
                            ) > 0
                              ? "+"
                              : ""}${Number(
                              diferencia
                            ).toFixed(
                              2
                            )}`
                          : "—"}
                      </td>


                      <td
                        style={{
                          padding:
                            "13px 12px",

                          textAlign:
                            "center",
                        }}
                      >

                        <span
                          style={{
                            display:
                              "inline-block",

                            padding:
                              "6px 10px",

                            borderRadius:
                              "999px",

                            fontSize:
                              "11px",

                            fontWeight:
                              "900",

                            whiteSpace:
                              "nowrap",

                            ...estiloResultado,
                          }}
                        >
                          {resultado}
                        </span>

                      </td>


                      <td
                        style={{
                          padding:
                            "13px 12px",

                          textAlign:
                            "center",

                          color:
                            "#475569",

                          fontSize:
                            "12px",

                          fontWeight:
                            "800",

                          whiteSpace:
                            "nowrap",
                        }}
                      >
                        {obtenerUltimaFecha(
                          datos.historial
                        )}
                      </td>


                      <td
                        style={{
                          padding:
                            "13px 12px",

                          textAlign:
                            "center",
                        }}
                      >

                        <button
                          type="button"
                          onClick={() =>
                            iniciarSeguimiento(
                              promotor
                            )
                          }
                          style={{
                            border:
                              "none",

                            borderRadius:
                              "9px",

                            padding:
                              "9px 12px",

                            background:
                              "#0057b8",

                            color:
                              "#ffffff",

                            fontWeight:
                              "900",

                            fontSize:
                              "12px",

                            cursor:
                              "pointer",

                            whiteSpace:
                              "nowrap",
                          }}
                        >
                          📋 Dar seguimiento
                        </button>

                      </td>

                    </tr>

                  );

                }
              )}

            </tbody>

          </table>

        </div>

      )}

    </section>

  );

}

export default TablaSeguimientoFocosRojos;
