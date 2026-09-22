import {
  useEffect,
  useState,
} from "react";

import {
  fetchProtegido,
} from "../services/authService";

import "./PromotorVsMesAnterior.css";


const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:3001";


function PromotorVsMesAnterior({
  onContinuar,
  onCerrarSesion,
}) {

  const [
    promotor,
    setPromotor,
  ] = useState(null);

  const [
    cargando,
    setCargando,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");


  useEffect(() => {

    async function cargarDatos() {

      try {

        setCargando(true);
        setError("");


        const respuesta =
          await fetchProtegido(
            `${API_URL}/api/promotor/resumen`
          );


        const datos =
          await respuesta.json();


        if (
          !respuesta.ok ||
          !datos.correcto
        ) {

          throw new Error(
            datos.mensaje ||
            "No se pudo cargar tu comparativa"
          );

        }


        setPromotor(
          datos.promotor
        );


      } catch (errorCarga) {

        console.error(
          "❌ Error cargando comparativa del promotor:",
          errorCarga
        );

        setError(
          errorCarga.message ||
          "No se pudo cargar tu comparativa"
        );

      } finally {

        setCargando(false);

      }

    }


    cargarDatos();

  }, []);


  if (cargando) {

    return (

      <div className="promotor-vs-page">

        <div className="promotor-vs-loading">

          <div className="promotor-vs-icon">
            📈
          </div>

          <h2>
            Comparando tu resultado...
          </h2>

          <p>
            Estamos revisando cómo vas contra el mes pasado.
          </p>

        </div>

      </div>

    );

  }


  if (
    error ||
    !promotor
  ) {

    return (

      <div className="promotor-vs-page">

        <div className="promotor-vs-loading">

          <div className="promotor-vs-icon">
            ⚠️
          </div>

          <h2>
            No pudimos cargar tu comparativa
          </h2>

          <p>
            {error}
          </p>

        </div>

      </div>

    );

  }


  const ventasActuales =
    Number(
      promotor.ventas || 0
    );


  const ventasAnterior =
    Number(
      promotor.ventasMesAnteriorMismoDia || 0
    );


  const diferencia =
    Number(
      promotor.diferenciaVsMesAnterior ??
      ventasActuales -
      ventasAnterior
    );


  let icono = "🔥";

  let titulo =
    "¡VAS ARRIBA DE TU RESULTADO!";

  let mensaje =
    `Llevas ${Math.abs(
      diferencia
    )} ventas más que al mismo día del mes pasado.`;

  let claseResultado =
    "positivo";


  if (
    diferencia === 0
  ) {

    icono = "⚡";

    titulo =
      "VAS AL MISMO RITMO";

    mensaje =
      "Estás exactamente en el mismo resultado que llevabas el mes pasado. Tu siguiente venta rompe el empate.";

    claseResultado =
      "igual";

  }


  if (
    diferencia < 0
  ) {

    icono = "🚀";

    titulo =
      `ESTÁS A ${Math.abs(
        diferencia
      )} VENTAS DE ALCANZARLO`;

    mensaje =
      "Todavía estás a tiempo de superar tu resultado anterior. Cada cierre reduce la distancia.";

    claseResultado =
      "negativo";

  }


  return (

    <div className="promotor-vs-page">

      <button
        type="button"
        className="promotor-vs-logout"
        onClick={
          onCerrarSesion
        }
      >
        🚪 Cerrar sesión
      </button>


      <div className="promotor-vs-card">

        <div className="promotor-vs-eyebrow">
          TU RETO PERSONAL
        </div>


        <div className="promotor-vs-icon">
          {icono}
        </div>


        <h1 className="promotor-vs-titulo">
          TÚ VS TU MES ANTERIOR
        </h1>


        <h2 className="promotor-vs-nombre">
          {promotor.nombre}
        </h2>


        <div className="promotor-vs-comparacion">

          <div className="promotor-vs-resultado">

            <span>
              ESTE MES
            </span>

            <strong>
              {ventasActuales}
            </strong>

            <small>
              ventas
            </small>

          </div>


          <div className="promotor-vs-centro">
            VS
          </div>


          <div className="promotor-vs-resultado">

            <span>
              MES PASADO
            </span>

            <strong>
              {ventasAnterior}
            </strong>

            <small>
              al mismo día
            </small>

          </div>

        </div>


        <div
          className={
            `promotor-vs-diferencia ${claseResultado}`
          }
        >

          {diferencia > 0
            ? `+${diferencia}`
            : diferencia}

        </div>


        <h3 className="promotor-vs-mensaje-titulo">
          {titulo}
        </h3>


        <p className="promotor-vs-mensaje">
          {mensaje}
        </p>


        <button
          type="button"
          className="promotor-vs-continuar"
          onClick={
            onContinuar
          }
        >
          CONTINUAR
          <span>
            →
          </span>
        </button>

      </div>

    </div>

  );

}


export default PromotorVsMesAnterior;
