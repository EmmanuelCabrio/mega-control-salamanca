import { useEffect, useState } from "react";
import { fetchProtegido } from "../services/authService";

const nombresCanal = {
  CAM: "CAMBACEO",
  EMP: "EMPRESARIAL",
  PDV: "PUNTO DE VENTA",
};

function ProductividadBajaDireccion() {
  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let activo = true;

    async function cargarDatos() {
      try {
        const respuesta = await fetchProtegido(
          "/api/promotores-productividad-baja"
        );

        const resultado = await respuesta.json();

        if (!respuesta.ok || !resultado.correcto) {
          throw new Error(
            resultado.mensaje ||
              "No se pudo cargar la productividad."
          );
        }

        if (activo) {
          setDatos(resultado);
        }
      } catch (fallo) {
        console.error(
          "Error al cargar productividad baja:",
          fallo
        );

        if (activo) {
          setError(
            fallo.message ||
              "No se pudo cargar la información."
          );
        }
      } finally {
        if (activo) {
          setCargando(false);
        }
      }
    }

    cargarDatos();

    return () => {
      activo = false;
    };
  }, []);

  const resumen = datos?.resumen || [];
  const detalle = datos?.detalle || [];

  return (
    <section className="productividad-baja-direccion">
      <header className="productividad-baja-direccion__header">
        <div>
          <h2>Promotores por rango de productividad</h2>
          <p>
            CAM, EMP y PDV · Productividad menor a 0.80
          </p>
        </div>

        {!cargando && !error && (
          <strong>{detalle.length} promotores</strong>
        )}
      </header>

      {cargando ? (
        <p role="status">Cargando promotores...</p>
      ) : error ? (
        <p role="alert">{error}</p>
      ) : (
        <>
          <div className="productividad-baja-direccion__resumen">
            {resumen.map((item) => (
              <div
                key={item.rango}
                className={
                  `productividad-baja-direccion__cuadro ` +
                  `productividad-baja-direccion__cuadro--${item.rango}`
                }
              >
                <span>{item.etiqueta}</span>
                <strong>{item.cantidad}</strong>
                <small>promotores</small>
              </div>
            ))}
          </div>

          <div className="productividad-baja-direccion__tabla">
            <table>
              <thead>
                <tr>
                  <th>Canal</th>
                  <th>Promotor</th>
                  <th>Supervisor</th>
                  <th>Productividad</th>
                  <th>Días en cero</th>
                </tr>
              </thead>

              <tbody>
                {detalle.map((promotor, index) => (
                  <tr
                    key={`${promotor.canal}-${promotor.nombre}-${index}`}
                    className={
                      `productividad-baja-direccion__fila--${promotor.rango}`
                    }
                  >
                    <td>
                      {nombresCanal[promotor.canal] ||
                        promotor.canal}
                    </td>
                    <td>{promotor.nombre}</td>
                    <td>{promotor.supervisor}</td>
                    <td>
                      <strong>
                        {Number(
                          promotor.productividad
                        ).toFixed(2)}
                      </strong>
                    </td>
                    <td>{promotor.diasSinVenta}</td>
                  </tr>
                ))}

                {detalle.length === 0 && (
                  <tr>
                    <td colSpan="5">
                      No hay promotores con productividad
                      menor a 0.80.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
}

export default ProductividadBajaDireccion;
