document.addEventListener("DOMContentLoaded", function () {
  const canvas = document.getElementById("moodyCanvas");
  const ctx = canvas.getContext("2d");
  const moodyImage = document.getElementById("moodyImage");
  const reynoldsElem = document.getElementById("reynolds");
  const fdarcyElem = document.getElementById("fdarcy");
  let linesActive = true;
  const viewport = window.visualViewport;

  // Función para dibujar las líneas de referencia
  function drawReferenceLine(x, y) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const minX = 0.07 * canvas.width;
    const maxX = 0.91 * canvas.width;
    const minY = 0.069 * canvas.height;
    const maxY = 0.9175 * canvas.height;

    if (y > minY && y < maxY && x > minX && x < maxX) {
      ctx.beginPath();
      ctx.moveTo(x, minY);
      ctx.lineTo(x, maxY);
      ctx.strokeStyle = "red";
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(minX, y);
      ctx.lineTo(maxX, y);
      ctx.strokeStyle = "red";
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }

  function calcularReynolds(mouseX, mouseY, canvas) {
    const x1 = 0.10962128810043101;
    const x2 = 0.8771750255885363;
    const y1 = 0.09;
    const y2 = 0.009;
    const B = Math.log10(y1 / y2) / (x1 - x2);
    const A = Math.pow(10, (x2 * Math.log10(y1) - x1 * Math.log10(y2)) / (x2 - x1));

    const x3 = 0.7488355428161949;
    const x4 = 0.11107130060910068;
    const y3 = 7;
    const y4 = 3;
    const D = (y3 - y4) / (x3 - x4);
    const C = Math.pow(10, (x4 * y3 - x3 * y4) / (x4 - x3));

    const reynolds = Math.trunc(C * Math.pow(10, D * mouseX / canvas.width));
    const factorFriccion = (A * Math.pow(10, B * mouseY / canvas.height)).toFixed(6);

    return { reynolds, factorFriccion };
  }

  function handleMouseMove(event) {
    if (linesActive) {
      const rect = canvas.getBoundingClientRect();
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;

      drawReferenceLine(mouseX, mouseY);

      const { reynolds, factorFriccion } = calcularReynolds(mouseX, mouseY, canvas);

      console.log(`(${mouseX / canvas.width}, ${mouseY / canvas.height})`);
      console.log(`(${reynolds}, ${factorFriccion})`);

      reynoldsElem.textContent = `Re = ${reynolds}`;
      fdarcyElem.textContent = `f = ${factorFriccion}`;
    }
  }


  // Función para cambiar el estado de las líneas
  function toggleLines() {
    linesActive = !linesActive;
  }

  // Función para ajustar el tamaño del canvas
  function setCanvas() {
    canvas.width = moodyImage.width;
    canvas.height = moodyImage.height;
  }

  // Eventos
  moodyImage.addEventListener("load", setCanvas);
  viewport.addEventListener("resize", setCanvas);

  canvas.addEventListener("mousemove", handleMouseMove);
  canvas.addEventListener("click", toggleLines);

  const timestamp = new Date().getTime();
  moodyImage.src = "moody.png?t=" + timestamp;
});
