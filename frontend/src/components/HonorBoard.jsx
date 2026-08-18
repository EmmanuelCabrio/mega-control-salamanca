import HonorCard from "./HonorCard";

import {
  filtrarCuadroHonor,
  ordenarPorProductividad,
} from "../utils/prioridades";


function HonorBoard({
  registros = [],
  titulo = "🏆 Cuadro de Honor",
}) {

  // ==================================================
  // FILTRAR Y ORDENAR CUADRO DE HONOR
  // ==================================================

  const equipoElegible =
    filtrarCuadroHonor(
      registros
    );


  const lista =
    ordenarPorProductividad(
      equipoElegible
    ).slice(0, 3);


  // ==================================================
  // RENDER
  // ==================================================

  return (

    <div className="honor-board">

      <h2 className="honor-tittle">
        {titulo}
      </h2>


      {lista.map(
        (promotor, index) => (

          <HonorCard
            key={promotor.nombre}
            promotor={promotor}
            posicion={index}
          />

        )
      )}

    </div>

  );

}


export default HonorBoard;