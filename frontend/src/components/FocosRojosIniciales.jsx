import {
  calcularPrioridades,
  filtrarFocosRojos,
  ordenarPorPrioridad
} from "../utils/prioridades";


function FocosRojosIniciales({

  registros = [],

  onContinuar

}) {


  // ==================================================
  // OBTENER SUPERVISORES ÚNICOS
  // ==================================================

  const supervisores = [
    ...new Set(

      registros

        .map(
          (promotor) =>
            String(
              promotor.supervisor ?? ""
            ).trim()
        )

        .filter(
          (supervisor) =>
            supervisor &&
            supervisor !== "0"
        )

    )
  ];


  // ==================================================
  // OBTENER 1 FOCO ROJO POR SUPERVISOR
  // ==================================================

  const focosPorSupervisor =
    supervisores

      .map(
        (supervisor) => {

          // ==========================================
          // EQUIPO DEL SUPERVISOR
          // ==========================================

          const equipo =
            registros.filter(
              (promotor) =>

                String(
                  promotor.supervisor ?? ""
                ).trim() ===
                supervisor &&

                String(
                  promotor.nombre ?? ""
                ).trim() !== "" &&

                String(
                  promotor.nombre ?? ""
                ).trim() !== "0"

            );


          // ==========================================
          // CALCULAR PRIORIDADES
          // ==========================================

          const equipoConPrioridades =
            calcularPrioridades(
              equipo
            );


          // ==========================================
          // OBTENER FOCOS ROJOS
          // ==========================================

          const focosRojos =
            filtrarFocosRojos(
              equipoConPrioridades
            );


          // ==========================================
          // ORDENAR POR PRIORIDAD
          // Y TOMAR EL MÁS CRÍTICO
          // ==========================================

          const focoMasCritico =
            ordenarPorPrioridad(
              [...focosRojos]
            )[0];


          // ==========================================
          // SI NO TIENE FOCO → NO MOSTRAR
          // ==========================================

          if (!focoMasCritico) {

            return null;

          }


          // ==========================================
          // DEVOLVER FOCO + SUPERVISOR
          // ==========================================

          return {

            ...focoMasCritico,

            supervisor

          };

        }
      )

      .filter(
        Boolean
      );


  // ==================================================
  // RENDER
  // ==================================================

  return (

    <div className="focos-rojos-iniciales">

      <div className="focos-rojos-iniciales-card">


        {/* ==========================================
            ICONO
        ========================================== */}

        <div className="focos-rojos-iniciales-icono">

          🔴

        </div>


        {/* ==========================================
            TÍTULO
        ========================================== */}

        <h1>

          Focos Rojos

        </h1>


        {/* ==========================================
            MENSAJE
        ========================================== */}

        <p className="focos-rojos-iniciales-subtitulo">

          Estos son los focos rojos de tus
          supervisores para hoy.

        </p>


        {/* ==========================================
            LISTA
        ========================================== */}

        {focosPorSupervisor.length > 0 ? (

          <div className="focos-rojos-iniciales-lista">

            {focosPorSupervisor.map(

              (promotor, index) => (

                <div

                  key={

                    `${promotor.supervisor}-${promotor.nombre}-${index}`

                  }

                  className="foco-rojo-inicial"
                >


                  {/* ==================================
                      ICONO
                  ================================== */}

                  <span className="foco-rojo-inicial-icono">

                    🔴

                  </span>


                  <div>


                    {/* ==============================
                        NOMBRE DEL SUPERVISOR
                    ============================== */}

                    <strong>

                      {promotor.supervisor}

                    </strong>


                    {/* ==============================
                        PROMOTOR
                    ============================== */}

                    <div>

                      {promotor.nombre}

                    </div>


                    {/* ==============================
                        MOTIVO
                    ============================== */}

                    {promotor.motivo && (

                      <small>

                        {promotor.motivo}

                      </small>

                    )}

                  </div>


                </div>

              )

            )}

          </div>

        ) : (


          // ============================================
          // SIN FOCOS
          // ============================================

          <div className="focos-rojos-iniciales-vacio">

            🟢

            <strong>

              ¡Excelente!

            </strong>

            <span>

              Ninguno de tus supervisores tiene
              focos rojos hoy.

            </span>

          </div>

        )}


        {/* ==========================================
            CONTINUAR
        ========================================== */}

        <button

          type="button"

          className="focos-rojos-iniciales-boton"

          onClick={
            onContinuar
          }

        >

          Continuar →

        </button>


      </div>

    </div>

  );

}


export default FocosRojosIniciales;
