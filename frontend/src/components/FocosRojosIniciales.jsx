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
  // NORMALIZAR ROL
  // ==================================================

  const rolNormalizado =
    String(
      rolUsuario ?? ""
    )
      .trim()
      .toUpperCase()
      .normalize("NFD")
      .replace(
        /[\u0300-\u036f]/g,
        ""
      );


  // ==================================================
  // FILTRAR REGISTROS VÁLIDOS
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
  // IDENTIFICAR DIRECCIÓN
  //
  // PRIMERA OPCIÓN:
  // EL ROL DICE DIRECCIÓN
  //
  // SEGUNDA OPCIÓN:
  // NO HAY SUPERVISOR SELECCIONADO
  // PERO YA TENEMOS REGISTROS
  // ==================================================

  const esDireccion =
    rolNormalizado === "DIRECCION" ||
    (
      String(
        supervisorSeleccionado ?? ""
      ).trim() === "" &&
      registrosValidos.length > 0
    );


  // ==================================================
  // LISTA FINAL
  // ==================================================

  let lista = [];


  // ==================================================
  // 👨‍💼 CASO SUPERVISOR
  // ==================================================

  if (!esDireccion) {


    // ================================================
    // EQUIPO DEL SUPERVISOR
    // ================================================

    const supervisorActual =
      String(
        supervisorSeleccionado ?? ""
      ).trim();


    const equipo =
      registrosValidos.filter(
        (promotor) => {

          const supervisor =
            String(
              promotor.supervisor ?? ""
            ).trim();


          return (
            supervisor ===
            supervisorActual
          );

        }
      );


    // ================================================
    // CALCULAR PRIORIDADES
    // ================================================

    const equipoConPrioridades =
      calcularPrioridades(
        equipo
      );


    // ================================================
    // FOCOS ROJOS
    // ================================================

    const focosRojos =
      filtrarFocosRojos(
        equipoConPrioridades
      );


    // ================================================
    // MÁS CRÍTICO
    // ================================================

    lista =
      ordenarPorPrioridad(
        [...focosRojos]
      ).slice(
        0,
        1
      );

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
    // RECORRER CADA SUPERVISOR
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
            // ORDENAR POR PRIORIDAD
            // ========================================

            const ordenados =
              ordenarPorPrioridad(
                [...focosRojos]
              );


            // ========================================
            // TOMAR EL MÁS CRÍTICO
            // ========================================

            const focoMasCritico =
              ordenados[0];


            // ========================================
            // SI NO TIENE FOCO
            // NO MOSTRAR
            // ========================================

            if (
              !focoMasCritico
            ) {

              return null;

            }


            // ========================================
            // DEVOLVER INFORMACIÓN
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
            SUBTÍTULO
        ========================================== */}

        <p className="focos-rojos-iniciales-subtitulo">

          {esDireccion

            ? "Estos son los focos rojos de tus supervisores para hoy."

            : "Este es el foco rojo que requiere tu atención hoy."

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

          // ==========================================
          // SIN FOCOS
          // ==========================================

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
