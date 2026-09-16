import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  fetchProtegido,
} from "../services/authService";


const formatearNumero =
  (valor) =>
    Number(
      valor || 0
    ).toLocaleString(
      "es-MX"
    );


const obtenerClase =
  (diferencia) =>
    Number(
      diferencia || 0
    ) > 0
      ? "rx-supervisor-positivo"
      : Number(
          diferencia || 0
        ) < 0
        ? "rx-supervisor-negativo"
        : "rx-supervisor-neutral";


const formatearDiferencia =
  (valor) => {

    const numero =
      Number(
        valor || 0
      );


    return numero > 0
      ? `+${formatearNumero(
          numero
        )}`
      : formatearNumero(
          numero
        );

  };


function RecuperacionesVsMesAnterior() {

  const [datos, setDatos] =
    useState(null);

  const [cargando, setCargando] =
    useState(true);

  const [error, setError] =
    useState("");


  const cargarComparativa =
    useCallback(
      async () => {

        setCargando(true);
        setError("");

        try {

          const respuesta =
            await fetchProtegido(
              "/api/recuperaciones-vs-mes-anterior"
            );

          const resultado =
            await respuesta.json();


          if (
            !respuesta.ok ||
            !resultado.correcto
          ) {

            throw new Error(
              resultado.mensaje ||
              "No se pudo cargar la comparativa de RX."
            );

          }


          setDatos(
            resultado
          );

        } catch (errorCarga) {

          console.error(
            "❌ Error al cargar RX vs mes anterior:",
            errorCarga
          );

          setError(
            errorCarga.message ||
            "No se pudo cargar la comparativa de RX."
          );

        } finally {

          setCargando(false);

        }

      },
      []
    );


  useEffect(
    () => {

      cargarComparativa();

    },
    [cargarComparativa]
  );


  if (cargando) {

    return (
      <section className="rx-supervisor-estado">
        Cargando recuperaciones vs mes anterior…
      </section>
    );

  }


  if (error) {

    return (
      <section
        className="
          rx-supervisor-estado
          rx-supervisor-error
        "
      >

        <p>
          {error}
        </p>

        <button
          type="button"
          onClick={cargarComparativa}
        >
          Reintentar
        </button>

      </section>
    );

  }


  if (!datos?.resumen) {

    return null;

  }


  const resumen =
    datos.resumen;

  const diferencia =
    Number(
      resumen.diferencia || 0
    );

  const clase =
    obtenerClase(
      diferencia
    );

  const icono =
    diferencia > 0
      ? "▲"
      : diferencia < 0
        ? "▼"
        : "=";

  const diferenciaTexto =
    formatearDiferencia(
      diferencia
    );

  const variacion =
    resumen.variacionPorcentaje;


  return (
    <section className="rx-supervisor-card">

      <div className="rx-supervisor-header">

        <div>

          <span>
            RECUPERACIONES
          </span>

          <h2>
            RX vs mismo día del mes anterior
          </h2>

          <p>
            Corte al día{" "}
            {datos.fechaCorte?.dia || "—"}
            {" · "}
            {datos.mesActual?.nombre}
            {" vs "}
            {datos.mesAnterior?.nombre}
          </p>

        </div>


        <div
          className={`
            rx-supervisor-balance
            ${clase}
          `}
        >

          <strong>
            {diferenciaTexto} {icono}
          </strong>

          <span>
            {diferencia > 0
              ? "RX arriba"
              : diferencia < 0
                ? "RX abajo"
                : "Mismo resultado"}
          </span>

        </div>

      </div>


      <div className="rx-supervisor-resumen">

        <article>

          <span>
            Actual
          </span>

          <strong>
            {formatearNumero(
              resumen.actual
            )}
          </strong>

        </article>


        <article>

          <span>
            Mes anterior
          </span>

          <strong>
            {formatearNumero(
              resumen.anterior
            )}
          </strong>

        </article>


        <article>

          <span>
            Diferencia
          </span>

          <strong className={clase}>
            {diferenciaTexto} {icono}
          </strong>

        </article>


        <article>

          <span>
            Variación
          </span>

          <strong className={clase}>

            {variacion == null
              ? "Sin base"
              : `${
                  variacion > 0
                    ? "+"
                    : ""
                }${Number(
                  variacion
                ).toFixed(1)}%`}

          </strong>

        </article>

      </div>


      <div className="rx-supervisor-equipo">

        <div className="rx-supervisor-equipo-titulo">

          <span>
            DETALLE DEL EQUIPO
          </span>

          <h3>
            Recuperaciones por promotor
          </h3>

          <p>
            Comparativo acumulado al mismo día del mes anterior.
          </p>

        </div>


        <div className="rx-supervisor-tabla-contenedor">

          <table className="rx-supervisor-tabla">

            <thead>

              <tr>
                <th>Promotor</th>
                <th>Actual</th>
                <th>Mes anterior</th>
                <th>Diferencia</th>
                <th>Variación</th>
              </tr>

            </thead>


            <tbody>

              {(
                datos.integrantes ||
                []
              ).map(
                (integrante) => {

                  const claseIntegrante =
                    obtenerClase(
                      integrante.diferencia
                    );


                  return (
                    <tr
                      key={
                        integrante.nombre
                      }
                    >

                      <td>
                        {integrante.nombre}
                      </td>

                      <td>
                        {formatearNumero(
                          integrante.actual
                        )}
                      </td>

                      <td>
                        {formatearNumero(
                          integrante.anterior
                        )}
                      </td>

                      <td
                        className={
                          claseIntegrante
                        }
                      >
                        {formatearDiferencia(
                          integrante.diferencia
                        )}
                      </td>

                      <td
                        className={
                          claseIntegrante
                        }
                      >

                        {integrante
                          .variacionPorcentaje ==
                        null
                          ? "Sin base"
                          : `${
                              integrante
                                .variacionPorcentaje >
                              0
                                ? "+"
                                : ""
                            }${Number(
                              integrante
                                .variacionPorcentaje
                            ).toFixed(1)}%`}

                      </td>

                    </tr>
                  );

                }
              )}


              {!datos.integrantes?.length && (

                <tr>

                  <td
                    className="rx-supervisor-sin-integrantes"
                    colSpan="5"
                  >
                    No se encontraron promotores en la plantilla actual.
                  </td>

                </tr>

              )}

            </tbody>

          </table>

        </div>

      </div>

    </section>
  );

}


export default RecuperacionesVsMesAnterior;
