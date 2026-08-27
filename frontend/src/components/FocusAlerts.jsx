import { useState } from "react";
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
  // ESTADO — FOCOS ROJOS OMITIDOS
  // ==================================================

  const [focosOmitidos, setFocosOmitidos] = useState({});


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
      !ausencias[promotor.nombre] &&
      !focosOmitidos[promotor.nombre]
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
  // FOCOS SALTADOS MANUALMENTE
  // ==================================================

  const focosSaltados = focosRojos.filter(
    (promotor) =>
      focosOmitidos[promotor.nombre]
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
  // ➡️ SIGUIENTE FOCO ROJO
  // ==================================================

  function siguienteFocoRojo() {

    if (!focoPrioritario) {
      return;
    }

    const nombre =
      focoPrioritario.nombre;

    setFocosOmitidos((actual) => ({
      ...actual,
      [nombre]: true
    }));

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
          FOCOS OMITIDOS POR AUSENCIA
      ============================================ */}

      {focosAusentes.length > 0 && (

        <p className="focos-resumen">

          🚫 {focosAusentes.length}{" "}

          {focosAusentes.length === 1
            ? "foco no disponible"
            : "focos no disponibles"
          }

        </p>

      )}


      {/* ============================================
          FOCOS SALTADOS
      ============================================ */}

      {focosSaltados.length > 0 && (

        <p className="focos-resumen">

          ⏭️ {focosSaltados.length}{" "}

          {focosSaltados.length === 1
            ? "foco omitido"
            : "focos omitidos"
          }

          {" "}con "Siguiente foco rojo"

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

          onSiguienteFoco={
            siguienteFocoRojo
          }

        />

      )}

    </div>

  );

}


export default FocusAlerts;
