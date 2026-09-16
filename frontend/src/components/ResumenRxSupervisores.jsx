import {
  useCallback,
  useEffect,
  useMemo,
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
      ? "resumen-rx-positivo"
      : Number(
          diferencia || 0
        ) < 0
        ? "resumen-rx-negativo"
        : "resumen-rx-neutral";


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


function ResumenRxSupervisores() {

  const [datos, setDatos] =
    useState(null);

  const [cargando, setCargando] =
    useState(true);

  const [error, setError] =
    useState("");


  const cargarResumen =
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
              "No se pudo cargar el resumen de RX."
            );

          }


          setDatos(
            resultado
          );

        } catch (errorCarga) {

          console.error(
            "❌ Error al cargar resumen de RX por supervisor:",
            errorCarga
          );

          setError(
            errorCarga.message ||
            "No se pudo cargar el resumen de RX."
          );

        } finally {

          setCargando(false);

        }

      },
      []
    );


  useEffect(
    () => {

      cargarResumen();

    },
    [cargarResumen]
  );


  const total =
    useMemo(
      () =>
        (
          datos?.supervisores ||
          []
        ).reduce(
          (
            acumulado,
            registro
          ) => ({

            actual:
              acumulado.actual +
              Number(
                registro.actual || 0
              ),

            anterior:
              acumulado.anterior +
              Number(
                registro.anterior || 0
              ),

          }),
          {
            actual: 0,
            anterior: 0,
          }
        ),
      [datos]
    );


  const diferenciaTotal =
    total.actual -
    total.anterior;

  const variacionTotal =
    total.anterior > 0
      ? (
          diferenciaTotal /
          total.anterior
        ) * 100
      : null;


  if (cargando) {

    return (
      <section className="resumen-rx-direccion-estado">
        Cargando recuperaciones por supervisor…
      </section>
    );

  }


  if (error) {

    return (
      <section
        className="
          resumen-rx-direccion-estado
          resumen-rx-direccion-error
        "
      >

        <p>
          {error}
        </p>

        <button
          type="button"
          onClick={cargarResumen}
        >
          Reintentar
        </button>

      </section>
    );

  }


  return (
    <section className="resumen-rx-direccion">

      <div className="resumen-rx-direccion-header">

        <div>

          <span>
            RECUPERACIONES VS MES ANTERIOR
          </span>

          <h2>
            Resumen por supervisor
          </h2>

          <p>
            Acumulado al día{" "}
            {datos?.fechaCorte?.dia || "—"}
            {" · "}
            {datos?.mesActual?.nombre}
            {" vs "}
            {datos?.mesAnterior?.nombre}
          </p>

        </div>


        <div
          className={`
            resumen-rx-direccion-balance
            ${obtenerClase(
              diferenciaTotal
            )}
          `}
        >

          <strong>
            {formatearDiferencia(
              diferenciaTotal
            )}
          </strong>

          <span>
            RX CL vs mes anterior
          </span>

        </div>

      </div>


      <div className="resumen-rx-direccion-tabla-contenedor">

        <table className="resumen-rx-direccion-tabla">

          <thead>

            <tr>
              <th>Supervisor</th>
              <th>Actual</th>
              <th>Mes anterior</th>
              <th>Diferencia</th>
              <th>Variación</th>
            </tr>

          </thead>


          <tbody>

            {(
              datos?.supervisores ||
              []
            ).map(
              (registro) => {

                const clase =
                  obtenerClase(
                    registro.diferencia
                  );


                return (
                  <tr
                    key={
                      registro.clave ||
                      registro.supervisor
                    }
                  >

                    <td>
                      {registro.supervisor}
                    </td>

                    <td>
                      {formatearNumero(
                        registro.actual
                      )}
                    </td>

                    <td>
                      {formatearNumero(
                        registro.anterior
                      )}
                    </td>

                    <td className={clase}>
                      {formatearDiferencia(
                        registro.diferencia
                      )}
                    </td>

                    <td className={clase}>

                      {registro
                        .variacionPorcentaje ==
                      null
                        ? "Sin base"
                        : `${
                            registro
                              .variacionPorcentaje >
                            0
                              ? "+"
                              : ""
                          }${Number(
                            registro
                              .variacionPorcentaje
                          ).toFixed(1)}%`}

                    </td>

                  </tr>
                );

              }
            )}

          </tbody>


          <tfoot>

            <tr>

              <td>
                TOTAL SUPERVISORES
              </td>

              <td>
                {formatearNumero(
                  total.actual
                )}
              </td>

              <td>
                {formatearNumero(
                  total.anterior
                )}
              </td>

              <td
                className={obtenerClase(
                  diferenciaTotal
                )}
              >
                {formatearDiferencia(
                  diferenciaTotal
                )}
              </td>

              <td
                className={obtenerClase(
                  diferenciaTotal
                )}
              >

                {variacionTotal == null
                  ? "Sin base"
                  : `${
                      variacionTotal > 0
                        ? "+"
                        : ""
                    }${variacionTotal.toFixed(
                      1
                    )}%`}

              </td>

            </tr>

          </tfoot>

        </table>

      </div>

    </section>
  );

}


export default ResumenRxSupervisores;
