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

// Los datos se cargan una sola vez al iniciar.
// Para actualizar el Excel durante el día,
// se reinicia el backend.

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
  // ==================================================

  const COLUMNA_EMPLEADO = 1;
  const COLUMNA_USUARIO = 2;
  const COLUMNA_PASSWORD = 3;
  const COLUMNA_ESTADO = 4;
  const COLUMNA_SUPERVISOR = 5;


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


  // ================================================
  // BUSCAR ENCABEZADO
  // ================================================

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


  // ================================================
  // COLUMNAS
  // ================================================

  const COLUMNA_DIA_1 = 6;

  const COLUMNA_RX = 37;

  const COLUMNA_VENTAS_MES = 38;


  // ================================================
  // PROMOTOR
  // ================================================

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


  // ================================================
  // RECORRER PROMOTORES
  // ================================================

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


    // ==============================================
    // DÍAS SIN VENTA
    // ==============================================

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


      // Domingo no cuenta

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


    // ==============================================
    // RX
    // ==============================================

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


    // ==============================================
    // VENTAS DEL MES
    // ==============================================

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


  // ==================================================
  // COLUMNAS
  //
  // D = Sucursal
  // E = Colonia
  // F = NSE
  // I = Potenciales
  // K = Activos Internet
  // N = Penetración
  // ==================================================

  const COLUMNA_SUCURSAL = 3;

  const COLUMNA_COLONIA = 4;

  const COLUMNA_NSE = 5;

  const COLUMNA_POTENCIALES = 8;

  const COLUMNA_ACTIVOS_INTERNET = 10;

  const COLUMNA_PENETRACION = 13;


  // ==================================================
  // RECORRER BASE
  // ==================================================

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


    // ==================================================
    // FILTROS
    // ==================================================

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

      activosInternet = 0;

    }


    activosInternet =
      Math.round(
        activosInternet
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


    // ==================================================
    // CONVERTIR A PORCENTAJE
    //
    // 0.36   → 36
    // 0.3333 → 33.33
    // ==================================================

    if (
      penetracion > 0 &&
      penetracion <= 1
    ) {

      penetracion =
        penetracion*100;

    }


    // ==================================================
    // POR VENDER
    // ==================================================

    const porVender =
      Math.max(
        potenciales -
        activosInternet,
        0
      );


    // ==================================================
    // GUARDAR
    // ==================================================

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


  // ==================================================
  // ELIMINAR DUPLICADOS
  // ==================================================

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
//
// A = Supervisor
// D = Promotor
// E = Productividad
// F = Dobles
// G = Triples
// H = Móvil
// I = Netflix
// J = Disney+
// K = MAX
//
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


  // ==================================================
  // RECORRER BASE
  // ==================================================

  for (
    let i = 0;
    i < datos.length;
    i++
  ) {

    const fila =
      datos[i];


    // ==================================================
    // A = SUPERVISOR
    // ==================================================

    const supervisor =
      limpiarTexto(
        fila[0]
      );


    // ==================================================
    // D = PROMOTOR
    // ==================================================

    const nombre =
      limpiarTexto(
        fila[3]
      );


    // ==================================================
    // IGNORAR ENCABEZADOS
    // ==================================================

    if (
      supervisor === "SUP" ||
      nombre === "PROMOTOR"
    ) {

      continue;

    }


    // ==================================================
    // IGNORAR FILAS VACÍAS
    // ==================================================

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


    // ==================================================
    // E = PRODUCTIVIDAD
    // ==================================================

    const productividad =
      Number(
        fila[4]
      );


    // ==================================================
    // F = DOBLES
    // ==================================================

    const dobles =
      Number(
        fila[5]
      );


    // ==================================================
    // G = TRIPLES
    // ==================================================

    const triples =
      Number(
        fila[6]
      );


    // ==================================================
    // H = MEGA MÓVIL
    // ==================================================

    const movil =
      Number(
        fila[7]
      );


    // ==================================================
    // I = NETFLIX
    // ==================================================

    const netflix =
      Number(
        fila[8]
      );


    // ==================================================
    // J = DISNEY+
    // ==================================================

    const disney =
      Number(
        fila[9]
      );


    // ==================================================
    // K = MAX
    // ==================================================

    const max =
      Number(
        fila[10]
      );


    // ==================================================
    // GUARDAR
    // ==================================================

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
// CALCULAR DÍAS HÁBILES RESTANTES
// ==================================================

function calcularDiasHabilesRestantes() {

  const hoy =
    new Date();

  const año =
    hoy.getFullYear();

  const mes =
    hoy.getMonth();

  const diaActual =
    hoy.getDate();

  const ultimoDia =
    new Date(
      año,
      mes + 1,
      0
    ).getDate();


  let diasHabiles =
    0;


  for (
    let dia = diaActual + 1;
    dia <= ultimoDia;
    dia++
  ) {

    const fecha =
      new Date(
        año,
        mes,
        dia
      );


    const diaSemana =
      fecha.getDay();


    // Lunes a sábado

    if (
      diaSemana !== 0
    ) {

      diasHabiles++;

    }

  }


  return diasHabiles;

}



// ==================================================
// LEER REGISTROS DE PRODUCTIVIDAD
// ==================================================

function leerRegistros(
  hojaProduccion,
  hojaSinVenta,
  hojaVentaVsPpto
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


  // ==============================================
  // RECORRER PRODUCCIÓN
  // ==============================================

  for (
    let i = 0;
    i < datos.length;
    i++
  ) {

    const fila =
      datos[i];


    // A = Supervisor

    const columnaA =
      limpiarTexto(
        fila[0]
      );


    // F = Promotor

    const columnaF =
      limpiarTexto(
        fila[5]
      );


    // H = Productividad

    const columnaH =
      fila[7];


    // ==========================================
    // DETECTAR SUPERVISOR
    // ==========================================

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


    // ==========================================
    // IGNORAR ENCABEZADO
    // ==========================================

    if (
      columnaF ===
      "PROMOTOR"
    ) {

      continue;

    }


    // ==========================================
    // SUPERVISOR EN A
    // ==========================================

    if (
      columnaA &&
      !esValorInvalido(
        columnaA
      )
    ) {

      supervisorActual =
        columnaA;

    }


    // ==========================================
    // PROMOTOR
    // ==========================================

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


    // ==========================================
    // PRODUCTIVIDAD
    // ==========================================

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


    // ==========================================
    // DATOS PROMOTOR
    // ==========================================

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


    // ==========================================
    // DATOS PPTO
    // ==========================================

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


    // ==========================================
    // DÍAS HÁBILES
    // ==========================================

    const diasHabilesRestantes =
      calcularDiasHabilesRestantes();


    // ==========================================
    // RITMO NECESARIO
    // ==========================================

    const ventasPorDia =
      diasHabilesRestantes > 0

        ? Math.ceil(
            ventasFaltantes /
            diasHabilesRestantes
          )

        : ventasFaltantes;


    // ==========================================
    // GUARDAR
    // ==========================================

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


  // ==============================================
  // ELIMINAR DUPLICADOS
  // ==============================================

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
// RANKING DE SUPERVISORES
// ==================================================
//
// Hoja: VENTA DIARIA POR SUPERVISOR
//
// Fila 18 = encabezados
// C = Supervisor
// E = Productividad
//
// Se excluye:
// MORALES PEREZ BENJAMIN
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


  const ranking = [];


  // ==========================================
  // FILA 18 = ENCABEZADOS
  // FILA 19 = PRIMER REGISTRO
  // ==========================================

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


    // ==========================================
    // FILTRAR
    // ==========================================

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


    // ==========================================
    // EXCLUIR BENJAMÍN
    // ==========================================

    if (
      supervisor ===
      "MORALES PEREZ BENJAMIN"
    ) {

      continue;

    }


    // ==========================================
    // VALIDAR PRODUCTIVIDAD
    // ==========================================

    if (
      !Number.isFinite(
        productividad
      )
    ) {

      continue;

    }


    ranking.push({

      supervisor,

      productividad,

    });

  }


  // ==========================================
  // ELIMINAR DUPLICADOS
  // ==========================================

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


  // ==========================================
  // ORDENAR MAYOR → MENOR
  // ==========================================

  rankingUnico.sort(

    (
      supervisorA,
      supervisorB
    ) =>

      supervisorB.productividad -
      supervisorA.productividad

  );


  // ==========================================
  // ASIGNAR POSICIÓN
  // ==========================================

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
    "🏆 RANKING SUPERVISORES:",
    resultado
  );


  return resultado;

}


// ==================================================
// LEER EXCEL COMPLETO
// ==================================================
//
// Por ahora conectamos:
// ✅ USERS
// ✅ BD PLAN DE TRABAJO
//
// Posteriormente agregaremos:
// 📊 BD AVANCE SEMANAL
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


const registros =
  leerRegistros(
    hojaProduccion,
    hojaSinVenta,
    hojaVentaVsPpto
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


    // Excel guarda:
    //
    // 0.06  → 6
    // 0.12  → 12
    // 0.3333 → 33.33
    //

    if (
      penetracion > 0 &&
      penetracion <= 1
    ) {

      penetracion =
        penetracion *100;

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
    // GUARDAR REGISTRO
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


  // ==================================================
  // LOG
  // ==================================================

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


   datosCacheados = {

  registros,

  planTrabajo,

  penetracion,

  avanceSemanal,

  rankingSupervisores,

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
// EXPORTACIONES
// ==================================================

module.exports = {

  obtenerUsuarios,

  validarUsuario,

  leerExcel,

  descargarExcelDesdeSupabase,

};
