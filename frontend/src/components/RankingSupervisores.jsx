function RankingSupervisores({

  ranking = [],

  supervisorSeleccionado = "",

  inicial = false,

  onContinuar,

}) {


  // ==================================================
  // BUSCAR SUPERVISOR ACTUAL
  // ==================================================

  const supervisorActual =
    ranking.find(
      (item) =>
        item.supervisor ===
        supervisorSeleccionado
    );


  const posicion =
    supervisorActual?.posicion ??
    0;


  const productividad =
    Number(
      supervisorActual?.productividad ??
      0
    );


  const total =
    ranking.length;


  // ==================================================
  // MENSAJE
  // ==================================================

  function obtenerMensaje() {


    if (
      posicion === 1
    ) {

      return {

        icono: "🥇",

        titulo:
          "¡ERES EL #1!",

        mensaje:
          "Estás liderando el Ranking de Supervisores. ¡Sigue marcando el ritmo y llevando a tu equipo al siguiente nivel!",

      };

    }


    if (
      posicion === 2
    ) {

      return {

        icono: "🥈",

        titulo:
          "¡EXCELENTE DESEMPEÑO!",

        mensaje:
          "Estás en el segundo lugar. ¡La cima está muy cerca, vamos por ese primer puesto!",

      };

    }


    if (
      posicion === 3
    ) {

      return {

        icono: "🥉",

        titulo:
          "¡GRAN TRABAJO!",

        mensaje:
          "Estás dentro del Top 3. ¡Mantén el ritmo y vamos por el siguiente escalón!",

      };

    }


    if (
      posicion === total
    ) {

      return {

        icono: "🔥",

        titulo:
          "¡ESTE NO ES TU LUGAR FINAL!",

        mensaje:
          "Hoy estás en la última posición, pero el ranking puede cambiar. ¡Vamos a trabajar para escalar posiciones!",

      };

    }


    return {

      icono: "📈",

      titulo:
        "¡VAMOS POR MÁS!",

      mensaje:
        "Cada día es una oportunidad para subir posiciones. ¡Mantén el enfoque y sigue avanzando!",

    };

  }


  const mensaje =
    obtenerMensaje();


  // ==================================================
  // PANTALLA INICIAL
  // ==================================================

  if (
    inicial
  ) {

    return (

      <div className="ranking-overlay">

        <div className="ranking-inicial">


          <div className="ranking-icono">

            {mensaje.icono}

          </div>


          <h1>

            RANKING DE
            SUPERVISORES

          </h1>


          <p className="ranking-nombre">

            {supervisorSeleccionado}

          </p>


          <div className="ranking-posicion">

            <span>
              POSICIÓN
            </span>


            <strong>

              {posicion}

              <small>
                /{total}
              </small>

            </strong>

          </div>


          <div className="ranking-productividad">

            Productividad

            <strong>

              {productividad.toFixed(2)}

            </strong>

          </div>


          <h2>

            {mensaje.titulo}

          </h2>


          <p className="ranking-mensaje">

            {mensaje.mensaje}

          </p>


          <button
            className="ranking-continuar"
            onClick={
              onContinuar
            }
          >

            🚀 ACEPTAR Y CONTINUAR

          </button>


        </div>

      </div>

    );

  }


  // ==================================================
  // TABLA DEL DASHBOARD
  // ==================================================

  return (

    <div className="ranking-supervisores">

      <h2>
        🏆 Ranking de Supervisores
      </h2>


      <p className="ranking-subtitulo">

        Productividad ordenada de mayor a menor

      </p>


      <table>

        <thead>

          <tr>

            <th>
              Puesto
            </th>

            <th>
              Supervisor
            </th>

            <th>
              Productividad
            </th>

          </tr>

        </thead>


        <tbody>

          {ranking.map(

            (
              supervisor
            ) => {

              const esActual =
                supervisor.supervisor ===
                supervisorSeleccionado;


              return (

                <tr
                  key={
                    supervisor.supervisor
                  }

                  className={
                    esActual
                      ? "supervisor-actual"
                      : ""
                  }
                >

                  <td>

                    {supervisor.posicion === 1 &&
                      "🥇"}

                    {supervisor.posicion === 2 &&
                      "🥈"}

                    {supervisor.posicion === 3 &&
                      "🥉"}

                    {supervisor.posicion > 3 &&
                      supervisor.posicion}

                  </td>


                  <td>

                    <strong>
                      {
                        supervisor.supervisor
                      }
                    </strong>


                    {esActual && (

                      <span className="tu-posicion">

                        ← TÚ ESTÁS AQUÍ

                      </span>

                    )}

                  </td>


                  <td>

                    {Number(
                      supervisor.productividad
                    ).toFixed(2)}

                  </td>

                </tr>

              );

            }

          )}

        </tbody>

      </table>

    </div>

  );

}


export default RankingSupervisores;