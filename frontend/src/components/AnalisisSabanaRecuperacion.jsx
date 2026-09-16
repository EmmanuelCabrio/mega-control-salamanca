import {
  useCallback,
  useEffect,
  useMemo,
  useState
} from "react";

import {
  fetchProtegido
} from "../services/authService";


const TODAS_LAS_SUCURSALES =
  "TODAS";

const TODAS_LAS_VISITAS =
  "TODAS";


const formatearNumero = (valor) =>
  Number(valor || 0).toLocaleString(
    "es-MX"
  );


function AnalisisSabanaRecuperacion() {

  const [datos, setDatos] =
    useState(null);

  const [cargando, setCargando] =
    useState(true);

  const [error, setError] =
    useState("");

  const [
    sucursalSeleccionada,
    setSucursalSeleccionada
  ] = useState(
    TODAS_LAS_SUCURSALES
  );

  const [
    visitasSeleccionadas,
    setVisitasSeleccionadas
  ] = useState(
    TODAS_LAS_VISITAS
  );


  const cargarAnalisis =
    useCallback(
      async () => {

        setCargando(true);
        setError("");

        try {

          const respuesta =
            await fetchProtegido(
              "/api/recuperacion/analisis-sabana"
            );

          const resultado =
            await respuesta.json();

          if (
            !respuesta.ok ||
            !resultado.correcto
          ) {

            throw new Error(
              resultado.mensaje ||
              "No se pudo cargar el análisis de cortes."
            );

          }

          setDatos(resultado);

        } catch (errorCarga) {

          console.error(
            "❌ Error al cargar el análisis de la sábana:",
            errorCarga
          );

          setError(
            errorCarga.message ||
            "No se pudo cargar el análisis de cortes."
          );

        } finally {

          setCargando(false);

        }

      },
      []
    );


  useEffect(
    () => {

      cargarAnalisis();

    },
    [cargarAnalisis]
  );


  const analisis =
    useMemo(
      () => {

        if (!datos) {

          return {
            colonias: [],
            topColonias: [],
            totalCortes: 0,
            conVisita: 0,
            sinVisita: 0,
            maximo: 0,
            lider: null,
          };

        }


        const numeroVisitas =
          visitasSeleccionadas ===
          TODAS_LAS_VISITAS
            ? null
            : Number(
                visitasSeleccionadas
              );


        const colonias =
          (datos.colonias || [])
            .filter(
              (registro) =>
                sucursalSeleccionada ===
                  TODAS_LAS_SUCURSALES ||
                registro.sucursal ===
                  sucursalSeleccionada
            )
            .map(
              (registro) => ({
                ...registro,

                cortesFiltrados:
                  numeroVisitas === null
                    ? registro.total
                    : Number(
                        registro.porVisitas?.[
                          numeroVisitas
                        ] || 0
                      ),
              })
            )
            .filter(
              (registro) =>
                registro.cortesFiltrados > 0
            )
            .sort(
              (registroA, registroB) =>
                registroB.cortesFiltrados -
                  registroA.cortesFiltrados ||
                registroA.colonia.localeCompare(
                  registroB.colonia,
                  "es"
                )
            );


        const totalCortes =
          colonias.reduce(
            (total, registro) =>
              total +
              registro.cortesFiltrados,
            0
          );


        const conVisita =
          numeroVisitas === null
            ? colonias.reduce(
                (total, registro) =>
                  total +
                  registro.conVisita,
                0
              )
            : numeroVisitas > 0
              ? totalCortes
              : 0;


        const sinVisita =
          numeroVisitas === null
            ? colonias.reduce(
                (total, registro) =>
                  total +
                  registro.sinVisita,
                0
              )
            : numeroVisitas === 0
              ? totalCortes
              : 0;


        return {
          colonias,

          topColonias:
            colonias.slice(0, 10),

          totalCortes,

          conVisita,

          sinVisita,

          maximo:
            colonias[0]?.cortesFiltrados ||
            0,

          lider:
            colonias[0] ||
            null,
        };

      },
      [
        datos,
        sucursalSeleccionada,
        visitasSeleccionadas,
      ]
    );


  const limpiarFiltros = () => {

    setSucursalSeleccionada(
      TODAS_LAS_SUCURSALES
    );

    setVisitasSeleccionadas(
      TODAS_LAS_VISITAS
    );

  };


  if (cargando) {

    return (
      <section className="analisis-sabana-estado">
        Analizando colonias y visitas…
      </section>
    );

  }


  if (error) {

    return (
      <section
        className="
          analisis-sabana-estado
          analisis-sabana-error
        "
      >

        <p>
          {error}
        </p>

        <button
          type="button"
          onClick={cargarAnalisis}
        >
          Reintentar
        </button>

      </section>
    );

  }


  return (
    <section className="analisis-sabana">

      <div className="analisis-sabana-header">

        <div>

          <span>
            DISTRIBUCIÓN TERRITORIAL
          </span>

          <h2>
            Análisis de cortes por colonia
          </h2>

          <p>
            Identifica dónde se concentra la cartera y
            cuántas visitas ha recibido.
          </p>

        </div>

        <strong>

          {formatearNumero(
            analisis.totalCortes
          )}

          <small>
            cortes filtrados
          </small>

        </strong>

      </div>


      <div className="analisis-sabana-filtros">

        <label>

          <span>
            Sucursal
          </span>

          <select
            value={sucursalSeleccionada}
            onChange={
              (evento) =>
                setSucursalSeleccionada(
                  evento.target.value
                )
            }
          >

            <option
              value={TODAS_LAS_SUCURSALES}
            >
              Todas las sucursales
            </option>

            {(datos?.sucursales || []).map(
              (sucursal) => (

                <option
                  key={sucursal}
                  value={sucursal}
                >
                  {sucursal}
                </option>

              )
            )}

          </select>

        </label>


        <label>

          <span>
            Número de visitas
          </span>

          <select
            value={visitasSeleccionadas}
            onChange={
              (evento) =>
                setVisitasSeleccionadas(
                  evento.target.value
                )
            }
          >

            <option
              value={TODAS_LAS_VISITAS}
            >
              Todas las visitas
            </option>

            {(
              datos?.visitasDisponibles ||
              []
            ).map(
              (visitas) => (

                <option
                  key={visitas}
                  value={visitas}
                >
                  {visitas === 0
                    ? "0 visitas — sin gestión"
                    : `${visitas} ${
                        visitas === 1
                          ? "visita"
                          : "visitas"
                      }`}
                </option>

              )
            )}

          </select>

        </label>


        <button
          type="button"
          onClick={limpiarFiltros}
        >
          Limpiar filtros
        </button>

      </div>


      <div className="analisis-sabana-kpis">

        <article>

          <span>
            Colonia con más cortes
          </span>

          <strong>
            {analisis.lider?.colonia ||
              "Sin información"}
          </strong>

          <small>
            {analisis.lider
              ? `${
                  analisis.lider.sucursal
                } · ${formatearNumero(
                  analisis.lider
                    .cortesFiltrados
                )} cortes`
              : "—"}
          </small>

        </article>


        <article>

          <span>
            Colonias afectadas
          </span>

          <strong>
            {formatearNumero(
              analisis.colonias.length
            )}
          </strong>

          <small>
            con registros en el filtro
          </small>

        </article>


        <article>

          <span>
            Con visita
          </span>

          <strong>
            {formatearNumero(
              analisis.conVisita
            )}
          </strong>

          <small>
            una o más visitas
          </small>

        </article>


        <article>

          <span>
            Sin visita
          </span>

          <strong>
            {formatearNumero(
              analisis.sinVisita
            )}
          </strong>

          <small>
            cero visitas registradas
          </small>

        </article>

      </div>


      <div className="analisis-sabana-contenido">

        <div className="analisis-sabana-ranking">

          <div className="analisis-sabana-subtitulo">

            <span>
              TOP 10
            </span>

            <h3>
              Colonias con más cortes
            </h3>

          </div>


          {analisis.topColonias.map(
            (registro, indice) => (

              <div
                className="analisis-sabana-barra"
                key={
                  `${registro.sucursal}-${registro.colonia}`
                }
              >

                <div>

                  <strong>
                    {indice + 1}.{" "}
                    {registro.colonia}
                  </strong>

                  <small>
                    {registro.sucursal}
                  </small>

                </div>

                <span>

                  <i
                    style={{
                      width:
                        analisis.maximo > 0
                          ? `${(
                              registro
                                .cortesFiltrados /
                              analisis.maximo
                            ) * 100}%`
                          : "0%",
                    }}
                  />

                </span>

                <b>
                  {formatearNumero(
                    registro.cortesFiltrados
                  )}
                </b>

              </div>

            )
          )}

        </div>


        <div className="analisis-sabana-tabla-contenedor">

          <table className="analisis-sabana-tabla">

            <thead>

              <tr>
                <th>#</th>
                <th>Sucursal</th>
                <th>Colonia</th>
                <th>Cortes</th>
                <th>Participación</th>
                <th>Visitas 0–6</th>
              </tr>

            </thead>

            <tbody>

              {analisis.colonias.map(
                (registro, indice) => (

                  <tr
                    key={
                      `${registro.sucursal}-${registro.colonia}`
                    }
                  >

                    <td>
                      {indice + 1}
                    </td>

                    <td>
                      {registro.sucursal}
                    </td>

                    <td>

                      <strong>
                        {registro.colonia}
                      </strong>

                    </td>

                    <td>

                      <strong>
                        {formatearNumero(
                          registro
                            .cortesFiltrados
                        )}
                      </strong>

                    </td>

                    <td>
                      {analisis.totalCortes > 0
                        ? `${(
                            registro
                              .cortesFiltrados /
                            analisis
                              .totalCortes *
                            100
                          ).toFixed(2)}%`
                        : "0.00%"}
                    </td>

                    <td>

                      <div className="analisis-sabana-visitas">

                        {(
                          datos
                            ?.visitasDisponibles ||
                          []
                        ).map(
                          (visitas) => (

                            <span
                              key={visitas}
                              className={
                                Number(
                                  registro
                                    .porVisitas?.[
                                      visitas
                                    ] || 0
                                ) > 0
                                  ? "tiene-datos"
                                  : ""
                              }
                            >
                              {visitas}:{" "}
                              {formatearNumero(
                                registro
                                  .porVisitas?.[
                                    visitas
                                  ] || 0
                              )}
                            </span>

                          )
                        )}

                      </div>

                    </td>

                  </tr>

                )
              )}

            </tbody>

          </table>

        </div>

      </div>

    </section>
  );

}


export default AnalisisSabanaRecuperacion;
