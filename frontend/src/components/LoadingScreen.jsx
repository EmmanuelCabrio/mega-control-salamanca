import { useEffect, useState } from "react";


// ==================================================
// FRASES MOTIVACIONALES
// ==================================================

const frases = [

  "🚀 Preparando tu tablero de ventas...",

  "📊 Cargando información comercial...",

  "🎯 Calculando tus indicadores...",

  "🔥 Analizando el desempeño de tu equipo...",

  "🏆 Preparando el ranking del clúster...",

  "💪 Cada venta cuenta. Vamos por el objetivo...",

  "⚡ Cargando inteligencia comercial...",

  "📈 Analizando el avance contra presupuesto...",

  "🧠 Organizando la información para ti...",

  "🚀 El mejor resultado comienza con un buen seguimiento...",

  "🎯 Enfócate en lo que sí puedes controlar...",

  "🔥 Los grandes equipos no esperan resultados, los construyen...",

  "🏆 Preparando todo para que tomes mejores decisiones...",

  "💼 Tu equipo está a punto de entrar en acción...",

  "🥇 Hoy es un buen día para superar el objetivo...",

];


// ==================================================
// PANTALLA DE CARGA
// ==================================================

function LoadingScreen() {

  const [frase, setFrase] = useState(
    frases[
      Math.floor(
        Math.random() * frases.length
      )
    ]
  );


  // ==================================================
  // CAMBIAR FRASE CADA 2.5 SEGUNDOS
  // ==================================================

  useEffect(() => {

    const intervalo = setInterval(() => {

      setFrase(
        frases[
          Math.floor(
            Math.random() * frases.length
          )
        ]
      );

    }, 2500);


    return () => {

      clearInterval(
        intervalo
      );

    };

  }, []);


  // ==================================================
  // RENDER
  // ==================================================

  return (

    <div className="loading-container">

      <div className="loading-card">

        {/* ==========================================
            LOGO
        ========================================== */}

        <div className="loading-logo">
          MEGA
        </div>


        {/* ==========================================
            CÍRCULO ANIMADO
        ========================================== */}

        <div className="loading-spinner">
          <div></div>
        </div>


        {/* ==========================================
            TÍTULO
        ========================================== */}

        <h1>
          SEGUIMIENTO 2.0
        </h1>


        {/* ==========================================
            FRASE DINÁMICA
        ========================================== */}

        <p
          key={frase}
          className="loading-frase"
        >
          {frase}
        </p>


        {/* ==========================================
            ESTADO
        ========================================== */}

        <span className="loading-status">
          Preparando información...
        </span>

      </div>

    </div>

  );

}


export default LoadingScreen;