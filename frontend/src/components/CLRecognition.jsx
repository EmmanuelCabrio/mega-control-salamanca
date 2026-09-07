function CLRecognition({

  ranking = [],

  onContinuar,

}) {

  // ==================================================
  // TOP 10 CL SALAMANCA
  // ==================================================

  const top10 =
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
      .slice(0, 10);


  // ==================================================
  // MEDALLAS TOP 3
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

          TOP 10

        </h1>


        <h2>

          CL SALAMANCA

        </h2>


        <div className="cl-recognition-linea" />


        <h3>

          ¡EN LA CIMA
          <br />
          TODO SE SIENTE DIFERENTE!

        </h3>


        {/* ==========================================
            TOP 10
        ========================================== */}

        <div className="cl-recognition-ranking">


          {top10.map(

            (
              promotor,
              index
            ) => {

              const posicion =
                index + 1;

              const esTop3 =
                posicion <= 3;


              return (

                <div

                  key={
                    `${promotor.nombre}-${index}`
                  }

                  className={
                    esTop3
                      ? `
                          cl-podio
                          cl-podio-${posicion}
                        `
                      : `
                          cl-podio
                          cl-podio-resto
                        `
                  }

                >


                  {/* ==================================
                      POSICIÓN / MEDALLA
                  ================================== */}

                  <div
                    className={
                      esTop3
                        ? "cl-podio-medalla"
                        : "cl-podio-posicion"
                    }
                  >

                    {
                      esTop3
                        ? medallas[index]
                        : posicion
                    }

                  </div>


                  {/* ==================================
                      INFORMACIÓN
                  ================================== */}

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

              );

            }

          )}


        </div>


        {/* ==========================================
            FRASE
        ========================================== */}

        <div className="cl-recognition-frase">

          <strong>

            🔥 GRACIAS POR MARCAR
            <br />
             LA DIFERENCIA.

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
