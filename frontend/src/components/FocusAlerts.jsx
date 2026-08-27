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
  //
  // IMPORTANTE:
  // Esto es independiente de las ausencias.
  //
  // Si damos "Siguiente foco rojo", guardamos aquí
  // el nombre del promotor actual para que no vuelva
  // a aparecer durante este ciclo.
  //
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
  //
  // Un foco NO está disponible si:
  //
  // 1. Está marcado como ausencia
  // 2. Ya fue omitido con "Siguiente foco rojo"
  //
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
  // FOCOS OMITIDOS MANUALMENTE
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
  //
  // Simplemente marcamos el foco actual como omitido.
  //
  // React actualiza el estado.
  //
  // Entonces focosDisponibles vuelve a calcularse
  // y automáticamente aparece el siguiente foco.
  //
  // ==================================================

  function siguienteFocoRojo() {

    if (!focoPrioritario) {
      return false;
    }


    const nombre =
      focoPrioritario.nombre;


    setFocosOmitidos((actual) => ({
      ...actual,
      [nombre]: true
    }));


    return true;

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
          FOCOS SALTADOS CON SIGUIENTE
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
