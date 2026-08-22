import { useState } from "react";


function AlertCard({
  promotor,
  ausencia,
  onAusencia,
  onQuitarAusencia,
  onIniciarSeguimiento
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
  // CHECKLIST
  // ==================================================

  const [
    checklist,
    setChecklist
  ] = useState({

    causaIdentificada: false,

    actividadRevisada: false,

    retroalimentacionRealizada: false,

    accionDefinida: false

  });


  // ==================================================
  // MOSTRAR CHECKLIST
  // ==================================================

  const [
    mostrarChecklist,
    setMostrarChecklist
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
  // ACTUALIZAR CHECKLIST
  // ==================================================

  function cambiarChecklist(
    campo
  ) {

    setChecklist(
      (actual) => ({

        ...actual,

        [campo]:
          !actual[campo]

      })
    );

  }


  // ==================================================
  // VALIDAR CHECKLIST
  // ==================================================

  const checklistCompleto =

    checklist.causaIdentificada &&

    checklist.actividadRevisada &&

    checklist.retroalimentacionRealizada &&

    checklist.accionDefinida;


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
              CHECKLIST
          ======================================== */}

          <div className="seguimiento-container">


            <button

              type="button"

              className="boton-checklist"

            onClick={() =>
                 onIniciarSeguimiento(
                  promotor
                )
              }

            >

              {mostrarChecklist

                ? "🔼 Ocultar checklist"

                : "☑️ Iniciar seguimiento"

              }

            </button>


            {/* ======================================
                CHECKLIST
            ====================================== */}

            {mostrarChecklist && (

              <div className="checklist-foco">


                <h3>

                  ☑️ Checklist de intervención

                </h3>


                <p className="checklist-intro">

                  Antes de definir el compromiso,
                  asegúrate de haber revisado
                  estos puntos.

                </p>


                {/* ==================================
                    PUNTO 1
                ================================== */}

                <label className="checklist-item">

                  <input

                    type="checkbox"

                    checked={
                      checklist.causaIdentificada
                    }

                    onChange={() =>
                      cambiarChecklist(
                        "causaIdentificada"
                      )
                    }

                  />

                  <span>

                    🔎 Identifiqué la causa
                    principal del foco rojo.

                  </span>

                </label>


                {/* ==================================
                    PUNTO 2
                ================================== */}

                <label className="checklist-item">

                  <input

                    type="checkbox"

                    checked={
                      checklist.actividadRevisada
                    }

                    onChange={() =>
                      cambiarChecklist(
                        "actividadRevisada"
                      )
                    }

                  />

                  <span>

                    📋 Revisé su actividad
                    y desempeño.

                  </span>

                </label>


                {/* ==================================
                    PUNTO 3
                ================================== */}

                <label className="checklist-item">

                  <input

                    type="checkbox"

                    checked={
                      checklist.retroalimentacionRealizada
                    }

                    onChange={() =>
                      cambiarChecklist(
                        "retroalimentacionRealizada"
                      )
                    }

                  />

                  <span>

                    🗣️ Realicé una
                    retroalimentación directa.

                  </span>

                </label>


                {/* ==================================
                    PUNTO 4
                ================================== */}

                <label className="checklist-item">

                  <input

                    type="checkbox"

                    checked={
                      checklist.accionDefinida
                    }

                    onChange={() =>
                      cambiarChecklist(
                        "accionDefinida"
                      )
                    }

                  />

                  <span>

                    🎯 Identifiqué el área
                    específica que debe mejorar.

                  </span>

                </label>


                {/* ==================================
                    AVANCE DEL CHECKLIST
                ================================== */}

                <div className="checklist-progreso">

                  {Object.values(
                    checklist
                  ).filter(Boolean).length}

                  {" / "}

                  {Object.keys(
                    checklist
                  ).length}

                  {" "}completados

                </div>


                {/* ==================================
                    CONTINUAR
                ================================== */}

                <button

                  type="button"

                  className="boton-continuar-compromiso"

                  disabled={
                    !checklistCompleto
                  }

                  onClick={() => {

                    console.log(
                      "Checklist completado para:",
                      promotor.nombre
                    );

                  }}

                >

                  {checklistCompleto

                    ? "🎯 Continuar con compromiso →"

                    : "🔒 Completa el checklist"

                  }

                </button>


              </div>

            )}

          </div>


          {/* ========================================
              AUSENCIA
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
