import {
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


function ResumenPlanTrabajoDireccion() {

  const [
    datos,
    setDatos,
  ] = useState(null);


  const [
    cargando,
    setCargando,
  ] = useState(true);


  const [
    error,
    setError,
  ] = useState("");


  // ==================================================
  // CARGAR INFORMACIÓN
  // ==================================================

  useEffect(() => {

    async function cargarResumen() {

      try {

        setCargando(true);

        setError("");


        const respuesta =
          await fetchProtegido(
            "/api/avance-plan-trabajo"
          );


        const resultado =
          await respuesta.json();


        if (
          !respuesta.ok ||
          !resultado.correcto
        ) {

          throw new Error(
            resultado.mensaje ||
            "No se pudo cargar el resumen"
          );

        }


        setDatos(
          resultado
        );

      } catch (errorCarga) {

        console.error(
          "❌ Error resumen Plan de Trabajo:",
          errorCarga
        );


        setError(
          errorCarga.message ||
          "No se pudo cargar el resumen"
        );

      } finally {

        setCargando(false);

      }

    }


    cargarResumen();

  }, []);


  // ==================================================
  // ESTADO DE CARGA
  // ==================================================

  if (cargando) {

    return (

      <section
        className="
          resumen-plan-direccion-estado
        "
      >

        Cargando avance del Plan de Trabajo…

      </section>

    );

  }


  // ==================================================
  // ERROR
  // ==================================================

  if (error) {

    return (

      <section
        className="
          resumen-plan-direccion-estado
          avance-plan-error
        "
      >

        {error}

      </section>

    );

  }


  const supervisores =
    datos?.supervisores ||
    [];


  const totales =
    datos?.totales ||
    {};


  // ==================================================
  // RENDER
  // ==================================================

  return (

    <section className="resumen-plan-direccion">


      {/* ==========================================
          ENCABEZADO
      ========================================== */}

      <div
        className="
          resumen-plan-direccion-header
        "
      >

        <div>

          <span>
            🎯 PLAN DE TRABAJO
          </span>

          <h2>
            Avance por supervisor
          </h2>

          <p>
            Ventas realizadas en las colonias
            asignadas contra la meta.
          </p>

        </div>


        <strong>

          {Number(
            totales.avancePorcentaje ||
            0
          ).toFixed(1)}%

          <small>
            avance general
          </small>

        </strong>

      </div>


      {/* ==========================================
          TABLA
      ========================================== */}

      <div
        className="
          resumen-plan-direccion-tabla-contenedor
        "
      >

        <table
          className="
            resumen-plan-direccion-tabla
          "
        >

          <thead>

            <tr>

              <th>
                Supervisor
              </th>

              <th>
                Canal
              </th>

              <th>
                Colonias
              </th>

              <th>
                Col. asignadas
              </th>

              <th>
                Potenciales
              </th>

              <th>
                Por vender
              </th>

              <th>
                Ventas plan
              </th>

              <th>
                Ventas general
              </th>

              <th>
                Meta
              </th>

              <th>
                Diferencia
              </th>


              <th>
               Apps
              </th>

              <th>
                Móvil
             </th>

            <th>
            Cortes
            </th>

            <th>
              RX
            </th>

              <th>
                Avance
              </th>

            </tr>

          </thead>


          <tbody>

            {supervisores.map(
              (registro) => {

                const diferencia =
                  Number(
                    registro.diferencia ||
                    0
                  );


                return (

                  <tr
                    key={
                      registro.claveSupervisor
                    }
                  >

                    <td>
                      {registro.supervisor}
                    </td>

                    <td>
                      {registro.canal}
                    </td>

                    <td>

                      {formatearNumero(
                        registro.colonias
                      )}

                    </td>

                    <td>

                      {formatearNumero(
                        registro.coloniasAsignadas
                      )}

                    </td>

                    <td>

                      {formatearNumero(
                        registro.potenciales
                      )}

                    </td>

                    <td>

                      {formatearNumero(
                        registro.porVender
                      )}

                    </td>

                    <td>

                      {formatearNumero(
                        registro.ventasPlan
                      )}

                    </td>

                    <td>

                      {formatearNumero(
                        registro.ventasGeneral
                      )}

                    </td>

                    <td>

                      {formatearNumero(
                        registro.meta
                      )}

                    </td>

                    <td
                      className={
                        diferencia >= 0
                          ? "avance-plan-positivo"
                          : "avance-plan-negativo"
                      }
                    >

                      {
                        diferencia > 0
                          ? "+"
                          : ""
                      }

                      {formatearNumero(
                        diferencia
                      )}

                    </td>

                    <td>
              {formatearNumero(
             registro.ventaApps
                )}
             </td>

              <td>
              {formatearNumero(
              registro.ventaMovil
                )}
            </td>

             <td>
               {formatearNumero(
                registro.cortes
               )}
             </td>

             <td>
              {formatearNumero(
            registro.rx
              )}
            </td>

                    <td>

                      {Number(
                        registro
                          .avancePorcentaje ||
                        0
                      ).toFixed(1)}%

                    </td>

                  </tr>

                );

              }
            )}

          </tbody>


          {/* ========================================
              TOTAL GENERAL
          ======================================== */}

          <tfoot>

            <tr>

              <td>
                TOTAL
              </td>

              <td>
                —
              </td>

              <td>

                {formatearNumero(
                  totales.colonias
                )}

              </td>

              <td>

                {formatearNumero(
                  totales.coloniasAsignadas
                )}

              </td>

              <td>

                {formatearNumero(
                  totales.potenciales
                )}

              </td>

              <td>

                {formatearNumero(
                  totales.porVender
                )}

              </td>

              <td>

                {formatearNumero(
                  totales.ventasPlan
                )}

              </td>

              <td>

                {formatearNumero(
                  totales.ventasGeneral
                )}

              </td>

              <td>

                {formatearNumero(
                  totales.meta
                )}

              </td>

              <td
                className={
                  Number(
                    totales.diferencia ||
                    0
                  ) >= 0
                    ? "avance-plan-positivo"
                    : "avance-plan-negativo"
                }
              >

                {
                  Number(
                    totales.diferencia ||
                    0
                  ) > 0
                    ? "+"
                    : ""
                }

                {formatearNumero(
                  totales.diferencia
                )}

              </td>

              <td>
             {formatearNumero(
               totales.ventaApps
            )}
           </td>

           <td>
             {formatearNumero(
             totales.ventaMovil
             )}
          </td>

           <td>
            {formatearNumero(
            totales.cortes
             )}
          </td>

         <td>
         {formatearNumero(
         totales.rx
          )}
         </td>

              <td>

                {Number(
                  totales.avancePorcentaje ||
                  0
                ).toFixed(1)}%

              </td>

            </tr>

          </tfoot>

        </table>

      </div>


    </section>

  );

}


export default ResumenPlanTrabajoDireccion;
