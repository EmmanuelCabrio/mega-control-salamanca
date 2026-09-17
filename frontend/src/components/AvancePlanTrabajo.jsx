import {
  useEffect,
  useState,
} from "react";

import {
  fetchProtegido,
} from "../services/authService";


const formatearNumero =
  (valor) =>
    Number(
      valor || 0
    ).toLocaleString(
      "es-MX"
    );


function AvancePlanTrabajo() {

  const [
    resumen,
    setResumen,
  ] = useState(null);


  const [
    cargando,
    setCargando,
  ] = useState(true);


  const [
    error,
    setError,
  ] = useState("");


  // ==================================================
  // CARGAR AVANCE
  // ==================================================

  useEffect(() => {

    async function cargarResumen() {

      try {

        setCargando(true);

        setError("");


        const respuesta =
          await fetchProtegido(
            "/api/avance-plan-trabajo"
          );


        const datos =
          await respuesta.json();


        if (
          !respuesta.ok ||
          !datos.correcto
        ) {

          throw new Error(
            datos.mensaje ||
            "No se pudo cargar el avance"
          );

        }


        setResumen(
          datos.supervisor || null
        );

      } catch (errorCarga) {

        console.error(
          "❌ Error avance Plan de Trabajo:",
          errorCarga
        );


        setError(
          errorCarga.message ||
          "No se pudo cargar el avance"
        );

      } finally {

        setCargando(false);

      }

    }


    cargarResumen();

  }, []);


  // ==================================================
  // ESTADO DE CARGA
  // ==================================================

  if (cargando) {

    return (

      <section className="avance-plan-estado">

        Cargando avance del Plan de Trabajo…

      </section>

    );

  }


  // ==================================================
  // ERROR O SIN INFORMACIÓN
  // ==================================================

  if (
    error ||
    !resumen
  ) {

    return (

      <section
        className="
          avance-plan-estado
          avance-plan-error
        "
      >

        {
          error ||
          "No hay información del Plan de Trabajo para este supervisor."
        }

      </section>

    );

  }


  // ==================================================
  // CÁLCULOS VISUALES
  // ==================================================

  const avance =
    Number(
      resumen.avancePorcentaje ||
      0
    );


  const avanceBarra =
    Math.min(
      Math.max(
        avance,
        0
      ),
      100
    );


  const diferencia =
    Number(
      resumen.diferencia ||
      0
    );


  // ==================================================
  // RENDER
  // ==================================================

  return (

    <section className="avance-plan-card">


      {/* ==========================================
          ENCABEZADO
      ========================================== */}

      <div className="avance-plan-header">

        <div>

          <span>
            🎯 PLAN DE TRABAJO
          </span>

          <h2>
            Avance vs meta
          </h2>

          <p>
            {resumen.canal}
            {" · "}
            {resumen.supervisor}
          </p>

        </div>


        <strong>

          {avance.toFixed(1)}%

          <small>
            avance
          </small>

        </strong>

      </div>


      {/* ==========================================
          INDICADORES DEL PLAN DETALLADO
      ========================================== */}

      <div
        className="
          avance-plan-indicadores
          avance-plan-indicadores-principales
        "
      >

        <article>

          <strong>

            {formatearNumero(
              resumen.colonias
            )}

          </strong>

          <span>
            Colonias
          </span>

        </article>


        <article>

          <strong>

            {formatearNumero(
              resumen.potenciales
            )}

          </strong>

          <span>
            Potenciales
          </span>

        </article>


        <article>

          <strong>

            {formatearNumero(
              resumen.porVender
            )}

          </strong>

          <span>
            Por vender
          </span>

        </article>

      </div>


      {/* ==========================================
          INDICADORES DE RESUMEN PLAN DE TRABAJO
      ========================================== */}

      <div
        className="
          avance-plan-indicadores
          avance-plan-indicadores-resumen
        "
      >

        <article>

          <span>
            Colonias asignadas
          </span>

          <strong>

            {formatearNumero(
              resumen.coloniasAsignadas
            )}

          </strong>

        </article>


        <article>

          <span>
            Ventas del plan
          </span>

          <strong>

            {formatearNumero(
              resumen.ventasPlan
            )}

          </strong>

        </article>


        <article>

          <span>
            Ventas generales
          </span>

          <strong>

            {formatearNumero(
              resumen.ventasGeneral
            )}

          </strong>

        </article>


        <article>

          <span>
            Meta
          </span>

          <strong>

            {formatearNumero(
              resumen.meta
            )}

          </strong>

        </article>


        <article>

          <span>
            Diferencia
          </span>

          <strong
            className={
              diferencia >= 0
                ? "avance-plan-positivo"
                : "avance-plan-negativo"
            }
          >

            {
              diferencia > 0
                ? "+"
                : ""
            }

            {formatearNumero(
              diferencia
            )}

          </strong>

        </article>

      </div>


      {/* ==========================================
          BARRA DE AVANCE
      ========================================== */}

      <div className="avance-plan-progreso">

        <div>

          <span>

            {formatearNumero(
              resumen.ventasPlan
            )}

            {" de "}

            {formatearNumero(
              resumen.meta
            )}

            {" ventas"}

          </span>


          <strong>
            {avance.toFixed(1)}%
          </strong>

        </div>


        <span>

          <i
            style={{

              width:
                `${avanceBarra}%`,

            }}
          />

        </span>

      </div>


    </section>

  );

}


export default AvancePlanTrabajo;
