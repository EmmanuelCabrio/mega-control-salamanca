import {
  useCallback,
  useEffect,
  useState
} from "react";

import {
  fetchProtegido
} from "../services/authService";


function ComparativaRecuperacionMesAnterior() {

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
              "/api/recuperacion/comparativa-mes-anterior"
            );


          const resultado =
            await respuesta.json();


          if (
            !respuesta.ok ||
            !resultado.correcto
          ) {

            throw new Error(
              resultado.mensaje ||
              "No se pudo cargar la comparativa."
            );

          }


          setDatos(
            resultado
          );

        } catch (errorCarga) {

          console.error(
            "❌ Error al cargar la comparativa de Recuperación:",
            errorCarga
          );

          setError(
            errorCarga.message ||
            "No se pudo cargar la comparativa."
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
      <section className="comparativa-rx-estado">
        Cargando comparativa mensual…
      </section>
    );

  }


  if (error) {

    return (
      <section className="comparativa-rx-estado comparativa-rx-error">

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


  if (!datos) {

    return null;

  }


  const diferencia =
    Number(
      datos.diferencia || 0
    );


  const variacion =
    datos.variacionPorcentaje == null
      ? null
      : Number(
          datos.variacionPorcentaje
        );


  const claseResultado =
    diferencia > 0
      ? "comparativa-rx-positivo"
      : diferencia < 0
        ? "comparativa-rx-negativo"
        : "comparativa-rx-neutral";


  const formatearDiferencia =
    (valor) => {

      const numero =
        Number(
          valor || 0
        );


      return numero > 0
        ? `+${numero}`
        : `${numero}`;

    };


  const etiquetaCorte =
    datos.fechaCorte
      ? `${datos.fechaCorte.dia} de ${datos.mesActual.nombre} de ${datos.fechaCorte.anio}`
      : "Sin fecha de corte";


  return (
    <section className="comparativa-rx">

      <div className="comparativa-rx-header">

        <div>

          <span>
            CORTE AL {etiquetaCorte.toUpperCase()}
          </span>

          <h2>
            RX vs mismo día del mes anterior
          </h2>

          <p>
            {datos.mesActual.nombre} contra {datos.mesAnterior.nombre},
            considerando únicamente el avance hasta el día {datos.fechaCorte?.dia}.
          </p>

        </div>


        <div className={`comparativa-rx-balance ${claseResultado}`}>

          <strong>
            {formatearDiferencia(
              diferencia
            )}
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


      <div className="comparativa-rx-kpis">

        <article>
          <span>
            {datos.mesActual.nombre}
          </span>
          <strong>
            {Number(
              datos.totalActual || 0
            ).toLocaleString("es-MX")}
          </strong>
          <small>
            RX actuales
          </small>
        </article>


        <article>
          <span>
            {datos.mesAnterior.nombre}
          </span>
          <strong>
            {Number(
              datos.totalAnteriorMismoDia || 0
            ).toLocaleString("es-MX")}
          </strong>
          <small>
            RX al mismo día
          </small>
        </article>


        <article className={claseResultado}>
          <span>
            Diferencia
          </span>
          <strong>
            {formatearDiferencia(
              diferencia
            )}
          </strong>
          <small>
            RX acumuladas
          </small>
        </article>


        <article className={claseResultado}>
          <span>
            Variación
          </span>
          <strong>
            {variacion == null
              ? "—"
              : `${
                  variacion > 0
                    ? "+"
                    : ""
                }${variacion.toFixed(1)}%`}
          </strong>
          <small>
            Contra el mes anterior
          </small>
        </article>

      </div>


      <div className="comparativa-rx-tabla-contenedor">

        <table className="comparativa-rx-tabla">

          <thead>

            <tr>
              <th>
                Día
              </th>
              <th>
                {datos.mesActual.nombre}
              </th>
              <th>
                {datos.mesAnterior.nombre}
              </th>
              <th>
                Dif. día
              </th>
              <th>
                Acum. {datos.mesActual.nombre}
              </th>
              <th>
                Acum. {datos.mesAnterior.nombre}
              </th>
              <th>
                Dif. acumulada
              </th>
            </tr>

          </thead>


          <tbody>

            {(datos.detalle || []).map(
              (fila) => {

                const claseDia =
                  fila.diferenciaDia > 0
                    ? "comparativa-rx-positivo"
                    : fila.diferenciaDia < 0
                      ? "comparativa-rx-negativo"
                      : "comparativa-rx-neutral";


                const claseAcumulada =
                  fila.diferenciaAcumulada > 0
                    ? "comparativa-rx-positivo"
                    : fila.diferenciaAcumulada < 0
                      ? "comparativa-rx-negativo"
                      : "comparativa-rx-neutral";


                return (
                  <tr
                    key={fila.dia}
                    className={
                      fila.dia === datos.fechaCorte?.dia
                        ? "comparativa-rx-fila-corte"
                        : ""
                    }
                  >

                    <td>
                      {fila.dia}
                    </td>

                    <td>
                      {fila.actual}
                    </td>

                    <td>
                      {fila.anterior}
                    </td>

                    <td className={claseDia}>
                      {formatearDiferencia(
                        fila.diferenciaDia
                      )}
                    </td>

                    <td>
                      {fila.acumuladoActual}
                    </td>

                    <td>
                      {fila.acumuladoAnterior}
                    </td>

                    <td className={claseAcumulada}>
                      {formatearDiferencia(
                        fila.diferenciaAcumulada
                      )}
                    </td>

                  </tr>
                );

              }
            )}

          </tbody>

        </table>

      </div>

    </section>
  );

}


export default ComparativaRecuperacionMesAnterior;
