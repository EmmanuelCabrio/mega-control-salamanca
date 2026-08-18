import { useMemo, useState } from "react";


function PenetracionColonia({
  registros = [],
  setVista
}) {

  // ==================================================
  // ESTADO
  // ==================================================

  const [sucursalSeleccionada, setSucursalSeleccionada] =
    useState("");

  const [coloniaSeleccionada, setColoniaSeleccionada] =
    useState("");


  // ==================================================
  // SUCURSALES
  // ==================================================

  const sucursales =
    useMemo(() => {

      const lista =
        registros
          .map(
            (item) =>
              item.sucursal
          )
          .filter(Boolean);

      return [
        ...new Set(lista)
      ].sort(
        (a, b) =>
          a.localeCompare(
            b,
            "es"
          )
      );

    }, [registros]);


  // ==================================================
  // COLONIAS DE LA SUCURSAL
  // ==================================================
  //
  // Solamente mostramos colonias pertenecientes
  // a la sucursal seleccionada.
  //
  // Dentro de cada sucursal se ordenan de menor
  // a mayor penetración.
  //
  // ==================================================

  const colonias =
    useMemo(() => {

      if (
        !sucursalSeleccionada
      ) {

        return [];

      }

      return registros
        .filter(
          (item) =>
            item.sucursal ===
            sucursalSeleccionada
        )
        .sort(
          (a, b) =>
            Number(
              a.penetracion ?? 0
            ) -
            Number(
              b.penetracion ?? 0
            )
        );

    }, [
      registros,
      sucursalSeleccionada
    ]);


  // ==================================================
  // COLONIA SELECCIONADA
  // ==================================================

  const colonia =
    registros.find(
      (item) =>
        item.sucursal ===
          sucursalSeleccionada &&
        item.colonia ===
          coloniaSeleccionada
    );


  // ==================================================
  // CAMBIAR SUCURSAL
  // ==================================================
  //
  // Cuando cambiamos de sucursal también limpiamos
  // la colonia anterior.
  //
  // ==================================================

  function manejarCambioSucursal(
    evento
  ) {

    setSucursalSeleccionada(
      evento.target.value
    );

    setColoniaSeleccionada(
      ""
    );

  }


  // ==================================================
  // FORMATEAR PENETRACIÓN
  // ==================================================

  function formatearPenetracion(
    valor
  ) {

    const numero =
      Number(
        valor ?? 0
      );

    return `${numero.toFixed(0)}%`;

  }


  // ==================================================
  // FORMATEAR NÚMEROS
  // ==================================================

  function formatearNumero(
    valor
  ) {

    return Number(
      valor ?? 0
    ).toLocaleString(
      "es-MX"
    );

  }


  // ==================================================
  // RENDER
  // ==================================================

  return (

    <div className="penetracion-container">


      {/* ==========================================
          ENCABEZADO
      ========================================== */}

      <div className="penetracion-header">

        <div className="penetracion-icono">
          📊
        </div>

        <h1>
          Penetración por colonia
        </h1>

        <p>
          Elige las mejores colonias y da el mejor resultado!
        </p>

      </div>


      {/* ==========================================
          SELECTORES
      ========================================== */}

      <div className="penetracion-selectores">


        {/* ========================================
            SUCURSAL
        ======================================== */}

        <div className="penetracion-selector">

          <label>
            🏢 Selecciona una sucursal
          </label>

          <select
            value={
              sucursalSeleccionada
            }
            onChange={
              manejarCambioSucursal
            }
          >

            <option value="">
              Selecciona una sucursal...
            </option>

            {sucursales.map(
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

        </div>


        {/* ========================================
            COLONIA
        ======================================== */}

        <div className="penetracion-selector">

          <label>
            📍 Selecciona una colonia
          </label>

          <select
            value={
              coloniaSeleccionada
            }
            disabled={
              !sucursalSeleccionada
            }
            onChange={(e) =>
              setColoniaSeleccionada(
                e.target.value
              )
            }
          >

            <option value="">

              {sucursalSeleccionada
                ? "Selecciona una colonia..."
                : "Primero selecciona una sucursal"
              }

            </option>

            {colonias.map(
              (item, index) => (

                <option
                  key={
                    `${item.sucursal}-${item.colonia}-${index}`
                  }
                  value={
                    item.colonia
                  }
                >

                  {item.colonia}

                </option>

              )
            )}

          </select>

        </div>

      </div>


      {/* ==========================================
          SIN SUCURSAL
      ========================================== */}

      {!sucursalSeleccionada && (

        <div className="penetracion-vacio">

          <div className="penetracion-vacio-icono">
            🏢
          </div>

          <h2>
            Selecciona una sucursal
          </h2>

          <p>
            Comienza seleccionando la sucursal
            que deseas consultar.
          </p>

        </div>

      )}


      {/* ==========================================
          SUCURSAL SELECCIONADA,
          PERO SIN COLONIA
      ========================================== */}

      {sucursalSeleccionada &&
        !colonia && (

        <div className="penetracion-vacio">

          <div className="penetracion-vacio-icono">
            🔎
          </div>

          <h2>
            Selecciona una colonia
          </h2>

          <p>
            Elige una colonia de{" "}
            <strong>
              {sucursalSeleccionada}
            </strong>{" "}
            para consultar sus indicadores.
          </p>

        </div>

      )}


      {/* ==========================================
          INFORMACIÓN DE LA COLONIA
      ========================================== */}

      {colonia && (

        <div className="penetracion-card">


          {/* ========================================
              COLONIA
          ======================================== */}

          <div className="penetracion-colonia">

            <span>
              📍 COLONIA
            </span>

            <h2>
              {colonia.colonia}
            </h2>

            <small>
              🏢 {colonia.sucursal}
            </small>

          </div>


          {/* ========================================
              NSE
          ======================================== */}

          <div className="penetracion-nse">

            <span>
              🏷️ NIVEL SOCIOECONÓMICO
            </span>

            <strong>
              {colonia.nse || "N/D"}
            </strong>

          </div>


          {/* ========================================
              INDICADORES
          ======================================== */}

          <div className="penetracion-indicadores">


            {/* POTENCIALES */}

            <div className="penetracion-indicador">

              <span>
                👥 Potenciales
              </span>

              <strong>
                {formatearNumero(
                  colonia.potenciales
                )}
              </strong>

            </div>


            {/* ACTIVOS INTERNET */}

            <div className="penetracion-indicador">

              <span>
                📡 Activos Internet
              </span>

              <strong>
                {formatearNumero(
                  colonia.activosInternet
                )}
              </strong>

            </div>


            {/* PENETRACIÓN */}

            <div className="penetracion-indicador principal">

              <span>
                🎯 Penetración
              </span>

              <strong>
                {formatearPenetracion(
                  colonia.penetracion
                )}
              </strong>

            </div>


            {/* POR VENDER */}

            <div className="penetracion-indicador">

              <span>
                🔴 Por vender
              </span>

              <strong>
                {formatearNumero(
                  colonia.porVender
                )}
              </strong>

            </div>

          </div>


          {/* ========================================
              BOTÓN REGRESAR
          ======================================== */}

          <button
            className="boton-regresar"
            onClick={() =>
              setVista(
                "supervisor"
              )
            }
          >

            ← Regresar al inicio

          </button>

        </div>

      )}


      {/* ==========================================
          REGRESAR SIN HABER SELECCIONADO COLONIA
      ========================================== */}

      {!colonia && (

        <button
          className="boton-regresar penetracion-regresar"
          onClick={() =>
            setVista(
              "supervisor"
            )
          }
        >

          ← Regresar al inicio

        </button>

      )}

    </div>

  );

}


export default PenetracionColonia;