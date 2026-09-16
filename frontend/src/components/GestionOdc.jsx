import {
  useCallback,
  useEffect,
  useState
} from "react";

import {
  fetchProtegido
} from "../services/authService";


function GestionOdc() {

  const [datos, setDatos] =
    useState(null);

  const [cargando, setCargando] =
    useState(true);

  const [error, setError] =
    useState("");


  const cargarGestion =
    useCallback(
      async () => {

        setCargando(true);
        setError("");

        try {

          const respuesta =
            await fetchProtegido(
              "/api/recuperacion/gestion-odc"
            );


          const resultado =
            await respuesta.json();


          if (
            !respuesta.ok ||
            !resultado.correcto
          ) {

            throw new Error(
              resultado.mensaje ||
              "No se pudo cargar la Gestión de ODC."
            );

          }


          setDatos(
            resultado
          );

        } catch (errorCarga) {

          console.error(
            "❌ Error al cargar la Gestión de ODC:",
            errorCarga
          );

          setError(
            errorCarga.message ||
            "No se pudo cargar la Gestión de ODC."
          );

        } finally {

          setCargando(false);

        }

      },
      []
    );


  useEffect(
    () => {

      cargarGestion();

    },
    [cargarGestion]
  );


  if (cargando) {

    return (
      <section className="gestion-odc-estado">
        Cargando Gestión de ODC…
      </section>
    );

  }


  if (error) {

    return (
      <section className="gestion-odc-estado gestion-odc-error">

        <p>
          {error}
        </p>

        <button
          type="button"
          onClick={cargarGestion}
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


  const sucursales =
    datos.sucursales || [];


  const sucursalCritica =
    sucursales.reduce(
      (critica, sucursal) => {

        if (
          !critica ||
          sucursal.porcentajeConVisita <
            critica.porcentajeConVisita
        ) {

          return sucursal;

        }


        return critica;

      },
      null
    );


  const formatearNumero =
    (valor) =>
      Number(
        valor || 0
      ).toLocaleString(
        "es-MX"
      );


  const formatearPorcentaje =
    (valor) =>
      `${Math.round(
        Number(
          valor || 0
        )
      )}%`;


  const obtenerClaseSemaforo =
    (porcentaje) => {

      const valor =
        Number(
          porcentaje || 0
        );


      if (valor >= 60) {
        return "gestion-odc-nivel-verde";
      }

      if (valor >= 55) {
        return "gestion-odc-nivel-verde-claro";
      }

      if (valor >= 50) {
        return "gestion-odc-nivel-lima";
      }

      if (valor >= 40) {
        return "gestion-odc-nivel-amarillo";
      }

      if (valor >= 20) {
        return "gestion-odc-nivel-naranja";
      }


      return "gestion-odc-nivel-rojo";

    };


  return (
    <section className="gestion-odc">

      <div className="gestion-odc-header">

        <div>

          <span>
            COBERTURA DE VISITAS
          </span>

          <h2>
            Gestión de órdenes de cobranza
          </h2>

          <p>
            Avance de las ODC gestionadas por sucursal.
          </p>

        </div>


        {sucursalCritica && (

          <div className="gestion-odc-prioridad">

            <span>
              Mayor pendiente
            </span>

            <strong>
              {sucursalCritica.sucursal}
            </strong>

            <small>

              {formatearPorcentaje(
                sucursalCritica.porcentajeSinVisita
              )} sin visita

            </small>

          </div>

        )}

      </div>


      <div className="gestion-odc-kpis">

        <article className="gestion-odc-kpi-total">

          <span>
            Total ODC
          </span>

          <strong>
            {formatearNumero(
              resumen.totalOdc
            )}
          </strong>

          <small>
            Órdenes asignadas
          </small>

        </article>


        <article className="gestion-odc-kpi-con-visita">

          <span>
            Con visita
          </span>

          <strong>
            {formatearNumero(
              resumen.conVisita
            )}
          </strong>

          <small>

            {formatearPorcentaje(
              resumen.porcentajeConVisita
            )} gestionadas

          </small>

        </article>


        <article className="gestion-odc-kpi-sin-visita">

          <span>
            Sin visita
          </span>

          <strong>
            {formatearNumero(
              resumen.sinVisita
            )}
          </strong>

          <small>

            {formatearPorcentaje(
              resumen.porcentajeSinVisita
            )} pendientes

          </small>

        </article>

      </div>


      <div className="gestion-odc-cobertura">

        <div className="gestion-odc-cobertura-etiquetas">

          <strong>
            Cobertura general
          </strong>

          <span>

            {formatearPorcentaje(
              resumen.porcentajeConVisita
            )} con visita

          </span>

        </div>


        <div
          className="gestion-odc-barra"
          role="progressbar"
          aria-label="Porcentaje de ODC con visita"
          aria-valuemin="0"
          aria-valuemax="100"
          aria-valuenow={Math.round(
            resumen.porcentajeConVisita
          )}
        >

          <span
            style={{
              width:
                `${Math.min(
                  Math.max(
                    Number(
                      resumen.porcentajeConVisita || 0
                    ),
                    0
                  ),
                  100
                )}%`,
            }}
          />

        </div>

      </div>


      <div className="gestion-odc-tabla-contenedor">

        <table className="gestion-odc-tabla">

          <thead>

            <tr>

              <th>
                Sucursal
              </th>

              <th>
                Con visita
              </th>

              <th>
                Sin visita
              </th>

              <th>
                Total ODC
              </th>

              <th>
                % con visita
              </th>

              <th>
                % sin visita
              </th>

            </tr>

          </thead>


          <tbody>

            {sucursales.map(
              (sucursal) => {

                const claseSemaforo =
                  obtenerClaseSemaforo(
                    sucursal.porcentajeConVisita
                  );


                return (

                  <tr key={sucursal.sucursal}>

                    <td>
                      {sucursal.sucursal}
                    </td>

                    <td>

                      {formatearNumero(
                        sucursal.conVisita
                      )}

                    </td>

                    <td>

                      {formatearNumero(
                        sucursal.sinVisita
                      )}

                    </td>

                    <td>

                      {formatearNumero(
                        sucursal.totalOdc
                      )}

                    </td>

                    <td className={claseSemaforo}>

                      {formatearPorcentaje(
                        sucursal.porcentajeConVisita
                      )}

                    </td>

                    <td className={claseSemaforo}>

                      {formatearPorcentaje(
                        sucursal.porcentajeSinVisita
                      )}

                    </td>

                  </tr>

                );

              }
            )}

          </tbody>


          <tfoot>

            <tr>

              <td>
                Total
              </td>

              <td>

                {formatearNumero(
                  resumen.conVisita
                )}

              </td>

              <td>

                {formatearNumero(
                  resumen.sinVisita
                )}

              </td>

              <td>

                {formatearNumero(
                  resumen.totalOdc
                )}

              </td>

              <td>

                {formatearPorcentaje(
                  resumen.porcentajeConVisita
                )}

              </td>

              <td>

                {formatearPorcentaje(
                  resumen.porcentajeSinVisita
                )}

              </td>

            </tr>

          </tfoot>

        </table>

      </div>

    </section>
  );

}


export default GestionOdc;
