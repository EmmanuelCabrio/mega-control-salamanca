import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  fetchProtegido,
} from "../services/authService";


// ==================================================
// FORMATEAR FECHA
// ==================================================

function formatearFecha(
  valor
) {

  if (
    !valor
  ) {

    return "—";

  }


  return new Intl.DateTimeFormat(
    "es-MX",
    {

      timeZone:
        "America/Mexico_City",

      dateStyle:
        "medium",

      timeStyle:
        "short",

    }
  ).format(
    new Date(
      valor
    )
  );

}




// ==================================================
// OBTENER MES DE UNA MINUTA
// ==================================================

function obtenerMesMinuta(
  valor
) {

  const fecha =
    new Date(
      valor
    );


  if (
    Number.isNaN(
      fecha.getTime()
    )
  ) {

    return "";

  }


  const partes =
    new Intl.DateTimeFormat(
      "en-CA",
      {

        timeZone:
          "America/Mexico_City",

        year:
          "numeric",

        month:
          "2-digit",

      }
    ).formatToParts(
      fecha
    );


  const anio =
    partes.find(
      (
        parte
      ) =>
        parte.type ===
        "year"
    )?.value;


  const mes =
    partes.find(
      (
        parte
      ) =>
        parte.type ===
        "month"
    )?.value;


  return anio && mes
    ? `${anio}-${mes}`
    : "";

}


// ==================================================
// MES ACTUAL EN MÉXICO
// ==================================================

function obtenerMesActual() {

  return obtenerMesMinuta(
    new Date()
  );

}


// ==================================================
// NOMBRE DEL MES
// ==================================================

function formatearNombreMes(
  valor
) {

  if (
    !/^\d{4}-\d{2}$/.test(
      valor
    )
  ) {

    return valor;
  }


  const [
    anio,
    mes,
  ] =
    valor.split("-");


  const fecha =
    new Date(
      Number(
        anio
      ),
      Number(
        mes
      ) - 1,
      1
    );


  const nombre =
    new Intl.DateTimeFormat(
      "es-MX",
      {

        month:
          "long",

        year:
          "numeric",

      }
    ).format(
      fecha
    );


  return nombre.charAt(
    0
  ).toUpperCase() +
    nombre.slice(
      1
    );

}


// ==================================================
// ESCAPAR TEXTO PARA DESCARGA
// ==================================================

function escaparTexto(
  valor
) {

  return String(
    valor ?? ""
  )
    .replaceAll(
      "&",
      "&amp;"
    )
    .replaceAll(
      "<",
      "&lt;"
    )
    .replaceAll(
      ">",
      "&gt;"
    )
    .replaceAll(
      "\"",
      "&quot;"
    )
    .replaceAll(
      "'",
      "&#039;"
    );

}


// ==================================================
// DESCARGAR MINUTA FIRMADA
// ==================================================

function descargarMinuta(
  minuta
) {

  if (
    !minuta?.firmaSupervisor
  ) {

    return;

  }


  const metricas =
    minuta.metricas ||
    {};


  const resultado =

    minuta.resultado ===
    "CUMPLIDO"

      ? "CUMPLIDO"

      : minuta.resultado ===
        "NO_CUMPLIDO"

        ? "NO CUMPLIDO"

        : "PENDIENTE DE EVALUACIÓN";


  const contenido = `<!doctype html>

<html lang="es">

<head>

  <meta charset="utf-8">

  <meta
    name="viewport"
    content="width=device-width, initial-scale=1"
  >

  <title>
    Minuta - ${escaparTexto(
      minuta.promotor
    )}
  </title>

  <style>

    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      padding: 34px;
      background: #eef2f7;
      color: #15213b;
      font-family: Arial, sans-serif;
    }

    .hoja {
      max-width: 900px;
      margin: auto;
      overflow: hidden;
      border-radius: 24px;
      background: #ffffff;
      box-shadow:
        0 18px 50px
        rgba(24, 36, 60, 0.15);
    }

    header {
      padding: 32px 38px;
      color: #ffffff;
      background:
        linear-gradient(
          135deg,
          #111d36,
          #173c74
        );
    }

    .logo {
      font-size: 30px;
      font-weight: 900;
    }

    .tipo {
      margin-top: 9px;
      color: #b9d5ff;
      font-size: 12px;
      font-weight: 800;
      letter-spacing: 2px;
    }

    main {
      padding: 34px 38px;
    }

    .encabezado {
      display: flex;
      justify-content: space-between;
      gap: 24px;
      padding-bottom: 22px;
      border-bottom:
        1px solid #dce3ed;
    }

    h1 {
      margin: 0 0 8px;
      font-size: 25px;
    }

    .dato {
      margin: 5px 0;
      color: #64748b;
    }

    .estado {
      height: max-content;
      padding: 9px 14px;
      border-radius: 999px;
      background: #e8f1ff;
      color: #174b8f;
      font-size: 12px;
      font-weight: 800;
    }

    .metricas {
      display: grid;
      grid-template-columns:
        repeat(
          5,
          1fr
        );
      gap: 10px;
      margin: 25px 0;
    }

    .metrica {
      padding: 14px;
      border:
        1px solid #dce3ed;
      border-radius: 15px;
      text-align: center;
    }

    .metrica span {
      display: block;
      color: #64748b;
      font-size: 11px;
      font-weight: 700;
    }

    .metrica strong {
      display: block;
      margin-top: 5px;
      font-size: 24px;
    }

    .compromiso {
      margin-top: 18px;
      padding: 20px;
      border-radius: 16px;
      background: #f4f7fb;
    }

    .compromiso label,
    .firma label {
      display: block;
      color: #64748b;
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 1px;
    }

    .compromiso p {
      margin: 9px 0 0;
      font-size: 17px;
      line-height: 1.55;
      white-space: pre-wrap;
    }

    .firma {
      margin-top: 24px;
      padding: 20px;
      border:
        1px solid #dce3ed;
      border-radius: 16px;
    }

    .firma img {
      display: block;
      width: 100%;
      max-width: 520px;
      height: 115px;
      margin: 8px auto;
      object-fit: contain;
      border-bottom:
        1px solid #64748b;
    }

    .firma small {
      display: block;
      color: #64748b;
      text-align: center;
    }

    footer {
      padding: 16px 38px 28px;
      color: #8490a3;
      font-size: 10px;
      text-align: center;
    }

  </style>

</head>

<body>

  <article class="hoja">

    <header>

      <div class="logo">
        MEGA
      </div>

      <div class="tipo">
        MINUTA DE COMPROMISO · SEGUIMIENTO 2.0
      </div>

    </header>

    <main>

      <div class="encabezado">

        <div>

          <h1>
            ${escaparTexto(
              minuta.promotor
            )}
          </h1>

          <p class="dato">
            Supervisor:
            ${escaparTexto(
              minuta.supervisor
            )}
          </p>

          <p class="dato">
            Generada:
            ${escaparTexto(
              formatearFecha(
                minuta.creadaEn
              )
            )}
          </p>

        </div>

        <div class="estado">
          ${resultado}
        </div>

      </div>

      <div class="metricas">

        <div class="metrica">
          <span>PRODUCTIVIDAD</span>
          <strong>
            ${Number(
              metricas.productividad ||
              0
            ).toFixed(2)}
          </strong>
        </div>

        <div class="metrica">
          <span>DÍAS EN CERO</span>
          <strong>
            ${Number(
              metricas.diasSinVenta ||
              0
            )}
          </strong>
        </div>

        <div class="metrica">
          <span>APPS</span>
          <strong>
            ${Number(
              metricas.apps ||
              0
            )}
          </strong>
        </div>

        <div class="metrica">
          <span>RX</span>
          <strong>
            ${Number(
              metricas.rx ||
              0
            )}
          </strong>
        </div>

        <div class="metrica">
          <span>MÓVIL</span>
          <strong>
            ${Number(
              metricas.movil ||
              0
            )}
          </strong>
        </div>

      </div>

      <div class="compromiso">

        <label>
          COMPROMISO PARA EL DÍA
        </label>

        <p>
          ${escaparTexto(
            minuta.compromiso
          )}
        </p>

      </div>

      <div class="firma">

        <label>
          FIRMA DEL SUPERVISOR DE ENTERADO
        </label>

        <img
          src="${minuta.firmaSupervisor}"
          alt="Firma del supervisor"
        >

        <small>
          Firmada el
          ${escaparTexto(
            formatearFecha(
              minuta.firmadaEn
            )
          )}
        </small>

      </div>

    </main>

    <footer>
      Documento generado desde MEGA Control Salamanca ·
      Identificador:
      ${escaparTexto(
        minuta.id
      )}
    </footer>

  </article>

</body>

</html>`;


  const archivo =
    new Blob(
      [
        contenido,
      ],
      {

        type:
          "text/html;charset=utf-8",

      }
    );


  const url =
    URL.createObjectURL(
      archivo
    );


  const enlace =
    document.createElement(
      "a"
    );


  const nombreSeguro =
    String(
      minuta.promotor ||
      "minuta"
    )
      .trim()
      .replace(
        /[^a-z0-9áéíóúñ]+/gi,
        "-"
      )
      .replace(
        /^-|-$/g,
        ""
      );


  enlace.href =
    url;

  enlace.download =
    `Minuta-${nombreSeguro}.html`;


  document.body.appendChild(
    enlace
  );

  enlace.click();

  enlace.remove();


  URL.revokeObjectURL(
    url
  );

}


// ==================================================
// INDICADORES
// ==================================================

function MetricasMinuta({

  datos,

}) {

  return (

    <div className="minuta-metricas">

      <div className="minuta-metrica">

        <span>
          Productividad
        </span>

        <strong>
          {Number(
            datos.productividad ||
            0
          ).toFixed(2)}
        </strong>

      </div>


      <div className="minuta-metrica">

        <span>
          Días en cero
        </span>

        <strong>
          {datos.diasSinVenta || 0}
        </strong>

      </div>


      <div className="minuta-metrica">

        <span>
          Apps
        </span>

        <strong>
          {datos.apps || 0}
        </strong>

      </div>


      <div className="minuta-metrica">

        <span>
          RX
        </span>

        <strong>
          {datos.rx || 0}
        </strong>

      </div>


      <div className="minuta-metrica">

        <span>
          Móvil
        </span>

        <strong>
          {datos.movil || 0}
        </strong>

      </div>

    </div>

  );

}


// ==================================================
// FIRMA DIGITAL
// ==================================================

function FirmaMinuta({

  minutaId,

  onFirmada,

}) {

  const canvasRef =
    useRef(null);


  const dibujando =
    useRef(false);


  const [
    tieneFirma,
    setTieneFirma,
  ] = useState(false);


  const [
    enviando,
    setEnviando,
  ] = useState(false);


  const [
    error,
    setError,
  ] = useState("");


  // ==================================================
  // POSICIÓN DEL MOUSE O DEDO
  // ==================================================

  function obtenerPosicion(
    evento
  ) {

    const canvas =
      canvasRef.current;


    const rect =
      canvas.getBoundingClientRect();


    const punto =
      evento.touches?.[0] ||
      evento;


    return {

      x:
        (
          punto.clientX -
          rect.left
        ) *
        (
          canvas.width /
          rect.width
        ),

      y:
        (
          punto.clientY -
          rect.top
        ) *
        (
          canvas.height /
          rect.height
        ),

    };

  }


  // ==================================================
  // INICIAR FIRMA
  // ==================================================

  function iniciarFirma(
    evento
  ) {

    evento.preventDefault();


    const contexto =
      canvasRef.current.getContext(
        "2d"
      );


    const posicion =
      obtenerPosicion(
        evento
      );


    dibujando.current =
      true;


    contexto.beginPath();


    contexto.moveTo(
      posicion.x,
      posicion.y
    );

  }


  // ==================================================
  // DIBUJAR
  // ==================================================

  function dibujarFirma(
    evento
  ) {

    evento.preventDefault();


    if (
      !dibujando.current
    ) {

      return;

    }


    const contexto =
      canvasRef.current.getContext(
        "2d"
      );


    const posicion =
      obtenerPosicion(
        evento
      );


    contexto.lineWidth =
      3;

    contexto.lineCap =
      "round";

    contexto.lineJoin =
      "round";

    contexto.strokeStyle =
      "#14213d";


    contexto.lineTo(
      posicion.x,
      posicion.y
    );


    contexto.stroke();


    setTieneFirma(
      true
    );

  }


  // ==================================================
  // TERMINAR FIRMA
  // ==================================================

  function terminarFirma(
    evento
  ) {

    if (
      evento
    ) {

      evento.preventDefault();

    }


    dibujando.current =
      false;

  }


  // ==================================================
  // LIMPIAR FIRMA
  // ==================================================

  function limpiarFirma() {

    const canvas =
      canvasRef.current;


    const contexto =
      canvas.getContext(
        "2d"
      );


    contexto.clearRect(
      0,
      0,
      canvas.width,
      canvas.height
    );


    setTieneFirma(
      false
    );


    setError(
      ""
    );

  }


  // ==================================================
  // ENVIAR FIRMA
  // ==================================================

  async function enviarFirma() {

    if (
      !tieneFirma
    ) {

      setError(
        "Firma dentro del recuadro antes de devolver la minuta."
      );

      return;

    }


    try {

      setEnviando(
        true
      );


      setError(
        ""
      );


      const firma =
        canvasRef.current.toDataURL(
          "image/png"
        );


      const respuesta =
        await fetchProtegido(
          `/api/minutas/${minutaId}/firmar`,
          {

            method:
              "POST",

            headers: {

              "Content-Type":
                "application/json",

            },

            body:
              JSON.stringify({

                firma,

              }),

          }
        );


      const datos =
        await respuesta.json();


      if (
        !respuesta.ok ||
        !datos.correcto
      ) {

        throw new Error(
          datos.mensaje ||
          "No se pudo devolver la minuta"
        );

      }


      await onFirmada(
        datos.mensaje
      );


    } catch (
      errorFirma
    ) {

      setError(
        errorFirma.message ||
        "No se pudo devolver la minuta"
      );


    } finally {

      setEnviando(
        false
      );

    }

  }


  return (

    <div className="minuta-firma-editor">

      <span>
        Firma de enterado del supervisor
      </span>

      <p>
        Al firmar confirmas que conoces el compromiso y darás seguimiento durante el día.
      </p>


      <canvas
        ref={
          canvasRef
        }
        width={
          900
        }
        height={
          220
        }
        onMouseDown={
          iniciarFirma
        }
        onMouseMove={
          dibujarFirma
        }
        onMouseUp={
          terminarFirma
        }
        onMouseLeave={
          terminarFirma
        }
        onTouchStart={
          iniciarFirma
        }
        onTouchMove={
          dibujarFirma
        }
        onTouchEnd={
          terminarFirma
        }
      />


      {error && (

        <div className="minutas-aviso minutas-aviso-error">
          {error}
        </div>

      )}


      <div className="minuta-firma-acciones">

        <button
          type="button"
          onClick={
            limpiarFirma
          }
        >
          Limpiar firma
        </button>

        <button
          type="button"
          onClick={
            enviarFirma
          }
          disabled={
            !tieneFirma ||
            enviando
          }
        >

          {enviando
            ? "Devolviendo…"
            : "Firmar y devolver a Dirección →"}

        </button>

      </div>

    </div>

  );

}


// ==================================================
// PANEL DE MINUTAS DEL SUPERVISOR
// ==================================================

function MinutasSupervisor() {

  const [
    minutas,
    setMinutas,
  ] = useState([]);


  const [
    cargando,
    setCargando,
  ] = useState(true);


  const [
    error,
    setError,
  ] = useState("");


  const [
    mensaje,
    setMensaje,
  ] = useState("");

  const [
  filtroMes,
  setFiltroMes,
] = useState(
  obtenerMesActual
);


const [
  filtroEstado,
  setFiltroEstado,
] = useState(
  "TODAS"
);


  // ==================================================
  // CARGAR MINUTAS
  // ==================================================

  async function cargarMinutas() {

    try {

      setCargando(
        true
      );


      setError(
        ""
      );


      const respuesta =
        await fetchProtegido(
          "/api/minutas"
        );


      const datos =
        await respuesta.json();


      if (
        !respuesta.ok ||
        !datos.correcto
      ) {

        throw new Error(
          datos.mensaje ||
          "No se pudieron cargar las minutas"
        );

      }


      setMinutas(
        datos.minutas ||
        []
      );


    } catch (
      errorCarga
    ) {

      setError(
        errorCarga.message ||
        "No se pudieron cargar las minutas"
      );


    } finally {

      setCargando(
        false
      );

    }

  }


  useEffect(
    () => {

      const temporizador =
        window.setTimeout(
          () => {

            cargarMinutas();

          },
          0
        );


      return () =>
        window.clearTimeout(
          temporizador
        );

    },
    []
  );


  // ==================================================
  // ACTUALIZAR DESPUÉS DE FIRMAR
  // ==================================================

  async function minutaFirmada(
    texto
  ) {

    setMensaje(
      texto
    );


    await cargarMinutas();

  }


  const pendientes =
    minutas.filter(
      (
        minuta
      ) =>
        minuta.estado ===
        "PENDIENTE_FIRMA"
    );



  // ==================================================
// MESES DISPONIBLES
// ==================================================

const mesesDisponibles =
  useMemo(
    () => {

      return [
        ...new Set(
          minutas
            .map(
              (
                minuta
              ) =>
                obtenerMesMinuta(
                  minuta.creadaEn
                )
            )
            .filter(
              Boolean
            )
        ),
      ].sort(
        (
          a,
          b
        ) =>
          b.localeCompare(
            a
          )
      );

    },
    [
      minutas,
    ]
  );


// ==================================================
// FILTRAR MINUTAS DEL SUPERVISOR
// ==================================================

const minutasFiltradas =
  useMemo(
    () => {

      return minutas

        .filter(
          (
            minuta
          ) => {

            const esPendiente =
              minuta.estado ===
              "PENDIENTE_FIRMA";


            // Las pendientes siempre permanecen
            // visibles con el filtro general.

            const coincideMes =
              filtroMes ===
                "TODOS" ||
              obtenerMesMinuta(
                minuta.creadaEn
              ) ===
                filtroMes ||
              (
                filtroEstado ===
                  "TODAS" &&
                esPendiente
              );


            if (
              !coincideMes
            ) {

              return false;

            }


            if (
              filtroEstado ===
              "TODAS"
            ) {

              return true;

            }


            if (
              filtroEstado ===
              "PENDIENTES"
            ) {

              return esPendiente;

            }


            if (
              filtroEstado ===
              "FIRMADAS"
            ) {

              return (
                minuta.estado ===
                  "FIRMADA" &&
                !minuta.resultado
              );

            }


            if (
              filtroEstado ===
              "CUMPLIDAS"
            ) {

              return (
                minuta.resultado ===
                "CUMPLIDO"
              );

            }


            if (
              filtroEstado ===
              "NO_CUMPLIDAS"
            ) {

              return (
                minuta.resultado ===
                "NO_CUMPLIDO"
              );

            }


            return true;

          }
        )

        .sort(
          (
            a,
            b
          ) => {

            const pendienteA =
              a.estado ===
              "PENDIENTE_FIRMA";

            const pendienteB =
              b.estado ===
              "PENDIENTE_FIRMA";


            if (
              pendienteA !==
              pendienteB
            ) {

              return pendienteA
                ? -1
                : 1;

            }


            return (
              new Date(
                b.creadaEn ||
                0
              ).getTime() -
              new Date(
                a.creadaEn ||
                0
              ).getTime()
            );

          }
        );

    },
    [
      minutas,
      filtroMes,
      filtroEstado,
    ]
  );


  // Si no hay minutas, no ocupa espacio
  // dentro del dashboard.

  if (
    !cargando &&
    minutas.length === 0 &&
    !error
  ) {

    return null;

  }


  return (

    <section className="minutas-panel minutas-supervisor">

      <header className="minutas-header">

        <div>

          <span className="minutas-kicker">
            MENSAJE DE DIRECCIÓN
          </span>

          <h2>
            Minutas y compromisos
          </h2>

          <p>

            {pendientes.length > 0

              ? `Tienes ${pendientes.length} minuta${pendientes.length === 1 ? "" : "s"} pendiente${pendientes.length === 1 ? "" : "s"} de firma.`

              : "Tus minutas están al corriente."}

          </p>

        </div>


        <button
          type="button"
          className="minutas-recargar"
          onClick={
            cargarMinutas
          }
        >
          ↻ Actualizar
        </button>

      </header>


      {error && (

        <div className="minutas-aviso minutas-aviso-error">
          {error}
        </div>

      )}


      {mensaje && (

        <div className="minutas-aviso minutas-aviso-ok">
          {mensaje}
        </div>

      )}





      {/* =================================================
    FILTROS DEL HISTORIAL
================================================= */}

<div className="minutas-historial-titulo">

  <div>

    <h3>
      Minutas del equipo
    </h3>

    <span>
      {minutasFiltradas.length} minuta{
        minutasFiltradas.length ===
        1
          ? ""
          : "s"
      } visible{
        minutasFiltradas.length ===
        1
          ? ""
          : "s"
      }
    </span>

  </div>


  <div className="minutas-filtros-historial">

    <label className="minutas-filtro">

      <span>
        Mes
      </span>

      <select
        value={
          filtroMes
        }
        onChange={
          (
            evento
          ) =>
            setFiltroMes(
              evento.target.value
            )
        }
      >

        <option value="TODOS">
          Todos los meses
        </option>

        {mesesDisponibles.map(
          (
            mes
          ) => (

            <option
              key={
                mes
              }
              value={
                mes
              }
            >
              {formatearNombreMes(
                mes
              )}
            </option>

          )
        )}

      </select>

    </label>


    <label className="minutas-filtro">

      <span>
        Estado
      </span>

      <select
        value={
          filtroEstado
        }
        onChange={
          (
            evento
          ) =>
            setFiltroEstado(
              evento.target.value
            )
        }
      >

        <option value="TODAS">
          Todas
        </option>

        <option value="PENDIENTES">
          Pendientes de firma
        </option>

        <option value="FIRMADAS">
          Firmadas
        </option>

        <option value="CUMPLIDAS">
          Cumplidas
        </option>

        <option value="NO_CUMPLIDAS">
          No cumplidas
        </option>

      </select>

    </label>

  </div>

</div>







      

      <div className="minutas-lista">

        {!cargando &&
minutasFiltradas.length ===
0 && (

  <div className="minutas-vacio">

    📅 No hay minutas que coincidan con el mes y estado seleccionados.

  </div>

)}

        {minutasFiltradas.map(
          (
            minuta
          ) => (

            <article
              className={`minuta-card ${
                minuta.estado ===
                "PENDIENTE_FIRMA"

                  ? "minuta-card-pendiente"

                  : ""
              }`}
              key={
                minuta.id
              }
            >

              <div className="minuta-card-top">

                <div>

                  <span
                    className={`minuta-estado minuta-estado-${String(
                      minuta.estado
                    ).toLowerCase()}`}
                  >

                    {minuta.estado ===
                    "PENDIENTE_FIRMA"

                      ? "Requiere tu firma"

                      : minuta.estado ===
                        "FIRMADA"

                        ? "Devuelta a Dirección"

                        : minuta.resultado ===
                          "CUMPLIDO"

                          ? "Cumplido"

                          : "No cumplido"}

                  </span>

                  <h4>
                    {minuta.promotor}
                  </h4>

                  <p>
                    Enviada por Dirección
                    {" · "}
                    {formatearFecha(
                      minuta.creadaEn
                    )}
                  </p>

                </div>

              </div>


              <MetricasMinuta
                datos={
                  minuta.metricas ||
                  {}
                }
              />


              <div className="minuta-compromiso">

                <span>
                  Compromiso para el día
                </span>

                <p>
                  {minuta.compromiso}
                </p>

              </div>


              {minuta.estado ===
              "PENDIENTE_FIRMA" && (

                <FirmaMinuta
                  minutaId={
                    minuta.id
                  }
                  onFirmada={
                    minutaFirmada
                  }
                />

              )}


              {minuta.firmaSupervisor && (

                <button
                  type="button"
                  className="minuta-descargar"
                  onClick={
                    () =>
                      descargarMinuta(
                        minuta
                      )
                  }
                >
                  ↓ Descargar minuta firmada
                </button>

              )}

            </article>

          )
        )}

      </div>

    </section>

  );

}


export default MinutasSupervisor;
