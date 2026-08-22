function ChecklistFocoRojo({
  promotor,
  supervisor,
  onRegresar
}) {

  const fecha = new Date().toLocaleDateString("es-MX");

  return (
    <div className="app">

      <div className="card">

        {/* ==========================================
            ENCABEZADO DEL CHECKLIST
        ========================================== */}

        <h1>
          🔴 CHECKLIST DE FOCO ROJO
        </h1>

        <div className="checklist-datos">

          <p>
            <strong>Fecha:</strong>{" "}
            {fecha}
          </p>

          <p>
            <strong>Vendedor:</strong>{" "}
            {promotor?.nombre || "—"}
          </p>

          <p>
            <strong>Supervisor:</strong>{" "}
            {supervisor || "—"}
          </p>

          <p>
            <strong>Productividad:</strong>{" "}
            {Number(
              promotor?.productividad ?? 0
            ).toFixed(2)}
          </p>

        </div>


        {/* ==========================================
            AVISO TEMPORAL
        ========================================== */}

        <div className="checklist-placeholder">

          <h2>
            📋 Checklist Maestro
          </h2>

          <p>
            Esta será la nueva pantalla de
            seguimiento del vendedor.
          </p>

          <p>
            Aquí construiremos los 20 puntos
            del checklist que diseñamos.
          </p>

        </div>


        {/* ==========================================
            REGRESAR
        ========================================== */}

        <button
          type="button"
          onClick={onRegresar}
        >
          ↩️ Regresar al Dashboard
        </button>

      </div>

    </div>
  );
}

export default ChecklistFocoRojo;
