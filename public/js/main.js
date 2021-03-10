// const canvasEl = document.querySelector("#canvas");
// const ctx = canvasEl.getContext("2d");

// // ctx.fillRect(10, 10, 10, 100);

// ctx.beginPath();
// ctx.strokeStyle = "blue";
// ctx.lineTo(10, 10);
// ctx.lineTo(100, 100);
// ctx.lineTo(0, 100);
// ctx.stroke();

let canvasEl = null;
let ctx = null;
let cursorEl = null;
let isMouseDown = false;
let selectedTool = "pen";
let colorsEl = null;
let rubberEl = null;
let selectedColor = "black";
let penPoints = [];
let rubberPoints = [];
const rubberDetails = {
  offset: 10,
  length: 21,
};

const init = () => {
  canvasEl = document.querySelector("#canvas");
  ctx = canvasEl.getContext("2d");

  colorsEl = document.querySelector(".colors");
  rubberEl = document.querySelector(".rubber");

  cursorEl = document.querySelector(".cursor");

  const socket = io();

  socket.on("s-draw-pen", ({ color, tool, penPoints }) => {
    console.log("tool", tool);
    ctx.beginPath();
    if (tool === "pen") {
      ctx.strokeStyle = color;
      penPoints.forEach(({ posX, posY }) => {
        ctx.lineTo(posX, posY);
      });
    }
    if (tool === "rubber") {
      ctx.fillStyle = "white";
      penPoints.forEach(({ posX, posY }) => {
        ctx.fillRect(
          posX - rubberDetails.offset,
          posY - rubberDetails.offset,
          rubberDetails.length,
          rubberDetails.length
        );
      });
    }

    ctx.strokeStyle = selectedColor;

    ctx.stroke();
  });

  socket.on("s-blank-canvas", () => {
    ctx.beginPath();
    ctx.fillStyle = "white";
    console.log("canvasEl.width", canvasEl.width);
    console.log("canvasEl.heh", canvasEl.height);
    ctx.fillRect(0, 0, canvasEl.width, canvasEl.height);
  });

  document.addEventListener("mousemove", (e) => {
    if (e.pageX < 20) {
      cursorEl.style.display = "none";
      return;
    }
    if (selectedTool === "rubber" && e.pageX > 20) {
      cursorEl.style.display = "block";
      cursorEl.style.top = `${e.pageY - rubberDetails.offset}px`;
      cursorEl.style.left = `${e.pageX - rubberDetails.offset}px`;
    }
  });

  colorsEl.addEventListener("click", ({ target }) => {
    if (!target.matches("li")) {
      return;
    }

    canvasEl.classList.remove('rubber-cursor')
    cursorEl.style.display = "none";

    selectedTool = "pen";

    const color = target.classList.value;
    selectedColor = color;
  });

  rubberEl.addEventListener("click", () => {
    console.log("Rubber selected");
    canvasEl.classList.add('rubber-cursor')
    cursorEl.style.display = "block";
    selectedTool = "rubber";
  });

  canvasEl.addEventListener("mousedown", () => {
    ctx.beginPath();
    penPoints = [];
    rubberPoints = [];
    if (selectedTool === "pen") {
      ctx.strokeStyle = selectedColor;
    }

    isMouseDown = true;
  });

  canvasEl.addEventListener("mouseup", () => {
    isMouseDown = false;

    socket.emit("c-draw-pen", {
      color: selectedColor,
      tool: selectedTool,
      penPoints,
    });
  });

  canvasEl.addEventListener("mousemove", ({ layerX, layerY }) => {
    if (!ctx) {
      return;
    }

    if (!isMouseDown) {
      return;
    }

    if (selectedTool === "pen") {
      ctx.lineTo(layerX, layerY);
    }
    if (selectedTool === "rubber") {
      // ctx.lineTo(layerX - 1, layerY - 1); // top left
      // ctx.lineTo(layerX, layerY - 1); // top center
      // ctx.lineTo(layerX, layerY - 1); // top right
      // ctx.lineTo(layerX + 1, layerY); // middle right
      // ctx.lineTo(layerX + 1, layerY + 1); // right bottom
      // ctx.lineTo(layerX, layerY + 1); // center bottom
      // ctx.lineTo(layerX, layerY + 1); // left bottom
      // ctx.lineTo(layerX - 1, layerY); // left center
      // ctx.lineTo(layerX, layerY); // center center
      ctx.fillStyle = "white";
      ctx.fillRect(
        layerX - rubberDetails.offset,
        layerY - rubberDetails.offset,
        rubberDetails.length,
        rubberDetails.length
      );
    }
    penPoints.push({
      posX: layerX,
      posY: layerY,
    });

    ctx.stroke();
  });

  //   canvasEl.addEventListener("click", (evt) => {
  //     console.log(evt);
  //     if (!ctx) {
  //       return;
  //     }

  //     ctx.lineTo(evt.clientX, evt.clientY);
  //     ctx.stroke();
  //   });
};

window.addEventListener("load", init);
