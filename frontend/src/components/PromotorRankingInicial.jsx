import {
  useEffect,
  useState,
} from "react";

import {
  fetchProtegido,
} from "../services/authService";

import "./PromotorRankingInicial.css";


const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:3001";


function PromotorRankingInicial({
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


  // ==================================================
  // CARGAR RESUMEN PERSONAL
  // ==================================================

  useEffect(() => {

    async function cargarResumen() {

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
            "No se pudo cargar tu información"
          );

        }


        setPromotor(
          datos.promotor
        );


      } catch (errorCarga) {

        console.error(
          "❌ Error cargando perfil promotor:",
          errorCarga
        );

        setError(
          errorCarga.message ||
          "No se pudo cargar tu información"
        );

      } finally {

        setCargando(false);

      }

    }


    cargarResumen();

  }, []);


  // ==================================================
  // CARGANDO
  // ==================================================

  if (cargando) {

    return (

      <div className="promotor-ranking-page">

        <div className="promotor-ranking-loading">

          <div className="promotor-loader">
            🏆
          </div>

          <h2>
            Preparando tu resultado...
          </h2>

          <p>
            Estamos consultando tu posición en el Cluster Salamanca.
          </p>

        </div>

      </div>

    );

  }


  // ==================================================
  // ERROR
  // ==================================================

  if (
    error ||
    !promotor
  ) {

    return (

      <div className="promotor-ranking-page">

        <div className="promotor-ranking-error">

          <div className="promotor-error-icon">
            ⚠️
          </div>

          <h2>
            No pudimos encontrar tu posición
          </h2>

          <p>
            {error}
          </p>

          <button
            type="button"
            className="promotor-btn-salir"
            onClick={
              onCerrarSesion
            }
          >
            Cerrar sesión
          </button>

        </div>

      </div>

    );

  }


  // ==================================================
  // DATOS
  // ==================================================

  const posicion =
    Number(
      promotor.posicion || 0
    );

  const total =
    Number(
      promotor.totalPromotores || 0
    );


  let medalla = "🏆";
  let titulo = "¡Vamos por más!";
  let mensaje =
    "Cada posición que avances cuenta.";


  if (
    posicion === 1
  ) {

    medalla = "🥇";

    titulo =
      "¡ERES EL #1 DEL CLUSTER!";

    mensaje =
      "Hoy estás marcando el ritmo. Defiende esa posición.";

  } else if (
    posicion === 2
  ) {

    medalla = "🥈";

    titulo =
      "¡TOP 2 DEL CLUSTER!";

    mensaje =
      "Estás entre los mejores. El primer lugar está cada vez más cerca.";

  } else if (
    posicion === 3
  ) {

    medalla = "🥉";

    titulo =
      "¡TOP 3 DEL CLUSTER!";

    mensaje =
      "Estás en el podio. Sigue empujando para subir una posición.";

  } else if (
    posicion >= 4 &&
    posicion <= 10
  ) {

    medalla = "🔥";

    titulo =
      "¡ESTÁS EN EL TOP 10!";

    mensaje =
      "Tu resultado ya destaca dentro del Cluster. Ahora vamos por el podio.";

  } else if (
    posicion > 10
  ) {

    medalla = "🚀";

    titulo =
      `Vas en la posición #${posicion}`;

    mensaje =
      "Tu siguiente venta puede acercarte a una nueva posición.";

  }


  // ==================================================
  // RENDER
  // ==================================================

  return (

    <div className="promotor-ranking-page">

      <button
        type="button"
        className="promotor-ranking-logout"
        onClick={
          onCerrarSesion
        }
      >
        🚪 Cerrar sesión
      </button>


      <div
        className={
          `promotor-ranking-card posicion-${posicion}`
        }
      >

        <div className="promotor-ranking-eyebrow">
          SEGUIMIENTO 2.0 · CL SALAMANCA
        </div>


        <div className="promotor-ranking-medalla">
          {medalla}
        </div>


        <div className="promotor-ranking-posicion">

          <span className="promotor-ranking-hash">
            #
          </span>

          {posicion}

        </div>


        <div className="promotor-ranking-total">

          DE{" "}

          <strong>
            {total}
          </strong>

          {" "}PROMOTORES

        </div>


        <h1 className="promotor-ranking-titulo">
          {titulo}
        </h1>


        <h2 className="promotor-ranking-nombre">
          {promotor.nombre}
        </h2>


        <p className="promotor-ranking-mensaje">
          {mensaje}
        </p>


        <div className="promotor-ranking-kpis">

          <div className="promotor-ranking-kpi">

            <span>
              VENTAS
            </span>

            <strong>
              {Number(
                promotor.ventas || 0
              ).toFixed(0)}
            </strong>

          </div>


          <div className="promotor-ranking-kpi">

            <span>
              PRODUCTIVIDAD
            </span>

            <strong>
              {Number(
                promotor.productividad || 0
              ).toFixed(2)}
            </strong>

          </div>


          <div className="promotor-ranking-kpi">

            <span>
              RX
            </span>

            <strong>
              {Number(
                promotor.recuperaciones || 0
              ).toFixed(0)}
            </strong>

          </div>

        </div>


        <div className="promotor-ranking-supervisor">

          Tu supervisor

          <strong>
            {promotor.supervisor || "—"}
          </strong>

        </div>


        <button
          type="button"
          className="promotor-ranking-continuar"
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


export default PromotorRankingInicial;
