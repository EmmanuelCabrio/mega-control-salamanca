import {
  useEffect,
  useState,
} from "react";

import {
  fetchProtegido,
} from "../services/authService";


function formatearFecha(
  fecha
) {

  if (
    !fecha
  ) {

    return "";

  }


  const valor =
    new Date(
      Date.UTC(
        fecha.anio,
        fecha.mes - 1,
        fecha.dia
      )
    );


  return new Intl.DateTimeFormat(
    "es-MX",
    {

      weekday:
        "long",

      day:
        "numeric",

      month:
        "long",

      timeZone:
        "UTC",

    }
  ).format(
    valor
  );

}


function MetaSemanaAnteriorDireccion() {

  const [
    datos,
    setDatos,
  ] = useState(null);


  const [
    cargando,
    setCargando,
  ] = useState(true);


  const [
    error,
    setError,
  ] = useState("");


  // ==================================================
  // CARGAR INFORMACIÓN
  // ==================================================

  useEffect(() => {

    async function cargarMeta() {

      try {

        setCargando(true);

        setError("");


        const respuesta =
          await fetchProtegido(
            "/api/meta-semana-anterior"
          );


        const resultado =
          await respuesta.json();


        if (
          !respuesta.ok ||
          !resultado.correcto
        ) {

          throw new Error(
            resultado.mensaje ||
            "No se pudo cargar la referencia"
          );

        }


        setDatos(
          resultado
        );

      } catch (errorCarga) {

        console.error(
          "❌ Error meta Dirección:",
          errorCarga
        );


        setError(
          errorCarga.message ||
          "No se pudo cargar la referencia"
        );

      } finally {

        setCargando(false);

      }

    }


    cargarMeta();

  }, []);


  // ==================================================
  // CARGANDO
  // ==================================================

  if (
    cargando
  ) {

    return (

      <section
        className="
          meta-semana-direccion-estado
        "
      >

        Calculando resultados de la semana anterior…

      </section>

    );

  }


  // ==================================================
  // ERROR
  // ==================================================

  if (
    error
  ) {

    return (

      <section
        className="
          meta-semana-direccion-estado
          meta-semana-error
        "
      >

        {error}

      </section>

    );

  }


  const supervisores =
    datos?.supervisores ||
    [];


  // ==================================================
  // RENDER
  // ==================================================

  return (

    <section className="meta-semana-direccion">


      {/* ==========================================
          ENCABEZADO
      ========================================== */}

      <div
        className="
          meta-semana-direccion-header
        "
      >

        <div>

          <span>
            REFERENCIA DE HOY
          </span>


          <h2>

            Emmanuel, al menos hoy tus supervisores
            van por este resultado

          </h2>


          <p>

            Resultado obtenido el{" "}

            {formatearFecha(
              datos?.fechaReferencia
            )}

            .

          </p>

        </div>


        <strong>

          {Number(
            datos?.total ||
            0
          ).toLocaleString(
            "es-MX"
          )}

          <small>
            ventas totales
          </small>

        </strong>

      </div>


      {/* ==========================================
          TABLA
      ========================================== */}

      <div
        className="
          meta-semana-direccion-tabla-contenedor
        "
      >

        <table
          className="
            meta-semana-direccion-tabla
          "
        >

          <thead>

            <tr>

              <th>
                Supervisor
              </th>

              <th>
                Resultado MDSA
              </th>

            </tr>

          </thead>


          <tbody>

            {supervisores.map(
              (registro) => (

                <tr
                  key={
                    registro.clave
                  }
                >

                  <td>

                    {registro.supervisor}

                  </td>


                  <td>

                    <strong>

                      {Number(
                        registro.resultado ||
                        0
                      ).toLocaleString(
                        "es-MX"
                      )}

                    </strong>

                  </td>

                </tr>

              )
            )}

          </tbody>


          {/* ========================================
              TOTAL
          ======================================== */}

          <tfoot>

            <tr>

              <td>
                TOTAL
              </td>

              <td>

                {Number(
                  datos?.total ||
                  0
                ).toLocaleString(
                  "es-MX"
                )}

              </td>

            </tr>

          </tfoot>

        </table>

      </div>


    </section>

  );

}


export default MetaSemanaAnteriorDireccion;
