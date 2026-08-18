import { useEffect, useMemo, useState } from "react";
import {
  fetchProtegido
} from "../services/authService";


// ==================================================
// URL DEL BACKEND
// ==================================================

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:3001";


// ==================================================
// COMPONENTE
// ==================================================

function AvanceSemanal({
  supervisorSeleccionado,
  setVista,
}) {

  // ==================================================
  // ESTADO
  // ==================================================

  const [registros, setRegistros] =
    useState([]);

  const [cargando, setCargando] =
    useState(true);

  const [error, setError] =
    useState("");


  // ==================================================
  // CARGAR AVANCE
  // ==================================================

  useEffect(() => {

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


        if (!respuesta.ok) {

          throw new Error(
            "No se pudo cargar el avance semanal"
          );

        }


        const datos =
          await respuesta.json();


        if (!datos.correcto) {

          throw new Error(
            datos.mensaje ||
            "No se pudo cargar el avance semanal"
          );

        }


        setRegistros(
          datos.registros || []
        );

        console.log(
  "🔥 AVANCE SEMANAL REAL RECIBIDO:",
  datos.registros
);

console.log(
  "🔥 PRIMER REGISTRO:",
  datos.registros?.[0]
);


      } catch (error) {

        console.error(
          "❌ Error cargando avance semanal:",
          error
        );


        setError(
          error.message ||
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

  }, [
    supervisorSeleccionado
  ]);


  // ==================================================
  // ORDENAR POR PRODUCTIVIDAD
  // ==================================================

  const registrosOrdenados =
    useMemo(() => {

      return [...registros].sort(
        (a, b) =>
          Number(
            b.productividad || 0
          ) -
          Number(
            a.productividad || 0
          )
      );

    }, [
      registros
    ]);


  // ==================================================
  // TOTALES
  // ==================================================

  const totales =
    useMemo(() => {

      return registros.reduce(
        (total, item) => {

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
          productividad: 0,
        }
      );

    }, [
      registros
    ]);


  // ==================================================
  // PRODUCTIVIDAD PROMEDIO
  // ==================================================

  const productividadPromedio =
    registros.length > 0

      ? (
          totales.productividad /
          registros.length
        ) * 100

      : 0;


  // ==================================================
  // FORMATEAR PRODUCTIVIDAD
  // ==================================================

  function formatearProductividad(
    valor
  ) {

    const numero =
      Number(
        valor || 0
      );


    return `${numero.toFixed(1)}`;

  }


  // ==================================================
  // FORMATEAR NÚMERO
  // ==================================================

  function formatearNumero(
    valor
  ) {

    return Number(
      valor || 0
    ).toLocaleString(
      "es-MX"
    );

  }


  // ==================================================
  // ESTILOS
  // ==================================================

  const estilos = {

    contenedor: {
      minHeight: "100vh",
      width: "100%",
      boxSizing: "border-box",
      padding: "24px",
      background: "#f4f7fb",
      color: "#14213d",
      fontFamily:
        "Arial, Helvetica, sans-serif",
    },


    tarjeta: {
      maxWidth: "1400px",
      margin: "0 auto",
      background: "#ffffff",
      borderRadius: "24px",
      padding: "28px",
      boxSizing: "border-box",
      boxShadow:
        "0 10px 30px rgba(0,0,0,0.08)",
    },


    encabezado: {
      textAlign: "center",
      marginBottom: "28px",
    },


    titulo: {
      margin: 0,
      fontSize: "34px",
      fontWeight: "800",
    },


    supervisor: {
      marginTop: "8px",
      fontSize: "18px",
      fontWeight: "600",
      color: "#2864e6",
    },


    resumen: {
      display: "grid",
      gridTemplateColumns:
        "repeat(auto-fit, minmax(150px, 1fr))",
      gap: "14px",
      marginBottom: "28px",
    },


    resumenCard: {
      background: "#f8fafc",
      border: "1px solid #dce3ec",
      borderRadius: "16px",
      padding: "18px",
      textAlign: "center",
    },


    resumenIcono: {
      fontSize: "26px",
    },


    resumenNumero: {
      marginTop: "6px",
      fontSize: "26px",
      fontWeight: "800",
    },


    resumenTexto: {
      marginTop: "4px",
      fontSize: "13px",
      color: "#667085",
    },


    tablaContenedor: {
      width: "100%",
      overflowX: "auto",
      border:
        "1px solid #dce3ec",
      borderRadius: "16px",
    },


    tabla: {
      width: "100%",
      minWidth: "850px",
      borderCollapse: "collapse",
    },


    th: {
      padding: "14px 12px",
      background: "#14213d",
      color: "#ffffff",
      textAlign: "center",
      fontSize: "13px",
      whiteSpace: "nowrap",
    },


    td: {
      padding: "14px 12px",
      borderBottom:
        "1px solid #e8edf3",
      textAlign: "center",
      fontSize: "14px",
    },


    promotor: {
      textAlign: "left",
      fontWeight: "700",
    },


    productividad: {
      fontWeight: "800",
      color: "#2864e6",
    },


    boton: {
      display: "block",
      margin:
        "28px auto 0",
      border: "none",
      borderRadius: "14px",
      padding:
        "14px 28px",
      background: "#14213d",
      color: "#ffffff",
      fontSize: "16px",
      fontWeight: "700",
      cursor: "pointer",
    },


    error: {
      textAlign: "center",
      padding: "40px 20px",
      color: "#d92d20",
      fontWeight: "700",
    },


    cargando: {
      textAlign: "center",
      padding: "80px 20px",
      fontSize: "20px",
      fontWeight: "700",
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
            style={
              estilos.boton
            }
            onClick={() =>
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

          <div
            style={
              estilos.resumenCard
            }
          >

            <div
              style={
                estilos.resumenIcono
              }
            >
              👥
            </div>

            <div
              style={
                estilos.resumenNumero
              }
            >
              {registros.length}
            </div>

            <div
              style={
                estilos.resumenTexto
              }
            >
              Promotores
            </div>

          </div>


          <div
            style={
              estilos.resumenCard
            }
          >

            <div
              style={
                estilos.resumenIcono
              }
            >
              📈
            </div>

            <div 
  style={ 
    estilos.resumenNumero 
  } 
> 
  {(productividadPromedio/100).toFixed(2)}
</div>

            <div
              style={
                estilos.resumenTexto
              }
            >
              Productividad del equipo
            </div>

          </div>


          <div
            style={
              estilos.resumenCard
            }
          >

            <div
              style={
                estilos.resumenIcono
              }
            >
              📦
            </div>

            <div
              style={
                estilos.resumenNumero
              }
            >
              {formatearNumero(
                totales.dobles
              )}
            </div>

            <div
              style={
                estilos.resumenTexto
              }
            >
              Paquetes dobles
            </div>

          </div>


          <div
            style={
              estilos.resumenCard
            }
          >

            <div
              style={
                estilos.resumenIcono
              }
            >
              🚀
            </div>

            <div
              style={
                estilos.resumenNumero
              }
            >
              {formatearNumero(
                totales.triples
              )}
            </div>

            <div
              style={
                estilos.resumenTexto
              }
            >
              Paquetes triples
            </div>

          </div>


          <div
            style={
              estilos.resumenCard
            }
          >

            <div
              style={
                estilos.resumenIcono
              }
            >
              📱
            </div>

            <div
              style={
                estilos.resumenNumero
              }
            >
              {formatearNumero(
                totales.movil
              )}
            </div>

            <div
              style={
                estilos.resumenTexto
              }
            >
              Mega Móvil
            </div>

          </div>


          <div
            style={
              estilos.resumenCard
            }
          >

            <div
              style={
                estilos.resumenIcono
              }
            >
              🎬
            </div>

            <div
              style={
                estilos.resumenNumero
              }
            >
              {
                formatearNumero(
                  totales.netflix +
                  totales.disney +
                  totales.max
                )
              }
            </div>

            <div
              style={
                estilos.resumenTexto
              }
            >
              Streaming
            </div>

          </div>

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
                  style={
                    estilos.th
                  }
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

                <th
                  style={
                    estilos.th
                  }
                >
                  Dobles
                </th>

                <th
                  style={
                    estilos.th
                  }
                >
                  Triples
                </th>

                <th
                  style={
                    estilos.th
                  }
                >
                  Mega Móvil
                </th>

                <th
                  style={
                    estilos.th
                  }
                >
                  Netflix
                </th>

                <th
                  style={
                    estilos.th
                  }
                >
                  Disney+
                </th>

                <th
                  style={
                    estilos.th
                  }
                >
                  MAX
                </th>

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
                      {
                        formatearProductividad(
                          item.productividad
                        )
                      }
                    </td>


                    <td
                      style={
                        estilos.td
                      }
                    >
                      {item.dobles}
                    </td>


                    <td
                      style={
                        estilos.td
                      }
                    >
                      {item.triples}
                    </td>


                    <td
                      style={
                        estilos.td
                      }
                    >
                      {item.movil}
                    </td>


                    <td
                      style={
                        estilos.td
                      }
                    >
                      {item.netflix}
                    </td>


                    <td
                      style={
                        estilos.td
                      }
                    >
                      {item.disney}
                    </td>


                    <td
                      style={
                        estilos.td
                      }
                    >
                      {item.max}
                    </td>

                  </tr>

                )
              )}

            </tbody>

          </table>

        </div>

         </div>


        {/* ==========================================
            NOTA IMPORTANTE
        ========================================== */}

        <div
          style={{
            marginTop: "18px",
            textAlign: "center",
            color: "#d92d20",
            fontSize: "15px",
            fontWeight: "700",
          }}
        >
          NOTA: revisa tus ventas canceladas en tus auxiliares y comisiones
          
        </div>
        <div
          style={{
            marginTop: "18px",
            textAlign: "center",
            color: "#d92d20",
            fontSize: "15px",
            fontWeight: "700",
          }}
        >
          NOTA 2: No sustituye prenóminas
          
        </div>


        {/* ==========================================
            REGRESAR
        ========================================== */}

        <button
          style={
            estilos.boton
          }
          onClick={() =>
            setVista(
              "supervisor"
            )
          }
        >

          ← Regresar al inicio

        </button>

      </div>

    

  );

}


export default AvanceSemanal;