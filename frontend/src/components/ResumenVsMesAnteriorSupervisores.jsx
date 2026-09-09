import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  fetchProtegido,
} from "../services/authService";


// ==================================================
// 📊 VS MISMO DÍA MES ANTERIOR — SUPERVISORES
// ==================================================

function ResumenVsMesAnteriorSupervisores() {

  // ==================================================
  // ESTADOS
  // ==================================================

  const [
    registros,
    setRegistros,
  ] = useState([]);


  const [
    cargando,
    setCargando,
  ] = useState(true);


  const [
    error,
    setError,
  ] = useState("");


  // ==================================================
  // CARGAR REGISTROS
  // ==================================================

  useEffect(() => {

    async function cargarDatos() {

      try {

        setCargando(true);

        setError("");


        const respuesta =
          await fetchProtegido(
            "/api/registros"
          );


        // ============================================
        // VALIDAR HTTP
        // ============================================

        if (!respuesta.ok) {

          throw new Error(
            `Error HTTP ${respuesta.status}`
          );

        }


        // ============================================
        // LEER RESPUESTA
        // ============================================

        const datos =
          await respuesta.json();


        if (!datos.correcto) {

          throw new Error(
            datos.mensaje ||
            "No se pudo cargar la comparativa"
          );

        }


        setRegistros(
          datos.registros || []
        );


      } catch (error) {

        console.error(
          "❌ Error comparativa supervisores:",
          error
        );


        setError(
          "No se pudo cargar la comparativa vs mes anterior"
        );


      } finally {

        setCargando(false);

      }

    }


    cargarDatos();

  }, []);


  // ==================================================
  // NORMALIZAR TEXTO
  // ==================================================

  function normalizarTexto(
    valor
  ) {

    return String(
      valor ?? ""
    )
      .trim()
      .toUpperCase()
      .normalize("NFD")
      .replace(
        /[\u0300-\u036f]/g,
        ""
      );

  }


  // ==================================================
  // AGRUPAR POR SUPERVISOR
  // ==================================================

  const supervisores =
    useMemo(
      () => {

        const mapa =
          new Map();


        for (
          const registro
          of registros
        ) {

          const supervisor =
            String(
              registro.supervisor ?? ""
            ).trim();


          const supervisorNormalizado =
            normalizarTexto(
              supervisor
            );


          const nombrePromotor =
            String(
              registro.nombre ?? ""
            ).trim();


          // ==========================================
          // FILTROS
          // ==========================================

          if (
            !supervisor ||
            !nombrePromotor ||
            nombrePromotor === "0"
          ) {

            continue;

          }


          if (
            supervisorNormalizado ===
            "MORALES PEREZ BENJAMIN"
          ) {

            continue;

          }


          // ==========================================
          // VALORES
          // ==========================================

          const actual =
            Number(
              registro
                .ventasMesPromotor ??
              0
            );


          const anterior =
            Number(
              registro
                .ventasMesAnteriorMismoDia ??
              0
            );


          // ==========================================
          // CREAR SUPERVISOR
          // ==========================================

          if (
            !mapa.has(
              supervisorNormalizado
            )
          ) {

            mapa.set(
              supervisorNormalizado,
              {

                supervisor,

                actual: 0,

                anterior: 0,

                promotores: 0,

              }
            );

          }


          const acumulado =
            mapa.get(
              supervisorNormalizado
            );


          acumulado.actual +=
            Number.isFinite(
              actual
            )
              ? actual
              : 0;


          acumulado.anterior +=
            Number.isFinite(
              anterior
            )
              ? anterior
              : 0;


          acumulado.promotores +=
            1;

        }


        // ============================================
        // CALCULAR DIFERENCIAS
        // ============================================

        const resultado =
          Array.from(
            mapa.values()
          )
            .map(
              (registro) => {

                const diferencia =
                  registro.actual -
                  registro.anterior;


                const variacion =
                  registro.anterior > 0

                    ? (
                        diferencia /
                        registro.anterior
                      ) * 100

                    : null;


                return {

                  ...registro,

                  diferencia,

                  variacion,

                };

              }
            );


        // ============================================
        // PEOR RESULTADO PRIMERO
        // ============================================

        resultado.sort(
          (a, b) => {

            if (
              a.diferencia !==
              b.diferencia
            ) {

              return (
                a.diferencia -
                b.diferencia
              );

            }


            return (
              b.actual -
              a.actual
            );

          }
        );


        return resultado;

      },
      [registros]
    );


  // ==================================================
  // RESULTADO TOTAL CL
  // ==================================================

  const totalCL =
    useMemo(
      () => {

        const resultado =
          supervisores.reduce(
            (
              acumulado,
              supervisor
            ) => {

              acumulado.actual +=
                supervisor.actual;


              acumulado.anterior +=
                supervisor.anterior;


              return acumulado;

            },
            {
              actual: 0,
              anterior: 0,
            }
          );


        resultado.diferencia =
          resultado.actual -
          resultado.anterior;


        resultado.variacion =
          resultado.anterior > 0

            ? (
                resultado.diferencia /
                resultado.anterior
              ) * 100

            : null;


        return resultado;

      },
      [supervisores]
    );


  // ==================================================
  // FUNCIONES VISUALES
  // ==================================================

  function obtenerClase(
    diferencia
  ) {

    if (
      diferencia > 0
    ) {

      return "resumen-vs-positivo";

    }


    if (
      diferencia < 0
    ) {

      return "resumen-vs-negativo";

    }


    return "resumen-vs-neutral";

  }


  function obtenerIcono(
    diferencia
  ) {

    if (
      diferencia > 0
    ) {

      return "▲";

    }


    if (
      diferencia < 0
    ) {

      return "▼";

    }


    return "=";

  }


  function formatearDiferencia(
    diferencia
  ) {

    if (
      diferencia > 0
    ) {

      return `+${diferencia}`;

    }


    return String(
      diferencia
    );

  }


  function formatearVariacion(
    variacion
  ) {

    if (
      variacion === null ||
      !Number.isFinite(
        variacion
      )
    ) {

      return "—";

    }


    return (
      `${variacion > 0 ? "+" : ""}` +
      `${variacion.toFixed(1)}%`
    );

  }


  // ==================================================
  // CARGANDO
  // ==================================================

  if (
    cargando
  ) {

    return (

      <section
        className="resumen-vs-supervisores"
      >

        <div
          className="resumen-vs-header"
        >

          <div>

            <div
              className="resumen-vs-etiqueta"
            >
              VS MISMO DÍA MES ANTERIOR
            </div>

            <h2>
              📊 Supervisores
            </h2>

            <p>
              Cargando comparativa...
            </p>

          </div>

        </div>

      </section>

    );

  }


  // ==================================================
  // ERROR
  // ==================================================

  if (
    error
  ) {

    return (

      <section
        className="resumen-vs-supervisores"
      >

        <div
          className="resumen-vs-header"
        >

          <div>

            <div
              className="resumen-vs-etiqueta"
            >
              VS MISMO DÍA MES ANTERIOR
            </div>

            <h2>
              📊 Supervisores
            </h2>

            <p
              className="resumen-vs-error"
            >
              🔴 {error}
            </p>

          </div>

        </div>

      </section>

    );

  }


  // ==================================================
  // CLASE TOTAL CL
  // ==================================================

  const claseTotal =
    obtenerClase(
      totalCL.diferencia
    );


  // ==================================================
  // RENDER
  // ==================================================

  return (

    <section
      className="resumen-vs-supervisores"
    >

      {/* ==========================================
          ENCABEZADO
      ========================================== */}

      <div
        className="resumen-vs-header"
      >

        <div>

          <div
            className="resumen-vs-etiqueta"
          >
            VS MISMO DÍA MES ANTERIOR
          </div>


          <h2>
            📊 Comparativa de Supervisores
          </h2>


          <p>
            Resultado del equipo actual de cada supervisor
          </p>

        </div>


        <div
          className={`
            resumen-vs-total-destacado
            ${claseTotal}
          `}
        >

          <strong>

            {formatearDiferencia(
              totalCL.diferencia
            )}{" "}

            {obtenerIcono(
              totalCL.diferencia
            )}

          </strong>


          <span>
            CL SALAMANCA
          </span>

        </div>

      </div>


      {/* ==========================================
          RESUMEN CL
      ========================================== */}

      <div
        className="resumen-vs-kpis"
      >

        <div>

          <span>
            ACTUAL
          </span>

          <strong>
            {totalCL.actual}
          </strong>

        </div>


        <div>

          <span>
            ANT. MISMO DÍA
          </span>

          <strong>
            {totalCL.anterior}
          </strong>

        </div>


        <div>

          <span>
            DIFERENCIA
          </span>

          <strong
            className={
              claseTotal
            }
          >

            {formatearDiferencia(
              totalCL.diferencia
            )}{" "}

            {obtenerIcono(
              totalCL.diferencia
            )}

          </strong>

        </div>


        <div>

          <span>
            VARIACIÓN
          </span>

          <strong
            className={
              claseTotal
            }
          >

            {formatearVariacion(
              totalCL.variacion
            )}

          </strong>

        </div>

      </div>


      {/* ==========================================
          TABLA
      ========================================== */}

      <div
        className="resumen-vs-tabla-contenedor"
      >

        <table
          className="resumen-vs-tabla"
        >

          <thead>

            <tr>

              <th>
                SUPERVISOR
              </th>

              <th>
                ACTUAL
              </th>

              <th>
                ANT. MISMO DÍA
              </th>

              <th>
                DIF
              </th>

              <th>
                VAR.
              </th>

            </tr>

          </thead>


          <tbody>

            {supervisores.map(
              (
                supervisor,
                index
              ) => {

                const clase =
                  obtenerClase(
                    supervisor.diferencia
                  );


                return (

                  <tr
                    key={
                      `${supervisor.supervisor}-${index}`
                    }
                  >

                    <td>

                      <strong>
                        {
                          supervisor.supervisor
                        }
                      </strong>

                    </td>


                    <td>
                      {supervisor.actual}
                    </td>


                    <td>
                      {supervisor.anterior}
                    </td>


                    <td
                      className={
                        clase
                      }
                    >

                      {formatearDiferencia(
                        supervisor.diferencia
                      )}{" "}

                      {obtenerIcono(
                        supervisor.diferencia
                      )}

                    </td>


                    <td
                      className={
                        clase
                      }
                    >

                      {formatearVariacion(
                        supervisor.variacion
                      )}

                    </td>

                  </tr>

                );

              }
            )}


            {/* ======================================
                TOTAL CL
            ====================================== */}

            {supervisores.length > 0 && (

              <tr
                className="resumen-vs-fila-total"
              >

                <td>
                  TOTAL CL
                </td>


                <td>
                  {totalCL.actual}
                </td>


                <td>
                  {totalCL.anterior}
                </td>


                <td
                  className={
                    claseTotal
                  }
                >

                  {formatearDiferencia(
                    totalCL.diferencia
                  )}{" "}

                  {obtenerIcono(
                    totalCL.diferencia
                  )}

                </td>


                <td
                  className={
                    claseTotal
                  }
                >

                  {formatearVariacion(
                    totalCL.variacion
                  )}

                </td>

              </tr>

            )}


            {/* ======================================
                SIN INFORMACIÓN
            ====================================== */}

            {supervisores.length === 0 && (

              <tr>

                <td
                  colSpan="5"
                  className="resumen-vs-sin-datos"
                >

                  No hay información disponible.

                </td>

              </tr>

            )}

          </tbody>

        </table>

      </div>

    </section>

  );

}


export default ResumenVsMesAnteriorSupervisores;
