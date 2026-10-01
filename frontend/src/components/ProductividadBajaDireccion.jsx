import { useEffect, useMemo, useState } from "react";
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


    // ==================================================
  // FILTROS DE LA TABLA
  // ==================================================

  const [filtroCanal, setFiltroCanal] = useState("");
  const [filtroPromotor, setFiltroPromotor] = useState("");
  const [filtroSupervisor, setFiltroSupervisor] =
    useState("");
  const [filtroProductividad, setFiltroProductividad] =
    useState("");
  const [filtroDiasCero, setFiltroDiasCero] =
    useState("");

  

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


    // ==================================================
  // OPCIONES DISPONIBLES PARA LOS FILTROS
  // ==================================================

  const canalesDisponibles = useMemo(() => {
    return [
      ...new Set(
        detalle
          .map((promotor) => promotor.canal)
          .filter(Boolean)
      ),
    ].sort();
  }, [detalle]);

  const supervisoresDisponibles = useMemo(() => {
    return [
      ...new Set(
        detalle
          .map((promotor) => promotor.supervisor)
          .filter(Boolean)
      ),
    ].sort((a, b) =>
      String(a).localeCompare(String(b), "es")
    );
  }, [detalle]);

  // ==================================================
  // DETALLE FILTRADO
  // ==================================================

  const detalleFiltrado = useMemo(() => {
    return detalle.filter((promotor) => {
      const canal = String(
        promotor.canal || ""
      ).toUpperCase();

      const nombre = String(
        promotor.nombre || ""
      ).toUpperCase();

      const supervisor = String(
        promotor.supervisor || ""
      ).toUpperCase();

      const productividad = Number(
        promotor.productividad || 0
      );

      const diasSinVenta = Number(
        promotor.diasSinVenta || 0
      );

      const coincideCanal =
        !filtroCanal ||
        canal === filtroCanal.toUpperCase();

      const coincidePromotor =
        !filtroPromotor ||
        nombre.includes(
          filtroPromotor.trim().toUpperCase()
        );

      const coincideSupervisor =
        !filtroSupervisor ||
        supervisor ===
          filtroSupervisor.toUpperCase();

      const coincideProductividad =
        !filtroProductividad ||
        (
          filtroProductividad === "cero" &&
          productividad === 0
        ) ||
        (
          filtroProductividad === "baja" &&
          productividad > 0 &&
          productividad < 0.6
        ) ||
        (
          filtroProductividad === "media" &&
          productividad >= 0.6 &&
          productividad < 0.8
        );

      const coincideDiasCero =
        filtroDiasCero === "" ||
        diasSinVenta === Number(filtroDiasCero);

      return (
        coincideCanal &&
        coincidePromotor &&
        coincideSupervisor &&
        coincideProductividad &&
        coincideDiasCero
      );
    });
  }, [
    detalle,
    filtroCanal,
    filtroPromotor,
    filtroSupervisor,
    filtroProductividad,
    filtroDiasCero,
  ]);

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
    <th>
      <div className="productividad-baja-direccion__encabezado">
        <span>Canal</span>

        <select
          value={filtroCanal}
          onChange={(evento) =>
            setFiltroCanal(evento.target.value)
          }
          aria-label="Filtrar por canal"
        >
          <option value="">Todos</option>

          {canalesDisponibles.map((canal) => (
            <option key={canal} value={canal}>
              {nombresCanal[canal] || canal}
            </option>
          ))}
        </select>
      </div>
    </th>

    <th>
      <div className="productividad-baja-direccion__encabezado">
        <span>Promotor</span>

        <input
          type="search"
          value={filtroPromotor}
          onChange={(evento) =>
            setFiltroPromotor(evento.target.value)
          }
          placeholder="Buscar..."
          aria-label="Buscar promotor"
        />
      </div>
    </th>

    <th>
      <div className="productividad-baja-direccion__encabezado">
        <span>Supervisor</span>

        <select
          value={filtroSupervisor}
          onChange={(evento) =>
            setFiltroSupervisor(evento.target.value)
          }
          aria-label="Filtrar por supervisor"
        >
          <option value="">Todos</option>

          {supervisoresDisponibles.map(
            (supervisor) => (
              <option
                key={supervisor}
                value={supervisor}
              >
                {supervisor}
              </option>
            )
          )}
        </select>
      </div>
    </th>

    <th>
      <div className="productividad-baja-direccion__encabezado">
        <span>Productividad</span>

        <select
          value={filtroProductividad}
          onChange={(evento) =>
            setFiltroProductividad(
              evento.target.value
            )
          }
          aria-label="Filtrar por productividad"
        >
          <option value="">Todas</option>
          <option value="cero">0.00</option>
          <option value="baja">
            0.01 a menos de 0.60
          </option>
          <option value="media">
            0.60 a menos de 0.80
          </option>
        </select>
      </div>
    </th>

    <th>
      <div className="productividad-baja-direccion__encabezado">
        <span>Días en cero</span>

        <input
          type="number"
          min="0"
          step="1"
          value={filtroDiasCero}
          onChange={(evento) =>
            setFiltroDiasCero(evento.target.value)
          }
          placeholder="Todos"
          aria-label="Filtrar por días en cero"
        />
      </div>
    </th>
  </tr>
</thead>

              <tbody>
                {detalleFiltrado.map((promotor, index) => (
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

                {detalleFiltrado.length === 0 && (
                  <tr>
                   <td colSpan="5">
                       No hay promotores que coincidan con los
                       filtros seleccionados.
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
