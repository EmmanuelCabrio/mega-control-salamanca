import { useState } from "react";

function ChecklistFocoRojo({
  promotor,
  supervisor,
  onRegresar
}) {

  // =========================================================
  // DATOS AUTOMÁTICOS DEL SEGUIMIENTO
  // =========================================================

  const fecha = new Date().toLocaleDateString("es-MX");

  const vendedor =
    promotor?.nombre || "—";

  const productividad =
    Number(
      promotor?.productividad ?? 0
    ).toFixed(2);


  // =========================================================
  // ESTADO DEL CHECKLIST
  //
  // true  = el vendedor SÍ cumplió
  // false = el vendedor NO cumplió
  // =========================================================

  const [checks, setChecks] = useState({});


  // =========================================================
  // FUNCIÓN PARA MARCAR / DESMARCAR
  // =========================================================

  const toggleCheck = (id) => {

    setChecks((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));

  };


  // =========================================================
  // COMPONENTE VISUAL PARA CADA CASILLA
  // =========================================================

  const Check = ({
    id,
    children
  }) => (

    <label className="check-item">

      <input
        type="checkbox"
        checked={!!checks[id]}
        onChange={() =>
          toggleCheck(id)
        }
      />

      <span>
        {children}
      </span>

    </label>

  );


  // =========================================================
  // ESTILOS
  // =========================================================

  const styles = {

    page: {
      minHeight: "100vh",
      background: "#f4f6f9",
      padding: "30px 20px",
      fontFamily:
        "Arial, Helvetica, sans-serif",
      color: "#17202a"
    },

    container: {
      maxWidth: "1100px",
      margin: "0 auto"
    },

    header: {
      background:
        "linear-gradient(135deg, #0057b8, #003b7a)",
      color: "#fff",
      borderRadius: "18px",
      padding: "28px",
      boxShadow:
        "0 8px 25px rgba(0,0,0,.15)",
      marginBottom: "22px"
    },

    mega: {
      fontSize: "34px",
      fontWeight: "900",
      letterSpacing: "2px",
      marginBottom: "4px"
    },

    title: {
      fontSize: "24px",
      fontWeight: "800",
      margin: 0
    },

    subtitle: {
      marginTop: "8px",
      opacity: ".9",
      fontSize: "14px"
    },

    dataGrid: {
      display: "grid",
      gridTemplateColumns:
        "repeat(auto-fit, minmax(220px, 1fr))",
      gap: "12px",
      marginTop: "22px"
    },

    dataBox: {
      background:
        "rgba(255,255,255,.12)",
      border:
        "1px solid rgba(255,255,255,.25)",
      borderRadius: "12px",
      padding: "13px 15px"
    },

    dataLabel: {
      display: "block",
      fontSize: "11px",
      textTransform: "uppercase",
      opacity: ".75",
      fontWeight: "700",
      marginBottom: "4px"
    },

    dataValue: {
      fontSize: "15px",
      fontWeight: "700"
    },

    productivity: {
      fontSize: "25px",
      fontWeight: "900"
    },

    section: {
      background: "#fff",
      borderRadius: "16px",
      padding: "22px",
      marginBottom: "16px",
      boxShadow:
        "0 3px 12px rgba(0,0,0,.07)",
      border:
        "1px solid #e5e9ef"
    },

    sectionHeader: {
      display: "flex",
      alignItems: "center",
      gap: "12px",
      marginBottom: "18px",
      paddingBottom: "12px",
      borderBottom:
        "2px solid #eef1f5"
    },

    number: {
      width: "38px",
      height: "38px",
      minWidth: "38px",
      borderRadius: "10px",
      background: "#0057b8",
      color: "#fff",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontWeight: "900",
      fontSize: "15px"
    },

    sectionTitle: {
      margin: 0,
      fontSize: "17px",
      fontWeight: "800",
      color: "#17202a"
    },

    question: {
      fontSize: "14px",
      fontWeight: "700",
      marginBottom: "12px"
    },

    checksGrid: {
      display: "grid",
      gridTemplateColumns:
        "repeat(auto-fit, minmax(220px, 1fr))",
      gap: "8px"
    },

    checkItem: {
      display: "flex",
      alignItems: "flex-start",
      gap: "9px",
      padding: "10px",
      borderRadius: "9px",
      background: "#f7f9fb",
      cursor: "pointer",
      fontSize: "14px",
      lineHeight: "1.35"
    },

    example: {
      margin:
        "4px 0 12px 30px",
      padding: "10px 12px",
      background: "#f1f6fc",
      borderLeft:
        "3px solid #0057b8",
      borderRadius: "0 8px 8px 0",
      fontSize: "13px",
      color: "#45515e",
      lineHeight: "1.4"
    },

    textArea: {
      width: "100%",
      minHeight: "130px",
      boxSizing: "border-box",
      border:
        "1px solid #d5dce5",
      borderRadius: "10px",
      padding: "12px",
      fontFamily:
        "Arial, Helvetica, sans-serif",
      fontSize: "14px",
      resize: "vertical",
      outline: "none"
    },

    footer: {
      display: "flex",
      justifyContent: "space-between",
      gap: "12px",
      flexWrap: "wrap",
      marginTop: "25px",
      paddingBottom: "30px"
    },

    backButton: {
      border: "none",
      borderRadius: "10px",
      padding: "13px 20px",
      background: "#6c757d",
      color: "#fff",
      fontWeight: "700",
      cursor: "pointer"
    },

    exportButton: {
      border: "none",
      borderRadius: "10px",
      padding: "13px 24px",
      background: "#0057b8",
      color: "#fff",
      fontWeight: "800",
      cursor: "pointer"
    }

  };


  return (

    <div style={styles.page}>

      <div style={styles.container}>


        {/* =================================================
            ENCABEZADO
        ================================================= */}

        <header style={styles.header}>

          <div style={styles.mega}>
            MEGA
          </div>

          <h1 style={styles.title}>
            🔴 CHECKLIST DE FOCO ROJO
          </h1>

          <div style={styles.subtitle}>
            Herramienta de diagnóstico y desarrollo comercial
          </div>


          <div style={styles.dataGrid}>

            <div style={styles.dataBox}>
              <span style={styles.dataLabel}>
                Fecha
              </span>

              <span style={styles.dataValue}>
                {fecha}
              </span>
            </div>


            <div style={styles.dataBox}>
              <span style={styles.dataLabel}>
                Vendedor
              </span>

              <span style={styles.dataValue}>
                {vendedor}
              </span>
            </div>


            <div style={styles.dataBox}>
              <span style={styles.dataLabel}>
                Supervisor
              </span>

              <span style={styles.dataValue}>
                {supervisor || "—"}
              </span>
            </div>


            <div style={styles.dataBox}>
              <span style={styles.dataLabel}>
                Productividad
              </span>

              <span style={styles.productivity}>
                {productividad}
              </span>
            </div>

          </div>

        </header>


        {/* =================================================
            01. IMAGEN
        ================================================= */}

        <section style={styles.section}>

          <div style={styles.sectionHeader}>

            <div style={styles.number}>
              01
            </div>

            <h2 style={styles.sectionTitle}>
              IMAGEN Y PRESENTACIÓN
            </h2>

          </div>


          <div style={styles.question}>
            ¿Su imagen es la adecuada?
          </div>


          <div style={styles.checksGrid}>

            <Check id="imagen-aseado">
              Asead@
            </Check>

            <Check id="imagen-peinado">
              Peinad@
            </Check>

            <Check id="imagen-uniforme">
              Uniforme
            </Check>

            <Check id="imagen-gafete">
              Gafete
            </Check>

          </div>

        </section>


        {/* =================================================
            02. PREPARACIÓN
        ================================================= */}

        <section style={styles.section}>

          <div style={styles.sectionHeader}>

            <div style={styles.number}>
              02
            </div>

            <h2 style={styles.sectionTitle}>
              PREPARACIÓN DE LA ENTREVISTA
            </h2>

          </div>


          <div style={styles.question}>
            ¿Prepara la entrevista?
          </div>


          <div style={styles.checksGrid}>

            <Check id="preparacion-analiza">
              Analiza
            </Check>

            <Check id="preparacion-acometida">
              Revisa posible acometida
            </Check>

            <Check id="preparacion-dimme">
              Revisa domicilio en DiMMe
            </Check>

          </div>

        </section>


        {/* =================================================
            03. ROMPIMIENTO DEL HIELO
        ================================================= */}

        <section style={styles.section}>

          <div style={styles.sectionHeader}>

            <div style={styles.number}>
              03
            </div>

            <h2 style={styles.sectionTitle}>
              ROMPIMIENTO DEL HIELO
            </h2>

          </div>


          <div style={styles.question}>
            ¿Qué técnica utilizó para romper el hielo?
          </div>


          <Check id="hielo-cumplido">
            <strong>
              El cumplido natural
            </strong>
          </Check>

          <div style={styles.example}>
            Ejemplo: “¡Amiga, ya te agarré haciendo de comer!
            Huele bien rico 😂. ¿Me regalas 5 minutitos?”
          </div>


          <Check id="hielo-disculpa">
            <strong>
              La disculpa espontánea
            </strong>
          </Check>

          <div style={styles.example}>
            Ejemplo: “¡Disculpa que te interrumpa!
            Sé que estás ocupado, solo te robo 2 minutitos.”
          </div>


          <Check id="hielo-observacion">
            <strong>
              La observación del momento
            </strong>
          </Check>

          <div style={styles.example}>
            Ejemplo: “¡Justo te agarré llegando!
            Antes de que entres, déjame contarte algo rapidísimo.”
          </div>


          <Check id="hielo-humor">
            <strong>
              La confianza / humor
            </strong>
          </Check>

          <div style={styles.example}>
            Ejemplo: “Prometo no quitarte mucho tiempo…
            si me tardo más de 5 minutos, me corres 😂.”
          </div>


          <Check id="hielo-pregunta">
            <strong>
              La pregunta inesperada
            </strong>
          </Check>

          <div style={styles.example}>
            Ejemplo: “Antes de explicarte cualquier cosa,
            te quiero hacer una pregunta rápida…”
          </div>


          <Check id="hielo-otra">
            Otra técnica
          </Check>

        </section>


        {/* =================================================
            04. CONFIANZA
        ================================================= */}

        <section style={styles.section}>

          <div style={styles.sectionHeader}>

            <div style={styles.number}>
              04
            </div>

            <h2 style={styles.sectionTitle}>
              GENERACIÓN DE CONFIANZA
            </h2>

          </div>


          <div style={styles.checksGrid}>

            <Check id="confianza">
              Logró generar confianza con el cliente
            </Check>

          </div>

        </section>


        {/* =================================================
            05. NOMBRE
        ================================================= */}

        <section style={styles.section}>

          <div style={styles.sectionHeader}>

            <div style={styles.number}>
              05
            </div>

            <h2 style={styles.sectionTitle}>
              PERSONALIZACIÓN
            </h2>

          </div>


          <div style={styles.checksGrid}>

            <Check id="nombre">
              Preguntó el nombre del prospecto
            </Check>

            <Check id="nombre-utilizo">
              Utilizó el nombre durante la conversación
            </Check>

          </div>

        </section>


        {/* =================================================
            06. PRESENTACIÓN
        ================================================= */}

        <section style={styles.section}>

          <div style={styles.sectionHeader}>

            <div style={styles.number}>
              06
            </div>

            <h2 style={styles.sectionTitle}>
              PRESENTACIÓN
            </h2>

          </div>


          <div style={styles.checksGrid}>

            <Check id="presentacion-vendedor">
              Se presentó correctamente
            </Check>

            <Check id="presentacion-empresa">
              Presentó a la empresa
            </Check>

          </div>

        </section>


        {/* =================================================
            07. SONDEO
        ================================================= */}

        <section style={styles.section}>

          <div style={styles.sectionHeader}>

            <div style={styles.number}>
              07
            </div>

            <h2 style={styles.sectionTitle}>
              SONDEO
            </h2>

          </div>


          <div style={styles.question}>
            ¿Realizó un sondeo adecuado?
          </div>


          <div style={styles.checksGrid}>

            <Check id="sondeo-costo">
              Costo mensual
            </Check>

            <Check id="sondeo-compania">
              Compañía actual
            </Check>

            <Check id="sondeo-megas">
              Megas
            </Check>

            <Check id="sondeo-canales">
              Canales
            </Check>

            <Check id="sondeo-telefonia">
              Telefonía
            </Check>

            <Check id="sondeo-apps">
              Apps
            </Check>

            <Check id="sondeo-simetria">
              Simetría
            </Check>

            <Check id="sondeo-tecnologia">
              Tecnología
            </Check>

            <Check id="sondeo-servicio">
              Servicio relevante para el cliente
            </Check>

          </div>

        </section>


        {/* =================================================
            08. PRESENTACIÓN PERSONALIZADA
        ================================================= */}

        <section style={styles.section}>

          <div style={styles.sectionHeader}>

            <div style={styles.number}>
              08
            </div>

            <h2 style={styles.sectionTitle}>
              PERSONALIZACIÓN DE LA PRESENTACIÓN
            </h2>

          </div>


          <div style={styles.question}>
            Servicio más relevante para el cliente
          </div>


          <div style={styles.checksGrid}>

            <Check id="servicio-internet">
              Internet
            </Check>

            <Check id="servicio-tv">
              Televisión
            </Check>

            <Check id="servicio-apps">
              Apps
            </Check>

            <Check id="servicio-casa">
              Telefonía de casa
            </Check>

            <Check id="servicio-movil">
              Telefonía móvil
            </Check>

          </div>


          <div
            style={{
              ...styles.question,
              marginTop: "18px"
            }}
          >
            Ejecución de la presentación
          </div>


          <div style={styles.checksGrid}>

            <Check id="presentacion-sondeo">
              Se apoyó en el sondeo para iniciar la presentación
            </Check>

            <Check id="presentacion-beneficios">
              Presentó primero los beneficios que más interesaron
            </Check>

            <Check id="presentacion-necesidad">
              Relacionó la necesidad con la solución ofrecida
            </Check>

          </div>

        </section>


        {/* =================================================
            09. BENEFICIOS
        ================================================= */}

        <section style={styles.section}>

          <div style={styles.sectionHeader}>

            <div style={styles.number}>
              09
            </div>

            <h2 style={styles.sectionTitle}>
              VENTA DE BENEFICIOS
            </h2>

          </div>


          <div style={styles.checksGrid}>

            <Check id="beneficios-caracteristicas">
              Convirtió características en beneficios
            </Check>

            <Check id="beneficios-claro">
              Explicó los beneficios claramente
            </Check>

            <Check id="beneficios-precio">
              No limitó la presentación únicamente al precio
            </Check>

          </div>

        </section>


        {/* =================================================
            10. HERRAMIENTAS
        ================================================= */}

        <section style={styles.section}>

          <div style={styles.sectionHeader}>

            <div style={styles.number}>
              10
            </div>

            <h2 style={styles.sectionTitle}>
              APOYO VISUAL / HERRAMIENTAS
            </h2>

          </div>


          <div style={styles.checksGrid}>

            <Check id="herramienta-folleto">
              Folleto
            </Check>

            <Check id="herramienta-carpeta">
              Carpeta
            </Check>

            <Check id="herramienta-xview">
              Xview Móvil
            </Check>

          </div>

        </section>


        {/* =================================================
            11. PREPARACIÓN DEL CIERRE
        ================================================= */}

        <section style={styles.section}>

          <div style={styles.sectionHeader}>

            <div style={styles.number}>
              11
            </div>

            <h2 style={styles.sectionTitle}>
              PREPARACIÓN DEL CIERRE
            </h2>

          </div>


          <div style={styles.checksGrid}>

            <Check id="cierre-necesidad">
              Detectó una necesidad real
            </Check>

            <Check id="cierre-reconoce">
              Hizo que el cliente reconociera esa necesidad
            </Check>

            <Check id="cierre-conecta">
              Conectó la necesidad con nuestro servicio
            </Check>

            <Check id="cierre-sis">
              Obtuvo pequeños “sí” durante su speech
            </Check>

            <Check id="cierre-solucion">
              Presentó nuestro servicio como solución
            </Check>

            <Check id="cierre-senales">
              Confirmó señales de interés
            </Check>

          </div>

        </section>


        {/* =================================================
            12. TÉCNICA DE CIERRE
        ================================================= */}

        <section style={styles.section}>

          <div style={styles.sectionHeader}>

            <div style={styles.number}>
              12
            </div>

            <h2 style={styles.sectionTitle}>
              TÉCNICA DE CIERRE
            </h2>

          </div>


          <Check id="cierre-eleccion">
            <strong>
              Cierre por elección
            </strong>
          </Check>

          <div style={styles.example}>
            Ejemplo: “¿Lo hacemos a tu nombre o al de tu esposa?”
          </div>


          <Check id="cierre-resumen">
            <strong>
              Cierre por resumen
            </strong>
          </Check>

          <div style={styles.example}>
            Ejemplo: “Quedamos que el paquete con los 3 servicios
            es el mejor para lo que necesitas, ¿verdad?”
          </div>


          <Check id="cierre-accion">
            <strong>
              Cierre por acción inmediata
            </strong>
          </Check>

          <div style={styles.example}>
            Ejemplo: “Perfecto, para dejarlo listo solo necesito tus datos.”
          </div>


          <Check id="cierre-otra">
            Otra técnica
          </Check>

        </section>


        {/* =================================================
            13. OBJECIONES
        ================================================= */}

        <section style={styles.section}>

          <div style={styles.sectionHeader}>

            <div style={styles.number}>
              13
            </div>

            <h2 style={styles.sectionTitle}>
              MANEJO DE DUDAS Y OBJECIONES
            </h2>

          </div>


          <Check id="objecion-acepta">
            <strong>ACEPTA</strong> — No contradice
          </Check>

          <div style={styles.example}>
            “Claro, te entiendo.”
          </div>


          <Check id="objecion-profundiza">
            <strong>PROFUNDIZA</strong> — Descubre la verdadera objeción
          </Check>

          <div style={styles.example}>
            “¿Qué es lo que más te preocupa de eso?”
          </div>


          <Check id="objecion-responde">
            <strong>RESPONDE</strong> — Contesta específicamente
          </Check>

          <div style={styles.example}>
            “Mira, justamente por eso…”
          </div>


          <Check id="objecion-cierra">
            <strong>CIERRA</strong> — Regresa a la venta
          </Check>

          <div style={styles.example}>
            “Entonces, si resolvemos eso, ¿avanzamos?”
          </div>

        </section>


        {/* =================================================
            14. SILENCIO
        ================================================= */}

        <section style={styles.section}>

          <div style={styles.sectionHeader}>

            <div style={styles.number}>
              14
            </div>

            <h2 style={styles.sectionTitle}>
              SILENCIO DE CIERRE
            </h2>

          </div>


          <Check id="silencio">
            Después de realizar el cierre,
            permitió que el cliente respondiera
            sin continuar hablando innecesariamente
          </Check>

        </section>


        {/* =================================================
            15. VENTA ADICIONAL
        ================================================= */}

        <section style={styles.section}>

          <div style={styles.sectionHeader}>

            <div style={styles.number}>
              15
            </div>

            <h2 style={styles.sectionTitle}>
              VENTA ADICIONAL
            </h2>

          </div>


          <div style={styles.question}>
            ¿Detectó oportunidades de venta adicional?
          </div>


          <div style={styles.checksGrid}>

            <Check id="adicional-movil">
              Móvil
            </Check>

            <Check id="adicional-netflix">
              Netflix
            </Check>

            <Check id="adicional-disney">
              Disney+
            </Check>

            <Check id="adicional-max">
              Max
            </Check>

            <Check id="adicional-streaming">
              Streaming
            </Check>

          </div>

        </section>


        {/* =================================================
            16. CONDICIONES
        ================================================= */}

        <section style={styles.section}>

          <div style={styles.sectionHeader}>

            <div style={styles.number}>
              16
            </div>

            <h2 style={styles.sectionTitle}>
              TÉRMINOS Y CONDICIONES
            </h2>

          </div>


          <div style={styles.checksGrid}>

            <Check id="condiciones-paquete">
              Paquete contratado
            </Check>

            <Check id="condiciones-mensualidad">
              Mensualidad
            </Check>

            <Check id="condiciones-instalacion">
              Promesa de instalación
            </Check>

            <Check id="condiciones-plazo">
              Plazo forzoso
            </Check>

            <Check id="condiciones-activacion">
              Activación de Apps / Móvil
            </Check>

            <Check id="condiciones-pago">
              Días de pago
            </Check>

            <Check id="condiciones-corte">
              Qué ocurre si sale a corte
            </Check>

          </div>

        </section>


        {/* =================================================
            17. REFERIDOS
        ================================================= */}

        <section style={styles.section}>

          <div style={styles.sectionHeader}>

            <div style={styles.number}>
              17
            </div>

            <h2 style={styles.sectionTitle}>
              REFERIDOS
            </h2>

          </div>


          <Check id="referidos">
            Solicitó referidos al cliente
          </Check>

        </section>


        {/* =================================================
            18. PROSPECTO NO CERRADO
        ================================================= */}

        <section style={styles.section}>

          <div style={styles.sectionHeader}>

            <div style={styles.number}>
              18
            </div>

            <h2 style={styles.sectionTitle}>
              PROSPECTO NO CERRADO
            </h2>

          </div>


          <div style={styles.question}>
            En caso de no cerrar la venta en frío:
          </div>


          <div style={styles.checksGrid}>

            <Check id="prospecto-dimme">
              Registró correctamente al prospecto en DiMMe
            </Check>

            <Check id="prospecto-info">
              Registró información suficiente
            </Check>

            <Check id="prospecto-seguimiento">
              Dejó definido el siguiente paso
            </Check>

          </div>

        </section>


        {/* =================================================
            19. DESPEDIDA
        ================================================= */}

        <section style={styles.section}>

          <div style={styles.sectionHeader}>

            <div style={styles.number}>
              19
            </div>

            <h2 style={styles.sectionTitle}>
              DESPEDIDA
            </h2>

          </div>


          <div style={styles.checksGrid}>

            <Check id="despedida-amable">
              Se despidió amablemente
            </Check>

            <Check id="despedida-impresion">
              Dejó una buena impresión en el cliente
            </Check>

          </div>

        </section>


        {/* =================================================
            20. REGISTRO
        ================================================= */}

        <section style={styles.section}>

          <div style={styles.sectionHeader}>

            <div style={styles.number}>
              20
            </div>

            <h2 style={styles.sectionTitle}>
              REGISTRO
            </h2>

          </div>


          <div style={styles.checksGrid}>

            <Check id="registro-ventas">
              Realizó correctamente su registro de ventas
            </Check>

            <Check id="registro-coincide">
              La información coincide con la actividad realizada
            </Check>

          </div>

        </section>


        {/* =================================================
            DIAGNÓSTICO
        ================================================= */}

        <section style={styles.section}>

          <div style={styles.sectionHeader}>

            <div
              style={{
                ...styles.number,
                background: "#d71920"
              }}
            >
              🔴
            </div>

            <h2 style={styles.sectionTitle}>
              DIAGNÓSTICO DEL SUPERVISOR
            </h2>

          </div>


          <div style={styles.question}>
            ¿Dónde se encuentra principalmente el área de oportunidad?
          </div>


          <div style={styles.checksGrid}>

            <Check id="diag-imagen">
              Imagen / presentación
            </Check>

            <Check id="diag-preparacion">
              Preparación
            </Check>

            <Check id="diag-hielo">
              Rompimiento del hielo
            </Check>

            <Check id="diag-confianza">
              Generación de confianza
            </Check>

            <Check id="diag-sondeo">
              Sondeo
            </Check>

            <Check id="diag-presentacion">
              Presentación
            </Check>

            <Check id="diag-beneficios">
              Argumentación de beneficios
            </Check>

            <Check id="diag-objeciones">
              Manejo de objeciones
            </Check>

            <Check id="diag-cierre">
              Cierre
            </Check>

            <Check id="diag-adicional">
              Venta adicional
            </Check>

            <Check id="diag-condiciones">
              Explicación de condiciones
            </Check>

            <Check id="diag-seguimiento">
              Seguimiento
            </Check>

            <Check id="diag-registro">
              Registro
            </Check>

          </div>


          <div
            style={{
              ...styles.question,
              marginTop: "20px"
            }}
          >
            Otra:
          </div>


          <input
            type="text"
            placeholder="Especifica otra área de oportunidad..."
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "12px",
              border:
                "1px solid #d5dce5",
              borderRadius: "10px",
              fontSize: "14px"
            }}
          />

        </section>


        {/* =================================================
            ACCIÓN CORRECTIVA
        ================================================= */}

        <section style={styles.section}>

          <div style={styles.sectionHeader}>

            <div style={styles.number}>
              🔧
            </div>

            <h2 style={styles.sectionTitle}>
              ACCIÓN CORRECTIVA
            </h2>

          </div>


          <div style={styles.question}>
            ¿Qué debe trabajar específicamente el vendedor?
          </div>


          <textarea
            style={styles.textArea}
            placeholder="Escribe aquí la acción correctiva..."
          />

        </section>


        {/* =================================================
            BOTONES
        ================================================= */}

        <div style={styles.footer}>

          <button
            type="button"
            onClick={onRegresar}
            style={styles.backButton}
          >
            ↩️ Regresar al Dashboard
          </button>


          <button
            type="button"
            style={styles.exportButton}
            onClick={() =>
              alert(
                "La exportación de evidencia la construiremos en el siguiente paso."
              )
            }
          >
            📄 Exportar evidencia
          </button>

        </div>

      </div>

    </div>

  );

}

export default ChecklistFocoRojo;
