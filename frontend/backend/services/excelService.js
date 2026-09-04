const XLSX = require("xlsx");
const path = require("path");
const fs = require("fs");
const os = require("os");
const crypto = require("crypto");

// ==================================================
// UBICACIÓN DEL EXCEL
// ==================================================

const RUTA_EXCEL = path.join(
  __dirname,
  "../data/SEGUIMIENTO 2.0.xlsx"
);

const RUTA_EXCEL_SUPABASE = path.join(
  os.tmpdir(),
  "SEGUIMIENTO 2.0.xlsx"
);

// ==================================================
// CACHE DE DATOS
// ==================================================

let datosCacheados = null;
let workbookCacheado = null;
let usuariosCacheados = null;

// ==================================================
// NOMBRE DE HOJA
// ==================================================

const HOJA_BD_PLAN_TRABAJO =
  "BD PLAN DE TRABAJO";

// ==================================================
// FUNCIONES AUXILIARES
// ==================================================

function limpiarTexto(valor) {
  return String(valor ?? "")
    .trim()
    .replace(/\s+/g, " ")
    .toUpperCase();
}

function normalizarNombre(valor) {
  return limpiarTexto(valor)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Z0-9 ]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function esValorInvalido(valor) {
  const texto =
    limpiarTexto(valor);

  return (
    !texto ||
    texto === "#N/A" ||
    texto === "#REF!" ||
    texto === "#VALUE!" ||
    texto === "#DIV/0!"
  );
}

// ==================================================
// DESCARGAR EXCEL DESDE SUPABASE
// ==================================================

async function descargarExcelDesdeSupabase() {
  const supabaseUrl =
    process.env.SUPABASE_URL;

  const supabaseSecretKey =
    process.env.SUPABASE_SECRET_KEY;

  // ================================================
  // SI NO HAY SUPABASE
  // ================================================

  if (
    !supabaseUrl ||
    !supabaseSecretKey
  ) {
    console.log(
      "💻 SUPABASE no configurado."
    );

    console.log(
      "📂 Se utilizará el Excel local."
    );

    return;
  }

  console.log(
    "☁️ Descargando Excel desde Supabase..."
  );

  // ================================================
  // DATOS DEL BUCKET Y ARCHIVO
  // ================================================

  const bucket =
    encodeURIComponent(
      "Nombre: mega-data"
    );

  const archivo =
    encodeURIComponent(
      "SEGUIMIENTO 2.0.xlsx"
    );

  // ================================================
  // DESCARGAR ARCHIVO PRIVADO
  // ================================================

  const url =
    `${supabaseUrl}/storage/v1/object/authenticated/${bucket}/${archivo}`;

  console.log(
    "📥 Descargando archivo privado..."
  );

  const respuestaArchivo =
    await fetch(
      url,
      {
        method: "GET",

        headers: {
          apikey:
            supabaseSecretKey,

          Authorization:
            `Bearer ${supabaseSecretKey}`,
        },
      }
    );

  // ================================================
  // VALIDAR RESPUESTA
  // ================================================

  if (!respuestaArchivo.ok) {
    const mensaje =
      await respuestaArchivo.text();

    throw new Error(
      `No se pudo descargar el Excel: HTTP ${respuestaArchivo.status} ${mensaje}`
    );
  }

  // ================================================
  // CONVERTIR A BUFFER
  // ================================================

  const buffer =
    Buffer.from(
      await respuestaArchivo.arrayBuffer()
    );

  const hashExcel =
    crypto
      .createHash("sha256")
      .update(buffer)
      .digest("hex");

  console.log(
    `🔐 SHA-256 Excel: ${hashExcel}`
  );

  // ================================================
  // GUARDAR ARCHIVO TEMPORAL
  // ================================================

  fs.writeFileSync(
    RUTA_EXCEL_SUPABASE,
    buffer
  );

  console.log(
    "✅ Excel descargado desde Supabase"
  );

  console.log(
    `📊 Tamaño: ${(buffer.length / 1024 / 1024).toFixed(2)} MB`
  );

  console.log(
    "📂 Archivo temporal:",
    RUTA_EXCEL_SUPABASE
  );
}

// ==================================================
// CARGAR EXCEL
// ==================================================

function cargarExcel() {
  try {
    // ================================================
    // USAR CACHE SI EL EXCEL YA FUE CARGADO
    // ================================================

    if (workbookCacheado) {
      return workbookCacheado;
    }

    console.log(
      "📂 Cargando Excel:"
    );

    const rutaExcelActual =
      (
        process.env.SUPABASE_URL &&
        process.env.SUPABASE_SECRET_KEY &&
        fs.existsSync(RUTA_EXCEL_SUPABASE)
      )
        ? RUTA_EXCEL_SUPABASE
        : RUTA_EXCEL;

    console.log(
      rutaExcelActual
    );

    workbookCacheado =
      XLSX.readFile(
        rutaExcelActual,
        {
          dense: true,
          cellHTML: false,
          cellFormula: false,
          cellStyles: false,
          cellNF: false,
        }
      );

    console.log(
      "⚡ Excel cargado en memoria"
    );

    return workbookCacheado;

  } catch (error) {
    console.error(
      "❌ Error al abrir el Excel:"
    );

    console.error(
      error.message
    );

    throw error;
  }
}

// ==================================================
// CARGAR EXCEL USUARIOS
// ==================================================

function cargarExcelUsuarios() {
  try {
    const workbook =
      XLSX.readFile(
        (
          process.env.SUPABASE_URL &&
          process.env.SUPABASE_SECRET_KEY &&
          fs.existsSync(RUTA_EXCEL_SUPABASE)
        )
          ? RUTA_EXCEL_SUPABASE
          : RUTA_EXCEL,
        {
          dense: true,
          sheetRows: 100,
          cellHTML: false,
          cellFormula: false,
          cellStyles: false,
          cellNF: false,
        }
      );

    return workbook;

  } catch (error) {
    console.error(
      "❌ Error al abrir USERS:"
    );

    console.error(
      error.message
    );

    throw error;
  }
}

// ==================================================
// LEER USERS
// ==================================================

function obtenerUsuarios() {
  if (usuariosCacheados) {
    return usuariosCacheados;
  }

  const workbook =
    cargarExcelUsuarios();

  const nombreHoja =
    workbook.SheetNames.find(
      (nombre) =>
        nombre.trim().toUpperCase() ===
        "USERS"
    );

  if (!nombreHoja) {
    throw new Error(
      'No se encontró la pestaña "USERS"'
    );
  }

  const hoja =
    workbook.Sheets[
      nombreHoja
    ];

  const datos =
    XLSX.utils.sheet_to_json(
      hoja,
      {
        header: 1,
        defval: "",
      }
    );

  const usuarios = [];

  // ==================================================
  // USERS
  //
  // B = Empleado
  // C = Usuario
  // D = Contraseña
  // E = Estado
  // F = Supervisor
  // G = Rol
  // ==================================================

  const COLUMNA_EMPLEADO = 1;
  const COLUMNA_USUARIO = 2;
  const COLUMNA_PASSWORD = 3;
  const COLUMNA_ESTADO = 4;
  const COLUMNA_SUPERVISOR = 5;
  const COLUMNA_ROL = 6;

  for (
    let i = 1;
    i < datos.length;
    i++
  ) {
    const fila =
      datos[i];

    const empleado =
      String(
        fila[
          COLUMNA_EMPLEADO
        ] ?? ""
      ).trim();

    const usuario =
      String(
        fila[
          COLUMNA_USUARIO
        ] ?? ""
      ).trim();

    const password =
      String(
        fila[
          COLUMNA_PASSWORD
        ] ?? ""
      ).trim();

    const estado =
      String(
        fila[
          COLUMNA_ESTADO
        ] ?? ""
      ).trim();

    const supervisor =
      String(
        fila[
          COLUMNA_SUPERVISOR
        ] ?? ""
      ).trim();

    const rol =
      String(
        fila[
          COLUMNA_ROL
        ] ?? ""
      ).trim();

    if (
      !usuario ||
      !password
    ) {
      continue;
    }

    usuarios.push({
      empleado,
      usuario,
      password,
      estado,
      supervisor,
      rol,
    });
  }

  console.log(
    `👥 Usuarios encontrados: ${usuarios.length}`
  );

  usuariosCacheados =
    usuarios;

  return usuariosCacheados;
}

// ==================================================
// VALIDAR USUARIO
// ==================================================

function validarUsuario(
  usuarioIngresado,
  passwordIngresada
) {
  const usuarios =
    obtenerUsuarios();

  const usuarioNormalizado =
    String(
      usuarioIngresado ?? ""
    )
      .trim()
      .toLowerCase();

  const encontrado =
    usuarios.find(
      (usuario) => {
        const usuarioExcel =
          String(
            usuario.usuario ?? ""
          )
            .trim()
            .toLowerCase();

        return (
          usuarioExcel ===
            usuarioNormalizado &&

          String(
            usuario.password
          ) ===
            String(
              passwordIngresada
            )
        );
      }
    );

  if (!encontrado) {
    return {
      correcto: false,
      mensaje:
        "Usuario o contraseña incorrectos",
    };
  }

  const estado =
    String(
      encontrado.estado ?? ""
    )
      .trim()
      .toUpperCase();

  if (
    estado !== "ACTIVO"
  ) {
    return {
      correcto: false,
      mensaje:
        "Tu usuario se encuentra inactivo",
    };
  }

  return {
    correcto: true,

    supervisor:
      encontrado.supervisor,

    empleado:
      encontrado.empleado,

    rol:
      encontrado.rol,
  };
}

// ==================================================
// LEER VENTA VS PPTO
// ==================================================

function leerVentaVsPpto(hoja) {
  const datos =
    XLSX.utils.sheet_to_json(
      hoja,
      {
        header: 1,
        defval: "",
      }
    );

  const mapa =
    new Map();

  for (
    let i = 0;
    i < datos.length;
    i++
  ) {
    const fila =
      datos[i];

    const supervisor =
      limpiarTexto(
        fila[0]
      );

    const presupuesto =
      Number(
        fila[1]
      );

    const ventas =
      Number(
        fila[2]
      );

    const restVsPpto =
      Number(
        fila[5]
      );

    if (
      esValorInvalido(
        supervisor
      )
    ) {
      continue;
    }

    if (
      supervisor === "SUPERVISOR" ||
      supervisor === "TOTAL"
    ) {
      continue;
    }

    if (
      !Number.isFinite(
        presupuesto
      )
    ) {
      continue;
    }

    if (
      !Number.isFinite(
        ventas
      )
    ) {
      continue;
    }

    const clave =
      normalizarNombre(
        supervisor
      );

    const presupuestoEntero =
      Math.round(
        presupuesto
      );

    const ventasEnteras =
      Math.round(
        ventas
      );

    let ventasFaltantes =
      0;

    if (
      Number.isFinite(
        restVsPpto
      )
    ) {
      ventasFaltantes =
        Math.max(
          Math.round(
            Math.abs(
              restVsPpto
            )
          ),
          0
        );
    } else {
      ventasFaltantes =
        Math.max(
          presupuestoEntero -
          ventasEnteras,
          0
        );
    }

    mapa.set(
      clave,
      {
        supervisor,

        presupuesto:
          presupuestoEntero,

        ventas:
          ventasEnteras,

        ventasFaltantes,
      }
    );
  }

  return mapa;
}

// ==================================================
// LEER BD SIN VENTA
// ==================================================

function leerBDSinVenta(hoja) {
  const datos =
    XLSX.utils.sheet_to_json(
      hoja,
      {
        header: 1,
        defval: "",
      }
    );

  const mapa =
    new Map();

  let filaEncabezado =
    -1;

  for (
    let i = 0;
    i < datos.length;
    i++
  ) {
    const fila =
      datos[i];

    const contienePromotor =
      fila.some(
        (celda) =>
          limpiarTexto(celda) ===
          "PROMOTOR"
      );

    if (
      contienePromotor
    ) {
      filaEncabezado =
        i;

      break;
    }
  }

  const COLUMNA_DIA_1 = 6;
  const COLUMNA_RX = 37;
  const COLUMNA_VENTAS_MES = 38;

  let columnaPromotor =
    5;

  if (
    filaEncabezado >= 0
  ) {
    const encabezados =
      datos[
        filaEncabezado
      ];

    const indice =
      encabezados.findIndex(
        (celda) =>
          limpiarTexto(celda) ===
          "PROMOTOR"
      );

    if (
      indice >= 0
    ) {
      columnaPromotor =
        indice;
    }
  }

  const inicio =
    filaEncabezado >= 0
      ? filaEncabezado + 1
      : 0;

  for (
    let i = inicio;
    i < datos.length;
    i++
  ) {
    const fila =
      datos[i];

    const nombre =
      limpiarTexto(
        fila[
          columnaPromotor
        ]
      );

    if (
      esValorInvalido(
        nombre
      )
    ) {
      continue;
    }

    if (
      nombre === "PROMOTOR" ||
      nombre === "SUPERVISOR" ||
      nombre === "TOTAL"
    ) {
      continue;
    }

    let diasSinVenta =
      0;

    const hoy =
      new Date();

    const año =
      hoy.getFullYear();

    const mes =
      hoy.getMonth();

    const diaActual =
      hoy.getDate();

    const ultimoDiaDisponible =
      Math.min(
        diaActual - 1,
        31
      );

    for (
      let numeroDia =
        ultimoDiaDisponible;

      numeroDia >= 1;

      numeroDia--
    ) {
      const fecha =
        new Date(
          año,
          mes,
          numeroDia
        );

      if (
        fecha.getDay() === 0
      ) {
        continue;
      }

      const columna =
        COLUMNA_DIA_1 +
        (
          numeroDia - 1
        );

      const venta =
        Number(
          fila[columna]
        );

      if (
        Number.isFinite(
          venta
        ) &&
        venta > 0
      ) {
        break;
      }

      diasSinVenta++;
    }

    let recuperaciones =
      Number(
        fila[
          COLUMNA_RX
        ]
      );

    if (
      !Number.isFinite(
        recuperaciones
      )
    ) {
      recuperaciones =
        0;
    }

    let ventasMesPromotor =
      Number(
        fila[
          COLUMNA_VENTAS_MES
        ]
      );

    if (
      !Number.isFinite(
        ventasMesPromotor
      )
    ) {
      ventasMesPromotor =
        0;
    }

    ventasMesPromotor =
      Math.round(
        ventasMesPromotor
      );

    mapa.set(
      nombre,
      {
        diasSinVenta,
        recuperaciones,
        ventasMesPromotor,
      }
    );
  }

  return mapa;
}

// ==================================================
// LEER BD PLAN DE TRABAJO
// ==================================================

function leerBDPlanTrabajo(
  hoja
) {
  const datos =
    XLSX.utils.sheet_to_json(
      hoja,
      {
        header: 1,
        defval: "",
      }
    );

  const resultado = [];

  const COLUMNA_SUCURSAL = 3;
  const COLUMNA_COLONIA = 4;
  const COLUMNA_NSE = 5;
  const COLUMNA_POTENCIALES = 8;
  const COLUMNA_ACTIVOS_INTERNET = 10;
  const COLUMNA_PENETRACION = 13;

  for (
    let i = 0;
    i < datos.length;
    i++
  ) {
    const fila =
      datos[i];

    const sucursal =
      limpiarTexto(
        fila[
          COLUMNA_SUCURSAL
        ]
      );

    const colonia =
      limpiarTexto(
        fila[
          COLUMNA_COLONIA
        ]
      );

    const nse =
      limpiarTexto(
        fila[
          COLUMNA_NSE
        ]
      );

    if (
      esValorInvalido(
        sucursal
      )
    ) {
      continue;
    }

    if (
      esValorInvalido(
        colonia
      )
    ) {
      continue;
    }

    if (
      sucursal === "0" ||
      colonia === "0"
    ) {
      continue;
    }

    if (
      sucursal === "SUCURSAL" ||
      colonia === "COLONIA"
    ) {
      continue;
    }

    let potenciales =
      Number(
        fila[
          COLUMNA_POTENCIALES
        ]
      );

    if (
      !Number.isFinite(
        potenciales
      )
    ) {
      potenciales =
        0;
    }

    potenciales =
      Math.round(
        potenciales
      );

    let activosInternet =
      Number(
        fila[
          COLUMNA_ACTIVOS_INTERNET
        ]
      );

    if (
      !Number.isFinite(
        activosInternet
      )
    ) {
      activosInternet =
        0;
    }

    activosInternet =
      Math.round(
        activosInternet
      );

    let penetracion =
      Number(
        fila[
          COLUMNA_PENETRACION
        ]
      );

    if (
      !Number.isFinite(
        penetracion
      )
    ) {
      penetracion =
        0;
    }

    if (
      penetracion > 0 &&
      penetracion <= 1
    ) {
      penetracion =
        penetracion * 100;
    }

    const porVender =
      Math.max(
        potenciales -
        activosInternet,
        0
      );

    resultado.push({
      sucursal,
      colonia,
      nse,
      potenciales,
      activosInternet,
      penetracion,
      porVender,
    });
  }

  const registrosUnicos =
    Array.from(
      new Map(
        resultado.map(
          (registro) => [
            `${registro.sucursal}-${registro.colonia}`,
            registro,
          ]
        )
      ).values()
    );

  console.log(
    "=========================================="
  );

  console.log(
    "📊 BD PLAN DE TRABAJO CARGADO"
  );

  console.log(
    "🏙️ Colonias únicas:",
    registrosUnicos.length
  );

  console.log(
    "=========================================="
  );

  return registrosUnicos;
}

// ==================================================
// LEER BD AVANCE SEMANAL
// ==================================================

function leerAvanceSemanal(hoja) {
  const datos =
    XLSX.utils.sheet_to_json(
      hoja,
      {
        header: 1,
        defval: "",
      }
    );

  const registros = [];

  for (
    let i = 0;
    i < datos.length;
    i++
  ) {
    const fila =
      datos[i];

    const supervisor =
      limpiarTexto(
        fila[0]
      );

    const nombre =
      limpiarTexto(
        fila[3]
      );

    if (
      supervisor === "SUP" ||
      nombre === "PROMOTOR"
    ) {
      continue;
    }

    if (
      esValorInvalido(
        supervisor
      ) ||
      esValorInvalido(
        nombre
      )
    ) {
      continue;
    }

    const productividad =
      Number(
        fila[4]
      );

    const dobles =
      Number(
        fila[5]
      );

    const triples =
      Number(
        fila[6]
      );

    const movil =
      Number(
        fila[7]
      );

    const netflix =
      Number(
        fila[8]
      );

    const disney =
      Number(
        fila[9]
      );

    const max =
      Number(
        fila[10]
      );

    registros.push({
      supervisor,
      nombre,

      productividad:
        Number.isFinite(
          productividad
        )
          ? productividad
          : 0,

      dobles:
        Number.isFinite(
          dobles
        )
          ? dobles
          : 0,

      triples:
        Number.isFinite(
          triples
        )
          ? triples
          : 0,

      movil:
        Number.isFinite(
          movil
        )
          ? movil
          : 0,

      netflix:
        Number.isFinite(
          netflix
        )
          ? netflix
          : 0,

      disney:
        Number.isFinite(
          disney
        )
          ? disney
          : 0,

      max:
        Number.isFinite(
          max
        )
          ? max
          : 0,
    });
  }

  console.log(
    "📊 AVANCE SEMANAL CARGADO:",
    registros.length,
    "promotores"
  );

  return registros;
}

// ==================================================
// LEER DÍAS HÁBILES DESDE PRODUCTIVIDAD
// ==================================================

function leerDiasHabiles(
  hojaProduccion
) {
  const datos =
    XLSX.utils.sheet_to_json(
      hojaProduccion,
      {
        header: 1,
        defval: "",
      }
    );

  const diasHabilesTotales =
    Number(
      datos[0]?.[7] ?? 0
    );

  const diasHabilesTranscurridos =
    Number(
      datos[1]?.[7] ?? 0
    );

  const diasHabilesRestantes =
    Math.max(
      diasHabilesTotales -
      diasHabilesTranscurridos,
      0
    );

  console.log(
    "📅 DÍAS HÁBILES:",
    {
      totales:
        diasHabilesTotales,

      transcurridos:
        diasHabilesTranscurridos,

      restantes:
        diasHabilesRestantes,
    }
  );

  return {
    diasHabilesTotales,
    diasHabilesTranscurridos,
    diasHabilesRestantes,
  };
}

// ==================================================
// LEER REGISTROS DE PRODUCTIVIDAD
// ==================================================

function leerRegistros(
  hojaProduccion,
  hojaSinVenta,
  hojaVentaVsPpto,
  diasHabiles
) {
  const datos =
    XLSX.utils.sheet_to_json(
      hojaProduccion,
      {
        header: 1,
        defval: "",
      }
    );

  const datosSinVenta =
    leerBDSinVenta(
      hojaSinVenta
    );

  const mapaVentaVsPpto =
    leerVentaVsPpto(
      hojaVentaVsPpto
    );

  const registros = [];

  let supervisorActual =
    "";

  for (
    let i = 0;
    i < datos.length;
    i++
  ) {
    const fila =
      datos[i];

    const columnaA =
      limpiarTexto(
        fila[0]
      );

    const columnaF =
      limpiarTexto(
        fila[5]
      );

    const columnaH =
      fila[7];

    if (
      columnaF ===
      "SUPERVISOR"
    ) {
      const nombreSupervisor =
        limpiarTexto(
          fila[7]
        );

      if (
        nombreSupervisor &&
        !esValorInvalido(
          nombreSupervisor
        )
      ) {
        supervisorActual =
          nombreSupervisor;
      }

      continue;
    }

    if (
      columnaF ===
      "PROMOTOR"
    ) {
      continue;
    }

    if (
      columnaA &&
      !esValorInvalido(
        columnaA
      )
    ) {
      supervisorActual =
        columnaA;
    }

    const nombrePromotor =
      columnaF;

    if (
      !nombrePromotor
    ) {
      continue;
    }

    if (
      esValorInvalido(
        nombrePromotor
      )
    ) {
      continue;
    }

    if (
      nombrePromotor ===
        "SUPERVISOR" ||
      nombrePromotor ===
        "PROMOTOR"
    ) {
      continue;
    }

    const productividad =
      typeof columnaH === "number"
        ? columnaH
        : Number(
            columnaH
          );

    if (
      !supervisorActual
    ) {
      continue;
    }

    if (
      !Number.isFinite(
        productividad
      )
    ) {
      continue;
    }

    const datosPromotor =
      datosSinVenta.get(
        nombrePromotor
      );

    const diasSinVenta =
      datosPromotor
        ?.diasSinVenta ??
      0;

    const recuperaciones =
      datosPromotor
        ?.recuperaciones ??
      0;

    const ventasMesPromotor =
      datosPromotor
        ?.ventasMesPromotor ??
      0;

    const claveSupervisor =
      normalizarNombre(
        supervisorActual
      );

    const datosPpto =
      mapaVentaVsPpto.get(
        claveSupervisor
      );

    const presupuesto =
      Math.round(
        Number(
          datosPpto?.presupuesto ??
          0
        )
      );

    const ventasMes =
      Math.round(
        Number(
          datosPpto?.ventas ??
          0
        )
      );

    const ventasFaltantes =
      Math.round(
        Number(
          datosPpto?.ventasFaltantes ??
          0
        )
      );

    const diasHabilesRestantes =
      diasHabiles.diasHabilesRestantes;

    const ventasPorDia =
      diasHabilesRestantes > 0
        ? Math.ceil(
            ventasFaltantes /
            diasHabilesRestantes
          )
        : ventasFaltantes;

    registros.push({
      supervisor:
        supervisorActual,

      nombre:
        nombrePromotor,

      productividad,

      diasSinVenta,

      recuperaciones,

      ventasMesPromotor,

      presupuesto,

      ventasMes,

      ventasFaltantes,

      diasHabilesRestantes,

      ventasPorDia,
    });
  }

  return Array.from(
    new Map(
      registros.map(
        (registro) => [
          `${registro.supervisor}-${registro.nombre}`,
          registro,
        ]
      )
    ).values()
  );
}

// ==================================================
// RANKING DE SUPERVISORES + AVANCE DE SERVICIOS
// ==================================================
//
// Hoja: VENTA DIARIA POR SUPERVISOR
//
// RANKING:
// C = Supervisor
// E = Productividad
// Desde fila 19
//
// AVANCE SERVICIOS:
// C3:C15 = Supervisor
// AN = Móvil
// AO = Netflix
// AP = Disney+
// AQ = MAX
//
// ==================================================

function leerRankingSupervisores(
  hoja
) {

  const datos =
    XLSX.utils.sheet_to_json(
      hoja,
      {
        header: 1,
        defval: "",
      }
    );


  // ==================================================
  // MAPA DE AVANCE DE SERVICIOS
  // ==================================================

  const mapaServicios =
    new Map();


  // C = índice 2
  const COLUMNA_SUPERVISOR_SERVICIOS = 2;

  // AN = índice 39
  const COLUMNA_MOVIL = 39;

  // AO = índice 40
  const COLUMNA_NETFLIX = 40;

  // AP = índice 41
  const COLUMNA_DISNEY = 41;

  // AQ = índice 42
  const COLUMNA_MAX = 42;


  // Excel filas 3 a 15
  // JS índices 2 a 14

  for (
    let i = 2;
    i <= 14;
    i++
  ) {

    const fila =
      datos[i] || [];


    const supervisor =
      limpiarTexto(
        fila[
          COLUMNA_SUPERVISOR_SERVICIOS
        ]
      );


    if (
      esValorInvalido(
        supervisor
      )
    ) {

      continue;

    }


    if (
      supervisor === "SUPERVISOR" ||
      supervisor === "TOTAL"
    ) {

      continue;

    }


    let movil =
      Number(
        fila[
          COLUMNA_MOVIL
        ]
      );


    let netflix =
      Number(
        fila[
          COLUMNA_NETFLIX
        ]
      );


    let disney =
      Number(
        fila[
          COLUMNA_DISNEY
        ]
      );


    let max =
      Number(
        fila[
          COLUMNA_MAX
        ]
      );


    if (
      !Number.isFinite(
        movil
      )
    ) {

      movil = 0;

    }


    if (
      !Number.isFinite(
        netflix
      )
    ) {

      netflix = 0;

    }


    if (
      !Number.isFinite(
        disney
      )
    ) {

      disney = 0;

    }


    if (
      !Number.isFinite(
        max
      )
    ) {

      max = 0;

    }


    mapaServicios.set(
      normalizarNombre(
        supervisor
      ),
      {

        movil:
          Math.round(
            movil
          ),

        netflix:
          Math.round(
            netflix
          ),

        disney:
          Math.round(
            disney
          ),

        max:
          Math.round(
            max
          ),

      }
    );

  }


  // ==================================================
  // RANKING
  // ==================================================

  const ranking = [];


  // Fila 19 en Excel
  const FILA_INICIO = 18;


  // C = índice 2
  const COLUMNA_SUPERVISOR = 2;


  // E = índice 4
  const COLUMNA_PRODUCTIVIDAD = 4;


  for (
    let i = FILA_INICIO;
    i < datos.length;
    i++
  ) {

    const fila =
      datos[i];


    const supervisor =
      limpiarTexto(
        fila[
          COLUMNA_SUPERVISOR
        ]
      );


    const productividad =
      Number(
        fila[
          COLUMNA_PRODUCTIVIDAD
        ]
      );


    if (
      esValorInvalido(
        supervisor
      )
    ) {

      continue;

    }


    if (
      supervisor ===
      "SUPERVISOR"
    ) {

      continue;

    }


    if (
      supervisor ===
      "MORALES PEREZ BENJAMIN"
    ) {

      continue;

    }


    if (
      !Number.isFinite(
        productividad
      )
    ) {

      continue;

    }


    const servicios =
      mapaServicios.get(
        normalizarNombre(
          supervisor
        )
      ) || {
        movil: 0,
        netflix: 0,
        disney: 0,
        max: 0,
      };


    ranking.push({

      supervisor,

      productividad,

      movil:
        servicios.movil,

      netflix:
        servicios.netflix,

      disney:
        servicios.disney,

      max:
        servicios.max,

    });

  }


  // ==================================================
  // ELIMINAR DUPLICADOS
  // ==================================================

  const rankingUnico =
    Array.from(
      new Map(
        ranking.map(
          (registro) => [
            registro.supervisor,
            registro,
          ]
        )
      ).values()
    );


  // ==================================================
  // ORDENAR MAYOR → MENOR
  // ==================================================

  rankingUnico.sort(
    (
      supervisorA,
      supervisorB
    ) =>
      supervisorB.productividad -
      supervisorA.productividad
  );


  // ==================================================
  // ASIGNAR POSICIÓN
  // ==================================================

  const resultado =
    rankingUnico.map(
      (
        registro,
        index
      ) => ({

        ...registro,

        posicion:
          index + 1,

      })
    );


  console.log(
    "🏆 RANKING SUPERVISORES + SERVICIOS:",
    resultado
  );


  return resultado;

}

// ==================================================
// 👥 STATUS DE PLANTILLA
// ==================================================

function leerPlantilla() {
  try {
    const workbook =
      cargarExcel();

    const nombreHoja =
      workbook.SheetNames.find(
        (nombre) =>
          String(nombre)
            .trim()
            .toUpperCase() ===
          "PLANTILLA"
      );

    if (!nombreHoja) {
      throw new Error(
        'No se encontró la hoja "PLANTILLA"'
      );
    }

    const hoja =
      workbook.Sheets[
        nombreHoja
      ];

    const datos =
      XLSX.utils.sheet_to_json(
        hoja,
        {
          header: 1,
          defval: "",
        }
      );

    const COLUMNA_PUESTO = 23;
    const COLUMNA_TOTAL = 24;
    const COLUMNA_ACT = 25;
    const COLUMNA_VAC = 26;
    const COLUMNA_TOT = 27;

    const registros = [];

    for (
      let i = 0;
      i < datos.length;
      i++
    ) {
      const fila =
        datos[i];

      const puesto =
        limpiarTexto(
          fila[COLUMNA_PUESTO]
        );

      if (
        !puesto ||
        puesto === "PUESTO"
      ) {
        continue;
      }

      let total =
        Number(
          fila[COLUMNA_TOTAL]
        );

      if (
        !Number.isFinite(total)
      ) {
        total = 0;
      }

      let activos =
        Number(
          fila[COLUMNA_ACT]
        );

      if (
        !Number.isFinite(activos)
      ) {
        activos = 0;
      }

      let vacantes =
        Number(
          fila[COLUMNA_VAC]
        );

      if (
        !Number.isFinite(vacantes)
      ) {
        vacantes = 0;
      }

      let tot =
        Number(
          fila[COLUMNA_TOT]
        );

      if (
        !Number.isFinite(tot)
      ) {
        tot = total;
      }

      registros.push({
        puesto,

        total:
          Math.round(total),

        activos:
          Math.round(activos),

        vacantes:
          Math.round(vacantes),

        tot:
          Math.round(tot),
      });
    }

    const totalGeneral =
      registros.reduce(
        (
          acumulado,
          registro
        ) =>
          acumulado +
          registro.total,
        0
      );

    const activosGeneral =
      registros.reduce(
        (
          acumulado,
          registro
        ) =>
          acumulado +
          registro.activos,
        0
      );

    const vacantesGeneral =
      registros.reduce(
        (
          acumulado,
          registro
        ) =>
          acumulado +
          registro.vacantes,
        0
      );

    const cobertura =
      totalGeneral > 0
        ? (
            activosGeneral /
            totalGeneral
          ) * 100
        : 0;

    console.log(
      "=========================================="
    );

    console.log(
      "👥 STATUS DE PLANTILLA"
    );

    console.log(
      "TOTAL:",
      totalGeneral
    );

    console.log(
      "ACTIVOS:",
      activosGeneral
    );

    console.log(
      "VACANTES:",
      vacantesGeneral
    );

    console.log(
      "COBERTURA:",
      cobertura.toFixed(2) + "%"
    );

    console.log(
      "=========================================="
    );

    return {
      registros,

      total:
        totalGeneral,

      activos:
        activosGeneral,

      vacantes:
        vacantesGeneral,

      cobertura,
    };

  } catch (error) {
    console.error(
      "❌ ERROR EN STATUS DE PLANTILLA:",
      error
    );

    return {
      registros: [],
      total: 0,
      activos: 0,
      vacantes: 0,
      cobertura: 0,
    };
  }
}

// ==================================================
// 📊 VENTA VS MES ANTERIOR
// ==================================================

function leerVentaVsMesAnterior() {
  try {
    const workbook =
      cargarExcel();

    const nombreHoja =
      workbook.SheetNames.find(
        (nombre) =>
          String(nombre)
            .trim()
            .toUpperCase() ===
          "VS MES ANTERIOR"
      );

    if (!nombreHoja) {
      throw new Error(
        'No se encontró la hoja "VS MES ANTERIOR"'
      );
    }

    const hoja =
      workbook.Sheets[
        nombreHoja
      ];

    const datos =
      XLSX.utils.sheet_to_json(
        hoja,
        {
          header: 1,
          defval: "",
        }
      );

    const registros = [];

    for (
      let i = 1;
      i < datos.length;
      i++
    ) {
      const fila =
        datos[i];

      const servicio =
        limpiarTexto(
          fila[0]
        );

      const canal =
        limpiarTexto(
          fila[1]
        );

      const ventas =
        Number(
          fila[2]
        );

      const mes =
        limpiarTexto(
          fila[3]
        );

      if (
        !servicio ||
        !canal ||
        !mes
      ) {
        continue;
      }

      if (
        servicio === "SERVICIO" ||
        canal === "CANAL" ||
        mes === "MES"
      ) {
        continue;
      }

      if (
        !Number.isFinite(
          ventas
        )
      ) {
        continue;
      }

      registros.push({
        servicio,
        canal,

        ventas:
          Math.round(
            ventas
          ),

        mes,
      });
    }

    const servicios = [
      ...new Set(
        registros.map(
          (registro) =>
            registro.servicio
        )
      ),
    ].sort();

    const canales = [
      ...new Set(
        registros.map(
          (registro) =>
            registro.canal
        )
      ),
    ].sort();

    const meses = [
      ...new Set(
        registros.map(
          (registro) =>
            registro.mes
        )
      ),
    ];

    console.log(
      "=========================================="
    );

    console.log(
      "📊 VENTA VS MES ANTERIOR"
    );

    console.log(
      "📦 REGISTROS:",
      registros.length
    );

    console.log(
      "🛠️ SERVICIOS:",
      servicios
    );

    console.log(
      "📡 CANALES:",
      canales
    );

    console.log(
      "📅 MESES:",
      meses
    );

    console.log(
      "=========================================="
    );

    return {
      registros,
      servicios,
      canales,
      meses,
    };

  } catch (error) {
    console.error(
      "❌ ERROR EN VENTA VS MES ANTERIOR:",
      error
    );

    return {
      registros: [],
      servicios: [],
      canales: [],
      meses: [],
    };
  }
}

// ==================================================
// 📈 PRODUCTIVIDAD POR CANAL
// ==================================================
//
// HOJA:
// KPI´s ventas
//
// L = CANAL
// M = PROD VTA
//
// O = CANAL
// P = PROD VTA + RX
//
// R = PLUS RX
//
// SOLO SE ACEPTAN:
// CAM
// PDV
// EMP
// REC
// POOL
// TOTAL
//
// ==================================================

function leerProductividadPorCanal() {

  try {

    // ==============================================
    // OBTENER EXCEL
    // ==============================================

    const workbook =
      cargarExcel();


    // ==============================================
    // BUSCAR HOJA
    // ==============================================

    const nombreHoja =
      workbook.SheetNames.find(
        (nombre) =>
          String(nombre)
            .trim()
            .toUpperCase() ===
          "KPI´S VENTAS"
      );


    if (!nombreHoja) {

      throw new Error(
        'No se encontró la hoja "KPI´s ventas"'
      );

    }


    const hoja =
      workbook.Sheets[
        nombreHoja
      ];


    // ==============================================
    // CONVERTIR A FILAS
    // ==============================================

    const datos =
      XLSX.utils.sheet_to_json(
        hoja,
        {
          header: 1,
          defval: "",
        }
      );


    // ==============================================
    // COLUMNAS
    // ==============================================

    const COLUMNA_CANAL_VTA = 11; // L

    const COLUMNA_PROD_VTA = 12; // M

    const COLUMNA_CANAL_RX = 14; // O

    const COLUMNA_PROD_RX = 15; // P

    const COLUMNA_PLUS_RX = 17; // R


    // ==============================================
    // CANALES VÁLIDOS
    // ==============================================

    const canalesValidos =
      new Set([
        "CAM",
        "PDV",
        "EMP",
        "REC",
        "POOL",
        "TOTAL",
      ]);


    // ==============================================
    // ORDEN FINAL
    // ==============================================

    const ordenCanales = [
      "CAM",
      "PDV",
      "EMP",
      "REC",
      "POOL",
      "TOTAL",
    ];


    // ==============================================
    // MAPAS
    // ==============================================

    const mapaVenta =
      new Map();


    const mapaVentaRx =
      new Map();


    const mapaPlusRx =
      new Map();


    // ==============================================
    // RECORRER FILAS
    // ==============================================

    for (
      let i = 0;
      i < datos.length;
      i++
    ) {

      const fila =
        datos[i];


      // ============================================
      // TABLA PROD VTA
      // ============================================

      const canalVenta =
        limpiarTexto(
          fila[
            COLUMNA_CANAL_VTA
          ]
        );


      if (
        canalesValidos.has(
          canalVenta
        )
      ) {

        const productividadVenta =
          Number(
            fila[
              COLUMNA_PROD_VTA
            ]
          );


        if (
          Number.isFinite(
            productividadVenta
          )
        ) {

          mapaVenta.set(
            canalVenta,
            productividadVenta
          );

        }

      }


      // ============================================
      // TABLA PROD VTA + RX
      // ============================================

      const canalRx =
        limpiarTexto(
          fila[
            COLUMNA_CANAL_RX
          ]
        );


      if (
        canalesValidos.has(
          canalRx
        )
      ) {

        const productividadVentaRx =
          Number(
            fila[
              COLUMNA_PROD_RX
            ]
          );


        if (
          Number.isFinite(
            productividadVentaRx
          )
        ) {

          mapaVentaRx.set(
            canalRx,
            productividadVentaRx
          );

        }


        // ==========================================
        // PLUS RX
        // ==========================================

        const plusRx =
          Number(
            fila[
              COLUMNA_PLUS_RX
            ]
          );


        if (
          Number.isFinite(
            plusRx
          )
        ) {

          mapaPlusRx.set(
            canalRx,
            plusRx
          );

        }

      }

    }


    // ==============================================
    // CONSTRUIR RESULTADO
    // ==============================================

    const registros =
      ordenCanales
        .filter(
          (canal) =>
            mapaVenta.has(
              canal
            ) ||
            mapaVentaRx.has(
              canal
            )
        )
        .map(
          (canal) => {

            const productividadVenta =
              Number(
                mapaVenta.get(
                  canal
                ) ?? 0
              );


            const productividadVentaRx =
              Number(
                mapaVentaRx.get(
                  canal
                ) ?? 0
              );


            let plusRx =
              mapaPlusRx.get(
                canal
              );


            // ======================================
            // SI R NO TRAE NÚMERO,
            // CALCULAR P - M
            //
            // Esto también calcula TOTAL,
            // porque en R7 aparece "TOTAL".
            // ======================================

            if (
              !Number.isFinite(
                plusRx
              )
            ) {

              plusRx =
                productividadVentaRx -
                productividadVenta;

            }


            return {

              canal,

              productividadVenta,

              productividadVentaRx,

              plusRx,

            };

          }
        );


    // ==============================================
    // LOG
    // ==============================================

    console.log(
      "=========================================="
    );

    console.log(
      "📈 PRODUCTIVIDAD POR CANAL"
    );

    console.log(
      "📦 REGISTROS:",
      registros.length
    );

    console.log(
      registros
    );

    console.log(
      "=========================================="
    );


    // ==============================================
    // DEVOLVER
    // ==============================================

    return {

      registros,

    };


  } catch (error) {

    console.error(
      "❌ ERROR EN PRODUCTIVIDAD POR CANAL:",
      error
    );


    return {

      registros: [],

    };

  }

}

// ==================================================
// 👥 CARTERA POR DÍA
// ==================================================
//
// HOJA:
// CARTERA POR DÍA
//
// FILA 2:
// DÍAS 1 - 31
//
// FILAS:
// 3 = VTA CL SALAMANCA
// 4 = RECONEXIONES
// 5 = CORTES
// 6 = SUSPENSIONES
// 7 = CANCELACIONES
//
// ==================================================

function leerCarteraPorDia() {

  try {

    // ==============================================
    // OBTENER EXCEL
    // ==============================================

    const workbook =
      cargarExcel();


    // ==============================================
    // BUSCAR HOJA
    // ==============================================

    const nombreHoja =
      workbook.SheetNames.find(
        (nombre) =>
          String(nombre)
            .trim()
            .toUpperCase() ===
          "CARTERA POR DÍA"
      );


    if (!nombreHoja) {

      throw new Error(
        'No se encontró la hoja "CARTERA POR DÍA"'
      );

    }


    const hoja =
      workbook.Sheets[
        nombreHoja
      ];


    // ==============================================
    // CONVERTIR A FILAS
    // ==============================================

    const datos =
      XLSX.utils.sheet_to_json(
        hoja,
        {
          header: 1,
          defval: "",
        }
      );


    // ==============================================
    // VALIDAR ESTRUCTURA
    // ==============================================

    if (
      datos.length < 7
    ) {

      throw new Error(
        'La hoja "CARTERA POR DÍA" no contiene la estructura esperada'
      );

    }


    // ==============================================
    // FILAS
    // ==============================================

    const FILA_DIAS = 1;

    const FILA_VENTAS = 2;

    const FILA_RECONEXIONES = 3;

    const FILA_CORTES = 4;

    const FILA_SUSPENSIONES = 5;

    const FILA_CANCELACIONES = 6;


    // ==============================================
    // COLUMNAS
    // ==============================================

    // B = día 1
    // C = día 2
    // ...
    // AF = día 31

    const COLUMNA_DIA_1 = 1;


    // ==============================================
    // RESULTADO
    // ==============================================

    const dias = [];


    // ==============================================
    // RECORRER DÍAS
    // ==============================================

    for (
      let dia = 1;
      dia <= 31;
      dia++
    ) {

      const columna =
        COLUMNA_DIA_1 +
        (dia - 1);


      // ============================================
      // VALIDAR DÍA
      // ============================================

      const diaExcel =
        Number(
          datos[
            FILA_DIAS
          ]?.[
            columna
          ]
        );


      if (
        !Number.isFinite(
          diaExcel
        )
      ) {

        continue;

      }


      // ============================================
      // VENTAS
      // ============================================

      let ventas =
        Number(
          datos[
            FILA_VENTAS
          ]?.[
            columna
          ]
        );


      if (
        !Number.isFinite(
          ventas
        )
      ) {

        ventas = 0;

      }


      // ============================================
      // RECONEXIONES
      // ============================================

      let reconexiones =
        Number(
          datos[
            FILA_RECONEXIONES
          ]?.[
            columna
          ]
        );


      if (
        !Number.isFinite(
          reconexiones
        )
      ) {

        reconexiones = 0;

      }


      // ============================================
      // CORTES
      // ============================================

      let cortes =
        Number(
          datos[
            FILA_CORTES
          ]?.[
            columna
          ]
        );


      if (
        !Number.isFinite(
          cortes
        )
      ) {

        cortes = 0;

      }


      // ============================================
      // SUSPENSIONES
      // ============================================

      let suspensiones =
        Number(
          datos[
            FILA_SUSPENSIONES
          ]?.[
            columna
          ]
        );


      if (
        !Number.isFinite(
          suspensiones
        )
      ) {

        suspensiones = 0;

      }


      // ============================================
      // CANCELACIONES
      // ============================================

      let cancelaciones =
        Number(
          datos[
            FILA_CANCELACIONES
          ]?.[
            columna
          ]
        );


      if (
        !Number.isFinite(
          cancelaciones
        )
      ) {

        cancelaciones = 0;

      }


      // ============================================
      // TOTAL MOVIMIENTOS
      // ============================================

      const total =
        ventas +
        reconexiones +
        cortes +
        suspensiones +
        cancelaciones;


      // ============================================
      // GUARDAR
      // ============================================

      dias.push({

        dia:
          diaExcel,

        ventas:
          Math.round(
            ventas
          ),

        reconexiones:
          Math.round(
            reconexiones
          ),

        cortes:
          Math.round(
            cortes
          ),

        suspensiones:
          Math.round(
            suspensiones
          ),

        cancelaciones:
          Math.round(
            cancelaciones
          ),

        total:
          Math.round(
            total
          ),

      });

    }


    // ==============================================
    // LOG
    // ==============================================

    console.log(
      "=========================================="
    );

    console.log(
      "👥 CARTERA POR DÍA"
    );

    console.log(
      "📦 DÍAS:",
      dias.length
    );

    console.log(
      "📊 EJEMPLO DÍA 30:",
      dias.find(
        (registro) =>
          registro.dia === 30
      )
    );

    console.log(
      "=========================================="
    );


    // ==============================================
    // DEVOLVER
    // ==============================================

    return {

      dias,

    };


  } catch (error) {

    console.error(
      "❌ ERROR EN CARTERA POR DÍA:",
      error
    );


    return {

      dias: [],

    };

  }

}

// ==================================================
// LEER EXCEL COMPLETO
// ==================================================

async function leerExcel() {

  // ==================================================
  // USAR CACHE SI YA FUE CARGADO
  // ==================================================

  if (datosCacheados) {

    console.log(
      "⚡ Usando datos en memoria"
    );

    return datosCacheados;

  }


  try {

    const workbook =
      cargarExcel();


    // ==================================================
    // PRODUCTIVIDAD
    // ==================================================

    const hojaProduccion =
      workbook.Sheets[
        "PRODUCTIVIDAD"
      ];


    const hojaSinVenta =
      workbook.Sheets[
        "BD SIN VENTA"
      ];


    const hojaVentaVsPpto =
      workbook.Sheets[
        "VENTA VS PPTO"
      ];


    if (
      !hojaProduccion ||
      !hojaSinVenta ||
      !hojaVentaVsPpto
    ) {

      throw new Error(
        "No se encontraron las hojas necesarias para REGISTROS"
      );

    }


    const diasHabiles =
      leerDiasHabiles(
        hojaProduccion
      );


    const registros =
      leerRegistros(
        hojaProduccion,
        hojaSinVenta,
        hojaVentaVsPpto,
        diasHabiles
      );


    // ==================================================
    // PLAN DE TRABAJO
    // ==================================================

    const HOJA_BD_PLAN_TRABAJO =
      "BD PLAN DE TRABAJO";

    const HOJA_PLAN_TRABAJO =
      "PLAN DE TRABAJO";


    // ==================================================
    // HOJA BD PLAN DE TRABAJO
    // ==================================================

    const hojaBDPlanTrabajo =
      workbook.Sheets[
        HOJA_BD_PLAN_TRABAJO
      ];


    if (
      !hojaBDPlanTrabajo
    ) {

      throw new Error(
        `No se encontró la hoja "${HOJA_BD_PLAN_TRABAJO}"`
      );

    }


    // ==================================================
    // HOJA PLAN DE TRABAJO
    // ==================================================

    const hojaPlanTrabajo =
      workbook.Sheets[
        HOJA_PLAN_TRABAJO
      ];


    if (
      !hojaPlanTrabajo
    ) {

      throw new Error(
        `No se encontró la hoja "${HOJA_PLAN_TRABAJO}"`
      );

    }


    // ==================================================
    // DATOS PLAN DE TRABAJO
    // ==================================================

    const planTrabajo =
      leerPlanTrabajo(
        hojaPlanTrabajo
      );


    // ==================================================
    // PENETRACIÓN
    // ==================================================

    const penetracion =
      leerBDPlanTrabajo(
        hojaBDPlanTrabajo
      );


    // ==================================================
    // LEER PLAN DE TRABAJO
    // ==================================================

    function leerPlanTrabajo(
      hoja
    ) {

      const datos =
        XLSX.utils.sheet_to_json(
          hoja,
          {
            header: 1,
            defval: "",
          }
        );


      const resultado = [];


      // ==================================================
      // COLUMNAS PLAN DE TRABAJO
      // ==================================================

      const COLUMNA_SUPERVISOR = 0;
      const COLUMNA_COLONIA = 4;
      const COLUMNA_POTENCIALES = 9;
      const COLUMNA_ACTIVOS = 10;
      const COLUMNA_PENETRACION = 11;
      const COLUMNA_VENTAS = 51;


      // ==================================================
      // RECORRER FILAS
      // ==================================================

      for (
        let i = 0;
        i < datos.length;
        i++
      ) {

        const fila =
          datos[i];


        // ==================================================
        // SUPERVISOR
        // ==================================================

        const supervisor =
          limpiarTexto(
            fila[
              COLUMNA_SUPERVISOR
            ]
          );


        // ==================================================
        // COLONIA
        // ==================================================

        const colonia =
          limpiarTexto(
            fila[
              COLUMNA_COLONIA
            ]
          );


        // ==================================================
        // FILTROS
        // ==================================================

        if (
          esValorInvalido(
            supervisor
          )
        ) {

          continue;

        }


        if (
          esValorInvalido(
            colonia
          )
        ) {

          continue;

        }


        if (
          supervisor === "SUPERVISOR" ||
          colonia === "COLONIA"
        ) {

          continue;

        }


        if (
          supervisor === "0" ||
          colonia === "0"
        ) {

          continue;

        }


        // ==================================================
        // POTENCIALES
        // ==================================================

        let potenciales =
          Number(
            fila[
              COLUMNA_POTENCIALES
            ]
          );


        if (
          !Number.isFinite(
            potenciales
          )
        ) {

          potenciales = 0;

        }


        potenciales =
          Math.round(
            potenciales
          );


        // ==================================================
        // ACTIVOS INTERNET
        // ==================================================

        let activos =
          Number(
            fila[
              COLUMNA_ACTIVOS
            ]
          );


        if (
          !Number.isFinite(
            activos
          )
        ) {

          activos = 0;

        }


        activos =
          Math.round(
            activos
          );


        // ==================================================
        // PENETRACIÓN
        // ==================================================

        let penetracion =
          Number(
            fila[
              COLUMNA_PENETRACION
            ]
          );


        if (
          !Number.isFinite(
            penetracion
          )
        ) {

          penetracion = 0;

        }


        if (
          penetracion > 0 &&
          penetracion <= 1
        ) {

          penetracion =
            penetracion * 100;

        }


        // ==================================================
        // POR VENDER
        // ==================================================

        const porVender =
          Math.max(
            potenciales -
            activos,
            0
          );


        // ==================================================
        // VENTAS
        // ==================================================

        let ventas =
          Number(
            fila[
              COLUMNA_VENTAS
            ]
          );


        if (
          !Number.isFinite(
            ventas
          )
        ) {

          ventas = 0;

        }


        ventas =
          Math.round(
            ventas
          );


        // ==================================================
        // GUARDAR
        // ==================================================

        resultado.push({

          supervisor,

          colonia,

          potenciales,

          penetracion,

          porVender,

          ventas,

        });

      }


      // ==================================================
      // ELIMINAR DUPLICADOS
      // ==================================================

      const registrosUnicos =
        Array.from(

          new Map(

            resultado.map(
              (registro) => [

                `${registro.supervisor}-${registro.colonia}`,

                registro,

              ]
            )

          ).values()

        );


      console.log(
        "=========================================="
      );

      console.log(
        "🎯 PLAN DE TRABAJO CARGADO:",
        registrosUnicos.length
      );

      console.log(
        "🔎 EJEMPLO RINCONADA:",
        registrosUnicos.find(
          (registro) =>
            registro.colonia ===
            "RINCONADA DE LA PAZ"
        )
      );

      console.log(
        "=========================================="
      );


      return registrosUnicos;

    }


    // ==================================================
    // BD AVANCE SEMANAL
    // ==================================================

    const hojaAvanceSemanal =
      workbook.Sheets[
        "BD AVANCE SEMANAL"
      ];


    if (
      !hojaAvanceSemanal
    ) {

      throw new Error(
        'No se encontró la hoja "BD AVANCE SEMANAL"'
      );

    }


    const avanceSemanal =
      leerAvanceSemanal(
        hojaAvanceSemanal
      );


    // ==================================================
    // RANKING SUPERVISORES
    // ==================================================

    const hojaRankingSupervisores =
      workbook.Sheets[
        "VENTA DIARIA POR SUPERVISOR"
      ];


    if (
      !hojaRankingSupervisores
    ) {

      throw new Error(
        'No se encontró la hoja "VENTA DIARIA POR SUPERVISOR"'
      );

    }


    const rankingSupervisores =
      leerRankingSupervisores(
        hojaRankingSupervisores
      );


    // ==================================================
    // 📈 PRODUCTIVIDAD POR CANAL
    // ==================================================

    const productividadPorCanal =
      leerProductividadPorCanal();


    // ==================================================
// 👥 CARTERA POR DÍA
// ==================================================

const carteraPorDia =
  leerCarteraPorDia();

    

    // ==================================================
    // GUARDAR CACHE
    // ==================================================

    datosCacheados = {

      registros,

      planTrabajo,

      penetracion,

      avanceSemanal,

      rankingSupervisores,

      productividadPorCanal,
      
      carteraPorDia,

    };


    return datosCacheados;


  } catch (error) {

    console.error(
      "❌ ERROR AL LEER EXCEL:"
    );

    console.error(
      error
    );

    throw error;

  }

}

// ==================================================
// 🔄 ACTUALIZAR EXCEL Y CACHÉ DESDE SUPABASE
// ==================================================

// Evita descargar varias veces si llegan
// solicitudes simultáneas.
let actualizacionEnCurso = null;

function actualizarDatosDesdeSupabase() {

  if (actualizacionEnCurso) {
    return actualizacionEnCurso;
  }

  actualizacionEnCurso = (async () => {

    const supabaseUrl = process.env.SUPABASE_URL;
    const clave = process.env.SUPABASE_SECRET_KEY;

    if (!supabaseUrl || !clave) {
      throw new Error(
        "Supabase no está configurado"
      );
    }

    // Mismo bucket y archivo que utiliza
    // actualmente tu descarga al arrancar.
    const bucket = encodeURIComponent(
      "Nombre: mega-data"
    );

    const archivo = encodeURIComponent(
      "SEGUIMIENTO 2.0.xlsx"
    );

    const url =
      `${supabaseUrl}/storage/v1/object/authenticated/${bucket}/${archivo}?actualizacion=${Date.now()}`;

    // Limitar el tiempo de descarga a 60 segundos.
    const controlador = new AbortController();

    const limite = setTimeout(
      () => controlador.abort(),
      60000
    );

    let buffer;

    // ==============================================
    // DESCARGAR SIN BORRAR LOS DATOS ACTUALES
    // ==============================================

    try {

      const respuesta = await fetch(url, {

        method: "GET",

        signal: controlador.signal,

        headers: {

          apikey: clave,

          Authorization:
            `Bearer ${clave}`,

          "Cache-Control": "no-cache",

        },

      });

      if (!respuesta.ok) {
        throw new Error(
          `Descarga de Excel: HTTP ${respuesta.status}`
        );
      }

      buffer = Buffer.from(
        await respuesta.arrayBuffer()
      );

    } finally {

      clearTimeout(limite);

    }

    // ==============================================
    // ABRIR EL ARCHIVO NUEVO ANTES DE REEMPLAZAR
    // ==============================================

    const nuevoWorkbook = XLSX.read(buffer, {

      type: "buffer",
      dense: true,
      cellHTML: false,
      cellFormula: false,
      cellStyles: false,
      cellNF: false,

    });

    // ==============================================
    // VALIDAR LAS PESTAÑAS QUE USA EL SISTEMA
    // ==============================================

    const hojasNecesarias = [

      "PRODUCTIVIDAD",
      "BD SIN VENTA",
      "VENTA VS PPTO",
      "BD PLAN DE TRABAJO",
      "PLAN DE TRABAJO",
      "BD AVANCE SEMANAL",
      "VENTA DIARIA POR SUPERVISOR",
      "USERS",
      "PLANTILLA",
      "VS MES ANTERIOR",
      "KPI´S VENTAS",
      "CARTERA POR DÍA",
      "PROYECCION",

    ];

    for (const nombre of hojasNecesarias) {

      const encontrada =
        nuevoWorkbook.SheetNames.find(
          (hoja) =>
            hoja.trim().toUpperCase() === nombre
        );

      if (
        !encontrada ||
        !nuevoWorkbook.Sheets[encontrada]?.["!ref"]
      ) {

        throw new Error(
          `Falta información en la hoja "${nombre}"`
        );

      }

    }

    // ==============================================
    // GUARDAR PRIMERO EN UN ARCHIVO TEMPORAL
    // ==============================================

    const temporal =
      `${RUTA_EXCEL_SUPABASE}.${crypto.randomUUID()}.tmp`;

    try {

      fs.writeFileSync(
        temporal,
        buffer
      );

      // Sustituir el archivo cuando terminó
      // de descargarse y abrirse correctamente.
      fs.renameSync(
        temporal,
        RUTA_EXCEL_SUPABASE
      );

    } finally {

      if (fs.existsSync(temporal)) {
        fs.unlinkSync(temporal);
      }

    }

    // ==============================================
    // RENOVAR LAS TRES CACHÉS
    // ==============================================

    workbookCacheado = nuevoWorkbook;

    datosCacheados = null;

    usuariosCacheados = null;

    return {
      actualizadoEn: new Date().toISOString(),
    };

  })().finally(() => {

    // Permitir la siguiente actualización,
    // tanto si terminó bien como si falló.
    actualizacionEnCurso = null;

  });

  return actualizacionEnCurso;

}


// ==================================================
// 📤 REEMPLAZAR EXCEL DIRECTAMENTE EN SUPABASE
// ==================================================

function validarExcelParaCarga(buffer) {

  // ================================================
  // COMPROBAR QUE RECIBIMOS UN ARCHIVO
  // ================================================

  if (
    !Buffer.isBuffer(buffer) ||
    buffer.length === 0
  ) {

    throw new Error(
      "No se recibió un archivo Excel"
    );

  }


  // ================================================
  // INTENTAR ABRIR EL EXCEL
  // ================================================

  const nuevoWorkbook = XLSX.read(
    buffer,
    {

      type: "buffer",
      dense: true,
      cellHTML: false,
      cellFormula: false,
      cellStyles: false,
      cellNF: false,

    }
  );


  // ================================================
  // PESTAÑAS NECESARIAS
  // ================================================

  const hojasNecesarias = [

    "PRODUCTIVIDAD",
    "BD SIN VENTA",
    "VENTA VS PPTO",
    "BD PLAN DE TRABAJO",
    "PLAN DE TRABAJO",
    "BD AVANCE SEMANAL",
    "VENTA DIARIA POR SUPERVISOR",
    "USERS",
    "PLANTILLA",
    "VS MES ANTERIOR",
    "KPI´S VENTAS",
    "CARTERA POR DÍA",
    "PROYECCION",

  ];


  // ================================================
  // VALIDAR CADA PESTAÑA
  // ================================================

  for (
    const nombre of hojasNecesarias
  ) {

    const encontrada =
      nuevoWorkbook.SheetNames.find(
        (hoja) =>
          hoja
            .trim()
            .toUpperCase() === nombre
      );


    if (
      !encontrada ||
      !nuevoWorkbook
        .Sheets[encontrada]
        ?.["!ref"]
    ) {

      throw new Error(
        `Falta información en la hoja "${nombre}"`
      );

    }

  }


  // ================================================
  // VALIDAR PROYECCION!N8:X68
  // ================================================

  const nombreProyeccion =
    nuevoWorkbook.SheetNames.find(
      (hoja) =>
        hoja
          .trim()
          .toUpperCase() ===
        "PROYECCION"
    );


  const rangoProyeccion =
    XLSX.utils.decode_range(
      nuevoWorkbook
        .Sheets[nombreProyeccion]
        ["!ref"]
    );


  // r = fila y c = columna.
  // JavaScript cuenta desde cero:
  // fila 68 = índice 67
  // columna X = índice 23

  if (
    rangoProyeccion.e.r < 67 ||
    rangoProyeccion.e.c < 23
  ) {

    throw new Error(
      "La hoja PROYECCION no alcanza el rango N8:X68"
    );

  }


  return nuevoWorkbook;

}


// ==================================================
// SUBIR Y ACTIVAR EL EXCEL
// ==================================================

function reemplazarExcelEnSupabase(
  buffer
) {

  // ================================================
  // EVITAR DOS OPERACIONES AL MISMO TIEMPO
  // ================================================

  if (actualizacionEnCurso) {

    const error = new Error(
      "Ya existe una actualización en curso"
    );

    error.codigo =
      "ACTUALIZACION_EN_CURSO";

    throw error;

  }


  actualizacionEnCurso =
    (async () => {

      const supabaseUrl =
        process.env.SUPABASE_URL;

      const clave =
        process.env.SUPABASE_SECRET_KEY;


      if (
        !supabaseUrl ||
        !clave
      ) {

        throw new Error(
          "Supabase no está configurado"
        );

      }


      // ============================================
      // VALIDAR ANTES DE REEMPLAZAR
      // ============================================

      const nuevoWorkbook =
        validarExcelParaCarga(
          buffer
        );


      // ============================================
      // UBICACIÓN EN SUPABASE
      // ============================================

      const bucket =
        encodeURIComponent(
          "Nombre: mega-data"
        );

      const archivo =
        encodeURIComponent(
          "SEGUIMIENTO 2.0.xlsx"
        );

      const url =
        `${supabaseUrl}/storage/v1/object/${bucket}/${archivo}`;


      // ============================================
      // TIEMPO MÁXIMO: 60 SEGUNDOS
      // ============================================

      const controlador =
        new AbortController();

      const limite =
        setTimeout(
          () => controlador.abort(),
          60000
        );


      // ============================================
      // REEMPLAZAR EL ARCHIVO EN SUPABASE
      // ============================================

      try {

        const respuesta =
          await fetch(
            url,
            {

              method: "POST",

              signal:
                controlador.signal,

              headers: {

                apikey:
                  clave,

                Authorization:
                  `Bearer ${clave}`,

                "Content-Type":
                  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",

                // Autoriza el reemplazo del archivo.
                "x-upsert":
                  "true",

              },

              body:
                buffer,

            }
          );


        if (!respuesta.ok) {

          throw new Error(
            `Carga a Supabase: HTTP ${respuesta.status}`
          );

        }

      } finally {

        clearTimeout(
          limite
        );

      }


      // ============================================
      // ACTUALIZAR LA COPIA TEMPORAL DE RENDER
      // ============================================

      const temporal =
        `${RUTA_EXCEL_SUPABASE}.${crypto.randomUUID()}.tmp`;


      try {

        fs.writeFileSync(
          temporal,
          buffer
        );

        fs.renameSync(
          temporal,
          RUTA_EXCEL_SUPABASE
        );

      } finally {

        if (
          fs.existsSync(
            temporal
          )
        ) {

          fs.unlinkSync(
            temporal
          );

        }

      }


      // ============================================
      // RENOVAR TODAS LAS CACHÉS
      // ============================================

      workbookCacheado =
        nuevoWorkbook;

      datosCacheados =
        null;

      usuariosCacheados =
        null;


      // ============================================
      // RESULTADO
      // ============================================

      return {

        actualizadoEn:
          new Date().toISOString(),

        tamanoBytes:
          buffer.length,

        hash:
          crypto
            .createHash("sha256")
            .update(buffer)
            .digest("hex"),

      };

    })().finally(() => {

      actualizacionEnCurso =
        null;

    });


  return actualizacionEnCurso;

}

// ==================================================
// EXPORTACIONES
// ==================================================

module.exports = {

  obtenerUsuarios,

  validarUsuario,

  leerExcel,

  leerVentaVsMesAnterior,

  leerPlantilla,

  leerProductividadPorCanal,

  leerCarteraPorDia,

  leerProyeccion,

  reemplazarExcelEnSupabase,

  actualizarDatosDesdeSupabase,

  descargarExcelDesdeSupabase,

  

};


// ==================================================
// 📊 PROYECCIÓN PARA DIRECCIÓN
// ==================================================
//
// HOJA: PROYECCION
//
// ENCABEZADOS: N8:X8
// INDICADORES: N9:X68
//
// Conserva:
// - Orden de sucursales e indicadores.
// - Celdas vacías y filas separadoras.
// - Ceros, porcentajes y formato numérico del Excel.
//
// ==================================================

function leerProyeccion() {

  // ================================================
  // UTILIZAR LA CARGA ACTUAL DEL EXCEL
  // ================================================

  const workbook = cargarExcel();

  // ================================================
  // LOCALIZAR LA HOJA
  // ================================================

  const nombreHoja = workbook.SheetNames.find(
    (nombre) =>
      String(nombre)
        .trim()
        .toUpperCase() === "PROYECCION"
  );

  if (!nombreHoja) {

    throw new Error(
      'No se encontró la hoja "PROYECCION"'
    );

  }

  const hoja = workbook.Sheets[nombreHoja];

  // ================================================
  // LEER UNA CELDA
  // ================================================

  function leerCelda(fila, columna) {

    // Excel cuenta las filas desde 1.
    // JavaScript cuenta las posiciones desde 0.
    const direccion = XLSX.utils.encode_cell({
      r: fila - 1,
      c: columna,
    });

    // Tu cargarExcel() utiliza dense: true.
    // También admitimos hojas por dirección de celda.
    const celda = Array.isArray(hoja)
      ? hoja[fila - 1]?.[columna]
      : hoja[direccion];

    return {

      direccion,

      // Valor original: conserva también el cero.
      valor: celda?.v ?? null,

      // Texto mostrado por Excel.
      // Si la celda no existe, permanece vacía.
      texto:
        celda == null
          ? ""
          : String(
              celda.w ??
              XLSX.utils.format_cell(celda)
            ),

    };

  }

  // ================================================
  // LEER UNA FILA COMPLETA: COLUMNAS N HASTA X
  // ================================================

  function leerFila(fila) {

    // N corresponde al índice 13.
    // Son 11 columnas, hasta X.
    return Array.from(
      { length: 11 },
      (_, indice) =>
        leerCelda(fila, indice + 13)
    );

  }

  // ================================================
  // ENCABEZADOS: FILA 8
  // ================================================

  const encabezados = leerFila(8);

  // ================================================
  // INDICADORES: FILAS 9 HASTA 68
  // ================================================

  const filas = Array.from(
    { length: 60 },
    (_, indice) => {

      const numero = indice + 9;

      const celdas = leerFila(numero);

      return {

        numero,

        celdas,

        // Una fila vacía se conserva como separación.
        separador: celdas.every(
          (celda) =>
            celda.texto.trim() === ""
        ),

      };

    }
  );

  // ================================================
  // VALIDAR QUE EL RANGO CONTENGA INFORMACIÓN
  // ================================================

  const todasLasFilas = [
    encabezados,
    ...filas.map(
      (fila) => fila.celdas
    ),
  ];

  const rangoVacio = todasLasFilas.every(
    (fila) =>
      fila.every(
        (celda) =>
          celda.texto.trim() === ""
      )
  );

  if (rangoVacio) {

    throw new Error(
      "El rango PROYECCION!N8:X68 está vacío"
    );

  }

  // ================================================
  // ENTREGAR LA TABLA
  // ================================================

  return {
    encabezados,
    filas,
  };

}
