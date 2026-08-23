// ==================================================
// PRIORIDADES DE ATENCIÓN
// ==================================================

export const PRIORIDADES = {

  DIAS_SIN_VENTA: 70,

  PRODUCTIVIDAD_BAJA: 20,

  SIN_RECUPERACIONES: 10,

};


// ==================================================
// CALCULAR PRIORIDAD DE UN PROMOTOR
// ==================================================

function calcularPrioridad(promotor) {

  let puntos = 0;


  // ----------------------------------------------
  // DÍAS SIN VENTA
  // ----------------------------------------------

  if (promotor.diasSinVenta >= 3) {

    puntos +=
      PRIORIDADES.DIAS_SIN_VENTA;

  }


  // ----------------------------------------------
  // PRODUCTIVIDAD BAJA
  // ----------------------------------------------

  if (promotor.productividad < 0.80) {

    puntos +=
      PRIORIDADES.PRODUCTIVIDAD_BAJA;

  }


  // ----------------------------------------------
  // SIN RECUPERACIONES
  // ----------------------------------------------

  if (promotor.recuperaciones === 0) {

    puntos +=
      PRIORIDADES.SIN_RECUPERACIONES;

  }


  return puntos;

}


// ==================================================
// FILTRAR FOCOS ROJOS
// ==================================================

export function filtrarFocosRojos(
  promotores
) {

  return promotores.filter(
    (promotor) =>
      promotor.prioridad > 0
  );

}


// ==================================================
// OBTENER ALERTA PRINCIPAL
// ==================================================

function obtenerAlerta(promotor) {

  // ----------------------------------------------
  // DÍAS SIN VENTA
  // ----------------------------------------------

  if (promotor.diasSinVenta >= 3) {

    return {

      icono: "🔴",

      motivo:
        `${promotor.diasSinVenta} días sin vender`,

    };

  }


  // ----------------------------------------------
  // PRODUCTIVIDAD BAJA
  // ----------------------------------------------

  if (promotor.productividad < 0.80) {

    return {

      icono: "🟠",

      motivo:
        `Productividad ${Number(
          promotor.productividad
        ).toFixed(2)}`,

    };

  }


  // ----------------------------------------------
  // SIN RECUPERACIONES
  // ----------------------------------------------

  if (promotor.recuperaciones === 0) {

    return {

      icono: "🟠",

      motivo:
        "Sin Recuperaciones en el mes",

    };

  }


  return {

    icono: "",

    motivo: "",

  };

}


// ==================================================
// OBTENER TODOS LOS DETALLES
// ==================================================

function obtenerDetalles(promotor) {

  const detalles = [];


  // ----------------------------------------------
  // DÍAS SIN VENTA
  // ----------------------------------------------

  if (promotor.diasSinVenta >= 3) {

    detalles.push(
      `${promotor.diasSinVenta} días sin vender`
    );

  }


  // ----------------------------------------------
  // PRODUCTIVIDAD
  // ----------------------------------------------

  if (promotor.productividad < 0.80) {

    detalles.push(
      `Productividad ${Number(
        promotor.productividad
      ).toFixed(2)}`
    );

  }


  // ----------------------------------------------
  // RECUPERACIONES
  // ----------------------------------------------

  if (promotor.recuperaciones === 0) {

    detalles.push(
      "Sin RX en el mes"
    );

  }


  return detalles;

}


// ==================================================
// FILTRAR CUADRO DE HONOR
// ==================================================

export function filtrarCuadroHonor(
  promotores
) {

  return promotores.filter(
    (promotor) =>
      promotor.productividad >= 1.0
  );

}


// ==================================================
// ORDENAR POR PRODUCTIVIDAD
// ==================================================

export function ordenarPorProductividad(
  promotores
) {

  return [...promotores].sort(
    (promotorA, promotorB) =>
      promotorB.productividad -
      promotorA.productividad
  );

}


// ==================================================
// CALCULAR TODAS LAS PRIORIDADES
// ==================================================

export function calcularPrioridades(
  promotores
) {

  return promotores.map(
    (promotor) => {

      const prioridad =
        calcularPrioridad(
          promotor
        );


      const alerta =
        obtenerAlerta(
          promotor
        );


      const detalles =
        obtenerDetalles(
          promotor
        );


      return {

        ...promotor,

        prioridad,

        ...alerta,

        detalles,

      };

    }
  );

}


// ==================================================
// ORDENAR POR PRIORIDAD
// ==================================================

export function ordenarPorPrioridad(
  promotores
) {

  return [...promotores].sort(
    (promotorA, promotorB) =>
      promotorB.prioridad -
      promotorA.prioridad
  );

}


// ==================================================
// NIVEL DE PRODUCTIVIDAD
// ==================================================

export function obtenerNivelProductividad(
  productividad
) {

  if (productividad >= 1.5) {

    return "nivel-verde-fuerte";

  }


  if (productividad >= 1.0) {

    return "nivel-verde";

  }


  if (productividad >= 0.8) {

    return "nivel-amarillo";

  }


  if (productividad >= 0.6) {

    return "nivel-naranja";

  }


  if (productividad > 0) {

    return "nivel-rojo";

  }


  return "nivel-rojo-fuerte";

}


// ==================================================
// OBTENER FOCO MÁS CRÍTICO POR SUPERVISOR
// ==================================================

export function obtenerFocoCriticoSupervisor(
  registros,
  supervisor
) {

  const equipo =
    registros.filter(
      (promotor) =>
        promotor.supervisor ===
        supervisor
    );


  const equipoConPrioridades =
    calcularPrioridades(
      equipo
    );


  const focosRojos =
    filtrarFocosRojos(
      equipoConPrioridades
    );


  const lista =
    ordenarPorPrioridad(
      [...focosRojos]
    );


  return (
    lista[0] ||
    null
  );

}
