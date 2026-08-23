import AlertCard from "./AlertCard";

import {
  calcularPrioridades,
  filtrarFocosRojos,
  ordenarPorPrioridad
} from "../utils/prioridades";


function FocusAlerts({
  registros = [],
  supervisorSeleccionado = "",
  ausencias = {},
  setAusencias,
  onIniciarSeguimiento
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
  // OBTENER TODOS LOS FOCOS ROJOS
  // ==================================================

  const focosRojos =
    filtrarFocosRojos(
      equipoConPrioridades
    );


  // ==================================================
  // QUITAR TEMPORALMENTE LOS AUSENTES
  // ==================================================

  const focosDisponibles =
    focosRojos.filter(
      (promotor) =>
        !ausencias[
          promotor.nombre
        ]
    );


  // ==================================================
  // ORDENAR POR PRIORIDAD
  // Y MOSTRAR SOLAMENTE EL PRIMERO
  // ==================================================

  const lista =
    ordenarPorPrioridad(
      [...focosDisponibles]
    ).slice(0, 1);


  // ==================================================
  // CONTAR FOCOS QUE FUERON OMITIDOS
  // ==================================================

  const focosAusentes =
    focosRojos.filter(
      (promotor) =>
        ausencias[
          promotor.nombre
        ]
    );


  // ==================================================
  // MARCAR AUSENCIA
  // ==================================================

  function manejarAusencia(
    nombre,
    motivo
  ) {

    if (
      typeof setAusencias !==
      "function"
    ) {

      return;

    }


    setAusencias(
      (actual) => ({

        ...actual,

        [nombre]:
          motivo

      })
    );

  }


  // ==================================================
  // QUITAR AUSENCIA
  // ==================================================

  function quitarAusencia(
    nombre
  ) {

    if (
      typeof setAusencias !==
      "function"
    ) {

      return;

    }


    setAusencias(
      (actual) => {

        const nuevo = {
          ...actual
        };


        delete nuevo[
          nombre
        ];


        return nuevo;

      }
    );

  }


  // ==================================================
  // RENDER
  // ==================================================

  return (

    <div className="focus-alerts">


      {/* ============================================
          TÍTULO
      ============================================ */}

      <h2>
        🚨 Focos Rojos
      </h2>


      <p className="subtitulo-focos">

        🎯 2 focos prioritarios para hoy

      </p>


      {/* ============================================
          AVISO DE AUSENCIAS
      ============================================ */}

      {focosAusentes.length > 0 && (

        <p className="focos-resumen">

          ⏭️{" "}

          {focosAusentes.length}

          {" "}

          {focosAusentes.length === 1
            ? "foco omitido"
            : "focos omitidos"
          }

          {" "}por ausencia

        </p>

      )}


      {/* ============================================
          SIN FOCOS
      ============================================ */}

      {lista.length === 0 ? (

        <p className="sin-focos">

          🟢 ¡Excelente!
          No hay focos rojos disponibles.

        </p>

      ) : (


        /* ==========================================
           MOSTRAR LOS 2 FOCOS
        ========================================== */

        lista.map(
          (promotor) => (

            <AlertCard

              key={
                promotor.nombre
              }

              promotor={
                promotor
              }


              // ======================================
              // NUEVO
              // ESTADO DE AUSENCIA
              // ======================================

              ausencia={
                ausencias[
                  promotor.nombre
                ]
              }


              // ======================================
              // NUEVO
              // MARCAR AUSENCIA
              // ======================================

              onAusencia={
                manejarAusencia
              }


              // ======================================
              // NUEVO
              // QUITAR AUSENCIA
              // ======================================

              onQuitarAusencia={
                quitarAusencia
              }

              onIniciarSeguimiento={
  onIniciarSeguimiento
}

            />

          )

        )

      )}

    </div>

  );

}


export default FocusAlerts;
