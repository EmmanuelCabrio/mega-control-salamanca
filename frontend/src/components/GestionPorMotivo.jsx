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


function GestionPorMotivo() {

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
              "/api/recuperacion/gestion-por-motivo"
            );

          const resultado =
            await respuesta.json();


          if (
            !respuesta.ok ||
            !resultado.correcto
          ) {

            throw new Error(
              resultado.mensaje ||
              "No se pudo cargar la gestión por motivo."
            );

          }


          setDatos(
            resultado
          );

        } catch (errorCarga) {

          console.error(
            "❌ Error al cargar la gestión por motivo:",
            errorCarga
          );

          setError(
            errorCarga.message ||
            "No se pudo cargar la gestión por motivo."
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
      <section className="gestion-motivo-estado">
        Cargando visitas por tipo de gestión…
      </section>
    );

  }


  if (error) {

    return (
      <section className="gestion-motivo-estado gestion-motivo-error">

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


  if (!datos) {
    return null;
  }


  return (
    <section className="gestion-motivo">

      <div className="gestion-motivo-header">

        <div>

          <span>
            RESULTADO DE LA GESTIÓN
          </span>

          <h2>
            Visitas por tipo de gestión
          </h2>

          <p>
            Motivo registrado para cada suscriptor de la cartera.
          </p>

        </div>


        <strong>

          {formatearNumero(
            datos.totalSuscriptores
          )}

          <small>
            suscriptores
          </small>

        </strong>

      </div>


      <div className="gestion-motivo-resumen">

        <article>

          <span>
            Con visita
          </span>

          <strong>
            {formatearNumero(
              datos.conVisita
            )}
          </strong>

          <small>
            {Number(
              datos.porcentajeConVisita || 0
            ).toFixed(2)}%
          </small>

        </article>


        <article>

          <span>
            Sin visita
          </span>

          <strong>
            {formatearNumero(
              datos.sinVisita
            )}
          </strong>

          <small>
            {Number(
              datos.porcentajeSinVisita || 0
            ).toFixed(2)}%
          </small>

        </article>

      </div>


      <div className="gestion-motivo-tabla-contenedor">

        <table className="gestion-motivo-tabla">

          <thead>

            <tr>
              <th>
                Motivo
              </th>

              <th>
                Suscriptores
              </th>

              <th>
                Participación
              </th>
            </tr>

          </thead>


          <tbody>

            {(datos.motivos || []).map(
              (registro) => (

                <tr
                  key={registro.motivo}
                  className={
                    registro.motivo
                      .toUpperCase() ===
                    "SIN VISITA"
                      ? "gestion-motivo-sin-visita"
                      : ""
                  }
                >

                  <td>
                    {registro.motivo}
                  </td>

                  <td>

                    <strong>
                      {formatearNumero(
                        registro.suscriptores
                      )}
                    </strong>

                  </td>

                  <td>

                    <div className="gestion-motivo-participacion">

                      <span>

                        <i
                          style={{
                            width:
                              datos.maximo > 0
                                ? `${(
                                    registro.suscriptores /
                                    datos.maximo
                                  ) * 100}%`
                                : "0%",
                          }}
                        />

                      </span>

                      <strong>
                        {Number(
                          registro.porcentaje || 0
                        ).toFixed(2)}%
                      </strong>

                    </div>

                  </td>

                </tr>

              )
            )}

          </tbody>


          <tfoot>

            <tr>

              <td>
                TOTAL
              </td>

              <td>
                {formatearNumero(
                  datos.totalSuscriptores
                )}
              </td>

              <td>
                100.00%
              </td>

            </tr>

          </tfoot>

        </table>

      </div>

    </section>
  );

}


export default GestionPorMotivo;
