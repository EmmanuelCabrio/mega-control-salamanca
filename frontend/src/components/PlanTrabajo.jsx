import {
  useMemo
} from "react";


function PlanTrabajo({

  planTrabajo = [],

  supervisorSeleccionado,

  setVista

}) {


  // ==================================================
  // FILTRAR COLONIAS DEL SUPERVISOR
  // ==================================================

  const colonias =
    useMemo(

      () => {

        return planTrabajo.filter(
          (registro) =>
            registro.supervisor ===
            supervisorSeleccionado
        );

      },

      [
        planTrabajo,
        supervisorSeleccionado
      ]

    );


  // ==================================================
  // RENDER
  // ==================================================

  return (

    <div className="plan-trabajo">


      {/* ==========================================
          ENCABEZADO
      ========================================== */}

      <div className="plan-header">

        <h1>
          🎯 Plan de Trabajo
        </h1>


        <p>

          Supervisor:

          <strong>
            {" "}
            {supervisorSeleccionado}
          </strong>

        </p>

      </div>


      {/* ==========================================
          RESUMEN
      ========================================== */}

      <div className="plan-resumen">

        <div>

          <strong>
            {colonias.length}
          </strong>

          <span>
            Colonias
          </span>

        </div>


        <div>

          <strong>
            {colonias.reduce(
              (
                total,
                item
              ) =>
                total +
                Number(
                  item.potenciales
                ),
              0
            )}
          </strong>

          <span>
            Potenciales
          </span>

        </div>


        <div>

          <strong>
            {colonias.reduce(
              (
                total,
                item
              ) =>
                total +
                Number(
                  item.porVender
                ),
              0
            )}
          </strong>

          <span>
            Por vender
          </span>

        </div>

      </div>


      {/* ==========================================
          LISTA DE COLONIAS
      ========================================== */}

      <div className="colonias-lista">


        {colonias.length === 0 ? (

          <div className="sin-colonias">

            ⚠️ No encontramos colonias
            asignadas a este supervisor.

          </div>

        ) : (


          colonias.map(
            (
              colonia,
              index
            ) => (

              <div
                className="colonia-card"
                key={`${colonia.colonia}-${index}`}
              >


                {/* =================================
                    NOMBRE
                ================================= */}

                <div className="colonia-header">

                  <h2>
                    📍 {colonia.colonia}
                  </h2>

                </div>


                {/* =================================
                    DATOS
                ================================= */}

                <div className="colonia-datos">


                  <div className="dato-colonia">

                    <span>
                      👥 Potenciales
                    </span>

                    <strong>
                      {Number(
                        colonia.potenciales
                      ).toLocaleString()}
                    </strong>

                  </div>


                  <div className="dato-colonia">

                    <span>
                      📊 Penetración
                    </span>

                    <strong>
                      {Number(
                        colonia.penetracion
                      ).toFixed(1)}%
                    </strong>

                  </div>


                  <div className="dato-colonia">

                    <span>
                      🔥 Por vender
                    </span>

                    <strong className="por-vender">

                      {Number(
                        colonia.porVender
                      ).toLocaleString()}

                    </strong>

                  </div>


                  <div className="dato-colonia">

                    <span>
                      📈 Ventas
                    </span>

                    <strong>
                      {Number(
                        colonia.ventas
                      ).toLocaleString()}
                    </strong>

                  </div>


                </div>


              </div>

            )

          )

        )}

      </div>


      {/* ==========================================
          REGRESAR
      ========================================== */}

      <button

        className="boton-regresar"

        onClick={() =>
          setVista("supervisor")
        }

      >

        ← Regresar al inicio

      </button>


    </div>

  );

}


export default PlanTrabajo;