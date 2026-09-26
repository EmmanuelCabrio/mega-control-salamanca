function KPICard({
  icono,
  titulo,
  valor,
  detalle,
  className = "",
}) {

  return (

    <div
      className={
        `sales-summary ${className}`.trim()
      }
    >

      <div className="kpi-encabezado">

        <span className="kpi-icono">
          {icono}
        </span>

        <h2>
          {titulo}
        </h2>

      </div>


      <div className="kpi-valor">
        {valor}
      </div>


      <div className="kpi-detalle">
        {detalle}
      </div>

    </div>

  );

}


export default KPICard;
