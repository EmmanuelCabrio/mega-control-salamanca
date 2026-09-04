import {
  useRef,
} from "react";


// ==================================================
// ✍️ CUADRO DE FIRMA REUTILIZABLE
// ==================================================

function SignaturePad({
  canvasRef,
  label,
  setFirmado,
  styles,
}) {

  const drawing =
    useRef(false);


  // ================================================
  // OBTENER CONTEXTO DEL CANVAS
  // ================================================

  const obtenerContexto = () => {

    const canvas =
      canvasRef.current;

    if (!canvas) {
      return null;
    }

    return canvas.getContext("2d");

  };


  // ================================================
  // OBTENER POSICIÓN DEL MOUSE O DEDO
  // ================================================

  const obtenerPosicion = (
    evento
  ) => {

    const canvas =
      canvasRef.current;

    if (!canvas) {

      return {
        x: 0,
        y: 0,
      };

    }

    const rect =
      canvas.getBoundingClientRect();

    const punto =
      evento.touches?.[0] ||
      evento.changedTouches?.[0] ||
      evento;

    return {

      x:
        (
          punto.clientX -
          rect.left
        ) *
        (
          canvas.width /
          rect.width
        ),

      y:
        (
          punto.clientY -
          rect.top
        ) *
        (
          canvas.height /
          rect.height
        ),

    };

  };


  // ================================================
  // COMENZAR FIRMA
  // ================================================

  const iniciarDibujo = (
    evento
  ) => {

    evento.preventDefault();

    const contexto =
      obtenerContexto();

    if (!contexto) {
      return;
    }

    const posicion =
      obtenerPosicion(
        evento
      );

    drawing.current =
      true;

    contexto.beginPath();

    contexto.moveTo(
      posicion.x,
      posicion.y
    );

  };


  // ================================================
  // DIBUJAR FIRMA
  // ================================================

  const dibujar = (
    evento
  ) => {

    evento.preventDefault();

    if (!drawing.current) {
      return;
    }

    const contexto =
      obtenerContexto();

    if (!contexto) {
      return;
    }

    const posicion =
      obtenerPosicion(
        evento
      );

    contexto.lineWidth =
      2.5;

    contexto.lineCap =
      "round";

    contexto.lineJoin =
      "round";

    contexto.strokeStyle =
      "#17202a";

    contexto.lineTo(
      posicion.x,
      posicion.y
    );

    contexto.stroke();

  };


  // ================================================
  // TERMINAR FIRMA
  // ================================================

  const terminarDibujo = (
    evento
  ) => {

    if (evento) {
      evento.preventDefault();
    }

    if (drawing.current) {

      setFirmado(true);

    }

    drawing.current =
      false;

  };


  // ================================================
  // LIMPIAR ÚNICAMENTE ESTA FIRMA
  // ================================================

  const limpiarFirma = () => {

    const canvas =
      canvasRef.current;

    if (!canvas) {
      return;
    }

    const contexto =
      canvas.getContext("2d");

    contexto.clearRect(
      0,
      0,
      canvas.width,
      canvas.height
    );

    setFirmado(false);

  };


  // ================================================
  // MOSTRAR CUADRO DE FIRMA
  // ================================================

  return (

    <div style={styles.signatureBox}>

      <div style={styles.signatureTitle}>
        {label}
      </div>

      <div style={styles.signatureInstruction}>
        Firma dentro del recuadro
      </div>

      <div style={styles.canvasWrapper}>

        <canvas
          ref={canvasRef}
          width={900}
          height={220}
          style={styles.signatureCanvas}

          onMouseDown={
            iniciarDibujo
          }

          onMouseMove={
            dibujar
          }

          onMouseUp={
            terminarDibujo
          }

          onMouseLeave={
            terminarDibujo
          }

          onTouchStart={
            iniciarDibujo
          }

          onTouchMove={
            dibujar
          }

          onTouchEnd={
            terminarDibujo
          }

          onTouchCancel={
            terminarDibujo
          }
        />

        <div style={styles.signatureLine}>
          Firma
        </div>

      </div>

      <button
        type="button"
        onClick={limpiarFirma}
        style={styles.clearSignatureButton}
      >
        🧹 Limpiar firma
      </button>

    </div>

  );

}


export default SignaturePad;
