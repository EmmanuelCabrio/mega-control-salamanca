import { useState } from "react";


function AlertCard({
  promotor,
  ausencia,
  onAusencia,
  onQuitarAusencia,
  onIniciarSeguimiento,
  onSiguienteFoco
}) {

  // ==================================================
  // ESTADO — MOSTRAR / OCULTAR DETALLE
  // ==================================================

  const [mostrarDetalle, setMostrarDetalle] = useState(false);


  // ==================================================
  // ESTADO — MOSTRAR / OCULTAR MOTIVOS DE AUSENCIA
  // ==================================================

  const [mostrarAusencia, setMostrarAusencia] = useState(false);


  // ==================================================
  // SELECCIONAR MOTIVO DE AUSENCIA
  // ==================================================

  function seleccionarMotivo(motivo) {

    if (typeof onAusencia === "function") {

      onAusencia(
        promotor.nombre,
        motivo
      );

    }

    setMostrarAusencia(false);
  }


  // ==================================================
  // QUITAR AUSENCIA
  // ==================================================

  function volverDisponible() {

    if (typeof onQuitarAusencia === "function") {

      onQuitarAusencia(
        promotor.nombre
      );

    }

  }


  // ==================================================
  // INICIAR SEGUIMIENTO
  // ==================================================

  function iniciarSeguimiento() {

    if (typeof onIniciarSeguimiento === "function") {

      onIniciarSeguimiento(promotor);

    }

  }


  // ==================================================
  // ➡️ SIGUIENTE FOCO ROJO
  // ==================================================

  function siguienteFocoRojo() {

    if (typeof onSiguienteFoco === "function") {

      onSiguienteFoco();

    }

  }


  // ==================================================
  // RENDER
  // ==================================================

  return (

    <div className="alerta">


      {/* ============================================
          NOMBRE DEL PROMOTOR
      ============================================ */}

      <strong>

        🔴 {promotor.nombre}

      </strong>


      {/* ============================================
          ESTADO DE AUSENCIA
      ============================================ */}

      {ausencia && (

        <div className="ausencia-activa">

          🚫 No disponible:

          {" "}

          <strong>
            {ausencia}
          </strong>


          <button
            type="button"
            className="boton-regresar-ausencia"
            onClick={volverDisponible}
          >

            ↩️ Disponible

          </button>

        </div>

      )}


      {/* ============================================
          BOTÓN VER DETALLE
      ============================================ */}

      <button
        type="button"
        className="boton-detalle"
        onClick={() =>
          setMostrarDetalle(!mostrarDetalle)
        }
      >

        {mostrarDetalle
          ? "🔼 Ocultar detalle"
          : "🔎 Ver detalle"
        }

      </button>


      {/* ============================================
          DETALLE
      ============================================ */}

      {mostrarDetalle && (

        <div className="detalle-alerta">


          {/* ========================================
              PRODUCTIVIDAD
          ======================================== */}

          <p>

            📈 Productividad:

            {" "}

            <strong>

              {Number(
                promotor.productividad ?? 0
              ).toFixed(2)}

            </strong>

          </p>


          {/* ========================================
              DÍAS SIN VENTA
          ======================================== */}

          <p>

            📅 Días sin venta:

            {" "}

            <strong>

              {promotor.diasSinVenta ?? 0}

            </strong>

          </p>


          {/* ========================================
              RECUPERACIONES
          ======================================== */}

          <p>

            🔄 Recuperaciones:

            {" "}

            <strong>

              {promotor.recuperaciones ?? 0}

            </strong>

          </p>


          {/* ========================================
              MOTIVOS DE ATENCIÓN
          ======================================== */}

          {promotor.detalles &&
            promotor.detalles.length > 0 && (

              <div className="motivos-alerta">

                <strong>

                  ⚠️ Motivo de atención:

                </strong>


                <ul>

                  {promotor.detalles.map(
                    (detalle, index) => (

                      <li key={index}>

                        {detalle}

                      </li>

                    )
                  )}

                </ul>

              </div>

            )}


          {/* ========================================
              BOTONES DE ACCIÓN
          ======================================== */}

          <div className="seguimiento-container">


            {/* ======================================
                ☑️ INICIAR SEGUIMIENTO
            ====================================== */}

            <button
              type="button"
              className="boton-checklist"
              onClick={iniciarSeguimiento}
            >

              ☑️ Iniciar seguimiento

            </button>


            {/* ======================================
                ➡️ SIGUIENTE FOCO ROJO
            ====================================== */}

              <button
            type="button"
           className="boton-checklist"
           onClick={siguienteFocoRojo}
            >
            ➡️ Siguiente foco rojo
             </button>

          {/* ========================================
              🚫 MARCAR AUSENCIA
          ======================================== */}

          {!ausencia && (

            <div className="ausencia-container">


              <button
                type="button"
                className="boton-ausencia"
                onClick={() =>
                  setMostrarAusencia(
                    !mostrarAusencia
                  )
                }
              >

                🚫 Marcar no disponible

              </button>


              {/* ==================================
                  MOTIVOS DE AUSENCIA
              ================================== */}

              {mostrarAusencia && (

                <div className="motivos-ausencia">


                  <button
                    type="button"
                    onClick={() =>
                      seleccionarMotivo("Falta")
                    }
                  >

                    ❌ Falta

                  </button>


                  <button
                    type="button"
                    onClick={() =>
                      seleccionarMotivo("Incapacidad")
                    }
                  >

                    🏥 Incapacidad

                  </button>


                  <button
                    type="button"
                    onClick={() =>
                      seleccionarMotivo("Vacaciones")
                    }
                  >

                    🏖️ Vacaciones

                  </button>


                  <button
                    type="button"
                    onClick={() =>
                      seleccionarMotivo("Permiso")
                    }
                  >

                    📄 Permiso

                  </button>


                </div>

              )}

            </div>

          )}

        </div>

      )}

    </div>

  );

}


export default AlertCard;
