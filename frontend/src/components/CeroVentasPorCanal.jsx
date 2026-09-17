import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  fetchProtegido,
} from "../services/authService";


const formatearCanal =
  (canal) => {

    const nombres = {

      "PUNTO DE VENTA":
        "Punto de venta",

      CAMBACEO:
        "Cambaceo",

      "CAMBACEO EMPRESARIAL":
        "Cambaceo empresarial",

    };


    return (
      nombres[canal] ||
      canal
    );

  };


function CeroVentasPorCanal() {

  const [datos, setDatos] =
    useState(null);

  const [cargando, setCargando] =
    useState(true);

  const [error, setError] =
    useState("");


  const cargarDatos =
    useCallback(
      async () => {

        setCargando(true);
        setError("");

        try {

          const respuesta =
            await fetchProtegido(
              "/api/cero-ventas-por-canal"
            );

          const resultado =
            await respuesta.json();


          if (
            !respuesta.ok ||
            !resultado.correcto
          ) {

            throw new Error(
              resultado.mensaje ||
              "No se pudo cargar el análisis de cero ventas."
            );

          }


          setDatos(
            resultado
          );

        } catch (errorCarga) {

          console.error(
            "❌ Error al cargar cero ventas por canal:",
            errorCarga
          );

          setError(
            errorCarga.message ||
            "No se pudo cargar el análisis de cero ventas."
          );

        } finally {

          setCargando(false);

        }

      },
      []
    );


  useEffect(
    () => {

      cargarDatos();

    },
    [cargarDatos]
  );


  if (cargando) {

    return (
      <section className="cero-ventas-estado">
        Analizando promotores con cero ventas…
      </section>
    );

  }


  if (error) {

    return (
      <section
        className="
          cero-ventas-estado
          cero-ventas-error
        "
      >

        <p>
          {error}
        </p>

        <button
          type="button"
          onClick={cargarDatos}
        >
          Reintentar
        </button>

      </section>
    );

  }


  return (
    <section className="cero-ventas-seccion">

      <div className="cero-ventas-encabezado">

        <div>

          <span>
            PRODUCTIVIDAD DIARIA
          </span>

          <h2>
            Promotores con cero ventas
          </h2>

          <p>
            Cantidad diaria por canal. No se consideran domingos.
          </p>

        </div>


        <strong>
          Corte al día{" "}
          {datos?.fechaCorte?.dia || "—"}
        </strong>

      </div>


      <div className="cero-ventas-graficas">

        {(
          datos?.canales ||
          []
        ).map(
          (registro) => {

            const ultimoDia =
              registro.dias?.[
                registro.dias.length - 1
              ];


            return (
              <article
                className="cero-ventas-card"
                key={registro.canal}
              >

                <div className="cero-ventas-card-header">

                  <div>

                    <span>
                      CANAL
                    </span>

                    <h3>
                      {formatearCanal(
                        registro.canal
                      )}
                    </h3>

                    <small>
                      {registro.totalPromotores} promotores activos
                    </small>

                  </div>


                  <strong>

                    {ultimoDia?.ceroVentas || 0}

                    <small>
                      cero en el último día
                    </small>

                  </strong>

                </div>


                <div className="cero-ventas-scroll">

                  <div
                    className="cero-ventas-grafica"
                    role="img"
                    aria-label={
                      `Promotores con cero ventas por día en ${formatearCanal(
                        registro.canal
                      )}`
                    }
                  >

                    {(
                      registro.dias ||
                      []
                    ).map(
                      (dia) => {

                        const altura =
                          registro.totalPromotores > 0
                            ? (
                                dia.ceroVentas /
                                registro.totalPromotores
                              ) * 100
                            : 0;


                        return (
                          <div
                            className="cero-ventas-columna"
                            key={dia.dia}
                          >

                            <b>
                              {dia.ceroVentas}
                            </b>

                            <div>

                              <span
                                style={{
                                  height:
                                    `${altura}%`,
                                }}
                              />

                            </div>

                            <small>
                              {dia.dia}
                            </small>

                          </div>
                        );

                      }
                    )}

                  </div>

                </div>


                <div className="cero-ventas-leyenda">

                  <span>
                    Día del mes
                  </span>

                  <strong>
                    Menos ceros es mejor
                  </strong>

                </div>

              </article>
            );

          }
        )}

      </div>

    </section>
  );

}


export default CeroVentasPorCanal;
