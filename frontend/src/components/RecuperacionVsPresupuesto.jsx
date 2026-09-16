import {
  useCallback,
  useEffect,
  useState
} from "react";

import {
  fetchProtegido
} from "../services/authService";


const formatearNumero = (valor) =>
  Math.round(
    Number(valor || 0)
  ).toLocaleString(
    "es-MX"
  );


const obtenerClaseAvance = (avance) => {

  const valor =
    Number(avance || 0);

  if (valor >= 100) {
    return "presupuesto-rx-cumplido";
  }

  if (valor >= 75) {
    return "presupuesto-rx-cerca";
  }

  if (valor >= 50) {
    return "presupuesto-rx-medio";
  }

  return "presupuesto-rx-rezagado";

};


function BarraAvance({
  avance,
}) {

  const porcentaje =
    Number(avance || 0);

  return (
    <div className="presupuesto-rx-barra">

      <span>

        <i
          style={{
            width:
              `${Math.min(
                Math.max(
                  porcentaje,
                  0
                ),
                100
              )}%`,
          }}
        />

      </span>

      <strong>
        {porcentaje.toFixed(2)}%
      </strong>

    </div>
  );

}


function TarjetaPresupuesto({
  titulo,
  metrica,
  clase,
}) {

  return (
    <article
      className={`presupuesto-rx-card ${clase}`}
    >

      <span>
        {titulo}
      </span>

      <strong>
        {formatearNumero(
          metrica.actual
        )}
      </strong>

      <small>
        Presupuesto:{" "}
        {formatearNumero(
          metrica.presupuesto
        )}
      </small>

      <BarraAvance
        avance={metrica.avance}
      />

      <div>

        <span>
          Faltan
        </span>

        <b>
          {formatearNumero(
            metrica.faltante
          )}
        </b>

      </div>

    </article>
  );

}


function RecuperacionVsPresupuesto() {

  const [datos, setDatos] =
    useState(null);

  const [cargando, setCargando] =
    useState(true);

  const [error, setError] =
    useState("");


  const cargarPresupuesto =
    useCallback(
      async () => {

        setCargando(true);
        setError("");

        try {

          const respuesta =
            await fetchProtegido(
              "/api/recuperacion/presupuesto"
            );

          const resultado =
            await respuesta.json();

          if (
            !respuesta.ok ||
            !resultado.correcto
          ) {

            throw new Error(
              resultado.mensaje ||
              "No se pudo cargar Recuperación vs Presupuesto."
            );

          }

          setDatos(resultado);

        } catch (errorCarga) {

          console.error(
            "❌ Error al cargar Recuperación vs Presupuesto:",
            errorCarga
          );

          setError(
            errorCarga.message ||
            "No se pudo cargar Recuperación vs Presupuesto."
          );

        } finally {

          setCargando(false);

        }

      },
      []
    );


  useEffect(
    () => {

      cargarPresupuesto();

    },
    [cargarPresupuesto]
  );


  if (cargando) {

    return (
      <section className="presupuesto-rx-estado">
        Cargando avance contra presupuesto…
      </section>
    );

  }


  if (error) {

    return (
      <section
        className="
          presupuesto-rx-estado
          presupuesto-rx-error
        "
      >

        <p>
          {error}
        </p>

        <button
          type="button"
          onClick={cargarPresupuesto}
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


  return (
    <section className="presupuesto-rx">

      <div className="presupuesto-rx-header">

        <div>

          <span>
            META DEL MES
          </span>

          <h2>
            Recuperación vs presupuesto
          </h2>

          <p>
            Avance de RX con esfuerzo, sin esfuerzo
            y total por sucursal.
          </p>

        </div>


        <div className="presupuesto-rx-meta-diaria">

          <strong>
            {formatearNumero(
              resumen.metaDiaria
            )}
          </strong>

          <span>
            RX diarias necesarias
          </span>

          <small>
            {datos.diasRestantes} días restantes
          </small>

        </div>

      </div>


      <div className="presupuesto-rx-cards">

        <TarjetaPresupuesto
          titulo="Con esfuerzo"
          metrica={resumen.conEsfuerzo}
          clase="presupuesto-rx-card-esfuerzo"
        />

        <TarjetaPresupuesto
          titulo="Sin esfuerzo"
          metrica={resumen.sinEsfuerzo}
          clase="presupuesto-rx-card-sin-esfuerzo"
        />

        <TarjetaPresupuesto
          titulo="Recuperación total"
          metrica={resumen.total}
          clase="presupuesto-rx-card-total"
        />

      </div>


      <div className="presupuesto-rx-tabla-titulo">

        <span>
          DETALLE POR SUCURSAL
        </span>

        <h3>
          Avance y faltante para cumplir
        </h3>

      </div>


      <div className="presupuesto-rx-tabla-contenedor">

        <table className="presupuesto-rx-tabla">

          <thead>

            <tr>
              <th>Sucursal</th>
              <th>RX actuales</th>
              <th>Presupuesto</th>
              <th>Faltante</th>
              <th>Avance</th>
              <th>Meta diaria</th>
            </tr>

          </thead>

          <tbody>

            {(datos.sucursales || []).map(
              (registro) => (

                <tr
                  key={registro.sucursal}
                  className={obtenerClaseAvance(
                    registro.total.avance
                  )}
                >

                  <td>
                    {registro.sucursal}
                  </td>

                  <td>
                    {formatearNumero(
                      registro.total.actual
                    )}
                  </td>

                  <td>
                    {formatearNumero(
                      registro.total.presupuesto
                    )}
                  </td>

                  <td>
                    {formatearNumero(
                      registro.total.faltante
                    )}
                  </td>

                  <td>

                    <BarraAvance
                      avance={
                        registro.total.avance
                      }
                    />

                  </td>

                  <td>

                    <strong>
                      {formatearNumero(
                        registro.metaDiaria
                      )}
                    </strong>

                  </td>

                </tr>

              )
            )}

          </tbody>

          <tfoot>

            <tr>

              <td>
                TOTAL CL
              </td>

              <td>
                {formatearNumero(
                  resumen.total.actual
                )}
              </td>

              <td>
                {formatearNumero(
                  resumen.total.presupuesto
                )}
              </td>

              <td>
                {formatearNumero(
                  resumen.total.faltante
                )}
              </td>

              <td>
                {resumen.total.avance.toFixed(2)}%
              </td>

              <td>
                {formatearNumero(
                  resumen.metaDiaria
                )}
              </td>

            </tr>

          </tfoot>

        </table>

      </div>

    </section>
  );

}


export default RecuperacionVsPresupuesto;
