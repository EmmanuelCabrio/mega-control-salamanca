import {
  ordenarPorProductividad,
  obtenerNivelProductividad
} from "../utils/prioridades";


function TeamTable({
  registros,
  supervisorSeleccionado
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

    <div className="team-table equipo-completo">

      <h2>
        👥 Equipo
      </h2>


      <p>
        Supervisor:{" "}
        <strong>
          {supervisorSeleccionado}
        </strong>
      </p>


      <table>

        <thead>

          <tr>

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
                key={`${promotor.nombre}-${index}`}
                className={
                  obtenerNivelProductividad(
                    promotor.productividad
                  )
                }
              >

                {/* NOMBRE */}

                <td>
                  {promotor.nombre}
                </td>


                {/* VENTAS DEL MES */}

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

  );

}


export default TeamTable;
