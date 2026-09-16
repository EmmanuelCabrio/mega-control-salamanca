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
    Math.round(
      Number(valor || 0)
    ).toLocaleString(
      "es-MX"
    );


const formatearDecimal =
  (valor) =>
    Number(valor || 0).toLocaleString(
      "es-MX",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    );


const obtenerClaseAvance =
  (avance) => {

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


function TarjetaResumen({
  titulo,
  valor,
  detalle,
  clase,
}) {

  return (
    <article className={`presupuesto-rx-card ${clase}`}>

      <span>
        {titulo}
      </span>

      <strong>
        {valor}
      </strong>

      <small>
        {detalle}
      </small>

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


          setDatos(
            resultado
          );

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
      <section className="presupuesto-rx-estado presupuesto-rx-error">

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
            RX con esfuerzo vs presupuesto
          </h2>

          <p>
            Avance de recuperación con esfuerzo por sucursal.
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
            Ritmo exacto: {formatearDecimal(
              resumen.ritmoNecesario
            )} · {datos.diasRestantes} días restantes
          </small>

        </div>

      </div>


      <div className="presupuesto-rx-cards">

        <TarjetaResumen
          titulo="RX con esfuerzo actuales"
          valor={formatearNumero(
            resumen.actual
          )}
          detalle="Acumulado del mes"
          clase="presupuesto-rx-card-actual"
        />

        <TarjetaResumen
          titulo="Presupuesto"
          valor={formatearNumero(
            resumen.presupuesto
          )}
          detalle="RX con esfuerzo esperadas"
          clase="presupuesto-rx-card-presupuesto"
        />

        <TarjetaResumen
          titulo="Faltante"
          valor={formatearNumero(
            resumen.faltante
          )}
          detalle="RX necesarias para cumplir"
          clase="presupuesto-rx-card-faltante"
        />

        <TarjetaResumen
          titulo="Avance"
          valor={`${Number(
            resumen.avance || 0
          ).toFixed(2)}%`}
          detalle="Cumplimiento del presupuesto"
          clase="presupuesto-rx-card-avance"
        />

      </div>


      <div className="presupuesto-rx-avance-general">

        <span>
          Avance general del clúster
        </span>

        <BarraAvance
          avance={resumen.avance}
        />

      </div>


      <div className="presupuesto-rx-tabla-titulo">

        <span>
          DETALLE POR SUCURSAL
        </span>

        <h3>
          Avance y ritmo necesario para cumplir
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
              <th>Ritmo diario</th>
            </tr>
          </thead>

          <tbody>

            {(datos.sucursales || []).map(
              (registro) => (

                <tr
                  key={registro.sucursal}
                  className={obtenerClaseAvance(
                    registro.avance
                  )}
                >

                  <td>
                    {registro.sucursal}
                  </td>

                  <td>
                    {formatearNumero(
                      registro.actual
                    )}
                  </td>

                  <td>
                    {formatearNumero(
                      registro.presupuesto
                    )}
                  </td>

                  <td>
                    {formatearNumero(
                      registro.faltante
                    )}
                  </td>

                  <td>
                    <BarraAvance
                      avance={registro.avance}
                    />
                  </td>

                  <td className="presupuesto-rx-ritmo">

                    <strong>
                      {formatearNumero(
                        registro.metaDiaria
                      )} RX/día
                    </strong>

                    <small>
                      {formatearDecimal(
                        registro.ritmoNecesario
                      )} exacto
                    </small>

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
                  resumen.actual
                )}
              </td>

              <td>
                {formatearNumero(
                  resumen.presupuesto
                )}
              </td>

              <td>
                {formatearNumero(
                  resumen.faltante
                )}
              </td>

              <td>
                {Number(
                  resumen.avance || 0
                ).toFixed(2)}%
              </td>

              <td>
                {formatearNumero(
                  resumen.metaDiaria
                )} RX/día
              </td>

            </tr>

          </tfoot>

        </table>

      </div>

    </section>
  );

}


export default RecuperacionVsPresupuesto;
