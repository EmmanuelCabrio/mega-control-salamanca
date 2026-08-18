function CLRecognition({

  ranking = [],

  onContinuar,

}) {

  // ==================================================
  // TOP 3 CL SALAMANCA
  // ==================================================

  const top3 =
    [...ranking]
      .filter(
        (promotor) =>
          promotor.nombre !==
          "MORALES PEREZ BENJAMIN"
      )
      .sort(
        (a, b) =>
          Number(b.productividad ?? 0) -
          Number(a.productividad ?? 0)
      )
      .slice(0, 3);


  // ==================================================
  // MEDALLAS
  // ==================================================

  const medallas = [
    "🥇",
    "🥈",
    "🥉",
  ];


  // ==================================================
  // RENDER
  // ==================================================

  return (

    <div className="cl-recognition-overlay">

      <div className="cl-recognition">


        {/* ==========================================
            TROFEO
        ========================================== */}

        <div className="cl-recognition-trofeo">

          🏆

        </div>


        {/* ==========================================
            TÍTULO
        ========================================== */}

        <h1>

          TOP 3

        </h1>


        <h2>

          CL SALAMANCA

        </h2>


        <div className="cl-recognition-linea" />


        <h3>

          ¡LOS QUE ESTÁN
          <br />
          MARCANDO EL RITMO!

        </h3>


        {/* ==========================================
            TOP 3
        ========================================== */}

        <div className="cl-recognition-ranking">


          {top3.map(

            (
              promotor,
              index
            ) => (

              <div

                key={
                  `${promotor.nombre}-${index}`
                }

                className={`
                  cl-podio
                  cl-podio-${index + 1}
                `}

              >


                {/* MEDALLA */}

                <div className="cl-podio-medalla">

                  {medallas[index]}

                </div>


                {/* INFORMACIÓN */}

                <div className="cl-podio-info">

                  <strong>

                    {promotor.nombre}

                  </strong>


                  <span>

                    Productividad

                  </span>


                  <b>

                    {Number(
                      promotor.productividad ?? 0
                    ).toFixed(2)}

                  </b>

                </div>


              </div>

            )

          )}

        </div>


        {/* ==========================================
            FRASE
        ========================================== */}

        <div className="cl-recognition-frase">

          <strong>

            🔥 EL RESULTADO DE UN EQUIPO
            <br />
            QUE NO SE CONFORMA.

          </strong>


          <p>

            ¡SIGAMOS HACIENDO HISTORIA
            <br />
            EN CL SALAMANCA!

          </p>

        </div>


        {/* ==========================================
            CONTINUAR
        ========================================== */}

        <button

          className="cl-recognition-continuar"

          onClick={
            onContinuar
          }

        >

          CONTINUAR 🚀

        </button>


      </div>

    </div>

  );

}


export default CLRecognition;