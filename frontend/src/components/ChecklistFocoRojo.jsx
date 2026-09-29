import { useEffect, useRef, useState } from "react";
import SignaturePad  from "./SignaturePad";
import {
  fetchProtegido,
} from "../services/authService";


// =========================================================
// RECUPERAR PASO DEL CHECKLIST PENDIENTE
// =========================================================

function obtenerPasoChecklistPendiente(
  supervisor,
  promotor
) {

  try {

    const guardado =
      localStorage.getItem(
        "mega_checklist_pendiente"
      );


    if (
      !guardado
    ) {

      return "";

    }


    const pendiente =
      JSON.parse(
        guardado
      );


    const mismoSupervisor =
      String(
        pendiente?.supervisor ||
        ""
      ).trim() ===
      String(
        supervisor ||
        ""
      ).trim();


    const mismoPromotor =
      String(
        pendiente?.promotor?.nombre ||
        ""
      ).trim() ===
      String(
        promotor ||
        ""
      ).trim();


    if (
      !mismoSupervisor ||
      !mismoPromotor
    ) {

      return "";

    }


    return String(
      pendiente.paso ||
      ""
    );

  } catch (
    error
  ) {

    console.error(
      "❌ No se pudo recuperar el paso del checklist:",
      error
    );


    return "";

  }

}



function ChecklistFocoRojo({
  promotor,
  supervisor,
  onRegresar,
}) {
  // =========================================================
  // DATOS AUTOMÁTICOS
  // =========================================================

  const fecha = new Date().toLocaleDateString("es-MX");

  const vendedor = promotor?.nombre || "—";

  const pasoPendiente =
  obtenerPasoChecklistPendiente(
    supervisor,
    vendedor
  );

  const productividad = Number(
    promotor?.productividad ?? 0
  ).toFixed(2);

  // =========================================================
  // ESTADOS
  // =========================================================

  const [checks, setChecks] = useState({});
  const [otraArea, setOtraArea] = useState("");
const [
  otraTecnicaHielo,
  setOtraTecnicaHielo,
] = useState("");
  
  const [accionCorrectiva, setAccionCorrectiva] = useState("");
  const [evidenciaDescargada, setEvidenciaDescargada] =
  useState(
    () =>
      pasoPendiente ===
        "SEGUIMIENTO_GUARDADO" ||
      pasoPendiente ===
        "CORPORATIVO_ABIERTO"
  );


  const [
  corporativoAbierto,
  setCorporativoAbierto,
] = useState(
  () =>
    pasoPendiente ===
    "CORPORATIVO_ABIERTO"
);


  // =========================================================
// HISTORIAL Y REGISTRO DEL CHECKLIST
// =========================================================

const [
  historial,
  setHistorial,
] = useState([]);

const [
  comparativa,
  setComparativa,
] = useState(null);

const [
  totalChecklists,
  setTotalChecklists,
] = useState(0);

const [
  sesionId,
  setSesionId,
] = useState(
  () => {

    try {

      const guardado =
        localStorage.getItem(
          "mega_checklist_pendiente"
        );


      if (
        !guardado
      ) {

        return null;

      }


      const pendiente =
        JSON.parse(
          guardado
        );


      return (
        pendiente.sesionId ||
        null
      );

    } catch {

      return null;

    }

  }
);

const [
  cargandoHistorial,
  setCargandoHistorial,
] = useState(true);

const [
  guardandoChecklist,
  setGuardandoChecklist,
] = useState(false);

const [
  checklistGuardado,
  setChecklistGuardado,
] = useState(
  () =>
    pasoPendiente ===
      "SEGUIMIENTO_GUARDADO" ||
    pasoPendiente ===
      "CORPORATIVO_ABIERTO"
);

const [
  errorSeguimiento,
  setErrorSeguimiento,
] = useState("");


  // Evita abrir dos sesiones del mismo checklist,
// incluso durante las validaciones de React.

const inicioChecklistRef =
  useRef("");


// =========================================================
// INICIAR REGISTRO Y CARGAR HISTORIAL
// =========================================================

useEffect(
  () => {

    const nombrePromotor =
      String(
        promotor?.nombre ?? ""
      ).trim();


    const nombreSupervisor =
      String(
        supervisor ?? ""
      ).trim();


    if (
      !nombrePromotor ||
      !nombreSupervisor
    ) {

      setCargandoHistorial(
        false
      );

      return;

    }


    const claveChecklist =
      `${nombreSupervisor}::${nombrePromotor}`;


    let componenteActivo =
      true;


    // ===============================================
    // CARGAR HISTORIAL
    // ===============================================

    async function cargarHistorial() {

      try {

        setCargandoHistorial(
          true
        );

        setErrorSeguimiento(
          ""
        );


        const respuesta =
          await fetchProtegido(
            `/api/checklists-foco-rojo?supervisor=${encodeURIComponent(
              nombreSupervisor
            )}&promotor=${encodeURIComponent(
              nombrePromotor
            )}`
          );


        const datos =
          await respuesta.json();


        if (
          !respuesta.ok
        ) {

          throw new Error(
            datos.mensaje ||
            "No se pudo consultar el historial"
          );

        }


        if (
          !componenteActivo
        ) {

          return;

        }


        setHistorial(
          datos.historial || []
        );

        setTotalChecklists(
          Number(
            datos.totalChecklists || 0
          )
        );

        setComparativa(
          datos.comparativa || null
        );

      } catch (
        error
      ) {

        console.error(
          "❌ Error al cargar historial del checklist:",
          error
        );


        if (
          componenteActivo
        ) {

          setErrorSeguimiento(
            "No se pudo consultar el historial del promotor."
          );

        }

      } finally {

        if (
          componenteActivo
        ) {

          setCargandoHistorial(
            false
          );

        }

      }

    }


    // ===============================================
    // REGISTRAR HORA DE INICIO
    // ===============================================

    async function registrarInicio() {

      // React puede ejecutar el efecto dos veces
      // durante desarrollo. Esta validación evita
      // crear dos sesiones para el mismo checklist.

      if (
        inicioChecklistRef.current ===
        claveChecklist
      ) {

        return;

      }


      inicioChecklistRef.current =
        claveChecklist;


      try {

        const respuesta =
          await fetchProtegido(
            "/api/checklists-foco-rojo/iniciar",
            {

              method:
                "POST",

              headers: {

                "Content-Type":
                  "application/json",

              },

              body:
                JSON.stringify({

                  supervisor:
                    nombreSupervisor,

                  promotor:
                    nombrePromotor,

                }),

            }
          );


        const datos =
          await respuesta.json();


        if (
          !respuesta.ok
        ) {

          throw new Error(
            datos.mensaje ||
            "No se pudo iniciar el checklist"
          );

        }


        if (
          componenteActivo
        ) {

          setSesionId(
            datos.sesionId
          );

          try {

  const pendienteGuardado =
    localStorage.getItem(
      "mega_checklist_pendiente"
    );


  if (
    pendienteGuardado
  ) {

    const pendiente =
      JSON.parse(
        pendienteGuardado
      );


    localStorage.setItem(
      "mega_checklist_pendiente",
      JSON.stringify({

        ...pendiente,

        sesionId:
          datos.sesionId,

      })
    );

  }

} catch (
  error
) {

  console.error(
    "❌ No se pudo guardar la sesión pendiente:",
    error
  );

}

        }

      } catch (
        error
      ) {

        console.error(
          "❌ Error al iniciar el registro del checklist:",
          error
        );


        if (
          componenteActivo
        ) {

          setErrorSeguimiento(
            "No se pudo iniciar el registro. Recarga la página antes de llenar el checklist."
          );

        }


        // Permite volver a intentarlo si el
        // componente se carga nuevamente.

        inicioChecklistRef.current =
          "";

      }

    }


    cargarHistorial();


if (
  !sesionId &&
  !checklistGuardado
) {

  registrarInicio();

}



    return () => {

      componenteActivo =
        false;

    };

  },
 [
  promotor?.nombre,
  supervisor,
  sesionId,
  checklistGuardado,
]
);

  // =========================================================
  // FIRMAS
  // =========================================================

  const supervisorSignatureRef = useRef(null);
  const promotorSignatureRef = useRef(null);

  const [firmaSupervisor, setFirmaSupervisor] =
    useState(false);

  const [firmaPromotor, setFirmaPromotor] =
    useState(false);



  // =========================================================
// VALIDAR QUE EL CHECK LOCAL ESTÉ COMPLETO
// =========================================================

const checkLocalCompleto =

  firmaSupervisor &&

  firmaPromotor &&

  accionCorrectiva
    .trim()
    .length >= 5 &&

  (
    !checks["hielo-otra"] ||

    otraTecnicaHielo
      .trim()
      .length >= 3
  );


  

  // =========================================================
  // MARCAR / DESMARCAR
  // =========================================================

  const toggleCheck = (id) => {
    setChecks((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // =========================================================
  // MOTOR DEL DIAGNÓSTICO
  // =========================================================

  const diagnosticoAreas = {
    "Imagen / presentación": [
      "imagen-aseado",
      "imagen-peinado",
      "imagen-uniforme",
      "imagen-gafete",
    ],

    Preparación: [
      "preparacion-analiza",
      "preparacion-acometida",
      "preparacion-dimme",
    ],

    "Rompimiento del hielo": [
      {
        tipo: "grupo",
        ids: [
          "hielo-cumplido",
          "hielo-disculpa",
          "hielo-observacion",
          "hielo-humor",
          "hielo-pregunta",
          "hielo-otra",
        ],
      },
    ],

    "Generación de confianza": [
      "confianza",
    ],

    Personalización: [
      "nombre",
      "nombre-utilizo",
    ],

    Presentación: [
      "presentacion-vendedor",
      "presentacion-empresa",
    ],

    Sondeo: [
      "sondeo-costo",
      "sondeo-compania",
      "sondeo-megas",
      "sondeo-canales",
      "sondeo-telefonia",
      "sondeo-apps",
      "sondeo-simetria",
      "sondeo-tecnologia",
      "sondeo-servicio",
    ],

    "Personalización de la presentación": [
      {
        tipo: "grupo",
        ids: [
          "servicio-internet",
          "servicio-tv",
          "servicio-apps",
          "servicio-casa",
          "servicio-movil",
        ],
      },
      "presentacion-sondeo",
      "presentacion-beneficios",
      "presentacion-necesidad",
    ],

    "Venta de beneficios": [
      "beneficios-caracteristicas",
      "beneficios-claro",
      "beneficios-precio",
    ],

    "Apoyo visual / herramientas": [
      {
        tipo: "grupo",
        ids: [
          "herramienta-folleto",
          "herramienta-carpeta",
          "herramienta-xview",
        ],
      },
    ],

    "Preparación del cierre": [
      "cierre-necesidad",
      "cierre-reconoce",
      "cierre-conecta",
      "cierre-sis",
      "cierre-solucion",
      "cierre-senales",
    ],

    "Técnica de cierre": [
      {
        tipo: "grupo",
        ids: [
          "cierre-eleccion",
          "cierre-resumen",
          "cierre-accion",
          "cierre-otra",
        ],
      },
    ],

    "Manejo de objeciones": [
      "objecion-acepta",
      "objecion-profundiza",
      "objecion-responde",
      "objecion-cierra",
    ],

    "Silencio de cierre": [
      "silencio",
    ],

    "Venta adicional": [
      {
        tipo: "grupo",
        ids: [
          "adicional-movil",
          "adicional-netflix",
          "adicional-disney",
          "adicional-max",
          "adicional-streaming",
        ],
      },
    ],

    "Términos y condiciones": [
      "condiciones-paquete",
      "condiciones-mensualidad",
      "condiciones-instalacion",
      "condiciones-plazo",
      "condiciones-activacion",
      "condiciones-pago",
      "condiciones-corte",
    ],

    Referidos: [
      "referidos",
    ],

    "Prospecto no cerrado": [
      "prospecto-dimme",
      "prospecto-info",
      "prospecto-seguimiento",
    ],

    Despedida: [
      "despedida-amable",
      "despedida-impresion",
    ],

    Registro: [
      "registro-ventas",
      "registro-coincide",
    ],
  };

  // =========================================================
  // CALCULAR OPORTUNIDADES
  // =========================================================

  const resultadosDiagnostico = Object.entries(
    diagnosticoAreas
  ).map(([area, criterios]) => {
    let oportunidades = 0;
    let evaluaciones = 0;

    criterios.forEach((criterio) => {
      // GRUPO
      if (
        typeof criterio === "object" &&
        criterio.tipo === "grupo"
      ) {
        evaluaciones += 1;

        const cumplioGrupo = criterio.ids.some(
          (id) => checks[id]
        );

        if (!cumplioGrupo) {
          oportunidades += 1;
        }

        return;
      }

      // CRITERIO INDIVIDUAL
      evaluaciones += 1;

      if (!checks[criterio]) {
        oportunidades += 1;
      }
    });

    return {
      area,
      oportunidades,
      evaluaciones,
    };
  });

  // =========================================================
  // RANKING
  // =========================================================

  const rankingDiagnostico = resultadosDiagnostico
    .filter((item) => item.oportunidades > 0)
    .sort(
      (a, b) =>
        b.oportunidades - a.oportunidades
    );

  // =========================================================
  // PRINCIPAL ÁREA
  // =========================================================

  const principalArea =
    rankingDiagnostico[0]?.area ||
    "Sin áreas de oportunidad detectadas";

  // =========================================================
// GUARDAR SEGUIMIENTO DEL CHECKLIST
// =========================================================

const guardarSeguimiento =
  async () => {

    if (
      checklistGuardado ||
      guardandoChecklist
    ) {

      return;

    }


    if (
      !evidenciaDescargada
    ) {

      alert(
        "Primero debes descargar la evidencia HTML del checklist."
      );

      return;

    }


    if (
      !sesionId
    ) {

      alert(
        "No se encontró una sesión activa del checklist. Recarga la página antes de intentarlo nuevamente."
      );

      return;

    }


    try {

      setGuardandoChecklist(
        true
      );


      const respuesta =
        await fetchProtegido(
          "/api/checklists-foco-rojo",
          {

            method:
              "POST",

            headers: {

              "Content-Type":
                "application/json",

            },

            body:
              JSON.stringify({

                sesionId,

                supervisor,

                promotor:
                  vendedor,

                checks,

                otraTecnicaHielo,

                otraArea,

                accionCorrectiva,

                diagnostico:
                  resultadosDiagnostico,

              }),

          }
        );


      const datos =
        await respuesta.json();


      if (
        !respuesta.ok
      ) {

        throw new Error(
          datos.mensaje ||
          "No se pudo guardar el checklist"
        );

      }


      // Desde este punto el checklist ya quedó
      // guardado definitivamente.

      setChecklistGuardado(
        true
      );


      // =============================================
// ACTUALIZAR PASO DEL CANDADO PERSISTENTE
// =============================================

try {

  const pendienteGuardado =
    localStorage.getItem(
      "mega_checklist_pendiente"
    );


  if (
    pendienteGuardado
  ) {

    const pendiente =
      JSON.parse(
        pendienteGuardado
      );


    localStorage.setItem(
      "mega_checklist_pendiente",
      JSON.stringify({

        ...pendiente,

        paso:
          "SEGUIMIENTO_GUARDADO",

        seguimientoGuardadoEn:
          new Date().toISOString(),

      })
    );

  }

} catch (
  error
) {

  console.error(
    "❌ No se pudo actualizar el paso del checklist:",
    error
  );

}


      // =============================================
      // ACTUALIZAR CONTEO Y COMPARATIVA
      // =============================================

      try {

        const respuestaHistorial =
          await fetchProtegido(
            `/api/checklists-foco-rojo?supervisor=${encodeURIComponent(
              supervisor
            )}&promotor=${encodeURIComponent(
              vendedor
            )}`
          );


        const datosHistorial =
          await respuestaHistorial.json();


        if (
          respuestaHistorial.ok
        ) {

          setHistorial(
            datosHistorial.historial || []
          );

          setTotalChecklists(
            Number(
              datosHistorial.totalChecklists ||
              0
            )
          );

          setComparativa(
            datosHistorial.comparativa ||
            null
          );

        }

      } catch (
        errorHistorial
      ) {

        console.error(
          "⚠️ El checklist se guardó, pero no se pudo actualizar el historial:",
          errorHistorial
        );

      }


      alert(
        "✅ Checklist guardado correctamente.\n\nEl seguimiento ya quedó registrado."
      );

    } catch (
      error
    ) {

      console.error(
        "❌ Error al guardar el seguimiento:",
        error
      );


      alert(
        `No se pudo guardar el checklist.\n\n${
          error.message
        }`
      );

    } finally {

      setGuardandoChecklist(
        false
      );

    }

  };

  // =========================================================
  // EXPORTAR EVIDENCIA HTML
  // =========================================================

  const exportarHTML = () => {

    if (
  !checkLocalCompleto
) {

  alert(
    "🔒 Primero debes completar la acción correctiva y colocar las firmas del supervisor y del promotor."
  );

  return;

}
    const origen = document.getElementById(
      "checklist-foco-rojo"
    );

    if (!origen) {
      alert(
        "No se pudo generar la evidencia. Intenta nuevamente."
      );

      return;
    }

    const copia = origen.cloneNode(true);

    // -------------------------------------------------------
    // QUITAR FOOTER
    // -------------------------------------------------------

    const footer = copia.querySelector(
      '[data-export-footer="true"]'
    );

    if (footer) {
      footer.remove();
    }

    // -------------------------------------------------------
    // CHECKBOXES
    // -------------------------------------------------------

    const checksOriginales =
      origen.querySelectorAll(
        'input[type="checkbox"]'
      );

    const checksCopia =
      copia.querySelectorAll(
        'input[type="checkbox"]'
      );

    checksCopia.forEach((checkbox, index) => {
      const original = checksOriginales[index];

      const span =
        document.createElement("span");

      const cumplio = !!original?.checked;

      span.textContent = cumplio
        ? "☑"
        : "☐";

      span.style.display = "inline-block";
      span.style.width = "20px";
      span.style.fontSize = "18px";
      span.style.fontWeight = "900";

      span.style.color = cumplio
        ? "#176b38"
        : "#9d1717";

      span.style.flexShrink = "0";

      checkbox.replaceWith(span);
    });


    // -------------------------------------------------------
// CAMPOS DE TEXTO DEL CHECKLIST
// -------------------------------------------------------

const inputsOriginales =
  origen.querySelectorAll(
    "input[data-checklist-texto]"
  );


const inputsCopia =
  copia.querySelectorAll(
    "input[data-checklist-texto]"
  );


inputsCopia.forEach(
  (
    input,
    indice
  ) => {

    const original =
      inputsOriginales[
        indice
      ];


    const texto =
      original?.value ||
      "";


    const bloque =
      document.createElement(
        "div"
      );


    bloque.textContent =
      texto ||
      "No especificado.";


    bloque.style.padding =
      "12px";

    bloque.style.border =
      "1px solid #d5dce5";

    bloque.style.borderRadius =
      "10px";

    bloque.style.fontSize =
      "14px";

    bloque.style.background =
      "#fff";

    bloque.style.whiteSpace =
      "pre-wrap";


    input.replaceWith(
      bloque
    );

  }
);




    
    // -------------------------------------------------------
    // TEXTAREA
    // -------------------------------------------------------

    const textareaOriginal =
      origen.querySelector("textarea");

    const textareaCopia =
      copia.querySelector("textarea");

    if (textareaCopia) {
      const texto =
        textareaOriginal?.value ||
        accionCorrectiva ||
        "No se registró acción correctiva.";

      const bloque =
        document.createElement("div");

      bloque.textContent = texto;

      bloque.style.whiteSpace =
        "pre-wrap";

      bloque.style.width = "100%";

      bloque.style.minHeight =
        "130px";

      bloque.style.boxSizing =
        "border-box";

      bloque.style.border =
        "1px solid #d5dce5";

      bloque.style.borderRadius =
        "10px";

      bloque.style.padding =
        "12px";

      bloque.style.fontFamily =
        "Arial, Helvetica, sans-serif";

      bloque.style.fontSize = "14px";

      bloque.style.background =
        "#fff";

      textareaCopia.replaceWith(bloque);
    }

    // -------------------------------------------------------
    // FIRMAS
    // -------------------------------------------------------

    const canvasOriginales =
      origen.querySelectorAll(
        "canvas"
      );

    const canvasCopias =
      copia.querySelectorAll(
        "canvas"
      );

    canvasCopias.forEach(
      (canvasCopia, index) => {
        const canvasOriginal =
          canvasOriginales[index];

        if (!canvasOriginal) return;

        const imagen =
          document.createElement("img");

        try {
          imagen.src =
            canvasOriginal.toDataURL(
              "image/png"
            );
        } catch (error) {
          imagen.alt =
            "Firma no disponible";
        }

        imagen.style.width =
          "100%";

        imagen.style.height =
          "180px";

        imagen.style.objectFit =
          "contain";

        imagen.style.display =
          "block";

        imagen.style.background =
          "#fff";

        canvasCopia.replaceWith(
          imagen
        );
      }
    );

    // -------------------------------------------------------
    // ESTILOS DEL HTML EXPORTADO
    // -------------------------------------------------------

    const estilos = `
      * {
        box-sizing: border-box;
      }

      body {
        margin: 0;
        padding: 30px 20px;
        background: #f4f6f9;
        font-family: Arial, Helvetica, sans-serif;
        color: #17202a;
      }

      .check-item {
        display: flex;
        align-items: flex-start;
        gap: 9px;
        padding: 10px;
        border-radius: 9px;
        background: #f7f9fb;
        font-size: 14px;
        line-height: 1.35;
      }

      .signatureBox {
        break-inside: avoid;
      }

      @media print {
        body {
          background: #fff;
          padding: 0;
        }

        section,
        header {
          break-inside: avoid;
        }
      }
    `;

    const documento = `<!DOCTYPE html>
<html lang="es">

<head>
<meta charset="UTF-8">

<meta
  name="viewport"
  content="width=device-width, initial-scale=1.0"
/>

<title>
Checklist Foco Rojo - ${vendedor}
</title>

<style>
${estilos}
</style>

</head>

<body>

${copia.outerHTML}

</body>

</html>`;

    const blob = new Blob(
      [documento],
      {
        type:
          "text/html;charset=utf-8",
      }
    );

    const url =
      URL.createObjectURL(blob);

    const enlace =
      document.createElement("a");

    const nombreLimpio =
      vendedor
        .replace(
          /[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ_-]/g,
          "_"
        )
        .replace(
          /_+/g,
          "_"
        );

    enlace.href = url;

    enlace.download =
      `Checklist_Foco_Rojo_${nombreLimpio}_${fecha.replace(
        /\//g,
        "-"
      )}.html`;

    document.body.appendChild(
      enlace
    );

    enlace.click();

    enlace.remove();

    URL.revokeObjectURL(url);

    setEvidenciaDescargada(true);

    alert(
      "✅ Evidencia descargada correctamente.\n\nLas firmas quedaron integradas en la evidencia y no se guardaron en el sistema."
    );
  };

  // =========================================================
  // COMPONENTE CHECK
  // =========================================================

  const Check = ({
    id,
    children,
  }) => (
    <label style={styles.checkItem}>
      <input
        type="checkbox"
        checked={!!checks[id]}
        onChange={() =>
          toggleCheck(id)
        }
      />

      <span>{children}</span>
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
      color: "#17202a",
    },

    container: {
      maxWidth: "1100px",
      margin: "0 auto",
    },

    header: {
      background:
        "linear-gradient(135deg, #0057b8, #003b7a)",
      color: "#fff",
      borderRadius: "18px",
      padding: "28px",
      boxShadow:
        "0 8px 25px rgba(0,0,0,.15)",
      marginBottom: "22px",
    },

    mega: {
      fontSize: "34px",
      fontWeight: "900",
      letterSpacing: "2px",
      marginBottom: "4px",
    },

    title: {
      fontSize: "24px",
      fontWeight: "800",
      margin: 0,
    },

    subtitle: {
      marginTop: "8px",
      opacity: ".9",
      fontSize: "14px",
    },

    dataGrid: {
      display: "grid",
      gridTemplateColumns:
        "repeat(auto-fit, minmax(220px, 1fr))",
      gap: "12px",
      marginTop: "22px",
    },

    dataBox: {
      background:
        "rgba(255,255,255,.12)",
      border:
        "1px solid rgba(255,255,255,.25)",
      borderRadius: "12px",
      padding: "13px 15px",
    },

    dataLabel: {
      display: "block",
      fontSize: "11px",
      textTransform: "uppercase",
      opacity: ".75",
      fontWeight: "700",
      marginBottom: "4px",
    },

    dataValue: {
      fontSize: "15px",
      fontWeight: "700",
    },

    productivity: {
      fontSize: "25px",
      fontWeight: "900",
    },

    section: {
      background: "#fff",
      borderRadius: "16px",
      padding: "22px",
      marginBottom: "16px",
      boxShadow:
        "0 3px 12px rgba(0,0,0,.07)",
      border:
        "1px solid #e5e9ef",
    },

    sectionHeader: {
      display: "flex",
      alignItems: "center",
      gap: "12px",
      marginBottom: "18px",
      paddingBottom: "12px",
      borderBottom:
        "2px solid #eef1f5",
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
      fontSize: "15px",
    },

    sectionTitle: {
      margin: 0,
      fontSize: "17px",
      fontWeight: "800",
      color: "#17202a",
    },

    question: {
      fontSize: "14px",
      fontWeight: "700",
      marginBottom: "12px",
    },

    checksGrid: {
      display: "grid",
      gridTemplateColumns:
        "repeat(auto-fit, minmax(220px, 1fr))",
      gap: "8px",
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
      lineHeight: "1.35",
    },

    example: {
      margin:
        "4px 0 12px 30px",
      padding:
        "10px 12px",
      background: "#f1f6fc",
      borderLeft:
        "3px solid #0057b8",
      borderRadius:
        "0 8px 8px 0",
      fontSize: "13px",
      color: "#45515e",
      lineHeight: "1.4",
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
      outline: "none",
    },

    // =======================================================
    // FIRMAS
    // =======================================================

    signaturesGrid: {
      display: "grid",
      gridTemplateColumns:
        "repeat(auto-fit, minmax(320px, 1fr))",
      gap: "20px",
      marginTop: "20px",
    },

    signatureBox: {
      border:
        "1px solid #dce2e9",
      borderRadius: "14px",
      padding: "16px",
      background: "#f9fafc",
      breakInside: "avoid",
    },

    signatureTitle: {
      fontSize: "16px",
      fontWeight: "900",
      color: "#17202a",
      marginBottom: "4px",
    },

    signatureInstruction: {
      fontSize: "12px",
      color: "#6c757d",
      marginBottom: "12px",
    },

    canvasWrapper: {
      position: "relative",
      width: "100%",
      height: "180px",
      background: "#fff",
      border:
        "1px solid #ccd4de",
      borderRadius: "10px",
      overflow: "hidden",
    },

    signatureCanvas: {
      width: "100%",
      height: "180px",
      display: "block",
      touchAction: "none",
      cursor: "crosshair",
    },

    signatureLine: {
      position: "absolute",
      bottom: "28px",
      left: "8%",
      right: "8%",
      borderBottom:
        "1px dashed #9ca6b2",
      textAlign: "center",
      color: "#9ca6b2",
      fontSize: "11px",
      pointerEvents: "none",
      paddingBottom: "3px",
    },

    clearSignatureButton: {
      marginTop: "10px",
      border: "none",
      borderRadius: "8px",
      padding: "9px 13px",
      background: "#eef1f5",
      color: "#495057",
      fontSize: "12px",
      fontWeight: "700",
      cursor: "pointer",
    },

    footer: {
      display: "flex",
      justifyContent:
        "space-between",
      gap: "12px",
      flexWrap: "wrap",
      marginTop: "25px",
      paddingBottom: "30px",
    },

    backButton: {
      border: "none",
      borderRadius: "10px",
      padding: "13px 20px",
      background: "#6c757d",
      color: "#fff",
      fontWeight: "700",
      cursor: "pointer",
    },

    corporateButton: {
    border: "none",
    borderRadius: "10px",
    padding: "13px 24px",
   background: "#17202a",
   color: "#fff",
   fontWeight: "800",
   cursor: "pointer",
    },

    exportButton: {
      border: "none",
      borderRadius: "10px",
      padding: "13px 24px",
      background: "#0057b8",
      color: "#fff",
      fontWeight: "800",
      cursor: "pointer",
    },
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div style={styles.page}>
      <div
        id="checklist-foco-rojo"
        style={styles.container}
      >

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
    HISTORIAL DEL FOCO ROJO
================================================= */}

<section
  style={{
    ...styles.section,

    background:
      "linear-gradient(135deg, #f8fafc 0%, #eef4fb 100%)",

    border:
      "1px solid #d7e2ef",
  }}
>

  <div style={styles.sectionHeader}>

    <div style={styles.number}>
      📈
    </div>

    <h2 style={styles.sectionTitle}>
      SEGUIMIENTO DEL FOCO ROJO
    </h2>

  </div>


  {cargandoHistorial ? (

    <div
      style={{
        padding:
          "18px",

        textAlign:
          "center",

        color:
          "#64748b",

        fontWeight:
          "700",
      }}
    >
      Cargando historial del promotor...
    </div>

  ) : (

    <>

      {/* ===========================================
          CONTADOR
      =========================================== */}

      <div
        style={{
          display:
            "grid",

          gridTemplateColumns:
            "repeat(auto-fit, minmax(170px, 1fr))",

          gap:
            "14px",

          marginBottom:
            "18px",
        }}
      >

        <div
          style={{
            padding:
              "18px",

            borderRadius:
              "14px",

            background:
              "#ffffff",

            border:
              "1px solid #dbe4ee",

            boxShadow:
              "0 6px 18px rgba(15, 23, 42, 0.06)",
          }}
        >

          <div
            style={{
              color:
                "#64748b",

              fontSize:
                "12px",

              fontWeight:
                "800",

              textTransform:
                "uppercase",

              letterSpacing:
                "0.5px",
            }}
          >
            Checklists realizados
          </div>

          <div
            style={{
              marginTop:
                "6px",

              color:
                "#0f172a",

              fontSize:
                "32px",

              fontWeight:
                "900",
            }}
          >
            {totalChecklists}
          </div>

        </div>


        <div
          style={{
            padding:
              "18px",

            borderRadius:
              "14px",

            background:
              "#ffffff",

            border:
              "1px solid #dbe4ee",

            boxShadow:
              "0 6px 18px rgba(15, 23, 42, 0.06)",
          }}
        >

          <div
            style={{
              color:
                "#64748b",

              fontSize:
                "12px",

              fontWeight:
                "800",

              textTransform:
                "uppercase",

              letterSpacing:
                "0.5px",
            }}
          >
            Productividad inicial
          </div>

          <div
            style={{
              marginTop:
                "6px",

              color:
                "#0f172a",

              fontSize:
                "30px",

              fontWeight:
                "900",
            }}
          >
            {comparativa?.productividadInicial !== null &&
            comparativa?.productividadInicial !== undefined
              ? Number(
                  comparativa.productividadInicial
                ).toFixed(
                  2
                )
              : "—"}
          </div>

        </div>


        <div
          style={{
            padding:
              "18px",

            borderRadius:
              "14px",

            background:
              "#ffffff",

            border:
              "1px solid #dbe4ee",

            boxShadow:
              "0 6px 18px rgba(15, 23, 42, 0.06)",
          }}
        >

          <div
            style={{
              color:
                "#64748b",

              fontSize:
                "12px",

              fontWeight:
                "800",

              textTransform:
                "uppercase",

              letterSpacing:
                "0.5px",
            }}
          >
            Última productividad
          </div>

          <div
            style={{
              marginTop:
                "6px",

              color:
                "#0f172a",

              fontSize:
                "30px",

              fontWeight:
                "900",
            }}
          >
            {comparativa?.productividadUltima !== null &&
            comparativa?.productividadUltima !== undefined
              ? Number(
                  comparativa.productividadUltima
                ).toFixed(
                  2
                )
              : "—"}
          </div>

        </div>


        <div
          style={{
            padding:
              "18px",

            borderRadius:
              "14px",

            background:
              comparativa?.resultado === "MEJORÓ"
                ? "#ecfdf5"
                : comparativa?.resultado === "DISMINUYÓ"
                  ? "#fef2f2"
                  : "#f8fafc",

            border:
              comparativa?.resultado === "MEJORÓ"
                ? "1px solid #86efac"
                : comparativa?.resultado === "DISMINUYÓ"
                  ? "1px solid #fecaca"
                  : "1px solid #dbe4ee",

            boxShadow:
              "0 6px 18px rgba(15, 23, 42, 0.06)",
          }}
        >

          <div
            style={{
              color:
                "#64748b",

              fontSize:
                "12px",

              fontWeight:
                "800",

              textTransform:
                "uppercase",

              letterSpacing:
                "0.5px",
            }}
          >
            Evolución
          </div>

          <div
            style={{
              marginTop:
                "6px",

              color:
                comparativa?.resultado === "MEJORÓ"
                  ? "#166534"
                  : comparativa?.resultado === "DISMINUYÓ"
                    ? "#991b1b"
                    : "#334155",

              fontSize:
                "22px",

              fontWeight:
                "900",
            }}
          >
            {comparativa?.resultado ||
              "SIN HISTORIAL"}
          </div>

          {comparativa?.diferencia !== null &&
            comparativa?.diferencia !== undefined && (

              <div
                style={{
                  marginTop:
                    "4px",

                  color:
                    "#475569",

                  fontWeight:
                    "800",
                }}
              >
                {Number(
                  comparativa.diferencia
                ) > 0
                  ? "+"
                  : ""}

                {Number(
                  comparativa.diferencia
                ).toFixed(
                  2
                )}
              </div>

            )}

        </div>

      </div>


      {/* ===========================================
          FECHAS, SIN HORAS
      =========================================== */}

      {historial.length > 0 && (

        <details
          style={{
            padding:
              "14px 16px",

            borderRadius:
              "12px",

            background:
              "#ffffff",

            border:
              "1px solid #dbe4ee",
          }}
        >

          <summary
            style={{
              cursor:
                "pointer",

              color:
                "#1e3a5f",

              fontWeight:
                "900",
            }}
          >
            Ver fechas de seguimiento
          </summary>

          <div
            style={{
              display:
                "grid",

              gap:
                "8px",

              marginTop:
                "14px",
            }}
          >

            {historial.map(
              (
                registro,
                index
              ) => (

                <div
                  key={
                    registro.id ||
                    index
                  }
                  style={{
                    display:
                      "flex",

                    justifyContent:
                      "space-between",

                    gap:
                      "12px",

                    padding:
                      "10px 12px",

                    borderRadius:
                      "10px",

                    background:
                      "#f8fafc",

                    color:
                      "#334155",

                    fontSize:
                      "13px",

                    fontWeight:
                      "700",
                  }}
                >

                  <span>
                    Checklist {index + 1}
                  </span>

                  <span>
                    {registro.fecha ||
                      "Fecha no disponible"}
                  </span>

                  <span>
                    Productividad:{" "}

                    {Number(
                      registro.productividad ??
                      0
                    ).toFixed(
                      2
                    )}
                  </span>

                </div>

              )
            )}

          </div>

        </details>

      )}


      {errorSeguimiento && (

        <div
          role="alert"
          style={{
            marginTop:
              "14px",

            padding:
              "12px 14px",

            borderRadius:
              "10px",

            background:
              "#fff7ed",

            color:
              "#9a3412",

            border:
              "1px solid #fed7aa",

            fontWeight:
              "700",
          }}
        >
          ⚠️ {errorSeguimiento}
        </div>

      )}

    </>

  )}

</section>

        {/* =================================================
            01
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
            02
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
            03
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


{checks["hielo-otra"] && (

  <input
    type="text"
    data-checklist-texto="hielo-otra"
    value={
      otraTecnicaHielo
    }
    onChange={
      (
        evento
      ) =>
        setOtraTecnicaHielo(
          evento.target.value
        )
    }
    maxLength={
      300
    }
    placeholder="Escribe la técnica que utilizó para romper el hielo..."
    style={{
      width: "100%",
      boxSizing: "border-box",
      marginTop: "10px",
      padding: "12px",
      border:
        "1px solid #cbd5e1",
      borderRadius: "10px",
      background:
        "#ffffff",
      color:
        "#172033",
      fontSize:
        "14px",
    }}
  />

)}
        </section>

        {/* =================================================
            04
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
            05
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
            06
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
            07
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
            08
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
              marginTop: "18px",
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
            09
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
            10
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
            11
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
            12
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
            13
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
            14
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
            15
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
            16
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
            17
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
            18
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
            19
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
            20
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
                background: "#d71920",
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

          <div
            style={{
              background: "#fff4f4",
              border:
                "1px solid #f3c2c2",
              borderRadius: "12px",
              padding: "18px",
              marginBottom: "20px",
            }}
          >

            <div
              style={{
                fontSize: "12px",
                fontWeight: "800",
                color: "#d71920",
                textTransform: "uppercase",
                marginBottom: "6px",
              }}
            >
              🔥 Principal área de oportunidad
            </div>

            <div
              style={{
                fontSize: "22px",
                fontWeight: "900",
                color: "#17202a",
              }}
            >
              {principalArea}
            </div>

            {rankingDiagnostico.length > 0 && (
              <div
                style={{
                  fontSize: "13px",
                  color: "#59636e",
                  marginTop: "5px",
                }}
              >
                El área con mayor cantidad de oportunidades
                detectadas durante la observación.
              </div>
            )}

          </div>

          {rankingDiagnostico.length === 0 ? (

            <div
              style={{
                padding: "20px",
                textAlign: "center",
                background: "#f1faf4",
                borderRadius: "12px",
                color: "#19733a",
                fontWeight: "700",
              }}
            >
              🟢 No se detectaron áreas de oportunidad.
            </div>

          ) : (

            <div>

              {rankingDiagnostico.map(
                (item) => {

                  const maxOportunidades =
                    rankingDiagnostico[0]
                      .oportunidades;

                  const ancho =
                    maxOportunidades > 0
                      ? (
                          item.oportunidades /
                          maxOportunidades
                        ) * 100
                      : 0;

                  return (
                    <div
                      key={item.area}
                      style={{
                        marginBottom: "16px",
                      }}
                    >

                      <div
                        style={{
                          display: "flex",
                          justifyContent:
                            "space-between",
                          alignItems:
                            "center",
                          marginBottom: "6px",
                        }}
                      >

                        <span
                          style={{
                            fontSize: "14px",
                            fontWeight: "700",
                          }}
                        >
                          {item.area}
                        </span>

                        <span
                          style={{
                            fontSize: "13px",
                            fontWeight: "900",
                            color: "#d71920",
                          }}
                        >
                          {item.oportunidades}{" "}
                          {item.oportunidades === 1
                            ? "oportunidad"
                            : "oportunidades"}
                        </span>

                      </div>

                      <div
                        style={{
                          width: "100%",
                          height: "13px",
                          background: "#edf0f3",
                          borderRadius: "20px",
                          overflow: "hidden",
                        }}
                      >

                        <div
                          style={{
                            width: `${ancho}%`,
                            height: "100%",
                            background: "#d71920",
                            borderRadius: "20px",
                          }}
                        />

                      </div>

                    </div>
                  );
                }
              )}

            </div>

          )}

          {/* OTRA ÁREA */}

          <div
            style={{
              marginTop: "22px",
            }}
          >

            <div style={styles.question}>
              Otra:
            </div>

            <input
              type="text"
              data-checklist-texto="otra-area"
              value={otraArea}
              onChange={(e) =>
                setOtraArea(
                  e.target.value
                )
              }
              placeholder="Especifica otra área de oportunidad..."
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "12px",
                border:
                  "1px solid #d5dce5",
                borderRadius: "10px",
                fontSize: "14px",
              }}
            />

          </div>

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
            value={accionCorrectiva}
            onChange={(e) =>
              setAccionCorrectiva(
                e.target.value
              )
            }
            style={styles.textArea}
            placeholder="Escribe aquí la acción correctiva..."
          />

        </section>

        {/* =================================================
            FIRMAS
        ================================================= */}

        <section style={styles.section}>

          <div style={styles.sectionHeader}>

            <div style={styles.number}>
              ✍️
            </div>

            <h2 style={styles.sectionTitle}>
              ACEPTACIÓN DE LA RETROALIMENTACIÓN
            </h2>

          </div>

          <div
            style={{
              fontSize: "13px",
              color: "#59636e",
              lineHeight: "1.5",
              marginBottom: "18px",
            }}
          >
            Las firmas forman parte exclusivamente de esta
            evidencia del checklist.
          </div>

          <div style={styles.signaturesGrid}>

            {/* FIRMA SUPERVISOR */}

                  <SignaturePad
                     styles={styles}

                   canvasRef={
                 supervisorSignatureRef
               }

             label={`Firma del supervisor — ${
                   supervisor || "—"
              }`}

                 setFirmado={
               setFirmaSupervisor
                }
                />

            {/* FIRMA PROMOTOR */}

                      <SignaturePad
                styles={styles}

                canvasRef={
                  promotorSignatureRef
            }

                label={`Firma del promotor — ${
                vendedor
              }`}

            setFirmado={
           setFirmaPromotor
          }
          />

          </div>

        </section>

       {/* =================================================
    BOTONES
================================================= */}

<div
  data-export-footer="true"
  style={
    styles.footer
  }
>

  {/* =============================================
      1. DESCARGAR CHECKLIST LOCAL
  ============================================= */}

  <button
    type="button"
    onClick={
      exportarHTML
    }
    disabled={
      !checkLocalCompleto ||
      evidenciaDescargada
    }
    style={{
      ...styles.exportButton,

      background:
        evidenciaDescargada
          ? "#15803d"
          : "#174b8f",

      opacity:
        checkLocalCompleto &&
        !evidenciaDescargada
          ? 1
          : 0.5,

      cursor:
        checkLocalCompleto &&
        !evidenciaDescargada
          ? "pointer"
          : "not-allowed",
    }}
  >

    {evidenciaDescargada

      ? "✅ CheckList descargado"

      : checkLocalCompleto

        ? "📄 Descargar CheckList"

        : "🔒 Completa y firma el CheckList"}

  </button>


  {/* =============================================
      2. GUARDAR SEGUIMIENTO
  ============================================= */}

  <button
    type="button"
    onClick={
      guardarSeguimiento
    }
    disabled={
      !evidenciaDescargada ||
      !sesionId ||
      guardandoChecklist ||
      checklistGuardado
    }
    style={{
      ...styles.exportButton,

      background:
        checklistGuardado
          ? "#15803d"
          : "#0f766e",

      opacity:
        evidenciaDescargada &&
        sesionId &&
        !guardandoChecklist &&
        !checklistGuardado
          ? 1
          : 0.55,

      cursor:
        evidenciaDescargada &&
        sesionId &&
        !guardandoChecklist &&
        !checklistGuardado
          ? "pointer"
          : "not-allowed",
    }}
  >

    {guardandoChecklist

      ? "⏳ Guardando..."

      : checklistGuardado

        ? "✅ Seguimiento guardado"

        : "💾 Guardar seguimiento"}

  </button>


  {/* =============================================
      3. ABRIR CHECKLIST CORPORATIVO
  ============================================= */}

  <button
    type="button"
    disabled={
      !checklistGuardado
    }
style={{
  ...styles.corporateButton,

  background:
    corporativoAbierto

      ? "#15803d"

      : checklistGuardado

        ? "#17202a"

        : "#94a3b8",

  color:
    "#ffffff",

  opacity:
    1,

  cursor:
    checklistGuardado
      ? "pointer"
      : "not-allowed",
}}
    onClick={
      () => {

        if (
          !checklistGuardado
        ) {

          alert(
            "🔒 Primero debes descargar el CheckList y guardar el seguimiento."
          );

          return;

        }


        window.open(
          "https://forms.cloud.microsoft/r/5WKYqP7h3N",
          "_blank",
          "noopener,noreferrer"
        );


        setCorporativoAbierto(
          true
        );


        try {

          const pendienteGuardado =
            localStorage.getItem(
              "mega_checklist_pendiente"
            );


          if (
            pendienteGuardado
          ) {

            const pendiente =
              JSON.parse(
                pendienteGuardado
              );


            localStorage.setItem(
              "mega_checklist_pendiente",
              JSON.stringify({

                ...pendiente,

                paso:
                  "CORPORATIVO_ABIERTO",

                corporativoAbiertoEn:
                  new Date().toISOString(),

              })
            );

          }

        } catch (
          error
        ) {

          console.error(
            "❌ No se pudo guardar el paso corporativo:",
            error
          );

        }

      }
    }
  >

    {corporativoAbierto

      ? "✅ Check list corporativo abierto"

      : checklistGuardado

        ? "🏢 Abrir Check list corporativo"

        : "🔒 Guarda primero el seguimiento"}

  </button>


  {/* =============================================
      4. CERRAR SEGUIMIENTO
  ============================================= */}

  <button
    type="button"
    disabled={
      !corporativoAbierto
    }
    onClick={
      () => {

        if (
          !corporativoAbierto
        ) {

          alert(
            "🔒 Primero debes completar el CheckList local, descargarlo, guardar el seguimiento y abrir el CheckList corporativo."
          );

          return;

        }


        try {

          localStorage.removeItem(
            "mega_checklist_pendiente"
          );

        } catch (
          error
        ) {

          console.error(
            "❌ No se pudo liberar el checklist pendiente:",
            error
          );

        }


        onRegresar();

      }
    }
    style={{
      ...styles.backButton,

      opacity:
        corporativoAbierto
          ? 1
          : 0.5,

      cursor:
        corporativoAbierto
          ? "pointer"
          : "not-allowed",
    }}
  >

    {corporativoAbierto

      ? "↩️ Cerrar seguimiento y regresar"

      : checklistGuardado

        ? "🔒 Abre el CheckList corporativo"

        : evidenciaDescargada

          ? "🔒 Guarda el seguimiento"

          : "🔒 Completa y descarga el CheckList"}

  </button>

</div>
      </div>

    </div>

  );

}


export default ChecklistFocoRojo;
