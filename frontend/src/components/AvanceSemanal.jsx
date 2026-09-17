import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  fetchProtegido,
} from "../services/authService";


// ==================================================
// URL DEL BACKEND
// ==================================================

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:3001";


const formatearNumero =
  (valor) =>
    Number(
      valor || 0
    ).toLocaleString(
      "es-MX"
    );


const formatearProductividad =
  (valor) =>
    Number(
      valor || 0
    ).toFixed(2);


// ==================================================
// COMPONENTE
// ==================================================

function AvanceSemanal({
  supervisorSeleccionado,
  setVista,
}) {

  const [registros, setRegistros] =
    useState([]);

  const [cargando, setCargando] =
    useState(true);

  const [error, setError] =
    useState("");


  // ==================================================
  // CARGAR AVANCE
  // ==================================================

  useEffect(
    () => {

      async function cargarAvance() {

        try {

          setCargando(true);
          setError("");


          const supervisor =
            encodeURIComponent(
              supervisorSeleccionado
            );


          const respuesta =
            await fetchProtegido(
              `${API_URL}/api/avance-semanal?supervisor=${supervisor}`
            );


          const datos =
            await respuesta.json();


          if (
            !respuesta.ok ||
            !datos.correcto
          ) {

            throw new Error(
              datos.mensaje ||
              "No se pudo cargar el avance semanal"
            );

          }


          setRegistros(
            datos.registros || []
          );

        } catch (errorCarga) {

          console.error(
            "❌ Error cargando avance semanal:",
            errorCarga
          );

          setError(
            errorCarga.message ||
            "No se pudo cargar el avance semanal"
          );

        } finally {

          setCargando(false);

        }

      }


      if (
        supervisorSeleccionado
      ) {

        cargarAvance();

      }

    },
    [supervisorSeleccionado]
  );


  // ==================================================
  // ORDENAR POR PRODUCTIVIDAD
  // ==================================================

  const registrosOrdenados =
    useMemo(
      () =>
        [...registros].sort(
          (
            registroA,
            registroB
          ) =>
            Number(
              registroB.productividad || 0
            ) -
            Number(
              registroA.productividad || 0
            )
        ),
      [registros]
    );


  // ==================================================
  // TOTALES
  // ==================================================

  const totales =
    useMemo(
      () =>
        registros.reduce(
          (
            total,
            item
          ) => {

            total.dobles +=
              Number(
                item.dobles || 0
              );

            total.triples +=
              Number(
                item.triples || 0
              );

            total.movil +=
              Number(
                item.movil || 0
              );

            total.netflix +=
              Number(
                item.netflix || 0
              );

            total.disney +=
              Number(
                item.disney || 0
              );

            total.max +=
              Number(
                item.max || 0
              );

            total.rx +=
              Number(
                item.rx || 0
              );

            total.productividad +=
              Number(
                item.productividad || 0
              );


            return total;

          },
          {
            dobles: 0,
            triples: 0,
            movil: 0,
            netflix: 0,
            disney: 0,
            max: 0,
            rx: 0,
            productividad: 0,
          }
        ),
      [registros]
    );


  const productividadPromedio =
    registros.length > 0
      ? (
          totales.productividad /
          registros.length
        )
      : 0;


  // ==================================================
  // TARJETAS DEL RESUMEN
  // ==================================================

  const tarjetasResumen = [

    {
      icono: "👥",

      valor:
        formatearNumero(
          registros.length
        ),

      texto:
        "Promotores",
    },

    {
      icono: "📈",

      valor:
        productividadPromedio.toFixed(
          2
        ),

      texto:
        "Productividad del equipo",
    },

    {
      icono: "🔄",

      valor:
        formatearNumero(
          totales.rx
        ),

      texto:
        "RX del equipo",
    },

    {
      icono: "📦",

      valor:
        formatearNumero(
          totales.dobles
        ),

      texto:
        "Paquetes dobles",
    },

    {
      icono: "🚀",

      valor:
        formatearNumero(
          totales.triples
        ),

      texto:
        "Paquetes triples",
    },

    {
      icono: "📱",

      valor:
        formatearNumero(
          totales.movil
        ),

      texto:
        "Mega Móvil",
    },

    {
      icono: "🎬",

      valor:
        formatearNumero(
          totales.netflix +
          totales.disney +
          totales.max
        ),

      texto:
        "Streaming",
    },

  ];


  // ==================================================
  // COLUMNAS DE SERVICIOS
  // ==================================================

  const columnasServicios = [

    {
      campo: "dobles",
      titulo: "Dobles",
    },

    {
      campo: "triples",
      titulo: "Triples",
    },

    {
      campo: "movil",
      titulo: "Mega Móvil",
    },

    {
      campo: "netflix",
      titulo: "Netflix",
    },

    {
      campo: "disney",
      titulo: "Disney+",
    },

    {
      campo: "max",
      titulo: "MAX",
    },

    {
      campo: "rx",
      titulo: "RX",
    },

  ];


  // ==================================================
  // ESTILOS
  // ==================================================

  const estilos = {

    contenedor: {

      minHeight:
        "100vh",

      width:
        "100%",

      boxSizing:
        "border-box",

      padding:
        "24px",

      background:
        "#f4f7fb",

      color:
        "#14213d",

      fontFamily:
        "Arial, Helvetica, sans-serif",

    },


    tarjeta: {

      maxWidth:
        "1400px",

      margin:
        "0 auto",

      padding:
        "28px",

      boxSizing:
        "border-box",

      borderRadius:
        "24px",

      background:
        "#ffffff",

      boxShadow:
        "0 10px 30px rgba(0,0,0,0.08)",

    },


    encabezado: {

      marginBottom:
        "28px",

      textAlign:
        "center",

    },


    titulo: {

      margin:
        0,

      fontSize:
        "34px",

      fontWeight:
        "800",

    },


    supervisor: {

      marginTop:
        "8px",

      color:
        "#2864e6",

      fontSize:
        "18px",

      fontWeight:
        "600",

    },


    resumen: {

      display:
        "grid",

      gridTemplateColumns:
        "repeat(auto-fit, minmax(150px, 1fr))",

      gap:
        "14px",

      marginBottom:
        "28px",

    },


    resumenCard: {

      padding:
        "18px",

      border:
        "1px solid #dce3ec",

      borderRadius:
        "16px",

      background:
        "#f8fafc",

      textAlign:
        "center",

    },


    resumenIcono: {

      fontSize:
        "26px",

    },


    resumenNumero: {

      marginTop:
        "6px",

      fontSize:
        "26px",

      fontWeight:
        "800",

    },


    resumenTexto: {

      marginTop:
        "4px",

      color:
        "#667085",

      fontSize:
        "13px",

    },


    tablaContenedor: {

      width:
        "100%",

      overflowX:
        "auto",

      border:
        "1px solid #dce3ec",

      borderRadius:
        "16px",

    },


    tabla: {

      width:
        "100%",

      minWidth:
        "950px",

      borderCollapse:
        "collapse",

    },


    th: {

      padding:
        "14px 12px",

      color:
        "#ffffff",

      background:
        "#14213d",

      fontSize:
        "13px",

      textAlign:
        "center",

      whiteSpace:
        "nowrap",

    },


    td: {

      padding:
        "14px 12px",

      borderBottom:
        "1px solid #e8edf3",

      fontSize:
        "14px",

      textAlign:
        "center",

    },


    promotor: {

      fontWeight:
        "700",

      textAlign:
        "left",

    },


    productividad: {

      color:
        "#2864e6",

      fontWeight:
        "800",

    },


    rx: {

      color:
        "#15803d",

      fontWeight:
        "800",

    },


    notas: {

      marginTop:
        "22px",

      padding:
        "16px",

      border:
        "1px solid #fecaca",

      borderRadius:
        "12px",

      color:
        "#b42318",

      background:
        "#fef2f2",

      fontSize:
        "14px",

      fontWeight:
        "700",

      textAlign:
        "center",

    },


    notaSecundaria: {

      display:
        "block",

      marginTop:
        "6px",

    },


    boton: {

      display:
        "block",

      margin:
        "28px auto 0",

      padding:
        "14px 28px",

      border:
        "none",

      borderRadius:
        "14px",

      color:
        "#ffffff",

      background:
        "#14213d",

      fontSize:
        "16px",

      fontWeight:
        "700",

      cursor:
        "pointer",

    },


    error: {

      padding:
        "40px 20px",

      color:
        "#d92d20",

      fontWeight:
        "700",

      textAlign:
        "center",

    },


    cargando: {

      padding:
        "80px 20px",

      fontSize:
        "20px",

      fontWeight:
        "700",

      textAlign:
        "center",

    },

  };


  // ==================================================
  // CARGANDO
  // ==================================================

  if (cargando) {

    return (
      <div
        style={
          estilos.contenedor
        }
      >

        <div
          style={
            estilos.tarjeta
          }
        >

          <div
            style={
              estilos.cargando
            }
          >
            📊 Cargando avance semanal...
          </div>

        </div>

      </div>
    );

  }


  // ==================================================
  // ERROR
  // ==================================================

  if (error) {

    return (
      <div
        style={
          estilos.contenedor
        }
      >

        <div
          style={
            estilos.tarjeta
          }
        >

          <div
            style={
              estilos.error
            }
          >
            ❌ {error}
          </div>

          <button
            type="button"
            style={
              estilos.boton
            }
            onClick={
              () =>
                setVista(
                  "supervisor"
                )
            }
          >
            ← Regresar al inicio
          </button>

        </div>

      </div>
    );

  }


  // ==================================================
  // RENDER
  // ==================================================

  return (
    <div
      style={
        estilos.contenedor
      }
    >

      <div
        style={
          estilos.tarjeta
        }
      >

        {/* ==========================================
            ENCABEZADO
        ========================================== */}

        <div
          style={
            estilos.encabezado
          }
        >

          <h1
            style={
              estilos.titulo
            }
          >
            📊 Avance semanal
          </h1>

          <div
            style={
              estilos.supervisor
            }
          >
            {supervisorSeleccionado}
          </div>

        </div>


        {/* ==========================================
            RESUMEN
        ========================================== */}

        <div
          style={
            estilos.resumen
          }
        >

          {tarjetasResumen.map(
            (tarjeta) => (

              <div
                style={
                  estilos.resumenCard
                }
                key={
                  tarjeta.texto
                }
              >

                <div
                  style={
                    estilos.resumenIcono
                  }
                >
                  {tarjeta.icono}
                </div>

                <div
                  style={
                    estilos.resumenNumero
                  }
                >
                  {tarjeta.valor}
                </div>

                <div
                  style={
                    estilos.resumenTexto
                  }
                >
                  {tarjeta.texto}
                </div>

              </div>

            )
          )}

        </div>


        {/* ==========================================
            TABLA
        ========================================== */}

        <div
          style={
            estilos.tablaContenedor
          }
        >

          <table
            style={
              estilos.tabla
            }
          >

            <thead>

              <tr>

                <th
                  style={
                    estilos.th
                  }
                >
                  #
                </th>

                <th
                  style={{
                    ...estilos.th,
                    textAlign:
                      "left",
                  }}
                >
                  Promotor
                </th>

                <th
                  style={
                    estilos.th
                  }
                >
                  Productividad
                </th>

                {columnasServicios.map(
                  (columna) => (

                    <th
                      style={
                        estilos.th
                      }
                      key={
                        columna.campo
                      }
                    >
                      {columna.titulo}
                    </th>

                  )
                )}

              </tr>

            </thead>


            <tbody>

              {registrosOrdenados.map(
                (
                  item,
                  index
                ) => (

                  <tr
                    key={
                      `${item.nombre}-${index}`
                    }
                  >

                    <td
                      style={
                        estilos.td
                      }
                    >
                      {index + 1}
                    </td>

                    <td
                      style={{
                        ...estilos.td,
                        ...estilos.promotor,
                      }}
                    >
                      {item.nombre}
                    </td>

                    <td
                      style={{
                        ...estilos.td,
                        ...estilos.productividad,
                      }}
                    >
                      {formatearProductividad(
                        item.productividad
                      )}
                    </td>

                    {columnasServicios.map(
                      (columna) => (

                        <td
                          style={{
                            ...estilos.td,

                            ...(columna.campo ===
                            "rx"
                              ? estilos.rx
                              : {}),
                          }}
                          key={
                            columna.campo
                          }
                        >
                          {formatearNumero(
                            item[
                              columna.campo
                            ]
                          )}
                        </td>

                      )
                    )}

                  </tr>

                )
              )}

            </tbody>

          </table>

        </div>


        {/* ==========================================
            NOTAS
        ========================================== */}

        <div
          style={
            estilos.notas
          }
        >

          <span>
            NOTA: revisa tus ventas canceladas en tus auxiliares y comisiones.
          </span>

          <span
            style={
              estilos.notaSecundaria
            }
          >
            NOTA 2: No sustituye prenóminas.
          </span>

        </div>


        {/* ==========================================
            REGRESAR
        ========================================== */}

        <button
          type="button"
          style={
            estilos.boton
          }
          onClick={
            () =>
              setVista(
                "supervisor"
              )
          }
        >
          ← Regresar al inicio
        </button>

      </div>

    </div>
  );

}


export default AvanceSemanal;
