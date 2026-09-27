function MenuButtons({ setVista }) {

  return (

    <div className="botones">


      {/* ==========================================
          PLAN DE TRABAJO
      ========================================== */}

      <button
        className="boton"
        onClick={() =>
          setVista("plan")
        }
      >

        📊 Plan de trabajo

      </button>


      {/* ==========================================
          AVANCE SEMANAL
      ========================================== */}

      <button
        className="boton avance-semanal"
        onClick={() =>
          setVista("avanceSemanal")
        }
      >

        📈 Avance semanal

      </button>



            {/* ==========================================
          RESULTADO DIARIO DEL EQUIPO
      ========================================== */}

      <button
        className="boton"
        onClick={() =>
          setVista(
            "detalleEquipoDiario"
          )
        }
      >

        📅 Resultado diario del equipo

      </button>


      {/* ==========================================
          PENETRACIÓN POR COLONIA
      ========================================== */}

      <button
        className="boton penetracion"
        onClick={() =>
          setVista("penetracion")
        }
      >

        🎯 Penetración por colonia

      </button>


      {/* ==========================================
          RANKING CLÚSTER
      ========================================== */}

      <button
        className="boton ranking"
        onClick={() =>
          setVista("ranking")
        }
      >

        🏆 Tabla General 

      </button>

    </div>

  );

}


export default MenuButtons;
