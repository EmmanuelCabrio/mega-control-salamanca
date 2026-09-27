import {
  useEffect,
  useMemo,
  useRef,
} from "react";


import {
  obtenerNivelProductividad,
} from "../utils/prioridades";

import "./PromotorRankingCompleto.css";


function PromotorRankingCompleto({
  rankingInicial = [],
  nombrePromotorInicial = "",
  onCerrarSesion,
}) {

  const ranking =
  Array.isArray(rankingInicial)
    ? rankingInicial
    : [];

const nombrePromotor =
  nombrePromotorInicial;

const cargando = false;

const error = "";


  const filaPromotorRef =
    useRef(null);


  // ==================================================
  // NORMALIZAR NOMBRE
  // ==================================================

  const normalizarNombre =
    (valor) =>
      String(
        valor ?? ""
      )
        .normalize("NFD")
        .replace(
          /[\u0300-\u036f]/g,
          ""
        )
        .replace(
          /\s+/g,
          " "
        )
        .trim()
        .toUpperCase();


  const nombrePromotorNormalizado =
    normalizarNombre(
      nombrePromotor
    );


 


  // ==================================================
  // UBICAR AL PROMOTOR
  // ==================================================

  const indicePromotor =
    useMemo(
      () =>
        ranking.findIndex(
          (registro) =>
            normalizarNombre(
              registro.nombre
            ) ===
            nombrePromotorNormalizado
        ),
      [
        ranking,
        nombrePromotorNormalizado,
      ]
    );


  // ==================================================
  // BAJAR AUTOMÁTICAMENTE A "TÚ ESTÁS AQUÍ"
  // ==================================================

  useEffect(() => {

    if (
      !cargando &&
      indicePromotor >= 0 &&
      filaPromotorRef.current
    ) {

      const timer =
        setTimeout(
          () => {

            filaPromotorRef.current
              ?.scrollIntoView({
                behavior: "smooth",
                block: "center",
              });

          },
          450
        );


      return () =>
        clearTimeout(
          timer
        );

    }

  }, [
    cargando,
    indicePromotor,
  ]);


  // ==================================================
  // CARGANDO
  // ==================================================

  if (cargando) {

    return (

      <div className="promotor-ranking-final-page">

        <div className="promotor-ranking-final-loading">

          <div className="promotor-ranking-final-icon">
            🏆
          </div>

          <h2>
            Preparando el Ranking Cluster...
          </h2>

          <p>
            Estamos buscando tu posición.
          </p>

        </div>

      </div>

    );

  }


  // ==================================================
  // ERROR
  // ==================================================

  if (error) {

    return (

      <div className="promotor-ranking-final-page">

        <div className="promotor-ranking-final-loading">

          <div className="promotor-ranking-final-icon">
            ⚠️
          </div>

          <h2>
            No pudimos cargar el ranking
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
  // RENDER
  // ==================================================

  return (

    <div className="promotor-ranking-final-page">

      <button
        type="button"
        className="promotor-ranking-final-logout"
        onClick={
          onCerrarSesion
        }
      >
        🚪 Cerrar sesión
      </button>


      <div className="promotor-ranking-final-card">

        <div className="promotor-ranking-final-eyebrow">
          CL SALAMANCA
        </div>


        <div className="promotor-ranking-final-trophy">
          🏆
        </div>


        <h1>
          RANKING CLUSTER
        </h1>


        {indicePromotor >= 0 && (

          <div className="promotor-ranking-final-resumen">

            <span>
              TU POSICIÓN
            </span>

            <strong>
              #{indicePromotor + 1}
            </strong>

            <small>
              de {ranking.length} promotores
            </small>

          </div>

        )}


        <div className="promotor-ranking-final-tabla-wrapper">

          <table className="promotor-ranking-final-tabla">

            <thead>

              <tr>

                <th>
                  #
                </th>

                <th>
                  PROMOTOR
                </th>

                <th>
                  VENTAS
                </th>

                <th>
                  RX
                </th>

                <th>
                  PROD.
                </th>

              </tr>

            </thead>


            <tbody>

              {ranking.map(
                (
                  promotor,
                  index
                ) => {

                  const esYo =
                    normalizarNombre(
                      promotor.nombre
                    ) ===
                    nombrePromotorNormalizado;


                  return (

                    <tr
                      key={
                        `${promotor.nombre}-${index}`
                      }

                      ref={
                        esYo
                          ? filaPromotorRef
                          : null
                      }

                      className={
                        esYo
                          ? "promotor-ranking-final-yo"
                          : obtenerNivelProductividad(
                              promotor.productividad
                            )
                      }
                    >

                      <td className="promotor-ranking-final-posicion">

                        {index === 0 && "🥇"}

                        {index === 1 && "🥈"}

                        {index === 2 && "🥉"}

                        {index > 2 &&
                          index + 1}

                      </td>


                      <td className="promotor-ranking-final-nombre">

                        {promotor.nombre}


                        {esYo && (

                          <div className="promotor-ranking-final-aqui">
                            👈 TÚ ESTÁS AQUÍ
                          </div>

                        )}

                      </td>


                      <td>

                        {Number(
                          promotor.ventasMesPromotor || 0
                        ).toFixed(0)}

                      </td>


                      <td>

                        {Number(
                          promotor.recuperaciones || 0
                        ).toFixed(0)}

                      </td>


                      <td>

                        {Number(
                          promotor.productividad || 0
                        ).toFixed(2)}

                      </td>

                    </tr>

                  );

                }
              )}

            </tbody>

          </table>

        </div>


        <div className="promotor-ranking-final-footer">

          🔥 Cada posición se construye una venta a la vez.

        </div>

      </div>

    </div>

  );

}


export default PromotorRankingCompleto;
