import { useEffect, useState } from "react";
import { fetchProtegido } from "../services/authService";

const mostrarProductividad = (valor) =>
  valor == null ? "—" : Number(valor).toFixed(2);

function ProductividadAntiguedad() {
  const [registros, setRegistros] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let activo = true;

    async function cargar() {
      try {
        const respuesta = await fetchProtegido(
          "/api/productividad-antiguedad"
        );

        if (!respuesta.ok) {
          throw new Error(`Error HTTP ${respuesta.status}`);
        }

        const datos = await respuesta.json();

        if (!datos.correcto) {
          throw new Error(datos.mensaje);
        }

        if (activo) {
          setRegistros(datos.registros || []);
        }
      } catch (fallo) {
        console.error(
          "Error al cargar productividad por antigüedad:",
          fallo
        );

        if (activo) {
          setError("No se pudo cargar la información.");
        }
      } finally {
        if (activo) {
          setCargando(false);
        }
      }
    }

    cargar();

    return () => {
      activo = false;
    };
  }, []);

  return (
    <section className="productividad-antiguedad">
      <header className="productividad-antiguedad__header">
        <h2>Productividad por antigüedad</h2>
        <p>
          Promedio por promotor activo · 45 días o menos /
          más de 45 días
        </p>
      </header>

      {cargando ? (
        <p role="status">Cargando información...</p>
      ) : error ? (
        <p role="alert">{error}</p>
      ) : (
        <div className="productividad-antiguedad__scroll">
          <table>
            <thead>
              <tr>
                <th rowSpan="2" scope="col">
                  Canal
                </th>
                <th
                  colSpan="3"
                  scope="colgroup"
                  className="productividad-antiguedad__nuevo"
                >
                  -45 días
                </th>
                <th
                  colSpan="3"
                  scope="colgroup"
                  className="productividad-antiguedad__experto"
                >
                  +45 días
                </th>
              </tr>
              <tr>
                <th scope="col">Promotores</th>
                <th scope="col">Prod. Vta</th>
                <th scope="col">Prod. Vta+RX</th>
                <th scope="col">Promotores</th>
                <th scope="col">Prod. Vta</th>
                <th scope="col">Prod. Vta+RX</th>
              </tr>
            </thead>

            <tbody>
              {registros.map(({ canal, menos45, mas45 }) => (
                <tr key={canal}>
                  <th scope="row">{canal}</th>

                  <td>{menos45.promotores}</td>
                  <td>
                    {mostrarProductividad(
                      menos45.productividadVenta
                    )}
                  </td>
                  <td>
                    {mostrarProductividad(
                      menos45.productividadVentaRx
                    )}
                  </td>

                  <td>{mas45.promotores}</td>
                  <td>
                    {mostrarProductividad(
                      mas45.productividadVenta
                    )}
                  </td>
                  <td>
                    {mostrarProductividad(
                      mas45.productividadVentaRx
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {registros.length === 0 && (
            <p>No hay información disponible.</p>
          )}
        </div>
      )}
    </section>
  );
}

export default ProductividadAntiguedad;
