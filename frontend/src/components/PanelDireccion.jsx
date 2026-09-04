import {
  Fragment,
  useRef,
  useState,
} from "react";

import {
  fetchProtegido,
} from "../services/authService";

import VentaVsMesAnterior
  from "./VentaVsMesAnterior";

import PlantillaStatus
  from "./PlantillaStatus";

import ProductividadPorCanal
  from "./ProductividadPorCanal";

import CarteraPorDia
  from "./CarteraPorDia";

import ProyeccionDireccion
  from "./ProyeccionDireccion";


// ==================================================
// 👑 DASHBOARD DE DIRECCIÓN
// ==================================================

function PanelDireccion({
  onCerrarSesion,
}) {

  const [actualizando, setActualizando] =
    useState(false);

  const [subiendo, setSubiendo] =
  useState(false);

  const [mensaje, setMensaje] =
    useState("");

  const [hayError, setHayError] =
    useState(false);

  const [versionDatos, setVersionDatos] =
    useState(0);

  // Bloqueo inmediato para evitar doble clic.
  const bloqueoActualizacion =
    useRef(false);

  const selectorExcel =
  useRef(null);



  // ================================================
// SUBIR, REEMPLAZAR Y ACTIVAR UN EXCEL NUEVO
// ================================================

async function subirExcel(
  evento
) {

  const archivo =
    evento.target.files?.[0];


  // Permite volver a seleccionar el mismo archivo
  // si necesitamos intentarlo nuevamente.

  evento.target.value = "";


  if (!archivo) {
    return;
  }


  // ==============================================
  // VALIDAR EXTENSIÓN
  // ==============================================

  if (
    !archivo.name
      .toLowerCase()
      .endsWith(".xlsx")
  ) {

    setHayError(true);

    setMensaje(
      "Selecciona un archivo con extensión .xlsx."
    );

    return;

  }


  // ==============================================
  // VALIDAR TAMAÑO
  // ==============================================

  const limiteBytes =
    10 * 1024 * 1024;


  if (
    archivo.size >
    limiteBytes
  ) {

    setHayError(true);

    setMensaje(
      "El archivo supera el límite de 10 MB."
    );

    return;

  }


  // ==============================================
  // CONFIRMAR EL REEMPLAZO
  // ==============================================

  const confirmar =
    window.confirm(
      `¿Reemplazar el Excel de Supabase con "${archivo.name}"?`
    );


  if (
    !confirmar ||
    bloqueoActualizacion.current
  ) {

    return;

  }


  // ==============================================
  // BLOQUEAR MÁS OPERACIONES
  // ==============================================

  bloqueoActualizacion.current =
    true;

  setSubiendo(true);

  setMensaje("");

  setHayError(false);


  try {

    // ============================================
    // ENVIAR EL ARCHIVO AL BACKEND
    // ============================================

    const respuesta =
      await fetchProtegido(
        "/api/subir-excel",
        {

          method:
            "POST",

          headers: {

            "Content-Type":
              "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",

            "X-File-Name":
              encodeURIComponent(
                archivo.name
              ),

          },

          body:
            archivo,

        }
      );


    // ============================================
    // LEER RESPUESTA
    // ============================================

    const resultado =
      await respuesta.json();


    if (
      !respuesta.ok ||
      !resultado.correcto
    ) {

      throw new Error(
        resultado.mensaje ||
        "No se pudo reemplazar el Excel."
      );

    }


    // ============================================
    // RECARGAR TODOS LOS COMPONENTES
    // ============================================

    setVersionDatos(
      (versionActual) =>
        versionActual + 1
    );


    const hora =
      new Date(
        resultado.actualizadoEn
      ).toLocaleTimeString(
        "es-MX"
      );


    setMensaje(
      `✅ Excel reemplazado y caché actualizada a las ${hora}.`
    );


  } catch (error) {

    setHayError(true);

    setMensaje(
      error.message ||
      "No se pudo reemplazar el Excel."
    );


  } finally {

    bloqueoActualizacion.current =
      false;

    setSubiendo(false);

  }

}


  // ================================================
  // ACTUALIZAR EL EXCEL Y RECARGAR LOS COMPONENTES
  // ================================================

  async function actualizarDatos() {

    if (bloqueoActualizacion.current) {
      return;
    }

    bloqueoActualizacion.current = true;

    setActualizando(true);
    setMensaje("");
    setHayError(false);

    try {

      const respuesta = await fetchProtegido(
        "/api/actualizar-datos",
        {
          method: "POST",
        }
      );

      if (respuesta.status === 401) {
        throw new Error(
          "Tu sesión expiró. Vuelve a iniciar sesión."
        );
      }

      if (respuesta.status === 403) {
        throw new Error(
          "Acceso exclusivo de Dirección."
        );
      }

      const resultado = await respuesta.json();

      if (!respuesta.ok || !resultado.correcto) {

        throw new Error(
          resultado.mensaje ||
          "No se pudo actualizar la información."
        );

      }

      // Recrea los componentes para que vuelvan
      // a consultar los datos del servidor.
      setVersionDatos(
        (versionActual) => versionActual + 1
      );

      const hora = new Date(
        resultado.actualizadoEn
      ).toLocaleTimeString("es-MX");

      setMensaje(
        `✅ Excel y caché actualizados a las ${hora}. El panel está cargando la información nueva.`
      );

    } catch (error) {

      setHayError(true);

      setMensaje(
        error.message ||
        "No se pudo completar la actualización."
      );

    } finally {

      bloqueoActualizacion.current = false;

      setActualizando(false);

    }

  }



// ================================================
// PANEL
// ================================================

return (

  <div className="panel-direccion">

    <header className="panel-direccion-header">

      {/* INFORMACIÓN DEL ENCABEZADO */}

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


      {/* CONTENEDOR DE BOTONES */}

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "12px",
          alignItems: "center",
        }}
      >

        {/* SELECTOR OCULTO DEL EXCEL */}

        <input
          ref={selectorExcel}
          type="file"

          accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"

          onChange={subirExcel}

          style={{
            display: "none",
          }}
        />


        {/* REEMPLAZAR EXCEL */}

        <button
          type="button"

          onClick={() =>
            selectorExcel.current?.click()
          }

          disabled={
            actualizando ||
            subiendo
          }

          aria-busy={subiendo}

          style={{
            padding: "12px 18px",

            border:
              "1px solid #059669",

            borderRadius:
              "12px",

            background:
              subiendo
                ? "#64748b"
                : "#047857",

            color:
              "#ffffff",

            font:
              "inherit",

            fontWeight:
              700,

            cursor:
              actualizando ||
              subiendo
                ? "wait"
                : "pointer",

            opacity:
              actualizando ||
              subiendo
                ? 0.8
                : 1,
          }}
        >

          {subiendo
            ? "⏳ Subiendo Excel..."
            : "📤 Reemplazar Excel"}

        </button>


        {/* ACTUALIZAR DESDE SUPABASE */}

        <button
          type="button"

          onClick={actualizarDatos}

          disabled={
            actualizando ||
            subiendo
          }

          aria-busy={actualizando}

          style={{
            padding:
              "12px 18px",

            border:
              "1px solid #2563eb",

            borderRadius:
              "12px",

            background:
              actualizando
                ? "#64748b"
                : "#1d4ed8",

            color:
              "#ffffff",

            font:
              "inherit",

            fontWeight:
              700,

            cursor:
              actualizando ||
              subiendo
                ? "wait"
                : "pointer",

            opacity:
              actualizando ||
              subiendo
                ? 0.8
                : 1,
          }}
        >

          {actualizando
            ? "⏳ Actualizando datos..."
            : "🔄 Actualizar datos"}

        </button>


        {/* CERRAR SESIÓN */}

        {onCerrarSesion && (

          <button
            type="button"
            className="panel-direccion-logout"
            onClick={onCerrarSesion}
          >
            🚪 Cerrar sesión
          </button>

        )}

      </div>

    </header>


      {mensaje && (

        <div
          role={hayError ? "alert" : "status"}
          style={{
            margin: "16px 0",
            padding: "14px 18px",
            borderRadius: "12px",
            background: hayError
              ? "#fef2f2"
              : "#ecfdf5",
            color: hayError
              ? "#991b1b"
              : "#065f46",
            border: hayError
              ? "1px solid #fecaca"
              : "1px solid #a7f3d0",
          }}
        >
          {mensaje}
        </div>

      )}


      <section className="panel-direccion-proximamente">

        <div>

          <span>
            🚀
          </span>

          <div>

            <h2>
              Resumen Operativo
            </h2>

            <p>
              Aquí es donde empieza el rumbo de tu día
            </p>

          </div>

        </div>

      </section>


      <Fragment key={versionDatos}>

        <PlantillaStatus />

        <VentaVsMesAnterior />

        <ProductividadPorCanal />

        <CarteraPorDia />

        <ProyeccionDireccion />

      </Fragment>

    </div>

  );

}

export default PanelDireccion;
