import React from "react";


// ==================================================
// 👑 DASHBOARD DE DIRECCIÓN
// ==================================================

function PanelDireccion({
  onCerrarSesion,
}) {

  return (

    <div className="panel-direccion">

      {/* ==================================================
          ENCABEZADO
      ================================================== */}

      <header className="panel-direccion-header">

        <div>

          <div className="panel-direccion-etiqueta">

            👑 DIRECCIÓN

          </div>


          <h1>

            Dashboard Dirección

          </h1>


          <p>

            Centro de control comercial · SEGUIMIENTO 2.0

          </p>

        </div>


        {/* ==================================================
            CERRAR SESIÓN
        ================================================== */}

        {onCerrarSesion && (

          <button

            type="button"

            className="panel-direccion-logout"

            onClick={onCerrarSesion}

          >

            🚪 Cerrar sesión

          </button>

        )}

      </header>



      {/* ==================================================
          CENTRO DE CONTROL COMERCIAL
      ================================================== */}

      <section className="panel-direccion-proximamente">

        <div>

          <span>

            🚀

          </span>


          <div>

            <h2>

              Centro de control comercial

            </h2>


            <p>

              Aquí construiremos los indicadores estratégicos de Dirección.

            </p>

          </div>

        </div>


        <div className="panel-direccion-badge">

          EN CONSTRUCCIÓN

        </div>

      </section>


    </div>

  );

}


export default PanelDireccion;
