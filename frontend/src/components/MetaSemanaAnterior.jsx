import {
  useEffect,
  useState,
} from "react";

import {
  fetchProtegido,
} from "../services/authService";


function formatearFecha(
  fecha
) {

  if (
    !fecha
  ) {

    return "";

  }


  const valor =
    new Date(
      Date.UTC(
        fecha.anio,
        fecha.mes - 1,
        fecha.dia
      )
    );


  return new Intl.DateTimeFormat(
    "es-MX",
    {

      weekday:
        "long",

      day:
        "numeric",

      month:
        "long",

      timeZone:
        "UTC",

    }
  ).format(
    valor
  );

}


function MetaSemanaAnterior() {

  const [
    datos,
    setDatos,
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
  // CARGAR META
  // ==================================================

  useEffect(() => {

    async function cargarMeta() {

      try {

        setCargando(true);

        setError("");


        const respuesta =
          await fetchProtegido(
            "/api/meta-semana-anterior"
          );


        const resultado =
          await respuesta.json();


        if (
          !respuesta.ok ||
          !resultado.correcto
        ) {

          throw new Error(
            resultado.mensaje ||
            "No se pudo cargar la meta"
          );

        }


        setDatos(
          resultado
        );

      } catch (errorCarga) {

        console.error(
          "❌ Error meta semana anterior:",
          errorCarga
        );


        setError(
          errorCarga.message ||
          "No se pudo cargar la meta"
        );

      } finally {

        setCargando(false);

      }

    }


    cargarMeta();

  }, []);


  // ==================================================
  // CARGANDO
  // ==================================================

  if (
    cargando
  ) {

    return (

      <section className="meta-semana-estado">

        Calculando referencia de la semana anterior…

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

      <section
        className="
          meta-semana-estado
          meta-semana-error
        "
      >

        {error}

      </section>

    );

  }


  const resultado =
    Number(
      datos?.supervisor?.resultado ||
      0
    );


  // ==================================================
  // RENDER
  // ==================================================

  return (

    <section className="meta-semana-card">


      {/* ==========================================
          MENSAJE
      ========================================== */}

      <div className="meta-semana-mensaje">

        <span>
          REFERENCIA DE HOY
        </span>


        <h2>
          Meta vs mismo día de la semana anterior
        </h2>


        <p>

          ANALIZA TU PLANTILLA, PRODUCTIVIDAD Y
          ASISTENCIA. SI PUEDES, MEJORA ESTE
          RESULTADO; SI NO, AL MENOS IGUÁLALO.

        </p>


        <small>

          Resultado del{" "}

          {formatearFecha(
            datos?.fechaReferencia
          )}

        </small>

      </div>


      {/* ==========================================
          RESULTADO
      ========================================== */}

      <div className="meta-semana-resultado">

        <span>
          Resultado mismo día semana anterior
        </span>


        <strong>

          {resultado.toLocaleString(
            "es-MX"
          )}

        </strong>


        <small>

          {
            resultado === 1
              ? "venta"
              : "ventas"
          }

        </small>

      </div>


    </section>

  );

}


export default MetaSemanaAnterior;
