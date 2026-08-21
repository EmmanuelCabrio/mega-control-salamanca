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


      {/* ============================================
          TÍTULO
      ============================================ */}

      <h1>
        🔴 Focos Rojos
      </h1>


      <p>
        Estos son los 2 focos prioritarios
        que requieren tu atención hoy.
      </p>


      {/* ============================================
          LISTA
      ============================================ */}

      {lista.length > 0 ? (

        <div className="focos-rojos-iniciales-lista">

          {lista.map(
            (
              promotor
              
            ) => (

              <div
                key={
                  promotor.nombre
                }

                className="foco-rojo-inicial"
              >

                <span>
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

        <p>
          🟢 ¡Excelente!
          No tienes focos rojos hoy.
        </p>

      )}


      {/* ============================================
          CONTINUAR
      ============================================ */}

      <button

        type="button"

        onClick={
          onContinuar
        }

      >

        Continuar →

      </button>


    </div>

  );

}


export default FocosRojosIniciales;
