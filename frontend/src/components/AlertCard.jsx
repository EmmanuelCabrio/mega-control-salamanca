import { useState } from "react";


function AlertCard({

  promotor,

  ausencia,

  onAusencia,

  onQuitarAusencia

}) {


  // ==================================================
  // ESTADOS
  // ==================================================

  const [
    mostrarDetalle,
    setMostrarDetalle
  ] = useState(false);


  const [
    mostrarAusencia,
    setMostrarAusencia
  ] = useState(false);


  // ==================================================
  // SELECCIONAR MOTIVO DE AUSENCIA
  // ==================================================

  function seleccionarMotivo(
    motivo
  ) {

    if (
      typeof onAusencia ===
      "function"
    ) {

      onAusencia(
        promotor.nombre,
        motivo
      );

    }


    setMostrarAusencia(
      false
    );

  }


  // ==================================================
  // QUITAR AUSENCIA
  // ==================================================

  function volverDisponible() {

    if (
      typeof onQuitarAusencia ===
      "function"
    ) {

      onQuitarAusencia(
        promotor.nombre
      );

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

            className="boton-regresar-ausencia"

            onClick={
              volverDisponible
            }

          >

            ↩️ Disponible

          </button>

        </div>

      )}


      {/* ============================================
          BOTÓN VER DETALLE
      ============================================ */}

      <button

        className="boton-detalle"

        onClick={() =>
          setMostrarDetalle(
            !mostrarDetalle
          )
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
                promotor.productividad
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

              {promotor.diasSinVenta}

            </strong>

          </p>


          {/* ========================================
              RECUPERACIONES
          ======================================== */}

          <p>

            🔄 Recuperaciones:

            {" "}

            <strong>

              {promotor.recuperaciones}

            </strong>

          </p>


          {/* ========================================
              MOTIVOS
          ======================================== */}

          {promotor.detalles &&

            promotor.detalles.length > 0 && (

              <div className="motivos-alerta">

                <strong>

                  ⚠️ Motivo de atención:

                </strong>


                <ul>

                  {promotor.detalles.map(
                    (
                      detalle,
                      index
                    ) => (

                      <li
                        key={index}
                      >

                        {detalle}

                      </li>

                    )
                  )}

                </ul>

              </div>

            )}


          {/* ========================================
              MARCAR AUSENCIA
          ======================================== */}

          {!ausencia && (

            <div className="ausencia-container">


              <button

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
                  OPCIONES DE AUSENCIA
              ================================== */}

              {mostrarAusencia && (

                <div className="motivos-ausencia">


                  <button

                    onClick={() =>
                      seleccionarMotivo(
                        "Falta"
                      )
                    }

                  >

                    ❌ Falta

                  </button>


                  <button

                    onClick={() =>
                      seleccionarMotivo(
                        "Incapacidad"
                      )
                    }

                  >

                    🏥 Incapacidad

                  </button>


                  <button

                    onClick={() =>
                      seleccionarMotivo(
                        "Vacaciones"
                      )
                    }

                  >

                    🏖️ Vacaciones

                  </button>


                  <button

                    onClick={() =>
                      seleccionarMotivo(
                        "Permiso"
                      )
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