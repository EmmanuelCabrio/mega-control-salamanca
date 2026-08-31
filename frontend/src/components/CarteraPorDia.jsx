import React, {
  useEffect,
  useState
} from "react";

import {
  fetchProtegido
} from "../services/authService";


// ==================================================
// 👥 CARTERA POR DÍA
// ==================================================

function CarteraPorDia() {

  // ==================================================
  // DATOS
  // ==================================================

  const [
    dias,
    setDias
  ] = useState([]);


  const [
    diaSeleccionado,
    setDiaSeleccionado
  ] = useState("");


  const [
    cargando,
    setCargando
  ] = useState(true);


  const [
    error,
    setError
  ] = useState("");


  // ==================================================
  // CARGAR DATOS
  // ==================================================

  useEffect(() => {

    async function cargarDatos() {

      try {

        setCargando(true);

        setError("");


        const respuesta =
          await fetchProtegido(
            "/api/cartera-por-dia"
          );


        if (
          !respuesta.ok
        ) {

          throw new Error(
            `Error HTTP ${respuesta.status}`
          );

        }


        const datos =
          await respuesta.json();


        if (
          !datos.correcto
        ) {

          throw new Error(
            datos.mensaje ||
            "No se pudo cargar la cartera"
          );

        }


        const registros =
          datos.dias || [];


        setDias(
          registros
        );


        // ==========================================
        // SELECCIONAR ÚLTIMO DÍA CON INFORMACIÓN
        // ==========================================

        if (
          registros.length > 0
        ) {

          const ultimoDia =
            registros[
              registros.length - 1
            ];

          setDiaSeleccionado(
            String(
              ultimoDia.dia
            )
          );

        }


      } catch (error) {

        console.error(
          "❌ Error Cartera por Día:",
          error
        );


        setError(
          "No se pudo cargar la cartera"
        );


      } finally {

        setCargando(false);

      }

    }


    cargarDatos();

  }, []);


  // ==================================================
  // DÍA ACTUAL
  // ==================================================

  const registroSeleccionado =
    dias.find(
      (registro) =>
        String(
          registro.dia
        ) ===
        String(
          diaSeleccionado
        )
    );


  // ==================================================
  // CARGANDO
  // ==================================================

  if (
    cargando
  ) {

    return (

      <section className="cartera-por-dia">

        <div className="cartera-por-dia-header">

          <div>

            <h2>
              👥 Cartera por Día
            </h2>

            <p>
              Cargando información...
            </p>

          </div>

        </div>

      </section>

    );

  }


  // ==================================================
  // ERROR
  // ==================================================

  if (
    error
  ) {

    return (

      <section className="cartera-por-dia">

        <div className="cartera-por-dia-header">

          <div>

            <h2>
              👥 Cartera por Día
            </h2>

            <p>
              🔴 {error}
            </p>

          </div>

        </div>

      </section>

    );

  }


  // ==================================================
  // RENDER
  // ==================================================

  return (

    <section className="cartera-por-dia">


      {/* ============================================
          ENCABEZADO
      ============================================ */}

      <div className="cartera-por-dia-header">

        <div>

          <h2>
            👥 Cartera por Día
          </h2>

          <p>
            Resumen de movimientos de Salamanca
          </p>

        </div>


        {/* ==========================================
            SELECTOR DE DÍA
        ========================================== */}

        <div className="cartera-por-dia-selector">

          <label htmlFor="selector-dia">

            Día

          </label>


          <select
            id="selector-dia"
            value={
              diaSeleccionado
            }
            onChange={(
              evento
            ) =>
              setDiaSeleccionado(
                evento.target.value
              )
            }
          >

            {dias.map(
              (registro) => (

                <option
                  key={
                    registro.dia
                  }
                  value={
                    registro.dia
                  }
                >

                  Día {registro.dia}

                </option>

              )
            )}

          </select>

        </div>

      </div>


      {/* ============================================
          INFORMACIÓN DEL DÍA
      ============================================ */}

      {registroSeleccionado && (

        <div className="cartera-por-dia-contenido">


          {/* ========================================
              VENTAS
          ======================================== */}

          <div className="cartera-indicador cartera-ventas">

            <span className="cartera-indicador-icono">
              🟢
            </span>

            <div>

              <span className="cartera-indicador-label">
                Ventas
              </span>

              <strong>
                {Number(
                  registroSeleccionado.ventas ?? 0
                ).toLocaleString("es-MX")}
              </strong>

            </div>

          </div>


          {/* ========================================
              RECONEXIONES
          ======================================== */}

          <div className="cartera-indicador cartera-reconexiones">

            <span className="cartera-indicador-icono">
              🔄
            </span>

            <div>

              <span className="cartera-indicador-label">
                Reconexiones
              </span>

              <strong>
                {Number(
                  registroSeleccionado.reconexiones ?? 0
                ).toLocaleString("es-MX")}
              </strong>

            </div>

          </div>


          {/* ========================================
              CORTES
          ======================================== */}

          <div className="cartera-indicador cartera-cortes">

            <span className="cartera-indicador-icono">
              ✂️
            </span>

            <div>

              <span className="cartera-indicador-label">
                Cortes
              </span>

              <strong>
                {Number(
                  registroSeleccionado.cortes ?? 0
                ).toLocaleString("es-MX")}
              </strong>

            </div>

          </div>


          {/* ========================================
              SUSPENSIONES
          ======================================== */}

          <div className="cartera-indicador cartera-suspensiones">

            <span className="cartera-indicador-icono">
              ⏸️
            </span>

            <div>

              <span className="cartera-indicador-label">
                Suspensiones
              </span>

              <strong>
                {Number(
                  registroSeleccionado.suspensiones ?? 0
                ).toLocaleString("es-MX")}
              </strong>

            </div>

          </div>


          {/* ========================================
              CANCELACIONES
          ======================================== */}

          <div className="cartera-indicador cartera-cancelaciones">

            <span className="cartera-indicador-icono">
              ❌
            </span>

            <div>

              <span className="cartera-indicador-label">
                Cancelaciones
              </span>

              <strong>
                {Number(
                  registroSeleccionado.cancelaciones ?? 0
                ).toLocaleString("es-MX")}
              </strong>

            </div>

          </div>


          {/* ========================================
              TOTAL
          ======================================== */}

          <div className="cartera-total">

            <span>
              Total movimientos
            </span>

            <strong>
              {Number(
                registroSeleccionado.total ?? 0
              ).toLocaleString("es-MX")}
            </strong>

          </div>


        </div>

      )}


      {/* ============================================
          SIN DATOS
      ============================================ */}

      {!registroSeleccionado && (

        <div className="cartera-sin-datos">

          No hay información disponible para este día.

        </div>

      )}

    </section>

  );

}


export default CarteraPorDia;
