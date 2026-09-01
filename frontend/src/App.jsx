import { useEffect, useState } from "react";

import "./App.css";

import Header from "./components/Header";
import Login from "./components/Login";
import WelcomeCard from "./components/WelcomeCard";
import MenuButtons from "./components/MenuButtons";
import KPICard from "./components/KPICard";
import FocusAlerts from "./components/FocusAlerts";
import HonorBoard from "./components/HonorBoard";
import TeamTable from "./components/TeamTable";
import RankingCluster from "./components/RankingCluster";
import PlanTrabajo from "./components/PlanTrabajo";
import PenetracionColonia from "./components/PenetracionColonia";
import AvanceSemanal from "./components/AvanceSemanal";
import RankingSupervisores
  from "./components/RankingSupervisores";
import CLRecognition from "./components/CLRecognition";
import {
  fetchProtegido
} from "./services/authService";
import FocosRojosIniciales from "./components/FocosRojosIniciales";
import ChecklistFocoRojo
  from "./components/ChecklistFocoRojo";

import PanelDireccion from "./components/PanelDireccion";

import {
  calcularPrioridades,
  filtrarFocosRojos,
  ordenarPorPrioridad
} from "./utils/prioridades";







const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:3001";


function App() {

  // ==================================================
  // ESTADO
  // ==================================================

  const [vista, setVista] =
    useState("supervisor");


  const [registros, setRegistros] =
    useState([]);


  const [planTrabajo, setPlanTrabajo] =
    useState([]);



// ==================================================
// RANKING INICIAL DE SUPERVISORES LUGAR DE TOTAL DE SUPERVISORES
// ==================================================

const [
  rankingSupervisores,
  setRankingSupervisores
] = useState([]);


const [
  mostrarRankingInicial,
  setMostrarRankingInicial
] = useState(false);

const [
  top3Ranking,
  setTop3Ranking
] = useState([]);

const [
  rankingCL,
  setRankingCL
] = useState([]);


// ==================================================
// RECONOCIMIENTO TOP 3 CL SALAMANCA
// ==================================================

const [
  mostrarReconocimientoCL,
  setMostrarReconocimientoCL
] = useState(false);

const [
  mostrarRankingSupervisoresIntermedio,
  setMostrarRankingSupervisoresIntermedio
] = useState(false);




 // ==================================================
//  FOCOS ROJOS INICIALES
// ================================================== 


  const [
  mostrarFocosRojosIniciales,
  setMostrarFocosRojosIniciales
] = useState(false);

  // ==================================================
  // PENETRACIÓN
  // ==================================================

  const [penetracion, setPenetracion] =
    useState([]);


  
  // ==================================================
  // AUSENCIAS TEMPORALES
  // ==================================================

  const [ausencias, setAusencias] =
    useState({});



  // ==================================================
  // LOGIN
  // ==================================================

  // ==================================================
  // 🔐 SESIÓN PERSISTENTE
  // ==================================================

  const [supervisorSeleccionado, setSupervisorSeleccionado] =
    useState(() => {
      try {

        const sesionGuardada =
          localStorage.getItem("mega_sesion");

        if (!sesionGuardada) {
          return "";
        }

        return JSON.parse(
          sesionGuardada
        );

      } catch (error) {

        console.error(
          "❌ No se pudo recuperar la sesión:",
          error
        );

        localStorage.removeItem(
          "mega_sesion"
        );

        return "";

      }
    });


  const [logueado, setLogueado] =
    useState(() => {

      try {

        return Boolean(
          localStorage.getItem(
            "mega_sesion"
          )
        );

      } catch (error) {

        return false;

      }

    });

  // ==================================================
// 👤 ROL DEL USUARIO LOGUEADO
// ==================================================

const [
  rolUsuario,
  setRolUsuario
] = useState("");


// ==================================================
// 🔴 VENDEDOR EN SEGUIMIENTO
// ==================================================

const [
  promotorEnSeguimiento,
  setPromotorEnSeguimiento
] = useState(null);



  // ==================================================
// 🔴 FOCOS ROJOS YA ATENDIDOS
// ==================================================

const [
  focosAtendidos,
  setFocosAtendidos
] = useState([]);
  

// ==================================================
// CARGAR DATOS
// ==================================================

async function cargarDatos() {

  try {

    console.log(
      "🚀🚀 CARGAR DATOS INICIADO"
    );

    // ============================================
    // RANKING DE SUPERVISORES
    // ============================================

    const respuestaRanking =
      await fetchProtegido(
        `${API_URL}/api/ranking-supervisores`
      );
if (
  !respuestaRanking.ok
) {

  throw new Error(
    `Error HTTP ${respuestaRanking.status} al cargar ranking`
  );

}


const datosRanking =
  await respuestaRanking.json();


if (
  !datosRanking.correcto
) {

  throw new Error(
    datosRanking.mensaje ||
    "No se pudo cargar el ranking"
  );

}


setRankingSupervisores(
  datosRanking.ranking || []
);


console.log(
  "🔥🔥 RANKING SUPERVISORES CARGADO:",
  datosRanking.ranking?.length || 0
);


// ============================================
// 🏆 TOP 3 CL SALAMANCA
// ============================================

console.log(
  "🏆 INTENTANDO CONECTAR CON BACKEND TOP 3 CL..."
);

const respuestaTop3CL =
  await fetchProtegido(
    `${API_URL}/api/ranking-cl`
  );

console.log(
  "🏆 RESPUESTA TOP 3 CL:",
  respuestaTop3CL.status
);


if (!respuestaTop3CL.ok) {

  throw new Error(
    `Error HTTP ${respuestaTop3CL.status} al cargar Top 3 CL`
  );

}


const datosTop3CL =
  await respuestaTop3CL.json();


console.log(
  "🏆 TOP 3 CL DESDE BACKEND:",
  datosTop3CL
);


if (
  !datosTop3CL.correcto
) {

  throw new Error(
    datosTop3CL.mensaje ||
    "No se pudo cargar el Top 3 CL"
  );

}


setTop3Ranking(
  datosTop3CL.ranking || []
);


console.log(
  "🏆 setTop3Ranking EJECUTADO:",
  datosTop3CL.ranking?.length || 0
);


    console.log(
      "🚀 INTENTANDO CONECTAR CON BACKEND REGISTROS..."
    );

   const respuestaRegistros =
  await fetchProtegido(
    `${API_URL}/api/registros`
  );


    console.log(
      "🚀 RESPUESTA DEL BACKEND:",
      respuestaRegistros.status
    );


    // ============================================
// 🏆 RANKING COMPLETO CL SALAMANCA
// ============================================

console.log(
  "🏆 INTENTANDO CONECTAR CON RANKING CL COMPLETO..."
);


const respuestaRankingCL =
  await fetchProtegido(
    `${API_URL}/api/ranking-cl-completo`
  );


console.log(
  "🏆 RESPUESTA RANKING CL:",
  respuestaRankingCL.status
);


if (
  !respuestaRankingCL.ok
) {

  throw new Error(
    `Error HTTP ${respuestaRankingCL.status} al cargar Ranking CL`
  );

}


const datosRankingCL =
  await respuestaRankingCL.json();


console.log(
  "🏆 RANKING CL COMPLETO:",
  datosRankingCL
);


if (
  !datosRankingCL.correcto
) {

  throw new Error(
    datosRankingCL.mensaje ||
    "No se pudo cargar el Ranking CL"
  );

}


setRankingCL(
  datosRankingCL.ranking || []
);


console.log(
  "🏆 setRankingCL EJECUTADO:",
  datosRankingCL.ranking?.length || 0
);


    // ============================================
    // VALIDAR RESPUESTA HTTP
    // ============================================

    if (
      !respuestaRegistros.ok
    ) {

      throw new Error(
        `Error HTTP ${respuestaRegistros.status} al cargar registros`
      );

    }


    // ============================================
    // CONVERTIR RESPUESTA
    // ============================================

    const datosRegistros =
      await respuestaRegistros.json();


    console.log(
      "🔥 REGISTROS DEL BACKEND:",
      datosRegistros
    );


    // ============================================
    // GUARDAR REGISTROS
    // ============================================

    setRegistros(
      datosRegistros.registros || []
    );

  console.log(
  "🔴 CANTIDAD TOTAL DE REGISTROS:",
  datosRegistros.registros?.length || 0
);

console.log(
  "🔴 SUPERVISORES EN REGISTROS:",
  [
    ...new Set(
      (datosRegistros.registros || [])
        .map(
          (registro) =>
            registro.supervisor
        )
        .filter(Boolean)
    )
  ]
);


    console.log(
      "🔥 setRegistros EJECUTADO"
    );

// ============================================
// PLAN DE TRABAJO — BACKEND
// ============================================

console.log(
  "🎯 INTENTANDO CONECTAR CON BACKEND PLAN DE TRABAJO..."
);


const respuestaPlanTrabajo =
  await fetchProtegido(
    `${API_URL}/api/plan-trabajo`
  );


console.log(
  "🎯 RESPUESTA PLAN DE TRABAJO:",
  respuestaPlanTrabajo.status
);


// ============================================
// VALIDAR RESPUESTA HTTP
// ============================================

if (
  !respuestaPlanTrabajo.ok
) {

  throw new Error(
    `Error HTTP ${respuestaPlanTrabajo.status} al cargar Plan de Trabajo`
  );

}


// ============================================
// CONVERTIR RESPUESTA
// ============================================

const datosPlanTrabajo =
  await respuestaPlanTrabajo.json();


console.log(
  "🎯 PLAN DE TRABAJO DEL BACKEND:",
  datosPlanTrabajo
);


// ============================================
// GUARDAR PLAN DE TRABAJO
// ============================================

setPlanTrabajo(
  datosPlanTrabajo.registros || []
);


console.log(
  "🎯 setPlanTrabajo EJECUTADO:",
  datosPlanTrabajo.registros?.length || 0
);
// ============================================
// CONVERTIR RESPUESTA
// ============================================


// ============================================
// PENETRACIÓN POR COLONIA — BACKEND
// ============================================

console.log(
  "🏙️ INTENTANDO CONECTAR CON BACKEND PENETRACIÓN..."
);

const respuestaPenetracion =
  await fetchProtegido(
    `${API_URL}/api/penetracion`
  );


console.log(
  "🏙️ RESPUESTA PENETRACIÓN:",
  respuestaPenetracion.status
);


// ============================================
// VALIDAR RESPUESTA HTTP
// ============================================

if (
  !respuestaPenetracion.ok
) {

  throw new Error(
    `Error HTTP ${respuestaPenetracion.status} al cargar penetración`
  );

}


// ============================================
// CONVERTIR RESPUESTA
// ============================================

const datosPenetracion =
  await respuestaPenetracion.json();


console.log(
  "🏙️ PENETRACIÓN DEL BACKEND:",
  datosPenetracion
);


// ============================================
// GUARDAR PENETRACIÓN
// ============================================

setPenetracion(
  datosPenetracion.registros || []
);


console.log(
  "🏙️ setPenetracion EJECUTADO:",
  datosPenetracion.registros?.length || 0
);


    } catch (error) {

    console.error(
      "❌ ERROR AL CARGAR DATOS:",
      error
    );

    console.log(
  "🚀🚀 CARGAR DATOS FALLÓ"
);
}
}

// ==================================================
// 🔐 CARGAR DATOS DESPUÉS DEL LOGIN
// ==================================================

useEffect(() => {

  if (!logueado) {

    return;

  }


  console.log(
    "🚀🚀 INICIANDO CARGA DESPUÉS DEL LOGIN"
  );


  console.log(
  "🚀 DIRECCIÓN: voy a cargar datos"
);

  cargarDatos();

}, [logueado]);
// ==================================================
// LOGIN
// ==================================================

function manejarLogin(
  resultadoLogin
) {

  const supervisor =
    resultadoLogin.supervisor;

  const rol =
    resultadoLogin.rol;

  setRolUsuario(
  rol
);


 if (
  rol === "DIRECCIÓN"
) {

  setLogueado(
    true
  );

  setAusencias({});

  setMostrarRankingInicial(
    false
  );

  setMostrarFocosRojosIniciales(
    false
  );

  setMostrarRankingSupervisoresIntermedio(
    false
  );

  setMostrarReconocimientoCL(
    true
  );

  return;

}


  setSupervisorSeleccionado(
    supervisor
  );
 

  // ==========================================
  // 💾 GUARDAR SESIÓN
  // ==========================================

  try {

    localStorage.setItem(
      "mega_sesion",
      JSON.stringify(
        supervisor
      )
    );

  } catch (error) {

    console.error(
      "❌ No se pudo guardar la sesión:",
      error
    );

  }


  setLogueado(
    true
  );

  setVista(
    "supervisor"
  );


  setAusencias({});
  setFocosAtendidos([]);


  // ==========================================
  // MOSTRAR RANKING AL ENTRAR
  // ==========================================

  setMostrarRankingInicial(
    true
  );

}

 

  // ==================================================
  // 🚪 CERRAR SESIÓN
  // ==================================================

  function cerrarSesion() {

    localStorage.removeItem(
      "mega_sesion"
    );


    setLogueado(
      false
    );


    setSupervisorSeleccionado(
      ""
    );

    setRolUsuario("");


    setPromotorEnSeguimiento(
      null
    );


    setMostrarRankingInicial(
      false
    );


    setMostrarReconocimientoCL(
      false
    );


    setMostrarFocosRojosIniciales(
      false
    );

    setMostrarRankingSupervisoresIntermedio(
      false
    );


    setVista(
      "supervisor"
    );


    setAusencias(
      {}
    );

    setFocosAtendidos([]);

  }




  // ==================================================
// 🔴 SIGUIENTE FOCO ROJO
// ==================================================

function manejarSiguienteFoco() {

  // ================================================
  // MARCAR EL ACTUAL COMO ATENDIDO
  // ================================================

  const nombreActual =
    promotorEnSeguimiento?.nombre;

  if (!nombreActual) {

    return false;

  }


  setFocosAtendidos(
    (actuales) => {

      if (
        actuales.includes(
          nombreActual
        )
      ) {

        return actuales;

      }

      return [
        ...actuales,
        nombreActual
      ];

    }
  );


  // ================================================
  // CALCULAR FOCOS ROJOS DEL EQUIPO
  // ================================================

  const equipo =
    registros.filter(
      (promotor) =>
        promotor.supervisor ===
        supervisorSeleccionado
    );


  const equipoConPrioridades =
    calcularPrioridades(
      equipo
    );


  const focosRojos =
    filtrarFocosRojos(
      equipoConPrioridades
    );


  // ================================================
  // QUITAR AUSENTES
  // ================================================

  const focosDisponibles =
    focosRojos.filter(
      (promotor) => {

        const esAusente =
          ausencias[
            promotor.nombre
          ];

        const yaAtendido =
          [
            ...focosAtendidos,
            nombreActual
          ].includes(
            promotor.nombre
          );

        return (
          !esAusente &&
          !yaAtendido
        );

      }
    );


  // ================================================
  // ORDENAR POR PRIORIDAD
  // ================================================

  const ordenados =
    ordenarPorPrioridad(
      [...focosDisponibles]
    );


  const siguiente =
    ordenados[0];


  // ================================================
  // EXISTE SIGUIENTE FOCO
  // ================================================

  if (siguiente) {

    setPromotorEnSeguimiento(
      siguiente
    );

    // IMPORTANTE:
    // seguimos en la misma vista.
    setVista(
      "checklistFocoRojo"
    );

    return true;

  }


  // ================================================
  // YA NO HAY MÁS FOCOS
  // ================================================

  setPromotorEnSeguimiento(
    null
  );

  setVista(
    "supervisor"
  );

  return false;

}


  // ==================================================
  // MOSTRAR LOGIN
  // ==================================================

  if (!logueado) {

    return (

      <Login
        onLogin={
          manejarLogin
        }
      />

    );

  }




  // ==================================================
// RANKING INICIAL DEL SUPERVISOR
// ==================================================

if (
  mostrarRankingInicial
) {

  return (

    <RankingSupervisores

      ranking={
        rankingSupervisores
      }

      supervisorSeleccionado={
        supervisorSeleccionado
      }

      inicial={
        true
      }

onContinuar={() => {

  setMostrarRankingInicial(
    false
  );

  setMostrarReconocimientoCL(
    true
);

}}

     
    />

  );

}


// ==================================================
// 🏆 RECONOCIMIENTO TOP 3 CL SALAMANCA
// ==================================================

if (
  mostrarReconocimientoCL &&
  top3Ranking.length > 0
) {

  console.log(
    "🔥 MOSTRANDO TOP 3 CL:",
    top3Ranking
  );

  return (

    <CLRecognition

      ranking={
        top3Ranking
      }

      onContinuar={() => {

        setMostrarReconocimientoCL(false);

        setMostrarRankingSupervisoresIntermedio(true);

      }}

    />

  );

}


// ==================================================
// 🏆 RANKING COMPLETO DE SUPERVISORES
// ==================================================

if (mostrarRankingSupervisoresIntermedio) {

  return (

    <div
      style={{
        minHeight: "100vh",
        background: "#f5f7fa",
        padding: "24px"
      }}
    >

      <div
        style={{
          maxWidth: "1100px",
          margin: "0 auto"
        }}
      >

        <div
          style={{
            background: "#ffffff",
            borderRadius: "18px",
            padding: "20px",
            boxShadow: "0 8px 28px rgba(0,0,0,0.10)"
          }}
        >

          <div
            style={{
              marginBottom: "16px",
              textAlign: "center"
            }}
          >

            <h1
              style={{
                margin: 0,
                fontSize: "28px",
                fontWeight: "900"
              }}
            >
              🏆 RANKING DE SUPERVISORES
            </h1>

            <p
              style={{
                margin: "8px 0 0",
                color: "#64748b",
                fontWeight: "600"
              }}
            >
              Así estás posicionado frente a los supervisores activos
            </p>

          </div>

          <RankingSupervisores

            ranking={
              rankingSupervisores
            }

          />

          <div
            style={{
              marginTop: "20px",
              display: "flex",
              justifyContent: "center"
            }}
          >

            <button
              type="button"
              onClick={() => {

                setMostrarRankingSupervisoresIntermedio(false);

                setMostrarFocosRojosIniciales(true);

              }}
              style={{
                border: "none",
                borderRadius: "12px",
                padding: "12px 24px",
                background: "#0f172a",
                color: "#ffffff",
                fontWeight: "800",
                cursor: "pointer",
                fontSize: "15px",
                boxShadow: "0 5px 16px rgba(0,0,0,0.16)"
              }}
            >
              CONTINUAR → FOCOS ROJOS
            </button>

          </div>

        </div>

      </div>

    </div>

  );

}


if (mostrarFocosRojosIniciales) {

  return (

   <FocosRojosIniciales

  registros={
    registros
  }

  supervisorSeleccionado={
    supervisorSeleccionado
  }

  rolUsuario={
    rolUsuario
  }

 onContinuar={() => {

  setMostrarFocosRojosIniciales(
    false
  );

  if (
    rolUsuario === "DIRECCIÓN"
  ) {

    setVista(
      "direccion"
    );

    return;

  }

  setVista(
    "supervisor"
  );

}}

/>

  );

}


 // ==================================================
  // EMPIEZA EL DASHBOARD
  // ==================================================

  


  // ==================================================
  // EQUIPO DEL SUPERVISOR
  // ==================================================

  const miEquipo =
    registros.filter(
      (registro) =>
        registro.supervisor ===
        supervisorSeleccionado
    );


  // ==================================================
  // DATOS DEL SUPERVISOR
  // ==================================================

  const datosSupervisor =
    miEquipo.find(
      (registro) =>
        Number.isFinite(
          Number(
            registro.presupuesto
          )
        )
    ) ?? null;


  // ==================================================
  // KPI
  // ==================================================

  const presupuesto =
    Number(
      datosSupervisor?.presupuesto ?? 0
    );


  const ventasMes =
    Number(
      datosSupervisor?.ventasMes ?? 0
    );


  const ventasFaltantes =
    Number(
      datosSupervisor?.ventasFaltantes ?? 0
    );


  const diasHabilesRestantes =
    Number(
      datosSupervisor?.diasHabilesRestantes ?? 0
    );


  const ventasPorDia =
    Number(
      datosSupervisor?.ventasPorDia ?? 0
    );


  // ==================================================
  // AVANCE VS PRESUPUESTO
  // ==================================================

  const porcentajePpto =
    presupuesto > 0

      ? (
          ventasMes /
          presupuesto
        ) * 100

      : 0;


  // ==================================================
// AVANCE DE SERVICIOS DEL SUPERVISOR
// ==================================================

const avanceServiciosSupervisor =
  rankingSupervisores.find(
    (registro) =>
      String(
        registro.supervisor || ""
      )
        .trim()
        .toUpperCase() ===
      String(
        supervisorSeleccionado || ""
      )
        .trim()
        .toUpperCase()
  ) || null;


const movilMes =
  Number(
    avanceServiciosSupervisor?.movil ?? 0
  );


const netflixMes =
  Number(
    avanceServiciosSupervisor?.netflix ?? 0
  );


const disneyMes =
  Number(
    avanceServiciosSupervisor?.disney ?? 0
  );


const maxMes =
  Number(
    avanceServiciosSupervisor?.max ?? 0
  );


  
  // ==================================================
  // VISTA PENETRACIÓN
  // ==================================================

  if (
    vista === "penetracion"
  ) {

    return (

      <div className="app">

        <PenetracionColonia

          registros={
            penetracion
          }

          setVista={
            setVista
          }

        />

      </div>

    );

  }


  // ==================================================
  // VISTA AVANCE SEMANAL
  // ==================================================

  if (
    vista === "avanceSemanal"
  ) {

    return (

      <div className="app">

  

       <AvanceSemanal

  supervisorSeleccionado={
    supervisorSeleccionado
  }

  setVista={
    setVista
  }

/>
      </div>

    );

  }


  // ==================================================
  // VISTA PLAN DE TRABAJO
  // ==================================================

  if (
    vista === "plan"
  ) {

    return (

      <div className="app">

        <PlanTrabajo

          planTrabajo={
            planTrabajo
          }

          supervisorSeleccionado={
            supervisorSeleccionado
          }

          setVista={
            setVista
          }

        />

      </div>

    );

  }


  // ==================================================
  // VISTA RANKING
  // ==================================================

  if (
    vista === "ranking"
  ) {

    return (

      <div className="app">

        <RankingCluster

          setVista={
            setVista
          }

          registros={
            rankingCL
          }

        />

      </div>

    );

  }


  // ==================================================
// 🔴 VISTA CHECKLIST FOCO ROJO
// ==================================================

if (
  vista === "checklistFocoRojo"
) {

  return (

<ChecklistFocoRojo

  promotor={
    promotorEnSeguimiento
  }

  supervisor={
    supervisorSeleccionado
  }

  onSiguienteFoco={
    manejarSiguienteFoco
  }

  onRegresar={() => {

    setPromotorEnSeguimiento(
      null
    );

    setVista(
      "supervisor"
    );

  }}

/>

  );

}


// ==================================================
// 👑 PANEL DE DIRECCIÓN
// ==================================================

if (
  vista === "direccion"
) {

  return (

    <PanelDireccion

      registros={
        registros
      }

      rankingSupervisores={
        rankingSupervisores
      }

      rankingCL={
        rankingCL
      }

      onCerrarSesion={
        cerrarSesion
      }

    />

  );

}

  // ==================================================
  // DASHBOARD
  // ==================================================

  return (

    <div className="app">

      <div className="card">


        {/* ==========================================
            ENCABEZADO
        ========================================== */}

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            marginBottom: "10px"
          }}
        >

          <button
            type="button"
            onClick={
              cerrarSesion
            }
            style={{
              border: "none",
              borderRadius: "10px",
              padding: "8px 14px",
              background: "#b91c1c",
              color: "#fff",
              fontWeight: "700",
              cursor: "pointer",
              boxShadow:
                "0 3px 10px rgba(0,0,0,0.12)"
            }}
          >
            🚪 Cerrar sesión
          </button>

        </div>

        <Header />


        {/* ==========================================
            BIENVENIDA
        ========================================== */}

        <WelcomeCard

          supervisorSeleccionado={
            supervisorSeleccionado
          }

        />


        {/* ==========================================
            MENÚ
        ========================================== */}

        <MenuButtons

          setVista={
            setVista
          }

        />


        {/* ==========================================
            KPI — VENTAS DEL MES
        ========================================== */}

       <KPICard

  icono="📈"

  titulo="Venta vs Ppto"

  valor={
    `${ventasMes} / ${presupuesto}`
  }

  detalle={

    <>

      <strong>
        🎯 Avance vs presupuesto
      </strong>


      <br />


      <span className="avance-kpi">

        {porcentajePpto.toFixed(1)}%

      </span>


      <br />


      <span className="faltante-kpi">

        {ventasFaltantes > 0

          ? `🔴 Faltan ${ventasFaltantes} ventas`

          : "🟢 ¡Presupuesto alcanzado!"

        }

      </span>


      {/* ========================================
          AVANCE DE SERVICIOS
      ======================================== */}

      <div className="kpi-servicios-separador" />


      <div className="kpi-servicios-titulo">

        📦 Avance de servicios del mes

      </div>


      <div className="kpi-servicios-grid">


        <div className="kpi-servicio">

          <span>
            📱 MÓVIL
          </span>

          <strong>
            {movilMes}
          </strong>

        </div>


        <div className="kpi-servicio">

          <span>
            🎬 NETFLIX
          </span>

          <strong>
            {netflixMes}
          </strong>

        </div>


        <div className="kpi-servicio">

          <span>
            ✨ Disney+
          </span>

          <strong>
            {disneyMes}
          </strong>

        </div>


        <div className="kpi-servicio">

          <span>
            🎞️ MAX
          </span>

          <strong>
            {maxMes}
          </strong>

        </div>


      </div>

    </>

  }

/>


        {/* ==========================================
            KPI — RITMO NECESARIO
        ========================================== */}

 <KPICard

  icono="🔥"

  titulo="Ritmo necesario"

  valor={

    <>

      <span className="ritmo-numero">

        {ventasPorDia}

      </span>

      <span className="ritmo-unidad " >

          VENTAS DIARIAS

      </span>

    </>

  }

  detalle={

    `TE QUEDAN ${diasHabilesRestantes} DÍAS HÁBILES RESTANTES`

  }

/>


        {/* ==========================================
            CONTENIDO PRINCIPAL
        ========================================== */}

        <div className="performance-grid">


          {/* ========================================
              FOCOS ROJOS
          ======================================== */}

          <FocusAlerts

  registros={
    registros
  }

  supervisorSeleccionado={
    supervisorSeleccionado
  }

  ausencias={
    ausencias
  }

  setAusencias={
    setAusencias
  }


  // ==========================================
  // 🔴 INICIAR SEGUIMIENTO
  // ==========================================

  onIniciarSeguimiento={(promotor) => {

    setPromotorEnSeguimiento(
      promotor
    );

    setVista(
      "checklistFocoRojo"
    );

  }}


  // ==========================================
  // 🔴 PASAR AL SIGUIENTE FOCO
  // ==========================================

  onSiguienteFoco={
    manejarSiguienteFoco
  }

/>


          {/* ========================================
              RANKINGS
          ======================================== */}

          <div className="rankings-dashboard">


            {/* RANKING MI EQUIPO */}

            <HonorBoard

              registros={
                miEquipo
              }

              titulo="🏆 Ranking Mi Equipo"

            />


            {/* RANKING CL */}

            <HonorBoard

              registros={
                top3Ranking
              }

              titulo="🏆 Ranking CL Salamanca"

            />
            
            </div>


          {/* ========================================
              EQUIPO
          ======================================== */}

          <TeamTable

            registros={
              registros
            }

            supervisorSeleccionado={
              supervisorSeleccionado
            }

          />

          {/* ==========================================
    RANKING DE SUPERVISORES
========================================== */}

<RankingSupervisores

  ranking={
    rankingSupervisores
  }

  supervisorSeleccionado={
    supervisorSeleccionado
  }

/>


        </div>


      </div>

    </div>

  );

}


export default App;
