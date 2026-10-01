import {
  useEffect,
  useMemo,
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
// OBTENER FECHA LOCAL DE LA MINUTA
// ==================================================

function obtenerFechaMinuta(
  valor
) {

  if (
    !valor
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

        day:
          "2-digit",

      }
    ).formatToParts(
      new Date(
        valor
      )
    );


  const obtenerParte =
    (
      tipo
    ) =>
      partes.find(
        (
          parte
        ) =>
          parte.type ===
          tipo
      )?.value ||
      "";


  const anio =
    obtenerParte(
      "year"
    );


  const mes =
    obtenerParte(
      "month"
    );


  const dia =
    obtenerParte(
      "day"
    );


  if (
    !anio ||
    !mes ||
    !dia
  ) {

    return "";

  }


  return `${anio}-${mes}-${dia}`;

}


// ==================================================
// ESCAPAR TEXTO PARA LA DESCARGA
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
      letter-spacing: 1px;
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

    @media print {

      body {
        padding: 0;
        background: #ffffff;
      }

      .hoja {
        border-radius: 0;
        box-shadow: none;
      }

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
// INDICADORES DE LA MINUTA
// ==================================================

function MetricasMinuta({

  datos,

}) {

  const indicadores = [

    [
      "Productividad",
      Number(
        datos.productividad ||
        0
      ).toFixed(2),
    ],

    [
      "Días en cero",
      datos.diasSinVenta ||
      0,
    ],

    [
      "Apps",
      datos.apps ||
      0,
    ],

    [
      "RX",
      datos.rx ||
      0,
    ],

    [
      "Móvil",
      datos.movil ||
      0,
    ],

  ];


  return (

    <div className="minuta-metricas">

      {indicadores.map(
        (
          [
            etiqueta,
            valor,
          ]
        ) => (

          <div
            className="minuta-metrica"
            key={etiqueta}
          >

            <span>
              {etiqueta}
            </span>

            <strong>
              {valor}
            </strong>

          </div>

        )
      )}

    </div>

  );

}


// ==================================================
// COMPONENTE PRINCIPAL
// ==================================================

function MinutasDireccion() {

  const [
    focosRojos,
    setFocosRojos,
  ] = useState([]);


  const [
    minutas,
    setMinutas,
  ] = useState([]);


  const [
    supervisor,
    setSupervisor,
  ] = useState("");


  const [
    promotor,
    setPromotor,
  ] = useState("");


  const [
    compromiso,
    setCompromiso,
  ] = useState("");


  const [
    cargando,
    setCargando,
  ] = useState(true);


  const [
    guardando,
    setGuardando,
  ] = useState(false);


  const [
    mensaje,
    setMensaje,
  ] = useState("");


  const [
    error,
    setError,
  ] = useState("");


  const [
    promotorAbierto,
    setPromotorAbierto,
  ] = useState("");
  
  const [
  filtroSupervisor,
  setFiltroSupervisor,
] = useState("TODOS");

  const [
  filtroFecha,
  setFiltroFecha,
] = useState("");


  // ==================================================
  // CARGAR CATÁLOGO E HISTORIAL
  // ==================================================

  async function cargarMinutas() {

    try {

      setCargando(
        true
      );

      setError(
        ""
      );


      const [

        respuestaCatalogo,

        respuestaMinutas,

      ] = await Promise.all([

        fetchProtegido(
          "/api/minutas/catalogo"
        ),

        fetchProtegido(
          "/api/minutas"
        ),

      ]);


      const [

        catalogo,

        historial,

      ] = await Promise.all([

        respuestaCatalogo.json(),

        respuestaMinutas.json(),

      ]);


      if (
        !respuestaCatalogo.ok ||
        !catalogo.correcto
      ) {

        throw new Error(
          catalogo.mensaje ||
          "No se pudieron cargar los focos rojos"
        );

      }


      if (
        !respuestaMinutas.ok ||
        !historial.correcto
      ) {

        throw new Error(
          historial.mensaje ||
          "No se pudieron cargar las minutas"
        );

      }


      setFocosRojos(
        catalogo.focosRojos ||
        []
      );


      setMinutas(
        historial.minutas ||
        []
      );


    } catch (
      errorCarga
    ) {

      setError(
        errorCarga.message ||
        "No se pudo cargar el módulo de minutas"
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
  // SUPERVISORES DISPONIBLES
  // ==================================================

  const supervisores =
    useMemo(
      () =>

        [
          ...new Set(
            focosRojos.map(
              (
                item
              ) =>
                item.supervisor
            )
          ),
        ].sort(
          (
            a,
            b
          ) =>
            a.localeCompare(
              b
            )
        ),

      [
        focosRojos,
      ]
    );


  // ==================================================
  // FOCOS ROJOS DEL SUPERVISOR
  // ==================================================

  const promotores =
    useMemo(
      () =>

        focosRojos.filter(
          (
            item
          ) =>
            item.supervisor ===
            supervisor
        ),

      [
        focosRojos,
        supervisor,
      ]
    );


  const focoSeleccionado =
    promotores.find(
      (
        item
      ) =>
        item.promotor ===
        promotor
    );


  // ==================================================
  // AGRUPAR HISTORIAL POR PROMOTOR
  // ==================================================

  const seguimientosPorPromotor =
    useMemo(
      () => {

        const grupos =
          new Map();


        minutas.forEach(
          (
            minuta
          ) => {

            const clave =
              String(
                minuta.promotor ||
                "SIN NOMBRE"
              )
                .trim()
                .toLocaleUpperCase(
                  "es-MX"
                );


            if (
              !grupos.has(
                clave
              )
            ) {

              grupos.set(
                clave,
                []
              );

            }


            grupos.get(
              clave
            ).push(
              minuta
            );

          }
        );


        return [
          ...grupos.entries(),
        ]
          .map(
            (
              [
                clave,
                historial,
              ]
            ) => {

              const ordenado =
                [
                  ...historial,
                ].sort(
                  (
                    a,
                    b
                  ) =>
                    new Date(
                      b.creadaEn ||
                      0
                    ).getTime() -
                    new Date(
                      a.creadaEn ||
                      0
                    ).getTime()
                );


              return {

                clave,

                ultima:
                  ordenado[0],

                anteriores:
                  ordenado.slice(
                    1
                  ),

                total:
                  ordenado.length,

              };

            }
          )
          .sort(
            (
              a,
              b
            ) =>
              new Date(
                b.ultima?.creadaEn ||
                0
              ).getTime() -
              new Date(
                a.ultima?.creadaEn ||
                0
              ).getTime()
          );

      },
      [
        minutas,
      ]
    );


  // ==================================================
// FILTRAR HISTORIAL POR SUPERVISOR
// ==================================================

const supervisoresHistorial =
  useMemo(
    () =>
      [
        ...new Set(
          minutas
            .map(
              (
                minuta
              ) =>
                String(
                  minuta.supervisor ||
                  ""
                ).trim()
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
          a.localeCompare(
            b,
            "es-MX"
          )
      ),

    [
      minutas,
    ]
  );


// ==================================================
// FILTRAR MINUTAS POR FECHA Y SUPERVISOR
// ==================================================

const minutasFiltradas =
  useMemo(
    () => {

      // Sin fecha seleccionada no mostramos
      // ninguna minuta.

      if (
        !filtroFecha
      ) {

        return [];

      }


      return minutas

        .filter(
          (
            minuta
          ) =>
            obtenerFechaMinuta(
              minuta.creadaEn
            ) ===
            filtroFecha
        )

        .filter(
          (
            minuta
          ) =>
            filtroSupervisor ===
              "TODOS" ||

            minuta.supervisor ===
              filtroSupervisor
        )

        .sort(
          (
            a,
            b
          ) =>
            new Date(
              b.creadaEn ||
              0
            ).getTime() -

            new Date(
              a.creadaEn ||
              0
            ).getTime()
        );

    },

    [
      minutas,
      filtroFecha,
      filtroSupervisor,
    ]
  );


  // ==================================================
  // ENVIAR MINUTA
  // ==================================================

  async function enviarMinuta(
    evento
  ) {

    evento.preventDefault();


    if (
      !focoSeleccionado ||
      compromiso.trim().length < 5
    ) {

      setError(
        "Selecciona el foco rojo y escribe el compromiso del día."
      );

      return;

    }


    try {

      setGuardando(
        true
      );

      setError(
        ""
      );

      setMensaje(
        ""
      );


      const respuesta =
        await fetchProtegido(
          "/api/minutas",
          {

            method:
              "POST",

            headers: {

              "Content-Type":
                "application/json",

            },

            body:
              JSON.stringify({

                supervisor,

                promotor,

                compromiso:
                  compromiso.trim(),

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
          "No se pudo enviar la minuta"
        );

      }


      setMensaje(
        datos.mensaje
      );


      setCompromiso(
        ""
      );


      setPromotor(
        ""
      );


      await cargarMinutas();


    } catch (
      errorEnvio
    ) {

      setError(
        errorEnvio.message ||
        "No se pudo enviar la minuta"
      );


    } finally {

      setGuardando(
        false
      );

    }

  }


  // ==================================================
  // MARCAR RESULTADO
  // ==================================================

  async function resolverCompromiso(
    id,
    resultado
  ) {

    try {

      setError(
        ""
      );

      setMensaje(
        ""
      );


      const respuesta =
        await fetchProtegido(
          `/api/minutas/${id}/resolver`,
          {

            method:
              "POST",

            headers: {

              "Content-Type":
                "application/json",

            },

            body:
              JSON.stringify({

                resultado,

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
          "No se pudo actualizar la minuta"
        );

      }


      setMensaje(
        datos.mensaje
      );


      await cargarMinutas();


    } catch (
      errorResultado
    ) {

      setError(
        errorResultado.message ||
        "No se pudo actualizar la minuta"
      );

    }

  }


  // ==================================================
  // TARJETA INDIVIDUAL DE MINUTA
  // ==================================================

  function renderizarMinuta(
    minuta,
    esAnterior = false
  ) {

    return (

      <article
        className={`minuta-card${
          esAnterior
            ? " minuta-card-anterior"
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

                ? "Pendiente de firma"

                : minuta.estado ===
                  "FIRMADA"

                  ? "Firmada · pendiente de resultado"

                  : minuta.resultado ===
                    "CUMPLIDO"

                    ? "Compromiso cumplido"

                    : "Compromiso no cumplido"}

            </span>

            <h4>
              {minuta.promotor}
            </h4>

            <p>
              {minuta.supervisor}
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
            Compromiso
          </span>

          <p>
            {minuta.compromiso}
          </p>

        </div>


        {minuta.firmaSupervisor && (

          <div className="minuta-firma-recibida">

            <div>

              <span>
                Firma recibida
              </span>

              <small>
                {formatearFecha(
                  minuta.firmadaEn
                )}
              </small>

            </div>

            <img
              src={
                minuta.firmaSupervisor
              }
              alt={`Firma de ${minuta.supervisor}`}
            />

            <button
              type="button"
              onClick={
                () =>
                  descargarMinuta(
                    minuta
                  )
              }
            >
              ↓ Descargar minuta firmada
            </button>

          </div>

        )}


        {minuta.estado ===
        "FIRMADA" && (

          <div className="minuta-resolver">

            <button
              type="button"
              onClick={
                () =>
                  resolverCompromiso(
                    minuta.id,
                    "CUMPLIDO"
                  )
              }
            >
              ✓ Marcar cumplido
            </button>

            <button
              type="button"
              onClick={
                () =>
                  resolverCompromiso(
                    minuta.id,
                    "NO_CUMPLIDO"
                  )
              }
            >
              ✕ Marcar no cumplido
            </button>

          </div>

        )}

      </article>

    );

  }


  // ==================================================
  // INTERFAZ
  // ==================================================

  return (

    <section className="minutas-panel minutas-direccion">

      <header className="minutas-header">

        <div>

          <span className="minutas-kicker">
            ACUERDOS EN CAMPO
          </span>

          <h2>
            Minutas de compromiso
          </h2>

          <p>
            Envía, recibe firmadas y califica el cumplimiento desde un solo lugar.
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


      <form
        className="minuta-formulario"
        onSubmit={
          enviarMinuta
        }
      >

        <div className="minuta-campos">

          <label>

            Supervisor

            <select
              value={
                supervisor
              }
              onChange={
                (
                  evento
                ) => {

                  setSupervisor(
                    evento.target.value
                  );

                  setPromotor(
                    ""
                  );

                }
              }
              disabled={
                cargando
              }
            >

              <option value="">
                Seleccionar supervisor
              </option>

              {supervisores.map(
                (
                  nombre
                ) => (

                  <option
                    key={nombre}
                    value={nombre}
                  >
                    {nombre}
                  </option>

                )
              )}

            </select>

          </label>


          <label>

            Foco rojo

            <select
              value={
                promotor
              }
              onChange={
                (
                  evento
                ) =>
                  setPromotor(
                    evento.target.value
                  )
              }
              disabled={
                !supervisor
              }
            >

              <option value="">
                Seleccionar promotor
              </option>

              {promotores.map(
                (
                  item
                ) => (

                  <option
                    key={
                      item.promotor
                    }
                    value={
                      item.promotor
                    }
                  >
                    {item.promotor}
                  </option>

                )
              )}

            </select>

          </label>

        </div>


        {focoSeleccionado && (

          <MetricasMinuta
            datos={
              focoSeleccionado
            }
          />

        )}


        <label className="minuta-compromiso-campo">

          Compromiso para el día

          <textarea
            value={
              compromiso
            }
            onChange={
              (
                evento
              ) =>
                setCompromiso(
                  evento.target.value
                )
            }
            maxLength={
              1000
            }
            placeholder="Ejemplo: acompañamiento a las 16:00 y cierre de 2 contratos antes de terminar la jornada."
          />

          <span>
            {compromiso.length}/1000
          </span>

        </label>


        <button
          type="submit"
          className="minuta-enviar"
          disabled={
            !focoSeleccionado ||
            compromiso.trim().length < 5 ||
            guardando
          }
        >

          {guardando
            ? "Enviando…"
            : "Enviar minuta al supervisor →"}

        </button>

      </form>


    <div className="minutas-historial-titulo">

  <div>

    <h3>
      Seguimiento de minutas
    </h3>

    <span>

      {filtroFecha

        ? `${minutasFiltradas.length} minuta${
            minutasFiltradas.length ===
            1
              ? ""
              : "s"
          } encontrada${
            minutasFiltradas.length ===
            1
              ? ""
              : "s"
          }`

        : "Selecciona una fecha para consultar las minutas"}

    </span>

  </div>


  <div className="minutas-filtros-historial">

    <label className="minutas-filtro">

      <span>
        Fecha
      </span>

      <input
        type="date"
        value={
          filtroFecha
        }
        onChange={
          (
            evento
          ) => {

            setFiltroFecha(
              evento.target.value
            );

            setPromotorAbierto(
              ""
            );

          }
        }
      />

    </label>


    <label className="minutas-filtro">

      <span>
        Supervisor
      </span>

      <select
        value={
          filtroSupervisor
        }
        onChange={
          (
            evento
          ) => {

            setFiltroSupervisor(
              evento.target.value
            );

            setPromotorAbierto(
              ""
            );

          }
        }
      >

        <option value="TODOS">
          Todos los supervisores
        </option>

        {supervisoresHistorial.map(
          (
            nombre
          ) => (

            <option
              key={
                nombre
              }
              value={
                nombre
              }
            >
              {nombre}
            </option>

          )
        )}

      </select>

    </label>

  </div>

</div>


      


      <div className="minutas-lista">

  {!cargando &&
  !filtroFecha && (

    <div className="minutas-vacio">

      📅 Selecciona una fecha para consultar las minutas enviadas.

    </div>

  )}


  {!cargando &&
  filtroFecha &&
  minutasFiltradas.length ===
  0 && (

    <div className="minutas-vacio">

      No se encontraron minutas para la fecha y supervisor seleccionados.

    </div>

  )}


  {minutasFiltradas.map(
    (
      minuta
    ) =>
      renderizarMinuta(
        minuta
      )
  )}

</div>
      

    </section>

  );

}


export default MinutasDireccion;
