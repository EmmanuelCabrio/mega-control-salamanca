function PanelRecuperacion({
  supervisor,
  onCerrarSesion,
}) {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        background: "#f1f5f9",
        padding: "24px",
      }}
    >
      <section
        style={{
          background: "#ffffff",
          padding: "32px",
          borderRadius: "20px",
          textAlign: "center",
          boxShadow:
            "0 20px 50px rgba(15, 23, 42, 0.15)",
        }}
      >
        <div style={{ fontSize: "48px" }}>
          🔄
        </div>

        <h1>
          Panel de Recuperación
        </h1>

        <p>
          Bienvenido, {supervisor || "usuario"}.
        </p>

        <p>
          El rol RECUPERACION fue reconocido correctamente.
        </p>

        <button
          type="button"
          onClick={onCerrarSesion}
          style={{
            marginTop: "16px",
            border: "none",
            borderRadius: "10px",
            padding: "10px 16px",
            background: "#b91c1c",
            color: "#ffffff",
            fontWeight: "700",
            cursor: "pointer",
          }}
        >
          🚪 Cerrar sesión
        </button>
      </section>
    </main>
  );
}

export default PanelRecuperacion;
