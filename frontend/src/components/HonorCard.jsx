function HonorCard({
  promotor,
  posicion,
}) {

  // ==================================================
  // MEDALLA SEGÚN LA POSICIÓN
  // ==================================================

  const medallas = {
    1: "🥇",
    2: "🥈",
    3: "🥉",
  };


  const lugar =
    posicion + 1;


  return (

    <div
      className={`honor-card lugar-${lugar}`}
    >

      {/* ==========================================
          MEDALLA
      ========================================== */}

      <span className="honor-medalla">
        {medallas[lugar]}
      </span>


      {/* ==========================================
          INFORMACIÓN DEL PROMOTOR
      ========================================== */}

      <div className="honor-info">

        <strong className="honor-nombre">
          {promotor.nombre}
        </strong>


        <p className="honor-productividad">
          Productividad:{" "}
          {Number(
            promotor.productividad
          ).toFixed(2)}
        </p>

      </div>

    </div>

  );

}


export default HonorCard;