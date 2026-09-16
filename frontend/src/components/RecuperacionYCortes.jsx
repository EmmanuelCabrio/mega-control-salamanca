import {
  useCallback,
  useEffect,
  useState
} from "react";

import {
  fetchProtegido
} from "../services/authService";


const formatearNumero = (valor) =>
  Number(valor || 0).toLocaleString("es-MX");


const formatearPorcentaje = (valor) =>
  `${Number(valor || 0).toFixed(2)}%`;


const formatearDiferencia = (
  valor,
  sufijo = ""
) => {

  const numero = Number(valor || 0);

  return `${
    numero > 0
      ? "+"
      : ""
  }${numero.toLocaleString(
    "es-MX",
    {
      minimumFractionDigits:
        sufijo ? 2 : 0,
      maximumFractionDigits:
        sufijo ? 2 : 0,
    }
  )}${sufijo}`;

};


const obtenerClaseDiferencia = (valor) => {

  const numero = Number(valor || 0);

  if (numero > 0) {
    return "recuperacion-cortes-positivo";
  }

  if (numero < 0) {
    return "recuperacion-cortes-negativo";
  }

  return "recuperacion-cortes-neutral";

};


function TarjetaRecuperacion({
  titulo,
  metrica,
  clase,
  mostrarPorcentaje = true,
}) {

  return (
    <article
      className={`recuperacion-cortes-card ${clase}`}
    >

      <span className="recuperacion-cortes-card-titulo">
        {titulo}
      </span>

      <strong className="recuperacion-cortes-card-valor">
        {formatearNumero(metrica.actual)}
      </strong>

      <div className="recuperacion-cortes-card-comparacion">

        <span>
          Mes anterior:{" "}
          {formatearNumero(metrica.anterior)}
        </span>

        <strong
          className={obtenerClaseDiferencia(
            metrica.diferencia
          )}
        >
          {formatearDiferencia(
            metrica.diferencia
          )}
        </strong>

      </div>

      {mostrarPorcentaje && (

        <div className="recuperacion-cortes-card-porcentaje">

          <span>
            Actual:{" "}
            {formatearPorcentaje(
              metrica.porcentajeActual
            )}
          </span>

          <span>
            MA:{" "}
            {formatearPorcentaje(
              metrica.porcentajeAnterior
            )}
          </span>

          <strong
            className={obtenerClaseDiferencia(
              metrica.diferenciaPorcentaje
            )}
          >
            {formatearDiferencia(
              metrica.diferenciaPorcentaje,
              " pp"
            )}
          </strong>

        </div>

      )}

    </article>
  );

}


function CeldaComparativa({
  metrica,
  esPorcentaje = false,
}) {

  const actual =
    esPorcentaje
      ? metrica.porcentajeActual
      : metrica.actual;

  const anterior =
    esPorcentaje
      ? metrica.porcentajeAnterior
      : metrica.anterior;

  const diferencia =
    esPorcentaje
      ? metrica.diferenciaPorcentaje
      : metrica.diferencia;

  return (
    <td className="recuperacion-cortes-celda">

      <strong>
        {esPorcentaje
          ? formatearPorcentaje(actual)
          : formatearNumero(actual)}
      </strong>

      <small>
        MA:{" "}
        {esPorcentaje
          ? formatearPorcentaje(anterior)
          : formatearNumero(anterior)}
      </small>

      <span
        className={obtenerClaseDiferencia(
          diferencia
        )}
      >
        {formatearDiferencia(
          diferencia,
          esPorcentaje
            ? " pp"
            : ""
        )}
      </span>

    </td>
  );

}


function FilaSucursal({
  registro,
  total = false,
}) {

  return (
    <tr
      className={
        total
          ? "recuperacion-cortes-fila-total"
          : ""
      }
    >

      <td>
        {total
          ? "TOTAL"
          : registro.sucursal}
      </td>

      <CeldaComparativa
        metrica={registro.conEsfuerzo}
      />

      <CeldaComparativa
        metrica={registro.conEsfuerzo}
        esPorcentaje
      />

      <CeldaComparativa
        metrica={registro.sinEsfuerzo}
      />

      <CeldaComparativa
        metrica={registro.sinEsfuerzo}
        esPorcentaje
      />

      <CeldaComparativa
        metrica={registro.total}
      />

      <CeldaComparativa
        metrica={registro.total}
        esPorcentaje
      />

      <CeldaComparativa
        metrica={registro.cortes}
      />

    </tr>
  );

}


function RecuperacionYCortes() {

  const [datos, setDatos] =
    useState(null);

  const [cargando, setCargando] =
    useState(true);

  const [error, setError] =
    useState("");


  const cargarPanorama =
    useCallback(
      async () => {

        setCargando(true);
        setError("");

        try {

          const respuesta =
            await fetchProtegido(
              "/api/recuperacion/recuperacion-cortes"
            );

          const resultado =
            await respuesta.json();

          if (
            !respuesta.ok ||
            !resultado.correcto
          ) {

            throw new Error(
              resultado.mensaje ||
              "No se pudo cargar Recuperación y Cortes."
            );

          }

          setDatos(resultado);

        } catch (errorCarga) {

          console.error(
            "❌ Error al cargar Recuperación y Cortes:",
            errorCarga
          );

          setError(
            errorCarga.message ||
            "No se pudo cargar Recuperación y Cortes."
          );

        } finally {

          setCargando(false);

        }

      },
      []
    );


  useEffect(
    () => {

      cargarPanorama();

    },
    [cargarPanorama]
  );


  if (cargando) {

    return (
      <section className="recuperacion-cortes-estado">
        Cargando panorama de recuperación…
      </section>
    );

  }


  if (error) {

    return (
      <section
        className="
          recuperacion-cortes-estado
          recuperacion-cortes-error
        "
      >

        <p>
          {error}
        </p>

        <button
          type="button"
          onClick={cargarPanorama}
        >
          Reintentar
        </button>

      </section>
    );

  }


  if (!datos?.resumen) {
    return null;
  }


  const resumen = datos.resumen;


  return (
    <section className="recuperacion-cortes">

      <div className="recuperacion-cortes-header">

        <div>

          <span>
            RESULTADO VS MES ANTERIOR
          </span>

          <h2>
            Recuperación y cortes
          </h2>

          <p>
            Resultado con esfuerzo, sin esfuerzo y
            recuperación total por sucursal.
          </p>

        </div>

        <div
          className={`
            recuperacion-cortes-balance
            ${obtenerClaseDiferencia(
              resumen.total.diferencia
            )}
          `}
        >

          <strong>
            {formatearDiferencia(
              resumen.total.diferencia
            )}
          </strong>

          <span>
            RX vs mes anterior
          </span>

        </div>

      </div>


      <div className="recuperacion-cortes-cards">

        <TarjetaRecuperacion
          titulo="Con esfuerzo"
          metrica={resumen.conEsfuerzo}
          clase="recuperacion-cortes-card-esfuerzo"
        />

        <TarjetaRecuperacion
          titulo="Sin esfuerzo"
          metrica={resumen.sinEsfuerzo}
          clase="recuperacion-cortes-card-sin-esfuerzo"
        />

        <TarjetaRecuperacion
          titulo="Recuperación total"
          metrica={resumen.total}
          clase="recuperacion-cortes-card-total"
        />

        <TarjetaRecuperacion
          titulo="Cortes"
          metrica={resumen.cortes}
          clase="recuperacion-cortes-card-cortes"
          mostrarPorcentaje={false}
        />

      </div>


      <div className="recuperacion-cortes-tabla-titulo">

        <span>
          DETALLE POR SUCURSAL
        </span>

        <h3>
          Actual, mes anterior y diferencia
        </h3>

      </div>


      <div className="recuperacion-cortes-tabla-contenedor">

        <table className="recuperacion-cortes-tabla">

          <thead>

            <tr>
              <th>Sucursal</th>
              <th>Con esfuerzo</th>
              <th>% con esfuerzo</th>
              <th>Sin esfuerzo</th>
              <th>% sin esfuerzo</th>
              <th>Total RX</th>
              <th>% total</th>
              <th>Cortes</th>
            </tr>

          </thead>

          <tbody>

            {(datos.sucursales || []).map(
              (sucursal) => (

                <FilaSucursal
                  key={sucursal.sucursal}
                  registro={sucursal}
                />

              )
            )}

          </tbody>

          <tfoot>

            <FilaSucursal
              registro={resumen}
              total
            />

          </tfoot>

        </table>

      </div>

    </section>
  );

}


export default RecuperacionYCortes;
