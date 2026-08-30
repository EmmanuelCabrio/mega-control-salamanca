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
  // EXPORTAR RANKING COMO IMAGEN
  // ==================================================

  const exportarRanking = async () => {

    if (!rankingRef.current) return;

    try {

      const canvas = await html2canvas(
        rankingRef.current,
        {
          scale: 2,
          useCORS: true,
          backgroundColor: "#111111"
        }
      );

      const enlace = document.createElement("a");

      enlace.download = "Ranking-CL-Salamanca.png";

      enlace.href = canvas.toDataURL("image/png");

      enlace.click();

    } catch (error) {

      console.error(
        "Error al exportar el Ranking:",
        error
      );

    }

  };


  // ==================================================
  // ORDENAR RANKING
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
  // TARJETA COMPACTA
  // ==================================================

  if (compacto) {

    return (

      <div className="honor-board ranking-cl">

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
                    promotor.productividad
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

      {/* ==================================================
          CONTENIDO QUE SE EXPORTARÁ
      ================================================== */}

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
                      promotor.productividad
                    ).toFixed(2)}

                  </td>


                </tr>

              )
            )}

          </tbody>

        </table>

      </div>


      {/* ==========================================
          EXPORTAR
      ========================================== */}

      <button
        type="button"
        className="boton-exportar-ranking"
        onClick={exportarRanking}
      >
        📸 Exportar Ranking
      </button>


      {/* ==========================================
          REGRESAR
      ========================================== */}

      <button
        className="boton-regresar"
        onClick={() =>
          setVista("supervisor")
        }
      >
        ← Regresar al inicio
      </button>


    </div>

  );

}


export default RankingCluster;
