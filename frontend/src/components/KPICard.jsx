function KPICard({
  icono,
  titulo,
  valor,
  detalle,
}) {

  return (

    <div className="sales-summary">

      <h2>
        {icono} {titulo}
      </h2>


      <h1>
        {valor}
      </h1>


      <div className="kpi-detalle">
        {detalle}
      </div>

    </div>

  );

}


export default KPICard;