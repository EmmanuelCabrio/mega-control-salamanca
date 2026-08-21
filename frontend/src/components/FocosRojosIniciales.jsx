import {
  calcularPrioridades,
  filtrarFocosRojos,
  ordenarPorPrioridad
} from "../utils/prioridades";


function FocosRojosIniciales({

  registros = [],

  supervisorSeleccionado = "",

  onContinuar

}) {


  // ==================================================
  // EQUIPO DEL SUPERVISOR
  // ==================================================

  const equipo =
    registros.filter(
      (promotor) =>
        promotor.supervisor ===
        supervisorSeleccionado
    );


  // ==================================================
  // CALCULAR PRIORIDADES
  // ==================================================

  const equipoConPrioridades =
    calcularPrioridades(
      equipo
    );


  // ==================================================
  // OBTENER FOCOS ROJOS
  // ==================================================

  const focosRojos =
    filtrarFocosRojos(
      equipoConPrioridades
    );


  // ==================================================
  // ORDENAR Y TOMAR LOS 2 PRIMEROS
  // ==================================================

  const lista =
    ordenarPorPrioridad(
      [...focosRojos]
    ).slice(0, 2);


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

          Estos son los 2 focos que requieren
          tu atención hoy.

        </p>


        {/* ==========================================
            LISTA
        ========================================== */}

        {lista.length > 0 ? (

          <div className="focos-rojos-iniciales-lista">

            {lista.map(
              (promotor) => (

                <div
                  key={
                    promotor.nombre
                  }

                  className="foco-rojo-inicial"
                >

                  <span className="foco-rojo-inicial-icono">

                    🔴

                  </span>


                  <strong>

                    {promotor.nombre}

                  </strong>

                </div>

              )
            )}

          </div>

        ) : (

          <div className="focos-rojos-iniciales-vacio">

            🟢

            <strong>
              ¡Excelente!
            </strong>

            <span>
              No tienes focos rojos hoy.
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
