import {
  ordenarPorProductividad,
  obtenerNivelProductividad,
  obtenerNivelProductividadRecuperacion
} from "../utils/prioridades";


function TeamTable({
  registros,
  supervisorSeleccionado,
  modoRecuperacion = false,
  titulo = "👥 Equipo"
}) {

  // ==================================================
  // EQUIPO DEL SUPERVISOR
  // ==================================================

  const equipo =
    registros.filter(
      (promotor) =>
        promotor.supervisor ===
          supervisorSeleccionado &&

        promotor.nombre &&

        String(
          promotor.nombre
        ).trim() !== "0"
    );


  // ==================================================
  // ORDENAR POR PRODUCTIVIDAD
  // ==================================================

  const lista =
    ordenarPorProductividad(
      [...equipo]
    );


  // ==================================================
  // RENDER
  // ==================================================

  return (

    <div
      className={
        `team-table equipo-completo${
          modoRecuperacion
            ? " team-table-recuperacion"
            : ""
        }`
      }
    >

      <h2>
        {titulo}
      </h2>


      <p>
        Supervisor:{" "}
        <strong>
          {supervisorSeleccionado}
        </strong>
      </p>


      {modoRecuperacion && (

        <div
          className="productividad-recuperacion-leyenda"
          aria-label="Niveles de productividad"
        >

          <span className="leyenda-rojo">
            ≤ 1 Rojo
          </span>

          <span className="leyenda-naranja">
            1.01–2.99 Naranja
          </span>

          <span className="leyenda-amarillo">
            3–3.99 Amarillo
          </span>

          <span className="leyenda-verde-claro">
            4–4.99 Verde claro
          </span>

          <span className="leyenda-verde-oscuro">
            ≥ 5 Verde oscuro
          </span>

        </div>

      )}


      <table>

        <thead>

          <tr>

            <th>
              Nombre
            </th>

            <th>
              Antigüedad
            </th>

           {!modoRecuperacion && (

           <th>
           Ventas
             </th>

             )}

            <th>
              RX
            </th>

            <th>
              Productividad
            </th>

          </tr>

        </thead>


        <tbody>

          {lista.length === 0 ? (

            <tr>

              <td
                colSpan={
               modoRecuperacion
            ? "4"
            : "5"
             }
                className="team-table-sin-registros"
              >
                No hay integrantes para mostrar.
              </td>

            </tr>

          ) : lista.map(
            (promotor, index) => (

              <tr
                key={`${promotor.nombre}-${index}`}
                className={
                  modoRecuperacion
                    ? obtenerNivelProductividadRecuperacion(
                        promotor.productividad
                      )
                    : obtenerNivelProductividad(
                        promotor.productividad
                      )
                }
              >

                {/* ==================================
                    NOMBRE
                ================================== */}

                <td>
                  {promotor.nombre}
                </td>


                {/* ==================================
                    DÍAS DE ANTIGÜEDAD
                ================================== */}

                <td>

                  {Number(
                    promotor.diasAntiguedad ?? 0
                  ).toFixed(0)} días

                </td>


                {/* ==================================
                    VENTAS DEL MES
                ================================== */}

               {!modoRecuperacion && (

            <td>

                  {Number(
            promotor.ventasMesPromotor ?? 0
                 ).toFixed(0)}

                 </td>

               )}


                {/* ==================================
                    RX
                ================================== */}

                <td>

                  {Number(
                    promotor.recuperaciones ?? 0
                  ).toFixed(0)}

                </td>


                {/* ==================================
                    PRODUCTIVIDAD
                ================================== */}

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

  );

}


export default TeamTable;
