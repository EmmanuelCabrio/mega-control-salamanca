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

</section>
