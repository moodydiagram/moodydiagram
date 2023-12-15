document.addEventListener("DOMContentLoaded", function () {
  const canvas = document.getElementById("moodyCanvas");
  const ctx = canvas.getContext("2d");
  const moodyImage = document.getElementById("moodyImage");
  const viewport = window.visualViewport;

  const sliderRe = document.getElementById("reslider");
  const outputRe = document.getElementById("redemo");
  const sliderRo = document.getElementById("roughnessslider");
  const outputRo = document.getElementById("roughnessdemo");
  const outputF = document.getElementById("fdarcydemo");

  let linesActive = true;
  let reVar, eVar;

  sliderRe.addEventListener("input", updateValues);
  sliderRo.addEventListener("input", updateValues);

  outputRe.addEventListener("input", updateValues2);
  outputRo.addEventListener("input", updateValues2);

  moodyImage.addEventListener("load", function () {
    setCanvas();
    updateValues();
  });

  function updateValues2() {
    reVar = outputRe.value;
    eVar = outputRo.value;
    var sliderReValue = calculateSliderValue(reVar)
    var sliderEValue = 100000 * eVar

    sliderRe.setAttribute('value', sliderReValue);
    sliderRe.value = sliderReValue;
    sliderRo.setAttribute('value', sliderEValue);
    sliderRo.value = sliderEValue;
    const fVar = moody(reVar, eVar, 10);
    outputF.innerHTML = fVar.toFixed(10);

    const { x, y } = calcularCordenadas(reVar, fVar);
    drawReferenceLine(x, y);
    drawFactorCurve(reVar, eVar);
  }

  viewport.addEventListener("resize", setCanvas);

  const timestamp = new Date().getTime();
  moodyImage.src = "moody.png?t=" + timestamp;

  function calculateReynolds(sliderValue) {
    return Math.trunc(Math.pow(10.0, sliderValue / 10000.0));
  }

  function calculateSliderValue(re) {
    return Math.log10(re) * 10000;
  }

  function updateValues() {
    reVar = calculateReynolds(sliderRe.value);
    eVar = sliderRo.value / 100000.0;

    outputRe.setAttribute('value', reVar);
    outputRe.value = reVar;
    outputRo.setAttribute('value', eVar);
    outputRo.value = eVar;
    const fVar = moody(reVar, eVar, 10);
    outputF.innerHTML = fVar.toFixed(15);

    const { x, y } = calcularCordenadas(reVar, fVar);
    drawReferenceLine(x, y);
    drawFactorCurve(reVar, eVar);
  }

  function moody(Re, rel_e, n) {
    if (Re <= 2300) {
      return 64 / Re;
    }

    if (Re < 4000) {
      return "transition flow";
    }

    let x = 0;
    let y = 0;
    let y_prime = 0;
    let A = rel_e / 3.7;
    let B = 2.51 / Re;

    if (n === undefined) {
      n = 3;
    }

    x = -1.8 * Math.log10((6.9 / Re) + Math.pow(A, 1.11));

    for (let i = 1; i <= n; i++) {
      y = x + 2 * Math.log10(A + B * x);
      y_prime = 1 + 2 * (B / Math.log(10)) / (A + B * x);
      x = x - y / y_prime;
    }

    return 1 / (x * x);
  }

  function checkPosition(mouseX, mouseY) {
    const minX = 0.07 * canvas.width;
    const maxX = 0.91 * canvas.width;
    const minY = 0.069 * canvas.height;
    const maxY = 0.9175 * canvas.height;
    const res = (mouseY > minY && mouseY < maxY && mouseX > minX && mouseX < maxX);

    return { res, minX, minY, maxX, maxY };
  }

  function drawReferenceLine(x, y) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const { res, minX, minY, maxX, maxY } = checkPosition(x, y);

    let x1 = x + (maxY - minY) * 0.02
    if (x1 > maxX) {
      x1 = maxX;
    }

    let y1 = y - (maxY - minY) * 0.02
    if (y1 < minY) {
      y1 = minY;
    }

    if (res) {
      ctx.beginPath();
      ctx.moveTo(x, y1);
      ctx.lineTo(x, maxY);
      ctx.strokeStyle = "red";
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(minX, y);
      ctx.lineTo(x1, y);
      ctx.strokeStyle = "blue";
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }

  function drawFactorCurve(re, epsilon) {
    ctx.beginPath();

    if (re <= 2300) {
      var { x, y } = calcularCordenadas(640, moody(640, 0))
      ctx.moveTo(x, y);
      var { x, y } = calcularCordenadas(2300, moody(2300, 0))
      ctx.lineTo(x, y);
    } else {
      let reMinEscalado = 36021;
      let reMin = Math.pow(10.0, reMinEscalado / 10000.0)
      let fDarcy = moody(reMin, epsilon, 10)
      var { x, y } = calcularCordenadas(reMin, fDarcy)
      ctx.moveTo(x, y);

      for (let reEscalado = reMinEscalado; reEscalado <= 80661; reEscalado += 661) {
        let reTest = Math.pow(10.0, reEscalado / 10000.0);
        fDarcy = moody(reTest, epsilon, 10);
        if (fDarcy < 0.008) {
          break;
        }
        var { x, y } = calcularCordenadas(reTest, fDarcy);
        ctx.lineTo(x, y);
      }
    }

    ctx.strokeStyle = "red";
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  function calcularCordenadas(Re, f) {
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

    const xCoord = canvas.width / D * (Math.log10(Re) - Math.log10(C))
    const yCoord = canvas.height / B * (Math.log10(f) - Math.log10(A))

    return { x: xCoord, y: yCoord };
  }

  function setCanvas() {
    canvas.width = moodyImage.width;
    canvas.height = moodyImage.height;
    //indicador.style.top = `${canvas.height}px`;
    //indicador.style.left = `${0.1 * canvas.width}px`;
  }
});
