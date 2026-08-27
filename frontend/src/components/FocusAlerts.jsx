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

  const equipo = registros.filter(
    (promotor) =>
      promotor.supervisor === supervisorSeleccionado
  );


  // ==================================================
  // OBTENER FOCOS ROJOS
  // ==================================================

  const focosRojos = filtrarFocosRojos(
    calcularPrioridades(equipo)
  );


  // ==================================================
  // FOCOS DISPONIBLES
  // ==================================================

  const focosDisponibles = focosRojos.filter(
    (promotor) =>
      !ausencias[promotor.nombre]
  );


  // ==================================================
  // FOCO PRIORITARIO
  // ==================================================

  const focoPrioritario =
    ordenarPorPrioridad(
      [...focosDisponibles]
    )[0];


  // ==================================================
  // FOCOS OMITIDOS POR AUSENCIA
  // ==================================================

  const focosAusentes = focosRojos.filter(
    (promotor) =>
      ausencias[promotor.nombre]
  );


  // ==================================================
  // MARCAR AUSENCIA
  // ==================================================

  function manejarAusencia(nombre, motivo) {

    if (typeof setAusencias !== "function") {
      return;
    }

    setAusencias((actual) => ({
      ...actual,
      [nombre]: motivo
    }));

  }


  // ==================================================
  // QUITAR AUSENCIA
  // ==================================================

  function quitarAusencia(nombre) {

    if (typeof setAusencias !== "function") {
      return;
    }

    setAusencias((actual) => {

      const nuevo = {
        ...actual
      };

      delete nuevo[nombre];

      return nuevo;

    });

  }


  // ==================================================
  // RENDER
  // ==================================================

  return (

    <div className="focus-alerts">

      <h2>
        🚨 Focos Rojos
      </h2>


      <p className="subtitulo-focos">

        🎯 1 foco prioritario para hoy,
        si no está pasa al que sigue.

      </p>


      {/* ============================================
          FOCOS OMITIDOS
      ============================================ */}

      {focosAusentes.length > 0 && (

        <p className="focos-resumen">

          ⏭️ {focosAusentes.length}{" "}

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

      {!focoPrioritario ? (

        <p className="sin-focos">

          🟢 ¡Excelente!
          No hay focos rojos disponibles.

        </p>

      ) : (

        <AlertCard

          key={focoPrioritario.nombre}

          promotor={focoPrioritario}

          ausencia={
            ausencias[focoPrioritario.nombre]
          }

          onAusencia={
            manejarAusencia
          }

          onQuitarAusencia={
            quitarAusencia
          }

          onIniciarSeguimiento={
            onIniciarSeguimiento
          }

        />

      )}

    </div>

  );

}


export default FocusAlerts;
