import {
  useEffect,
  useState,
} from "react";

import {
  fetchProtegido,
} from "../services/authService";


// ==================================================
// 📊 PROYECCIÓN DE CIERRE — DIRECCIÓN
// ==================================================

function ProyeccionDireccion() {

  // ================================================
  // ESTADOS DEL COMPONENTE
  // ================================================

  const [datos, setDatos] = useState(null);

  const [cargando, setCargando] = useState(true);

  const [error, setError] = useState("");

  const [intento, setIntento] = useState(0);


  // ================================================
  // CONSULTAR LA PROYECCIÓN
  // ================================================

  useEffect(() => {

    let activo = true;

    async function cargarProyeccion() {

      setCargando(true);

      setError("");

      try {

        const respuesta = await fetchProtegido(
          "/api/proyeccion"
        );

        if (!respuesta.ok) {

          throw new Error(
            respuesta.status === 403
              ? "Acceso exclusivo de Dirección"
              : respuesta.status === 401
                ? "Tu sesión expiró. Vuelve a iniciar sesión."
                : "No se pudo cargar la proyección"
          );

        }

        const resultado = await respuesta.json();

        // Verificar que recibimos las 11 columnas
        // y las 60 filas de indicadores.
        const estructuraValida =
          resultado.correcto &&
          Array.isArray(resultado.encabezados) &&
          resultado.encabezados.length === 11 &&
          Array.isArray(resultado.filas) &&
          resultado.filas.length === 60 &&
          resultado.filas.every(
            (fila) =>
              Array.isArray(fila?.celdas) &&
              fila.celdas.length === 11
          );

        if (!estructuraValida) {

          throw new Error(
            resultado.mensaje ||
            "La proyección no contiene la estructura esperada"
          );

        }

        if (activo) {

          setDatos(resultado);

        }

      } catch (errorConsulta) {

        if (activo) {

          setError(
            errorConsulta.message ||
            "No se pudo cargar la proyección"
          );

        }

      } finally {

        if (activo) {

          setCargando(false);

        }

      }

    }

    cargarProyeccion();

    // Evita actualizar el componente si el usuario
    // salió del panel mientras cargaban los datos.
    return () => {

      activo = false;

    };

  }, [intento]);


  // ================================================
  // IDENTIFICAR EL ESTILO DE CADA FILA
  // ================================================

  function obtenerClaseFila(fila) {

    if (fila.separador) {

      return "proyeccion-direccion__separador";

    }

    // Filas de resultados en el Excel.
    // Solo cambia su apariencia; conserva su posición.
    const filasDestacadas = [
      58,
      59,
      60,
      62,
      64,
      65,
      66,
      67,
      68,
    ];

    if (filasDestacadas.includes(fila.numero)) {

      return "proyeccion-direccion__resultado";

    }

    return "";

  }


  // ================================================
  // MOSTRAR EL COMPONENTE
  // ================================================

  return (

    <section
      className="proyeccion-direccion"
      aria-labelledby="proyeccion-titulo"
    >

      {/* ENCABEZADO */}

      <header className="proyeccion-direccion__header">

        <div>

          <span className="proyeccion-direccion__eyebrow">
            DIRECCIÓN · SALAMANCA
          </span>

          <h2 id="proyeccion-titulo">
            Proyección de cierre
          </h2>

          <p>
            Consolidado del CL y detalle por sucursal
          </p>

        </div>

        <span className="proyeccion-direccion__badge">
          VISIÓN EJECUTIVA
        </span>

      </header>


      {/* CARGANDO */}

      {cargando ? (

        <p
          className="proyeccion-direccion__estado"
          role="status"
        >
          Cargando proyección…
        </p>

      ) : error ? (

        /* ERROR Y REINTENTO */

        <div
          className="proyeccion-direccion__estado"
          role="alert"
        >

          <p>
            {error}
          </p>

          <button
            type="button"
            onClick={() => {

              setIntento(
                (valorActual) => valorActual + 1
              );

            }}
          >
            Reintentar
          </button>

        </div>

      ) : datos ? (

        <>

          <p
            className="proyeccion-direccion__ayuda"
            id="proyeccion-ayuda"
          >
            Desplázate para consultar todas las
            sucursales e indicadores.
          </p>


          {/* CONTENEDOR DE LA TABLA */}

          <div
            className="proyeccion-direccion__scroll"
            tabIndex={0}
            role="region"
            aria-label="Tabla de proyección por sucursal"
            aria-describedby="proyeccion-ayuda"
          >

            <table className="proyeccion-direccion__tabla">

              <caption className="proyeccion-direccion__sr">
                Proyección de cierre de Salamanca,
                indicadores por sucursal
              </caption>


              {/* ENCABEZADOS: N8:X8 */}

              <thead>

                <tr>

                  {datos.encabezados.map(
                    (celda, indice) => (

                      <th
                        key={celda.direccion}
                        scope="col"
                        aria-label={
                          indice === 0 && !celda.texto
                            ? "Indicador"
                            : undefined
                        }
                      >
                        {celda.texto}
                      </th>

                    )
                  )}

                </tr>

              </thead>


              {/* INDICADORES: N9:X68 */}

              <tbody>

                {datos.filas.map(
                  (fila) => (

                    <tr
                      key={fila.numero}
                      className={obtenerClaseFila(fila)}
                    >

                      {fila.celdas.map(
                        (celda, indice) => (

                          indice === 0 ? (

                            <th
                              key={celda.direccion}
                              scope="row"
                            >
                              {celda.texto}
                            </th>

                          ) : (

                            <td
                              key={celda.direccion}
                            >
                              {celda.texto}
                            </td>

                          )

                        )
                      )}

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        </>

      ) : null}

    </section>

  );

}


export default ProyeccionDireccion;
