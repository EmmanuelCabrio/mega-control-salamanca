import {
  useEffect,
  useState,
} from "react";

import {
  fetchProtegido,
} from "../services/authService";

import "./PromotorAvanceSemanal.css";


const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:3001";


function PromotorAvanceSemanal({
  onContinuar,
  onCerrarSesion,
}) {

  const [
    avance,
    setAvance,
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
  // CARGAR AVANCE SEMANAL
  // ==================================================

  useEffect(() => {

    async function cargarAvance() {

      try {

        setCargando(true);
        setError("");


        const respuesta =
          await fetchProtegido(
            `${API_URL}/api/promotor/avance-semanal`
          );


        const datos =
          await respuesta.json();


        if (
          !respuesta.ok ||
          !datos.correcto
        ) {

          throw new Error(
            datos.mensaje ||
            "No se pudo cargar tu avance semanal"
          );

        }


        setAvance(
          datos.avance
        );


      } catch (errorCarga) {

        console.error(
          "❌ Error cargando avance semanal del promotor:",
          errorCarga
        );


        setError(
          errorCarga.message ||
          "No se pudo cargar tu avance semanal"
        );


      } finally {

        setCargando(false);

      }

    }


    cargarAvance();

  }, []);


  // ==================================================
  // CARGANDO
  // ==================================================

  if (cargando) {

    return (

      <div className="promotor-semana-page">

        <div className="promotor-semana-loading">

          <div className="promotor-semana-icon">
            📅
          </div>

          <h2>
            Preparando tu semana...
          </h2>

          <p>
            Estamos revisando tu avance semanal.
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
    !avance
  ) {

    return (

      <div className="promotor-semana-page">

        <div className="promotor-semana-loading">

          <div className="promotor-semana-icon">
            ⚠️
          </div>

          <h2>
            No pudimos cargar tu semana
          </h2>

          <p>
            {error}
          </p>

          <button
            type="button"
            className="promotor-semana-salir"
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

  const productividad =
    Number(
      avance.productividad || 0
    );


  let icono = "🚀";

  let titulo =
    "SIGUE CONSTRUYENDO TU SEMANA";

  let mensaje =
    "Cada resultado que sumas hoy fortalece tu cierre semanal.";


  if (
    productividad >= 1
  ) {

    icono = "🔥";

    titulo =
      "¡VAS CON GRAN RITMO!";

    mensaje =
      "Mantén la intensidad y sigue fortaleciendo tu mix de venta.";

  } else if (
    productividad >= 0.8
  ) {

    icono = "💪";

    titulo =
      "¡VAS MUY CERCA!";

    mensaje =
      "Un buen cierre puede llevar tu semana al siguiente nivel.";

  } else if (
    productividad > 0
  ) {

    icono = "⚡";

    titulo =
      "TU SEMANA TODAVÍA PUEDE CAMBIAR";

    mensaje =
      "Cada oportunidad cuenta. Enfócate en tu siguiente cierre.";

  }


  // ==================================================
  // RENDER
  // ==================================================

  return (

    <div className="promotor-semana-page">

      <button
        type="button"
        className="promotor-semana-logout"
        onClick={
          onCerrarSesion
        }
      >
        🚪 Cerrar sesión
      </button>


      <div className="promotor-semana-card">

        <div className="promotor-semana-eyebrow">
          TU RESULTADO DE LA SEMANA
        </div>


        <div className="promotor-semana-icon">
          📅
        </div>


        <h1 className="promotor-semana-titulo">
          TU AVANCE SEMANAL
        </h1>


        <h2 className="promotor-semana-nombre">
          {avance.nombre}
        </h2>


        <div className="promotor-semana-productividad">

          <span>
            PRODUCTIVIDAD
          </span>

          <strong>
            {productividad.toFixed(2)}
          </strong>

        </div>


        <div className="promotor-semana-grid">

          <div className="promotor-semana-kpi">

            <span>
              DOBLES
            </span>

            <strong>
              {Number(
                avance.dobles || 0
              )}
            </strong>

          </div>


          <div className="promotor-semana-kpi">

            <span>
              TRIPLES
            </span>

            <strong>
              {Number(
                avance.triples || 0
              )}
            </strong>

          </div>


          <div className="promotor-semana-kpi">

            <span>
              MÓVIL
            </span>

            <strong>
              {Number(
                avance.movil || 0
              )}
            </strong>

          </div>


          <div className="promotor-semana-kpi">

            <span>
              NETFLIX
            </span>

            <strong>
              {Number(
                avance.netflix || 0
              )}
            </strong>

          </div>


          <div className="promotor-semana-kpi">

            <span>
              DISNEY+
            </span>

            <strong>
              {Number(
                avance.disney || 0
              )}
            </strong>

          </div>


          <div className="promotor-semana-kpi">

            <span>
              MAX
            </span>

            <strong>
              {Number(
                avance.max || 0
              )}
            </strong>

          </div>

        </div>


        <div className="promotor-semana-rx">

          <span>
            RX ESTA SEMANA
          </span>

          <strong>
            {Number(
              avance.rx || 0
            )}
          </strong>

        </div>


        <div className="promotor-semana-motivacion">

          <div className="promotor-semana-motivacion-icon">
            {icono}
          </div>

          <h3>
            {titulo}
          </h3>

          <p>
            {mensaje}
          </p>

        </div>


        <button
          type="button"
          className="promotor-semana-continuar"
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


export default PromotorAvanceSemanal;
