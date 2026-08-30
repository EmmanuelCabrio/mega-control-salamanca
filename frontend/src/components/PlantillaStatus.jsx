import React, {
  useEffect,
  useState
} from "react";

import {
  fetchProtegido
} from "../services/authService";


// ==================================================
// 👥 STATUS DE PLANTILLA
// ==================================================

function PlantillaStatus() {

  const [
    registros,
    setRegistros
  ] = useState([]);


  const [
    total,
    setTotal
  ] = useState(0);


  const [
    activos,
    setActivos
  ] = useState(0);


  const [
    vacantes,
    setVacantes
  ] = useState(0);


  const [
    cobertura,
    setCobertura
  ] = useState(0);


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

    async function cargarPlantilla() {

      try {

        setCargando(true);

        setError("");


        const respuesta =
          await fetchProtegido(
            "/api/plantilla"
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
            "No se pudo cargar la plantilla"
          );

        }


        setRegistros(
          datos.registros || []
        );


        setTotal(
          Number(
            datos.total || 0
          )
        );


        setActivos(
          Number(
            datos.activos || 0
          )
        );


        setVacantes(
          Number(
            datos.vacantes || 0
          )
        );


        setCobertura(
          Number(
            datos.cobertura || 0
          )
        );


      } catch (error) {

        console.error(
          "❌ Error Status Plantilla:",
          error
        );


        setError(
          "No se pudo cargar el status de plantilla"
        );


      } finally {

        setCargando(false);

      }

    }


    cargarPlantilla();

  }, []);


  // ==================================================
  // CARGANDO
  // ==================================================

  if (
    cargando
  ) {

    return (

      <section className="plantilla-status">

        <div className="plantilla-status-header">

          <span>
            👥
          </span>

          <div>

            <h2>
              Status de plantilla
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

      <section className="plantilla-status">

        <div className="plantilla-status-header">

          <span>
            👥
          </span>

          <div>

            <h2>
              Status de plantilla
            </h2>

            <p className="plantilla-error">
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

    <section className="plantilla-status">


      {/* ============================================
          ENCABEZADO
      ============================================ */}

      <div className="plantilla-status-header">

        <span>
          👥
        </span>

        <div>

          <h2>
            Status de plantilla
          </h2>

          <p>
            Situación actual de la estructura
          </p>

        </div>

      </div>


      {/* ============================================
          INDICADORES
      ============================================ */}

      <div className="plantilla-kpis">


        <div className="plantilla-kpi">

          <small>
            PLANTILLA TOTAL
          </small>

          <strong>
            {total}
          </strong>

        </div>


        <div className="plantilla-kpi plantilla-kpi-activos">

          <small>
            ACTIVOS
          </small>

          <strong>
            {activos}
          </strong>

        </div>


        <div className="plantilla-kpi plantilla-kpi-vacantes">

          <small>
            VACANTES
          </small>

          <strong>
            {vacantes}
          </strong>

        </div>


        <div className="plantilla-kpi plantilla-kpi-cobertura">

          <small>
            COBERTURA
          </small>

          <strong>
            {cobertura.toFixed(1)}%
          </strong>

        </div>


      </div>


      {/* ============================================
          TABLA
      ============================================ */}

      <div className="plantilla-tabla">

        <table>

          <thead>

            <tr>

              <th>
                Puesto
              </th>

              <th>
                Total
              </th>

              <th>
                Activos
              </th>

              <th>
                Vacantes
              </th>

            </tr>

          </thead>


          <tbody>

            {registros.map(
              (registro) => (

                <tr
                  key={registro.puesto}
                >

                  <td>

                    <strong>
                      {registro.puesto}
                    </strong>

                  </td>

                  <td>
                    {registro.total}
                  </td>

                  <td>
                    {registro.activos}
                  </td>

                  <td
                    className={
                      registro.vacantes > 0
                        ? "plantilla-vacante"
                        : "plantilla-sin-vacante"
                    }
                  >

                    {registro.vacantes}

                  </td>

                </tr>

              )
            )}


            {/* ======================================
                TOTAL
            ====================================== */}

            <tr className="plantilla-total">

              <td>
                TOTAL GENERAL
              </td>

              <td>
                {total}
              </td>

              <td>
                {activos}
              </td>

              <td>
                {vacantes}
              </td>

            </tr>

          </tbody>

        </table>

      </div>

    </section>

  );

}


export default PlantillaStatus;
