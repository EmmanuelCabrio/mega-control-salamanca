import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  fetchProtegido,
} from "../services/authService";


// ==================================================
// DETALLE DIARIO DEL EQUIPO
// ==================================================

function DetalleEquipoDiario({
  supervisor,
  onRegresar,
}) {

  // ================================================
  // ESTADOS
  // ================================================

  const [
    detalle,
    setDetalle,
  ] = useState(null);


  const [
    cargando,
    setCargando,
  ] = useState(true);


  const [
    error,
    setError,
  ] = useState("");


  // ================================================
  // NOMBRE DEL SUPERVISOR
  // ================================================

  const nombreSupervisor =
    typeof supervisor === "string"
      ? supervisor
      : supervisor?.supervisor || "";


  // ================================================
  // CARGAR INFORMACIÓN
  // ================================================

  useEffect(
    () => {

      let componenteActivo =
        true;


      async function cargarDetalle() {

        if (
          !nombreSupervisor
        ) {

          if (
            componenteActivo
          ) {

            setError(
              "No se seleccionó un supervisor."
            );

            setCargando(
              false
            );

          }


          return;

        }


        try {

          setCargando(
            true
          );

          setError(
            ""
          );


          const respuesta =
            await fetchProtegido(

              `/api/detalle-equipo-diario?supervisor=${encodeURIComponent(
                nombreSupervisor
              )}`

            );


          const resultado =
            await respuesta.json();


          if (
            !respuesta.ok ||
            !resultado.correcto
          ) {

            throw new Error(
              resultado.mensaje ||
              "No se pudo cargar el detalle diario"
            );

          }


          if (
            componenteActivo
          ) {

            setDetalle(
              resultado
            );

          }


        } catch (
          error
        ) {

          console.error(
            "❌ Error DetalleEquipoDiario:",
            error
          );


          if (
            componenteActivo
          ) {

            setError(
              error.message ||
              "No se pudo cargar el resultado del equipo"
            );

          }


        } finally {

          if (
            componenteActivo
          ) {

            setCargando(
              false
            );

          }

        }

      }


      cargarDetalle();


      return () => {

        componenteActivo =
          false;

      };

    },
    [
      nombreSupervisor,
    ]
  );


  // ================================================
  // DÍAS DEL MES
  // ================================================

  const dias =
    useMemo(
      () =>
        Array.from(
          {
            length: 31,
          },
          (
            _,
            indice
          ) =>
            indice + 1
        ),
      []
    );


  // ================================================
  // FECHA DE CORTE
  // ================================================

  const diaCorte =
    Number(
      detalle?.fechaCorte?.dia ||
      0
    );


  // ================================================
  // TOTALES DEL EQUIPO
  // ================================================

  const totales =
    useMemo(
      () => {

        const registros =
          detalle?.registros ||
          [];


        return registros.reduce(
          (
            acumulado,
            registro
          ) => {

            acumulado.ventas +=
              Number(
                registro.totalVentas ||
                0
              );


            acumulado.rx +=
              Number(
                registro.totalRx ||
                0
              );


            return acumulado;

          },
          {
            ventas: 0,
            rx: 0,
          }
        );

      },
      [
        detalle,
      ]
    );


  // ================================================
  // CLASE DE PRODUCTIVIDAD
  // ================================================

  const obtenerClaseProductividad =
    (
      productividad
    ) => {

      const valor =
        Number(
          productividad
        );


      if (
        !Number.isFinite(
          valor
        ) ||
        valor <= 1
      ) {

        return "productividad-roja";

      }


      if (
        valor < 3
      ) {

        return "productividad-naranja";

      }


      if (
        valor < 4
      ) {

        return "productividad-amarilla";

      }


      if (
        valor < 5
      ) {

        return "productividad-verde-clara";

      }


      return "productividad-verde-oscura";

    };


  // ================================================
  // FORMATO DE PRODUCTIVIDAD
  // ================================================

  const formatearProductividad =
    (
      valor
    ) => {

      const numero =
        Number(
          valor
        );


      return Number.isFinite(
        numero
      )
        ? numero.toFixed(
            2
          )
        : "0.00";

    };


  // ================================================
  // CARGANDO
  // ================================================

  if (
    cargando
  ) {

    return (

      <section className="detalle-equipo-diario">

        <div className="detalle-equipo-diario-estado">

          <div className="detalle-equipo-diario-spinner" />

          <h2>
            Cargando resultado diario...
          </h2>

          <p>
            Estamos preparando la información de{" "}
            {nombreSupervisor}.
          </p>

        </div>

      </section>

    );

  }


  // ================================================
  // ERROR
  // ================================================

  if (
    error
  ) {

    return (

      <section className="detalle-equipo-diario">

        <div className="detalle-equipo-diario-estado">

          <span className="detalle-equipo-diario-icono-error">
            ⚠️
          </span>

          <h2>
            No se pudo cargar la información
          </h2>

          <p>
            {error}
          </p>

          <button
            type="button"
            className="detalle-equipo-regresar"
            onClick={
              onRegresar
            }
          >
            ← Regresar al panel
          </button>

        </div>

      </section>

    );

  }


  // ================================================
  // REGISTROS
  // ================================================

  const registros =
    detalle?.registros ||
    [];


  // ================================================
  // RENDER
  // ================================================

  return (

    <section className="detalle-equipo-diario">


      {/* ============================================
          ENCABEZADO
      ============================================ */}

      <header className="detalle-equipo-diario-header">

        <div>

          <div className="detalle-equipo-diario-etiqueta">
            RESULTADO DIARIO DEL EQUIPO
          </div>

          <h1>
            {nombreSupervisor}
          </h1>

          <p>
            Ventas y recuperaciones por vendedor
            del día 1 al 31
          </p>

        </div>


        <button
          type="button"
          className="detalle-equipo-regresar"
          onClick={
            onRegresar
          }
        >
          ← Regresar al panel
        </button>

      </header>


      {/* ============================================
          INDICADORES
      ============================================ */}

      <div className="detalle-equipo-kpis">

        <article className="detalle-equipo-kpi">

          <span>
            Integrantes
          </span>

          <strong>
            {registros.length}
          </strong>

          <small>
            Vendedores activos
          </small>

        </article>


        <article className="detalle-equipo-kpi detalle-equipo-kpi-ventas">

          <span>
            Ventas
          </span>

          <strong>
            {totales.ventas}
          </strong>

          <small>
            Acumulado del equipo
          </small>

        </article>


        <article className="detalle-equipo-kpi detalle-equipo-kpi-rx">

          <span>
            RX
          </span>

          <strong>
            {totales.rx}
          </strong>

          <small>
            Recuperaciones acumuladas
          </small>

        </article>


        <article className="detalle-equipo-kpi detalle-equipo-kpi-total">

          <span>
            Venta + RX
          </span>

          <strong>
            {
              totales.ventas +
              totales.rx
            }
          </strong>

          <small>
            Resultado comercial total
          </small>

        </article>

      </div>


      {/* ============================================
          LEYENDA
      ============================================ */}

      <div className="detalle-equipo-leyenda">

        <span>
          <b className="detalle-equipo-muestra venta">
            V
          </b>

          Venta
        </span>


        <span>
          <b className="detalle-equipo-muestra rx">
            R
          </b>

          Recuperación
        </span>


        {diaCorte > 0 && (

          <span className="detalle-equipo-corte">

            Información actualizada hasta el día{" "}
            <strong>
              {diaCorte}
            </strong>

          </span>

        )}

      </div>


      {/* ============================================
          TABLA
      ============================================ */}

      <div className="detalle-equipo-tabla-contenedor">

        <table className="detalle-equipo-tabla">

          <thead>

            <tr>

              <th
                rowSpan="2"
                className="detalle-equipo-columna-vendedor"
              >
                Vendedor
              </th>


              {dias.map(
                (
                  dia
                ) => (

                  <th
                    key={
                      `encabezado-dia-${dia}`
                    }
                    colSpan="2"
                    className={
                      diaCorte > 0 &&
                      dia > diaCorte
                        ? "detalle-equipo-dia-futuro"
                        : ""
                    }
                  >
                    {dia}
                  </th>

                )
              )}


              <th
                rowSpan="2"
                className="detalle-equipo-total-ventas"
              >
                Total
                <br />
                ventas
              </th>


              <th
                rowSpan="2"
                className="detalle-equipo-total-rx"
              >
                Total
                <br />
                RX
              </th>


              <th
                rowSpan="2"
                className="detalle-equipo-productividad"
              >
                Prod.
                <br />
                venta
              </th>


              <th
                rowSpan="2"
                className="detalle-equipo-productividad"
              >
                Prod.
                <br />
                venta + RX
              </th>

            </tr>


            <tr>

              {dias.map(
                (
                  dia
                ) => (

                  <FragmentDia
                    key={
                      `subencabezado-${dia}`
                    }
                    futuro={
                      diaCorte > 0 &&
                      dia > diaCorte
                    }
                  />

                )
              )}

            </tr>

          </thead>


          <tbody>

            {registros.map(
              (
                registro,
                indiceRegistro
              ) => (

                <tr
                  key={
                    `${registro.nombre}-${indiceRegistro}`
                  }
                >

                  <td className="detalle-equipo-columna-vendedor">

                    <span className="detalle-equipo-posicion">
                      {
                        indiceRegistro + 1
                      }
                    </span>

                    <strong>
                      {registro.nombre}
                    </strong>

                  </td>


                  {dias.map(
                    (
                      dia
                    ) => {

                      const resultadoDia =
                        registro.dias?.[
                          dia - 1
                        ] || {

                          venta: 0,

                          rx: 0,

                        };


                      const esFuturo =
                        diaCorte > 0 &&
                        dia > diaCorte;


                      return (

                        <FragmentResultadoDia
                          key={
                            `${registro.nombre}-${dia}`
                          }
                          venta={
                            resultadoDia.venta
                          }
                          rx={
                            resultadoDia.rx
                          }
                          futuro={
                            esFuturo
                          }
                        />

                      );

                    }
                  )}


                  <td className="detalle-equipo-total-ventas">

                    {registro.totalVentas}

                  </td>


                  <td className="detalle-equipo-total-rx">

                    {registro.totalRx}

                  </td>


                  <td
                    className={`
                      detalle-equipo-productividad
                      ${obtenerClaseProductividad(
                        registro.productividadVenta
                      )}
                    `}
                  >

                    {formatearProductividad(
                      registro.productividadVenta
                    )}

                  </td>


                  <td
                    className={`
                      detalle-equipo-productividad
                      ${obtenerClaseProductividad(
                        registro.productividadVentaRx
                      )}
                    `}
                  >

                    {formatearProductividad(
                      registro.productividadVentaRx
                    )}

                  </td>

                </tr>

              )
            )}


            {registros.length > 0 && (

              <tr className="detalle-equipo-fila-total">

                <td className="detalle-equipo-columna-vendedor">

                  TOTAL EQUIPO

                </td>


                {dias.map(
                  (
                    dia
                  ) => {

                    const ventaDia =
                      registros.reduce(
                        (
                          total,
                          registro
                        ) =>
                          total +
                          Number(
                            registro.dias?.[
                              dia - 1
                            ]?.venta ||
                            0
                          ),
                        0
                      );


                    const rxDia =
                      registros.reduce(
                        (
                          total,
                          registro
                        ) =>
                          total +
                          Number(
                            registro.dias?.[
                              dia - 1
                            ]?.rx ||
                            0
                          ),
                        0
                      );


                    const esFuturo =
                      diaCorte > 0 &&
                      dia > diaCorte;


                    return (

                      <FragmentResultadoDia
                        key={
                          `total-dia-${dia}`
                        }
                        venta={
                          ventaDia
                        }
                        rx={
                          rxDia
                        }
                        futuro={
                          esFuturo
                        }
                      />

                    );

                  }
                )}


                <td className="detalle-equipo-total-ventas">

                  {totales.ventas}

                </td>


                <td className="detalle-equipo-total-rx">

                  {totales.rx}

                </td>


                <td className="detalle-equipo-productividad">
                  —
                </td>


                <td className="detalle-equipo-productividad">
                  —
                </td>

              </tr>

            )}


            {registros.length === 0 && (

              <tr>

                <td
                  colSpan="67"
                  className="detalle-equipo-sin-datos"
                >

                  No se encontraron vendedores para este supervisor.

                </td>

              </tr>

            )}

          </tbody>

        </table>

      </div>


      <div className="detalle-equipo-ayuda">

        💡 Desliza horizontalmente para consultar
        todos los días y las productividades.

      </div>

    </section>

  );

}


// ==================================================
// SUBENCABEZADOS DE VENTA Y RX
// ==================================================

function FragmentDia({
  futuro,
}) {

  const clase =
    futuro
      ? "detalle-equipo-dia-futuro"
      : "";


  return (

    <>

      <th
        className={`detalle-equipo-subventa ${clase}`}
      >
        V
      </th>

      <th
        className={`detalle-equipo-subrx ${clase}`}
      >
        R
      </th>

    </>

  );

}


// ==================================================
// CELDAS DE VENTA Y RX
// ==================================================

function FragmentResultadoDia({
  venta,
  rx,
  futuro,
}) {

  if (
    futuro
  ) {

    return (

      <>

        <td className="detalle-equipo-celda detalle-equipo-dia-futuro">
          —
        </td>

        <td className="detalle-equipo-celda detalle-equipo-dia-futuro">
          —
        </td>

      </>

    );

  }


  return (

    <>

      <td
        className={
          Number(
            venta
          ) > 0
            ? "detalle-equipo-celda detalle-equipo-celda-venta activa"
            : "detalle-equipo-celda detalle-equipo-celda-cero"
        }
      >
        {
          Number(
            venta
          ) || 0
        }
      </td>


      <td
        className={
          Number(
            rx
          ) > 0
            ? "detalle-equipo-celda detalle-equipo-celda-rx activa"
            : "detalle-equipo-celda detalle-equipo-celda-cero"
        }
      >
        {
          Number(
            rx
          ) || 0
        }
      </td>

    </>

  );

}


export default DetalleEquipoDiario;
