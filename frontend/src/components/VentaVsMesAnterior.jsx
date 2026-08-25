import React, {
  useEffect,
  useMemo,
  useState
} from "react";

import {
  fetchProtegido
} from "../services/authService";


// ==================================================
// 📊 VENTA VS MES ANTERIOR
// ==================================================

function VentaVsMesAnterior() {


  // ==================================================
  // DATOS
  // ==================================================

  const [
    registros,
    setRegistros
  ] = useState([]);


  const [
    servicios,
    setServicios
  ] = useState([]);


  const [
    canales,
    setCanales
  ] = useState([]);


  const [
    meses,
    setMeses
  ] = useState([]);


  const [
    cargando,
    setCargando
  ] = useState(true);


  const [
    error,
    setError
  ] = useState("");


  // ==================================================
  // FILTROS
  // ==================================================

  const [
    servicioSeleccionado,
    setServicioSeleccionado
  ] = useState("TODOS");


  const [
    canalSeleccionado,
    setCanalSeleccionado
  ] = useState("TODOS");


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
            "/api/venta-vs-mes-anterior"
          );


        if (
          !respuesta.ok
        ) {

          throw new Error(
            `Error HTTP ${respuesta.status}`
          );

        }


        const datos =
          await respuesta.json();


        if (
          !datos.correcto
        ) {

          throw new Error(
            datos.mensaje ||
            "No se pudo cargar la información"
          );

        }


        setRegistros(
          datos.registros || []
        );


        setServicios(
          datos.servicios || []
        );


        setCanales(
          datos.canales || []
        );


        setMeses(
          datos.meses || []
        );


      } catch (error) {

        console.error(
          "❌ Error Venta vs Mes Anterior:",
          error
        );


        setError(
          "No se pudo cargar la información"
        );


      } finally {

        setCargando(false);

      }

    }


    cargarDatos();

  }, []);


  // ==================================================
  // MES ANTERIOR / MES ACTUAL
  // ==================================================

  const mesAnterior =
    meses.length >= 2
      ? meses[0]
      : "";


  const mesActual =
    meses.length >= 2
      ? meses[1]
      : meses[0] || "";


  // ==================================================
  // FILTRAR REGISTROS
  // ==================================================

  const registrosFiltrados =
    useMemo(() => {

      return registros.filter(
        (registro) => {

          const coincideServicio =
            servicioSeleccionado ===
            "TODOS" ||
            registro.servicio ===
            servicioSeleccionado;


          const coincideCanal =
            canalSeleccionado ===
            "TODOS" ||
            registro.canal ===
            canalSeleccionado;


          return (
            coincideServicio &&
            coincideCanal
          );

        }
      );

    }, [
      registros,
      servicioSeleccionado,
      canalSeleccionado
    ]);


  // ==================================================
  // AGRUPAR PARA LA TABLA
  // ==================================================

  const tabla =
    useMemo(() => {

      const mapa =
        new Map();


      registrosFiltrados.forEach(
        (registro) => {

          const clave =

            servicioSeleccionado ===
            "TODOS"

              ? registro.servicio

              : registro.canal;


          if (
            !mapa.has(clave)
          ) {

            mapa.set(
              clave,
              {
                nombre: clave,
                anterior: 0,
                actual: 0
              }
            );

          }


          const fila =
            mapa.get(
              clave
            );


          if (
            registro.mes ===
            mesAnterior
          ) {

            fila.anterior +=
              registro.ventas;

          }


          if (
            registro.mes ===
            mesActual
          ) {

            fila.actual +=
              registro.ventas;

          }

        }
      );


      return Array.from(
        mapa.values()
      ).map(
        (fila) => {

          const diferencia =
            fila.actual -
            fila.anterior;


          const porcentaje =

            fila.anterior > 0

              ? (
                  diferencia /
                  fila.anterior
                ) * 100

              : 0;


          return {

            ...fila,

            diferencia,

            porcentaje

          };

        }
      );

    }, [
      registrosFiltrados,
      servicioSeleccionado,
      mesAnterior,
      mesActual
    ]);


  // ==================================================
  // TOTALES
  // ==================================================

  const totalAnterior =
    tabla.reduce(
      (
        total,
        fila
      ) =>
        total +
        fila.anterior,
      0
    );


  const totalActual =
    tabla.reduce(
      (
        total,
        fila
      ) =>
        total +
        fila.actual,
      0
    );


  const diferenciaTotal =
    totalActual -
    totalAnterior;


  const porcentajeTotal =

    totalAnterior > 0

      ? (
          diferenciaTotal /
          totalAnterior
        ) * 100

      : 0;


  // ==================================================
  // CARGANDO
  // ==================================================

  if (
    cargando
  ) {

    return (

      <section className="venta-vs-mes-anterior">

        <h2>
          📊 Venta vs Mes Anterior
        </h2>

        <p>
          Cargando información...
        </p>

      </section>

    );

  }


  // ==================================================
  // ERROR
  // ==================================================

  if (
    error
  ) {

    return (

      <section className="venta-vs-mes-anterior">

        <h2>
          📊 Venta vs Mes Anterior
        </h2>

        <p>
          🔴 {error}
        </p>

      </section>

    );

  }


  // ==================================================
  // RENDER
  // ==================================================

  return (

    <section className="venta-vs-mes-anterior">


      {/* ============================================
          ENCABEZADO
      ============================================ */}

      <div>

        <h2>

          📊 Venta vs Mes Anterior

        </h2>


        <p>

          Comparativo de ventas comerciales

        </p>

      </div>


      {/* ============================================
          FILTROS
      ============================================ */}

      <div className="venta-vs-mes-anterior-filtros">


        {/* SERVICIO */}

        <div>

          <label>
            Servicio
          </label>


          <select

            value={
              servicioSeleccionado
            }

            onChange={(evento) =>
              setServicioSeleccionado(
                evento.target.value
              )
            }

          >

            <option value="TODOS">
              Todos
            </option>


            {servicios.map(
              (servicio) => (

                <option
                  key={servicio}
                  value={servicio}
                >
                  {servicio}
                </option>

              )
            )}

          </select>

        </div>


        {/* CANAL */}

        <div>

          <label>
            Canal
          </label>


          <select

            value={
              canalSeleccionado
            }

            onChange={(evento) =>
              setCanalSeleccionado(
                evento.target.value
              )
            }

          >

            <option value="TODOS">
              Todos
            </option>


            {canales.map(
              (canal) => (

                <option
                  key={canal}
                  value={canal}
                >
                  {canal}
                </option>

              )
            )}

          </select>

        </div>


      </div>


      {/* ============================================
          RESUMEN
      ============================================ */}

      <div className="venta-vs-mes-anterior-resumen">


        <div>

          <small>
            {mesAnterior}
          </small>

          <strong>
            {totalAnterior}
          </strong>

        </div>


        <div>

          <small>
            {mesActual}
          </small>

          <strong>
            {totalActual}
          </strong>

        </div>


        <div>

          <small>
            Diferencia
          </small>

          <strong>

            {diferenciaTotal > 0
              ? `+${diferenciaTotal}`
              : diferenciaTotal}

          </strong>

        </div>


        <div>

          <small>
            Variación
          </small>

          <strong>

            {porcentajeTotal.toFixed(2)}%

          </strong>

        </div>


      </div>


      {/* ============================================
          TABLA
      ============================================ */}

      <div className="venta-vs-mes-anterior-tabla">

        <table>

          <thead>

            <tr>

              <th>
                {servicioSeleccionado ===
                "TODOS"
                  ? "Servicio"
                  : "Canal"}
              </th>

              <th>
                {mesAnterior}
              </th>

              <th>
                {mesActual}
              </th>

              <th>
                Diferencia
              </th>

              <th>
                %
              </th>

            </tr>

          </thead>


          <tbody>

            {tabla.map(
              (fila) => (

                <tr
                  key={
                    fila.nombre
                  }
                >

                  <td>

                    <strong>
                      {fila.nombre}
                    </strong>

                  </td>


                  <td>
                    {fila.anterior}
                  </td>


                  <td>
                    {fila.actual}
                  </td>


                  <td>

                    {fila.diferencia > 0
                      ? `+${fila.diferencia}`
                      : fila.diferencia}

                  </td>


                  <td>

                    {fila.porcentaje.toFixed(2)}%

                  </td>

                </tr>

              )
            )}


            {/* TOTAL */}

            <tr>

              <td>
                <strong>
                  TOTAL
                </strong>
              </td>

              <td>
                <strong>
                  {totalAnterior}
                </strong>
              </td>

              <td>
                <strong>
                  {totalActual}
                </strong>
              </td>

              <td>
                <strong>
                  {diferenciaTotal > 0
                    ? `+${diferenciaTotal}`
                    : diferenciaTotal}
                </strong>
              </td>

              <td>
                <strong>
                  {porcentajeTotal.toFixed(2)}%
                </strong>
              </td>

            </tr>

          </tbody>

        </table>

      </div>


    </section>

  );

}


export default VentaVsMesAnterior;
