import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  fetchProtegido,
} from "../services/authService";


// ==================================================
// 📊 DETALLE DE VENTA MENSUAL
// ==================================================

function DetalledeVentaMensual({
  onSeleccionarSupervisor,
}) {

  // ==================================================
  // ESTADOS
  // ==================================================

  const [
    registros,
    setRegistros,
  ] = useState([]);


  const [
    cargando,
    setCargando,
  ] = useState(true);


  const [
    error,
    setError,
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
            "/api/detalle-venta-mensual"
          );


        // ============================================
        // VALIDAR HTTP
        // ============================================

        if (!respuesta.ok) {

          throw new Error(
            `Error HTTP ${respuesta.status}`
          );

        }


        // ============================================
        // LEER RESPUESTA
        // ============================================

        const datos =
          await respuesta.json();


        // ============================================
        // VALIDAR BACKEND
        // ============================================

        if (!datos.correcto) {

          throw new Error(
            datos.mensaje ||
            "No se pudo cargar el resultado mensual"
          );

        }


        // ============================================
        // GUARDAR REGISTROS
        // ============================================

        setRegistros(
          datos.registros || []
        );


      } catch (error) {

        console.error(
          "❌ Error Detalle Venta Mensual:",
          error
        );


        setError(
          "No se pudo cargar el resultado mensual"
        );


      } finally {

        setCargando(false);

      }

    }


    cargarDatos();

  }, []);


  // ==================================================
  // REGISTROS ORDENADOS
  // ==================================================

  const registrosOrdenados =
    useMemo(
      () => {

        return [...registros]
          .filter(
            (registro) => {

              const supervisor =
                String(
                  registro.supervisor ?? ""
                ).trim();

              return (
                supervisor !== "" &&
                supervisor !== "0"
              );

            }
          )
          .sort(
            (a, b) =>
              Number(
                b.ventas ?? 0
              ) -
              Number(
                a.ventas ?? 0
              )
          );

      },
      [registros]
    );


  // ==================================================
  // TOTALES CL
  // ==================================================

  const totales =
    useMemo(
      () => {

        return registrosOrdenados.reduce(
          (acumulado, registro) => {

            acumulado.ventas +=
              Number(
                registro.ventas ?? 0
              );

            acumulado.rx +=
              Number(
                registro.rx ?? 0
              );

            acumulado.movil +=
              Number(
                registro.movil ?? 0
              );

            acumulado.netflix +=
              Number(
                registro.netflix ?? 0
              );

            acumulado.disney +=
              Number(
                registro.disney ?? 0
              );

            acumulado.max +=
              Number(
                registro.max ?? 0
              );


            return acumulado;

          },
          {
            ventas: 0,
            rx: 0,
            movil: 0,
            netflix: 0,
            disney: 0,
            max: 0,
          }
        );

      },
      [registrosOrdenados]
    );


  // ==================================================
  // TOTAL DE ADICIONALES
  // ==================================================

  const totalAdicionales =
    totales.movil +
    totales.netflix +
    totales.disney +
    totales.max;


  // ==================================================
  // CARGANDO
  // ==================================================

  if (cargando) {

    return (

      <section className="detalle-venta-mensual">

        <div className="detalle-venta-mensual-header">

          <div>

            <h2>
              📊 Resultado Comercial del Mes
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

  if (error) {

    return (

      <section className="detalle-venta-mensual">

        <div className="detalle-venta-mensual-header">

          <div>

            <h2>
              📊 Resultado Comercial del Mes
            </h2>

            <p className="detalle-venta-error">
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

    <section className="detalle-venta-mensual">


      {/* ============================================
          ENCABEZADO
      ============================================ */}

      <div className="detalle-venta-mensual-header">

        <div>

          <h2>
            📊 Resultado Comercial del Mes
          </h2>

          <p>
            Venta, recuperaciones y servicios adicionales
            por supervisor
          </p>

        </div>

      </div>


      {/* ============================================
          KPIS GENERALES
      ============================================ */}

      <div className="detalle-venta-kpis">


        <div className="detalle-venta-kpi">

          <span>
            Ventas
          </span>

          <strong>
            {totales.ventas}
          </strong>

        </div>


        <div className="detalle-venta-kpi">

          <span>
            RX
          </span>

          <strong>
            {totales.rx}
          </strong>

        </div>


        <div className="detalle-venta-kpi">

          <span>
            Adicionales
          </span>

          <strong>
            {totalAdicionales}
          </strong>

        </div>


      </div>


      {/* ============================================
          TABLA
      ============================================ */}

      <div className="detalle-venta-mensual-tabla">

        <table>

          <thead>

            <tr>

              <th>
                Supervisor
              </th>

              <th>
                Ventas
              </th>

              <th>
                RX
              </th>

              <th>
                Móvil
              </th>

              <th>
                Netflix
              </th>

              <th>
                Disney+
              </th>

              <th>
                MAX
              </th>

              <th>
                Adic.
              </th>

            </tr>

          </thead>


          <tbody>


            {registrosOrdenados.map(
              (
                registro,
                index
              ) => {

                // ==================================
                // NORMALIZAR VALORES
                // ==================================

                const ventas =
                  Number(
                    registro.ventas ?? 0
                  );


                const rx =
                  Number(
                    registro.rx ?? 0
                  );


                const movil =
                  Number(
                    registro.movil ?? 0
                  );


                const netflix =
                  Number(
                    registro.netflix ?? 0
                  );


                const disney =
                  Number(
                    registro.disney ?? 0
                  );


                const max =
                  Number(
                    registro.max ?? 0
                  );


                const adicionales =
                  movil +
                  netflix +
                  disney +
                  max;


                return (

                  <tr
                    key={
                      `${registro.supervisor}-${index}`
                    }
                  >


                    {/* ==============================
                        SUPERVISOR
                    ============================== */}

                    <td>

                      <button
                        type="button"

                        className="detalle-venta-supervisor"

                        onClick={() => {

                          if (
                            onSeleccionarSupervisor
                          ) {

                            onSeleccionarSupervisor(
                              registro
                            );

                          }

                        }}
                      >

                        {registro.supervisor}

                      </button>

                    </td>


                    {/* ==============================
                        VENTAS
                    ============================== */}

                    <td className="detalle-venta-principal">

                      {ventas}

                    </td>


                    {/* ==============================
                        RX
                    ============================== */}

                    <td>

                      {rx}

                    </td>


                    {/* ==============================
                        MÓVIL
                    ============================== */}

                    <td>

                      {movil}

                    </td>


                    {/* ==============================
                        NETFLIX
                    ============================== */}

                    <td>

                      {netflix}

                    </td>


                    {/* ==============================
                        DISNEY
                    ============================== */}

                    <td>

                      {disney}

                    </td>


                    {/* ==============================
                        MAX
                    ============================== */}

                    <td>

                      {max}

                    </td>


                    {/* ==============================
                        TOTAL ADICIONALES
                    ============================== */}

                    <td className="detalle-venta-adicionales">

                      {adicionales}

                    </td>


                  </tr>

                );

              }
            )}


            {/* ======================================
                TOTAL CL
            ====================================== */}

            {registrosOrdenados.length > 0 && (

              <tr className="detalle-venta-total">

                <td>

                  <strong>
                    TOTAL CL
                  </strong>

                </td>


                <td>
                  {totales.ventas}
                </td>


                <td>
                  {totales.rx}
                </td>


                <td>
                  {totales.movil}
                </td>


                <td>
                  {totales.netflix}
                </td>


                <td>
                  {totales.disney}
                </td>


                <td>
                  {totales.max}
                </td>


                <td>
                  {totalAdicionales}
                </td>

              </tr>

            )}


            {/* ======================================
                SIN DATOS
            ====================================== */}

            {registrosOrdenados.length === 0 && (

              <tr>

                <td
                  colSpan="8"
                  className="detalle-venta-sin-datos"
                >

                  No hay información disponible.

                </td>

              </tr>

            )}


          </tbody>

        </table>

      </div>


      {/* ============================================
          AYUDA
      ============================================ */}

      <div className="detalle-venta-ayuda">

        💡 Selecciona un supervisor para consultar
        posteriormente el detalle de su equipo.

      </div>


    </section>

  );

}


export default DetalledeVentaMensual;
