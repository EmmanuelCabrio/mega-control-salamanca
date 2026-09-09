function ComparativaMesAnterior({
  registros,
  supervisorSeleccionado
}) {

  // ==================================================
  // EQUIPO
  // ==================================================

  const equipo =
    (registros || [])
      .filter(
        (promotor) => {

          const supervisor =
            String(
              promotor.supervisor ?? ""
            )
              .trim()
              .toUpperCase();


          const supervisorActual =
            String(
              supervisorSeleccionado ?? ""
            )
              .trim()
              .toUpperCase();


          const nombre =
            String(
              promotor.nombre ?? ""
            ).trim();


          return (
            supervisor ===
              supervisorActual &&
            nombre !== "" &&
            nombre !== "0"
          );

        }
      );


  // ==================================================
  // COMPARATIVA POR PROMOTOR
  // ==================================================

  const comparativa =
    equipo
      .map(
        (promotor) => {

          const actual =
            Number(
              promotor
                .ventasMesPromotor ??
              0
            );


          const anterior =
            Number(
              promotor
                .ventasMesAnteriorMismoDia ??
              0
            );


          const diferencia =
            actual -
            anterior;


          return {

            nombre:
              promotor.nombre,

            actual,

            anterior,

            diferencia,

          };

        }
      )

      // ==============================================
      // MÁS CRÍTICO PRIMERO
      // ==============================================

      .sort(
        (a, b) => {

          if (
            a.diferencia !==
            b.diferencia
          ) {

            return (
              a.diferencia -
              b.diferencia
            );

          }


          return (
            b.actual -
            a.actual
          );

        }
      );


  // ==================================================
  // RESULTADO DEL SUPERVISOR
  // ==================================================

  const ventaActualSupervisor =
    comparativa.reduce(
      (
        total,
        promotor
      ) =>
        total +
        promotor.actual,
      0
    );


  const ventaAnteriorSupervisor =
    comparativa.reduce(
      (
        total,
        promotor
      ) =>
        total +
        promotor.anterior,
      0
    );


  const diferenciaSupervisor =
    ventaActualSupervisor -
    ventaAnteriorSupervisor;


  const porcentajeSupervisor =
    ventaAnteriorSupervisor > 0

      ? (
          diferenciaSupervisor /
          ventaAnteriorSupervisor
        ) * 100

      : 0;


  // ==================================================
  // ESTILO RESULTADO
  // ==================================================

  const claseSupervisor =
    diferenciaSupervisor > 0
      ? "comparativa-positivo"
      : diferenciaSupervisor < 0
        ? "comparativa-negativo"
        : "comparativa-neutral";


  const iconoSupervisor =
    diferenciaSupervisor > 0
      ? "▲"
      : diferenciaSupervisor < 0
        ? "▼"
        : "=";


  const diferenciaSupervisorTexto =
    diferenciaSupervisor > 0
      ? `+${diferenciaSupervisor}`
      : `${diferenciaSupervisor}`;


  // ==================================================
  // RENDER
  // ==================================================

  return (

    <section
      className="comparativa-mes-anterior"
    >

      {/* ==========================================
          ENCABEZADO
      ========================================== */}

      <div
        className="comparativa-encabezado"
      >

        <div>

          <div
            className="comparativa-subtitulo"
          >
            VS MISMO DÍA MES ANTERIOR
          </div>


          <h2>
            {supervisorSeleccionado}
          </h2>

        </div>


        <div
          className={`
            comparativa-resultado-supervisor
            ${claseSupervisor}
          `}
        >

          <strong>

            {diferenciaSupervisorTexto}{" "}
            {iconoSupervisor}

          </strong>


          <span>

            {diferenciaSupervisor === 0

              ? "Mismo resultado"

              : diferenciaSupervisor > 0

                ? "ventas arriba"

                : "ventas abajo"
            }

          </span>

        </div>

      </div>


      {/* ==========================================
          RESUMEN DEL SUPERVISOR
      ========================================== */}

      <div
        className="comparativa-resumen"
      >

        <div>

          <span>
            ACTUAL
          </span>

          <strong>
            {ventaActualSupervisor}
          </strong>

        </div>


        <div>

          <span>
            ANT. MISMO DÍA
          </span>

          <strong>
            {ventaAnteriorSupervisor}
          </strong>

        </div>


        <div>

          <span>
            DIFERENCIA
          </span>

          <strong
            className={
              claseSupervisor
            }
          >

            {diferenciaSupervisorTexto}{" "}
            {iconoSupervisor}

          </strong>

        </div>


        <div>

          <span>
            VARIACIÓN
          </span>

          <strong
            className={
              claseSupervisor
            }
          >

            {porcentajeSupervisor > 0
              ? "+"
              : ""
            }

            {porcentajeSupervisor.toFixed(
              1
            )}%

          </strong>

        </div>

      </div>


      {/* ==========================================
          TABLA
      ========================================== */}

      <div
        className="comparativa-tabla-contenedor"
      >

        <table
          className="comparativa-tabla"
        >

          <thead>

            <tr>

              <th>
                PROMOTOR
              </th>

              <th>
                ACTUAL
              </th>

              <th>
                ANT. MISMO DÍA
              </th>

              <th>
                DIF
              </th>

            </tr>

          </thead>


          <tbody>

            {comparativa.map(
              (
                promotor,
                index
              ) => {

                const clase =
                  promotor.diferencia > 0
                    ? "comparativa-positivo"
                    : promotor.diferencia < 0
                      ? "comparativa-negativo"
                      : "comparativa-neutral";


                const icono =
                  promotor.diferencia > 0
                    ? "▲"
                    : promotor.diferencia < 0
                      ? "▼"
                      : "=";


                const diferencia =
                  promotor.diferencia > 0
                    ? `+${promotor.diferencia}`
                    : `${promotor.diferencia}`;


                return (

                  <tr
                    key={
                      `${promotor.nombre}-${index}`
                    }
                  >

                    <td>
                      {promotor.nombre}
                    </td>


                    <td>
                      {promotor.actual}
                    </td>


                    <td>
                      {promotor.anterior}
                    </td>


                    <td
                      className={
                        clase
                      }
                    >

                      {diferencia}{" "}
                      {icono}

                    </td>

                  </tr>

                );

              }
            )}

          </tbody>

        </table>

      </div>

    </section>

  );

}


export default ComparativaMesAnterior;
