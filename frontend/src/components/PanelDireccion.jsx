import React from "react";


// ==================================================
// 👑 DASHBOARD DE DIRECCIÓN
// ==================================================

function PanelDireccion({

  registros = [],

  rankingSupervisores = [],

  rankingCL = [],

  onCerrarSesion,

}) {


  // ==================================================
  // 👥 SUPERVISORES ÚNICOS
  // ==================================================

  const supervisores = [

    ...new Set(

      registros

        .map(
          (registro) =>
            String(
              registro.supervisor ?? ""
            )
              .trim()
        )

        .filter(
          (supervisor) =>
            supervisor !== "" &&
            supervisor !== "0"
        )

    )

  ];


  // ==================================================
  // 👤 TOTAL DE PROMOTORES
  // ==================================================

  const totalPromotores =
    registros.length;


  // ==================================================
  // 👔 TOTAL DE SUPERVISORES
  // ==================================================

  const totalSupervisores =
    supervisores.length;


  // ==================================================
  // 📊 PRODUCTIVIDAD PROMEDIO
  // ==================================================

  const productividadPromedio =

    totalPromotores > 0

      ? (

          registros.reduce(

            (total, registro) =>

              total +
              Number(
                registro.productividad ?? 0
              ),

            0

          ) /

          totalPromotores

        )

      : 0;


  // ==================================================
  // 🏆 MEJOR SUPERVISOR
  // ==================================================

  const mejorSupervisor =
    rankingSupervisores.length > 0

      ? rankingSupervisores[0]

      : null;


  // ==================================================
  // RENDER
  // ==================================================

  return (

    <div className="panel-direccion">


      {/* ==================================================
          ENCABEZADO
      ================================================== */}

      <header className="panel-direccion-header">

        <div>

          <div className="panel-direccion-etiqueta">

            👑 DIRECCIÓN

          </div>


          <h1>

            Dashboard Dirección

          </h1>


          <p>

            Centro de control comercial · SEGUIMIENTO 2.0

          </p>

        </div>


        {/* ==================================================
            CERRAR SESIÓN
        ================================================== */}

        {onCerrarSesion && (

          <button

            type="button"

            className="panel-direccion-logout"

            onClick={
              onCerrarSesion
            }

          >

            🚪 Cerrar sesión

          </button>

        )}

      </header>



      {/* ==================================================
          INDICADORES PRINCIPALES
      ================================================== */}

      <section className="panel-direccion-indicadores">


        {/* SUPERVISORES */}

        <div className="panel-direccion-indicador">

          <span className="panel-direccion-indicador-icono">

            👔

          </span>


          <div>

            <small>

              Supervisores

            </small>


            <strong>

              {totalSupervisores}

            </strong>

          </div>

        </div>



        {/* PROMOTORES */}

        <div className="panel-direccion-indicador">

          <span className="panel-direccion-indicador-icono">

            👥

          </span>


          <div>

            <small>

              Promotores

            </small>


            <strong>

              {totalPromotores}

            </strong>

          </div>

        </div>



        {/* PRODUCTIVIDAD */}

        <div className="panel-direccion-indicador">

          <span className="panel-direccion-indicador-icono">

            📊

          </span>


          <div>

            <small>

              Productividad promedio

            </small>


            <strong>

              {productividadPromedio.toFixed(2)}

            </strong>

          </div>

        </div>



        {/* MEJOR SUPERVISOR */}

        <div className="panel-direccion-indicador">

          <span className="panel-direccion-indicador-icono">

            🏆

          </span>


          <div>

            <small>

              Mejor supervisor

            </small>


            <strong>

              {mejorSupervisor?.supervisor || "—"}

            </strong>

          </div>

        </div>


      </section>



      {/* ==================================================
          CONTENIDO
      ================================================== */}

      <section className="panel-direccion-contenido">


        {/* ==================================================
            RANKING SUPERVISORES
        ================================================== */}

        <div className="panel-direccion-card">

          <div className="panel-direccion-card-header">

            <div>

              <span>

                🏆

              </span>

              <h2>

                Ranking de Supervisores

              </h2>

            </div>

          </div>


          {rankingSupervisores.length > 0 ? (

            <div className="panel-direccion-ranking">

              {rankingSupervisores

                .slice(0, 5)

                .map(

                  (supervisor, index) => (

                    <div

                      key={

                        `${supervisor.supervisor}-${index}`

                      }

                      className="panel-direccion-ranking-item"

                    >

                      <span className="panel-direccion-posicion">

                        {index + 1}

                      </span>


                      <div>

                        <strong>

                          {supervisor.supervisor}

                        </strong>


                        <small>

                          Productividad:{" "}

                          {Number(
                            supervisor.productividad ?? 0
                          ).toFixed(2)}

                        </small>

                      </div>

                    </div>

                  )

                )}

            </div>

          ) : (

            <div className="panel-direccion-vacio">

              No hay información disponible.

            </div>

          )}

        </div>



        {/* ==================================================
            RESUMEN DE EQUIPOS
        ================================================== */}

        <div className="panel-direccion-card">

          <div className="panel-direccion-card-header">

            <div>

              <span>

                👥

              </span>

              <h2>

                Equipos

              </h2>

            </div>

          </div>


          {supervisores.length > 0 ? (

            <div className="panel-direccion-equipos">

              {supervisores.map(

                (supervisor, index) => {

                  const equipo =
                    registros.filter(

                      (registro) =>

                        String(
                          registro.supervisor ?? ""
                        )
                          .trim() ===
                        supervisor

                    );


                  return (

                    <div

                      key={
                        `${supervisor}-${index}`
                      }

                      className="panel-direccion-equipo"

                    >

                      <div>

                        <strong>

                          {supervisor}

                        </strong>


                        <small>

                          {equipo.length}{" "}

                          {equipo.length === 1
                            ? "promotor"
                            : "promotores"}

                        </small>

                      </div>


                      <span>

                        👥

                      </span>

                    </div>

                  );

                }

              )}

            </div>

          ) : (

            <div className="panel-direccion-vacio">

              No hay equipos disponibles.

            </div>

          )}

        </div>


      </section>



      {/* ==================================================
          PRÓXIMAMENTE
      ================================================== */}

      <section className="panel-direccion-proximamente">

        <div>

          <span>

            🚀

          </span>

          <div>

            <h2>

              Centro de control comercial

            </h2>


            <p>

              Aquí construiremos los indicadores estratégicos de Dirección.

            </p>

          </div>

        </div>


        <div className="panel-direccion-badge">

          EN CONSTRUCCIÓN

        </div>

      </section>


    </div>

  );

}


export default PanelDireccion;
