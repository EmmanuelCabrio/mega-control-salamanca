import { useEffect, useState } from "react";
import { fetchProtegido } from "../services/authService";

import TeamTable from "./TeamTable";
import ComparativaRecuperacionMesAnterior from "./ComparativaRecuperacionMesAnterior";
import RecuperacionVsPresupuesto from "./RecuperacionVsPresupuesto";
import GestionOdc from "./GestionOdc";
import GestionPorMotivo from "./GestionPorMotivo";
import RecuperacionYCortes from "./RecuperacionYCortes";
import AnalisisSabanaRecuperacion from "./AnalisisSabanaRecuperacion";

function PanelRecuperacion({
  desdeDireccion,
  onCerrarSesion,
  onRegresarDireccion,
}) {
  const [equipo, setEquipo] = useState(null);
  const [errorEquipo, setErrorEquipo] = useState("");

  useEffect(() => {
    const controlador = new AbortController();

    async function cargarEquipo() {
      try {
        const ruta = desdeDireccion
          ? "/api/registros?equipo=recuperacion"
          : "/api/registros";

        const respuesta = await fetchProtegido(ruta, {
          signal: controlador.signal,
        });
        const datos = await respuesta.json();

        if (!respuesta.ok || !datos.correcto) {
          throw new Error(
            datos.mensaje || "No se pudo cargar el equipo de Recuperación."
          );
        }

        if (!controlador.signal.aborted) {
          setEquipo(datos);
        }
      } catch (error) {
        if (!controlador.signal.aborted) {
          setErrorEquipo(error.message);
        }
      }
    }

    cargarEquipo();
    return () => controlador.abort();
  }, [desdeDireccion]);

  return (
    <main className="panel-recuperacion">
      <header className="panel-recuperacion-header">
        <div>
          <span className="panel-recuperacion-etiqueta">
            PANEL DE RECUPERACIÓN
          </span>

          <h1>
            {equipo ? `Hola, ${equipo.supervisor}` : "Equipo de Recuperación"}
          </h1>

          <p>Comencemos por el resultado más importante de hoy.</p>
        </div>

        <div className="panel-recuperacion-acciones">
          {onRegresarDireccion && (
            <button
              type="button"
              onClick={onRegresarDireccion}
              className="panel-recuperacion-regresar"
            >
              ← Volver a Dirección
            </button>
          )}

          <button
            type="button"
            onClick={onCerrarSesion}
            className="panel-recuperacion-salir"
          >
            🚪 Cerrar sesión
          </button>
        </div>
      </header>

      <section className="panel-recuperacion-paso">
        <span>01</span>
        <div>
          <h2>¿Cómo voy?</h2>
          <p>
            Productividad actual de cada integrante del equipo, ordenada de
            mayor a menor.
          </p>
        </div>
      </section>

      {errorEquipo && <p role="alert">{errorEquipo}</p>}

      {!equipo && !errorEquipo && (
        <p role="status">Cargando equipo de Recuperación…</p>
      )}

      {equipo && (
        <TeamTable
          registros={equipo.registros}
          supervisorSeleccionado={equipo.supervisor}
          modoRecuperacion
          titulo="📊 Productividad del equipo"
        />
      )}

      <section className="panel-recuperacion-paso panel-recuperacion-paso-secundario">
        <span>02</span>
        <div>
          <h2>¿Cómo voy contra el mes anterior?</h2>
          <p>Compara las RX acumuladas contra el mismo día del mes anterior.</p>
        </div>
      </section>

      <ComparativaRecuperacionMesAnterior />

      <section className="panel-recuperacion-paso panel-recuperacion-paso-presupuesto">
        <span>03</span>
        <div>
          <h2>¿Cómo voy contra mi presupuesto?</h2>
          <p>Avance de recuperación, faltante y ritmo diario para cumplir la meta.</p>
        </div>
      </section>

      <RecuperacionVsPresupuesto />

      <section className="panel-recuperacion-paso panel-recuperacion-paso-cortes">
        <span>04</span>
        <div>
          <h2>¿Cómo va la recuperación y los cortes?</h2>
          <p>Resultado con esfuerzo, sin esfuerzo y comparación contra el mes anterior.</p>
        </div>
      </section>

      <RecuperacionYCortes />

      <section className="panel-recuperacion-paso panel-recuperacion-paso-odc">
        <span>05</span>
        <div>
          <h2>¿Cómo va la gestión de ODC?</h2>
          <p>Cobertura de visitas y pendientes por cada sucursal.</p>
        </div>
      </section>

      <GestionOdc />

      <section className="panel-recuperacion-paso panel-recuperacion-paso-gestion-motivo">
        <span>06</span>
        <div>
          <h2>¿Qué resultado están dejando las visitas?</h2>
          <p>Distribución de suscriptores por cada tipo de gestión registrada.</p>
        </div>
      </section>

      <GestionPorMotivo />

      <section className="panel-recuperacion-paso panel-recuperacion-paso-analisis">
        <span>07</span>
        <div>
          <h2>¿Dónde se concentran los cortes?</h2>
          <p>Analiza colonias por sucursal y número de visitas realizadas.</p>
        </div>
      </section>

      <AnalisisSabanaRecuperacion />
    </main>
  );
}

export default PanelRecuperacion;
