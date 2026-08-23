import {
  calcularPrioridades,
  filtrarFocosRojos,
  ordenarPorPrioridad
} from "../utils/prioridades";


function FocosRojosIniciales({

  registros = [],

  supervisorSeleccionado = "",

  rolUsuario = "",

  onContinuar

}) {


  // ==================================================
  // IDENTIFICAR SI ES DIRECCIÓN
  // ==================================================

  const esDireccion =
    String(
      rolUsuario ?? ""
    )
      .trim()
      .toUpperCase() ===
    "DIRECCIÓN";


  // ==================================================
  // FILTRAR REGISTROS VÁLIDOS
  // Evitamos nombres / supervisores "0"
  // ==================================================

  const registrosValidos =
    registros.filter(
      (promotor) => {

        const nombre =
          String(
            promotor.nombre ?? ""
          ).trim();


        const supervisor =
          String(
            promotor.supervisor ?? ""
          ).trim();


        return (

          nombre !== "" &&

          nombre !== "0" &&

          supervisor !== "" &&

          supervisor !== "0"

        );

      }
    );


  // ==================================================
  // OBTENER FOCOS ROJOS
  // ==================================================

  let lista = [];


  // ==================================================
  // 👨‍💼 CASO SUPERVISOR
  // ==================================================

  if (!esDireccion) {


    // ================================================
    // EQUIPO DEL SUPERVISOR LOGUEADO
    // ================================================

    const equipo =
      registrosValidos.filter(
        (promotor) =>

          String(
            promotor.supervisor ?? ""
          ).trim() ===

          String(
            supervisorSeleccionado ?? ""
          ).trim()

      );


    // ================================================
    // CALCULAR PRIORIDADES
    // ================================================

    const equipoConPrioridades =
      calcularPrioridades(
        equipo
      );


    // ================================================
    // OBTENER FOCOS ROJOS
    // ================================================

    const focosRojos =
      filtrarFocosRojos(
        equipoConPrioridades
      );


    // ================================================
    // ORDENAR Y TOMAR EL MÁS CRÍTICO
    // ================================================

    lista =
      ordenarPorPrioridad(
        [...focosRojos]
      )
      .slice(0, 1);

  }


  // ==================================================
  // 👔 CASO DIRECCIÓN
  // ==================================================

  else {


    // ================================================
    // OBTENER SUPERVISORES ÚNICOS
    // ================================================

    const supervisores = [

      ...new Set(

        registrosValidos

          .map(
            (promotor) =>

              String(
                promotor.supervisor ?? ""
              ).trim()

          )

          .filter(
            (supervisor) =>

              supervisor !== "" &&

              supervisor !== "0"

          )

      )

    ];


    // ================================================
    // OBTENER 1 FOCO POR SUPERVISOR
    // ================================================

    lista =

      supervisores

        .map(
          (supervisor) => {


            // ========================================
            // EQUIPO DEL SUPERVISOR
            // ========================================

            const equipo =
              registrosValidos.filter(
                (promotor) =>

                  String(
                    promotor.supervisor ?? ""
                  ).trim() ===
                  supervisor

              );


            // ========================================
            // CALCULAR PRIORIDADES
            // ========================================

            const equipoConPrioridades =
              calcularPrioridades(
                equipo
              );


            // ========================================
            // OBTENER FOCOS ROJOS
            // ========================================

            const focosRojos =
              filtrarFocosRojos(
                equipoConPrioridades
              );


            // ========================================
            // TOMAR EL MÁS CRÍTICO
            // ========================================

            const focoMasCritico =
              ordenarPorPrioridad(
                [...focosRojos]
              )[0];


            // ========================================
            // SI NO HAY FOCO
            // ========================================

            if (
              !focoMasCritico
            ) {

              return null;

            }


            // ========================================
            // DEVOLVER FOCO + SUPERVISOR
            // ========================================

            return {

              ...focoMasCritico,

              supervisor

            };

          }

        )

        .filter(
          Boolean
        );

  }


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

          {esDireccion

            ? "Estos son los focos rojos de tus supervisores para hoy."

            : "Estos son los focos que requieren tu atención hoy."

          }

        </p>


        {/* ==========================================
            LISTA
        ========================================== */}

        {lista.length > 0 ? (

          <div className="focos-rojos-iniciales-lista">

            {lista.map(

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


                    {/* ==================================
                        SUPERVISOR
                        SOLO DIRECCIÓN
                    ================================== */}

                    {esDireccion && (

                      <strong>

                        {promotor.supervisor}

                      </strong>

                    )}


                    {/* ==================================
                        PROMOTOR
                    ================================== */}

                    <div>

                      {promotor.nombre}

                    </div>


                    {/* ==================================
                        MOTIVO
                    ================================== */}

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

              {esDireccion

                ? "Ninguno de tus supervisores tiene focos rojos hoy."

                : "No tienes focos rojos hoy."

              }

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
