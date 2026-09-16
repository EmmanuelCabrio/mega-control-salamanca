import {
  useCallback,
  useEffect,
  useState
} from "react";

import TeamTable
  from "./TeamTable";

import ComparativaRecuperacionMesAnterior
  from "./ComparativaRecuperacionMesAnterior";

import GestionOdc
  from "./GestionOdc";

import {
  fetchProtegido
} from "../services/authService";


function PanelRecuperacion({
  supervisor,
  onCerrarSesion,
}) {

  const [registros, setRegistros] =
    useState([]);

  const [cargando, setCargando] =
    useState(true);

  const [error, setError] =
    useState("");


  const cargarEquipo =
    useCallback(
      async () => {

        setCargando(true);
        setError("");

        try {

          const respuesta =
            await fetchProtegido(
              "/api/registros"
            );


          const resultado =
            await respuesta.json();


          if (
            !respuesta.ok ||
            !resultado.correcto
          ) {

            throw new Error(
              resultado.mensaje ||
              "No se pudo cargar la productividad del equipo."
            );

          }


          setRegistros(
            resultado.registros || []
          );

        } catch (errorCarga) {

          console.error(
            "❌ Error al cargar el equipo de Recuperación:",
            errorCarga
          );

          setError(
            errorCarga.message ||
            "No se pudo cargar la productividad del equipo."
          );

        } finally {

          setCargando(false);

        }

      },
      []
    );


  useEffect(
    () => {

      cargarEquipo();

    },
    [cargarEquipo]
  );


  return (
    <main className="panel-recuperacion">

      <header className="panel-recuperacion-header">

        <div>

          <span className="panel-recuperacion-etiqueta">
            PANEL DE RECUPERACIÓN
          </span>

          <h1>
            Hola, {supervisor || "usuario"}
          </h1>

          <p>
            Comencemos por el resultado más importante de hoy.
          </p>

        </div>


        <button
          type="button"
          onClick={onCerrarSesion}
          className="panel-recuperacion-salir"
        >
          🚪 Cerrar sesión
        </button>

      </header>


      <section className="panel-recuperacion-paso">

        <span>01</span>

        <div>

          <h2>
            ¿Cómo voy?
          </h2>

          <p>
            Productividad actual de cada integrante del equipo,
            ordenada de mayor a menor.
          </p>

        </div>

      </section>


      {cargando && (

        <section className="panel-recuperacion-estado">
          Cargando productividad del equipo…
        </section>

      )}


      {!cargando && error && (

        <section className="panel-recuperacion-estado panel-recuperacion-error">

          <p>
            {error}
          </p>

          <button
            type="button"
            onClick={cargarEquipo}
          >
            Reintentar
          </button>

        </section>

      )}


      {!cargando && !error && (

        <TeamTable
          registros={registros}
          supervisorSeleccionado={supervisor}
          modoRecuperacion
          titulo="📊 Productividad del equipo"
        />

      )}


      <section className="panel-recuperacion-paso panel-recuperacion-paso-secundario">

        <span>02</span>

        <div>

          <h2>
            ¿Cómo voy contra el mes anterior?
          </h2>

          <p>
            Compara las RX acumuladas contra el mismo día del mes anterior.
          </p>

        </div>

      </section>


      <ComparativaRecuperacionMesAnterior />


      <section className="panel-recuperacion-paso panel-recuperacion-paso-odc">

        <span>03</span>

        <div>

          <h2>
            ¿Cómo va la gestión de ODC?
          </h2>

          <p>
            Cobertura de visitas y pendientes por cada sucursal.
          </p>

        </div>

      </section>


      <GestionOdc />

    </main>
  );
}


export default PanelRecuperacion;
