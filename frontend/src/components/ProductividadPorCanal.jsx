import React, {
  useEffect,
  useState
} from "react";

import {
  fetchProtegido
} from "../services/authService";


// ==================================================
// 📈 PRODUCTIVIDAD POR CANAL
// ==================================================

function ProductividadPorCanal() {


  // ==================================================
  // DATOS
  // ==================================================

  const [
    registros,
    setRegistros
  ] = useState([]);


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
            "/api/productividad-por-canal"
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
        console.log(

          
  "📊 PRODUCTIVIDAD POR CANAL - RESPUESTA:",
  datos
);

        if (
          !datos.correcto
        ) {

          throw new Error(
            datos.mensaje ||
            "No se pudo cargar la información"
          );

        }


        setRegistros(
          datos.registros || []
        );


      } catch (error) {

        console.error(
          "❌ Error Productividad por Canal:",
          error
        );


        setError(
          "No se pudo cargar la información"
        );


      } finally {

        setCargando(false);

      }

    }


    cargarDatos();

  }, []);


  // ==================================================
  // CARGANDO
  // ==================================================

  if (
    cargando
  ) {

    return (

      <section className="productividad-por-canal">

        <div className="productividad-por-canal-header">

          <div>

            <h2>
              📈 Productividad por Canal
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

      <section className="productividad-por-canal">

        <div className="productividad-por-canal-header">

          <div>

            <h2>
              📈 Productividad por Canal
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

    <section className="productividad-por-canal">


      {/* ============================================
          ENCABEZADO
      ============================================ */}

      <div className="productividad-por-canal-header">

        <div>

          <h2>
            📈 Productividad por Canal
          </h2>

          <p>
            Productividad comercial y aportación de RX
          </p>

        </div>

      </div>


      {/* ============================================
          TABLA
      ============================================ */}

      <div className="productividad-por-canal-tabla">

        <table>

          <thead>

            <tr>

              <th>
                Canal
              </th>

              <th>
                PROD VTA
              </th>

              <th>
                PROD VTA + RX
              </th>

              <th>
                PLUS RX
              </th>

            </tr>

          </thead>


          <tbody>

            {registros.map(
              (registro, index) => {

                const productividad =
                  Number(
                    registro.productividad ?? 0
                  );

                const productividadRx =
                  Number(
                    registro.productividadRx ?? 0
                  );

                const plusRx =
                  Number(
                    registro.diferencia ?? 0
                  );


                return (

             <tr
                key={
             `${registro.canal}-${index}`
                 }
                     >

                    {/* ==================================
                        CANAL
                    ================================== */}

                    <td>

                      <strong>
                        {registro.canal}
                      </strong>

                    </td>


                    {/* ==================================
                        PRODUCTIVIDAD VENTA
                    ================================== */}

                    <td>

                      {productividad.toFixed(2)}

                    </td>


                    {/* ==================================
                        PRODUCTIVIDAD VENTA + RX
                    ================================== */}

                    <td>

                      {productividadRx.toFixed(2)}

                    </td>


                    {/* ==================================
                        PLUS RX
                    ================================== */}

                    <td>

                      <strong>

                      {plusRx > 0
                         ? "+" + plusRx.toFixed(2)
                      : plusRx.toFixed(2)
                         }

                      </strong>

                    </td>

                  </tr>

                );

              }
            )}


            {/* ======================================
                SIN DATOS
            ====================================== */}

            {registros.length === 0 && (

              <tr>

                <td
                  colSpan="4"
                >

                  No hay información disponible.

                </td>

              </tr>

            )}

          </tbody>

        </table>

      </div>


    </section>

  );

}


export default ProductividadPorCanal;
