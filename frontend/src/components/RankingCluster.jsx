import { useRef } from "react";
import html2canvas from "html2canvas";

import {
  obtenerNivelProductividad
} from "../utils/prioridades";


function RankingCluster({
  setVista,
  registros,
  compacto = false
}) {

  // ==================================================
  // REFERENCIA PARA EXPORTAR EL RANKING
  // ==================================================

  const rankingRef = useRef(null);


  // ==================================================
  // ORDENAR / FILTRAR RANKING
  // ==================================================

  const listaCompleta =
    registros.filter(
      (promotor) =>
        promotor?.nombre &&
        String(promotor.nombre).trim() !== "" &&
        String(promotor.nombre).trim() !== "0"
    );


  // ==================================================
  // TOP 3 SI ES COMPACTO
  // ==================================================

  const lista =
    compacto
      ? listaCompleta.slice(0, 3)
      : listaCompleta;


  // ==================================================
  // EXPORTAR RANKING COMO IMAGEN
  // ==================================================

  const exportarRanking = async () => {

    if (!rankingRef.current) {
      return;
    }

    const contenedor = rankingRef.current;

    // Elementos cuyo estilo modificaremos temporalmente
    const encabezados =
      contenedor.querySelectorAll(".ranking-header");

    const titulos =
      contenedor.querySelectorAll("h2");


    // Guardar estilos originales
    const estilosEncabezados =
      Array.from(encabezados).map(
        (elemento) => ({
          position: elemento.style.position,
          top: elemento.style.top,
          zIndex: elemento.style.zIndex
        })
      );


    const estilosTitulos =
      Array.from(titulos).map(
        (elemento) => ({
          color: elemento.style.color,
          backgroundColor:
            elemento.style.backgroundColor
        })
      );


    // Guardar estilo original del contenedor
    const estiloContenedor = {
      backgroundColor:
        contenedor.style.backgroundColor,
      color:
        contenedor.style.color
    };


    try {

      // ==================================================
      // PREPARAR CONTENEDOR PARA EXPORTACIÓN
      // ==================================================

      contenedor.style.backgroundColor = "#ffffff";
      contenedor.style.color = "#111111";


      // ==================================================
      // EVITAR QUE EL HEADER STICKY SE REPITA
      // ==================================================

      encabezados.forEach(
        (elemento) => {

          elemento.style.position = "static";
          elemento.style.top = "auto";
          elemento.style.zIndex = "auto";

        }
      );


      // ==================================================
      // HACER VISIBLE EL TÍTULO SOBRE FONDO BLANCO
      // ==================================================

      titulos.forEach(
        (elemento) => {

          elemento.style.color = "#111111";
          elemento.style.backgroundColor =
            "transparent";

        }
      );


      // ==================================================
      // ESPERAR A QUE EL NAVEGADOR APLIQUE LOS CAMBIOS
      // ==================================================

      await new Promise(
        (resolve) => {
          requestAnimationFrame(() => {
            requestAnimationFrame(resolve);
          });
        }
      );


      // ==================================================
      // GENERAR CAPTURA
      // ==================================================

      const canvas =
        await html2canvas(
          contenedor,
          {
            scale: 2,
            useCORS: true,
            backgroundColor: "#ffffff",
            logging: false
          }
        );


      // ==================================================
      // CONVERTIR A IMAGEN
      // ==================================================

      const imagen =
        canvas.toDataURL("image/png");


      // ==================================================
      // DESCARGAR IMAGEN
      // ==================================================

      const enlace =
        document.createElement("a");


      enlace.href = imagen;


      enlace.download =
        "Ranking-CL-Salamanca.png";


      document.body.appendChild(enlace);

      enlace.click();

      document.body.removeChild(enlace);


    } catch (error) {

      console.error(
        "Error al exportar el ranking:",
        error
      );

      alert(
        "No fue posible exportar el ranking. Intenta nuevamente."
      );


    } finally {

      // ==================================================
      // RESTAURAR ESTILOS ORIGINALES
      // ==================================================

      encabezados.forEach(
        (elemento, index) => {

          const original =
            estilosEncabezados[index];

          elemento.style.position =
            original.position;

          elemento.style.top =
            original.top;

          elemento.style.zIndex =
            original.zIndex;

        }
      );


      titulos.forEach(
        (elemento, index) => {

          const original =
            estilosTitulos[index];

          elemento.style.color =
            original.color;

          elemento.style.backgroundColor =
            original.backgroundColor;

        }
      );


      contenedor.style.backgroundColor =
        estiloContenedor.backgroundColor;

      contenedor.style.color =
        estiloContenedor.color;

    }

  };


  // ==================================================
  // TARJETA COMPACTA
  // ==================================================

  if (compacto) {

    return (

      <div
        ref={rankingRef}
        className="honor-board ranking-cl"
      >

        <h2 className="honor-tittle">
          🏆 Ranking CL Salamanca
        </h2>


        {lista.map(
          (promotor, index) => (

            <div
              key={`${promotor.supervisor}-${promotor.nombre}-${index}`}
              className={`honor-card lugar-${index + 1}`}
            >

              {/* MEDALLA */}

              <span className="honor-medalla">

                {index === 0 && "🥇"}

                {index === 1 && "🥈"}

                {index === 2 && "🥉"}

              </span>


              <div className="honor-info">

                {/* NOMBRE */}

                <strong className="honor-nombre">

                  {promotor.nombre}

                </strong>


                {/* VENTAS + PRODUCTIVIDAD + RX */}

                <p className="honor-productividad">

                  Ventas:{" "}

                  <strong>

                    {Number(
                      promotor.ventasMesPromotor ?? 0
                    ).toFixed(0)}

                  </strong>


                  {" • "}


                  Productividad:{" "}

                  {Number(
                    promotor.productividad ?? 0
                  ).toFixed(2)}


                  {" • "}


                  RX:{" "}

                  <strong>

                    {Number(
                      promotor.recuperaciones ?? 0
                    ).toFixed(0)}

                  </strong>

                </p>

              </div>

            </div>

          )
        )}

      </div>

    );

  }


  // ==================================================
  // RANKING COMPLETO
  // ==================================================

  return (

    <div className="ranking-cluster">

      {/* ==========================================
          CONTENEDOR QUE SE EXPORTA
      ========================================== */}

      <div ref={rankingRef}>

        <h2>
          🏆 Ranking CL Salamanca
        </h2>


        <table className="tabla-ranking">

          <thead className="ranking-header">

            <tr>

              <th>
                Puesto
              </th>

              <th>
                Nombre
              </th>

              <th>
                Ventas
              </th>

              <th>
                RX
              </th>

              <th>
                Productividad
              </th>

            </tr>

          </thead>


          <tbody>

            {lista.map(
              (promotor, index) => (

                <tr
                  key={`${promotor.supervisor}-${promotor.nombre}-${index}`}
                  className={
                    obtenerNivelProductividad(
                      promotor.productividad
                    )
                  }
                >

                  {/* PUESTO */}

                  <td>

                    {index === 0 && "🥇"}

                    {index === 1 && "🥈"}

                    {index === 2 && "🥉"}

                    {index > 2 &&
                      index + 1}

                  </td>


                  {/* NOMBRE */}

                  <td>

                    {promotor.nombre}

                  </td>


                  {/* VENTAS */}

                  <td>

                    {Number(
                      promotor.ventasMesPromotor ?? 0
                    ).toFixed(0)}

                  </td>


                  {/* RX */}

                  <td>

                    {Number(
                      promotor.recuperaciones ?? 0
                    ).toFixed(0)}

                  </td>


                  {/* PRODUCTIVIDAD */}

                  <td>

                    {Number(
                      promotor.productividad ?? 0
                    ).toFixed(2)}

                  </td>

                </tr>

              )
            )}

          </tbody>

        </table>

      </div>


      {/* ==========================================
          ACCIONES
      ========================================== */}

      <div className="ranking-acciones">

        <button
          type="button"
          className="boton-exportar"
          onClick={exportarRanking}
        >
          📸 Exportar ranking
        </button>


        <button
          type="button"
          className="boton-regresar"
          onClick={() =>
            setVista("supervisor")
          }
        >
          ← Regresar al inicio
        </button>

      </div>

    </div>

  );

}


export default RankingCluster;
