import './style.css';

const canvas = document.getElementById('canvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

// Variables to keep track of drawing state
let isDrawing = false;
let lastX = 0;
let lastY = 0;

function resizeCanvas(): void {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

function startDrawing(event: MouseEvent): void {
  isDrawing = true;
  [lastX, lastY] = [event.offsetX, event.offsetY];
}

function stopDrawing(): void {
  isDrawing = false;
}

function drawLine(event: MouseEvent): void {
  if (!isDrawing) return;
  ctx.strokeStyle = 'black';
  ctx.lineWidth = 5;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  ctx.beginPath();
  ctx.moveTo(lastX, lastY);
  ctx.lineTo(event.offsetX, event.offsetY);
  ctx.stroke();

  [lastX, lastY] = [event.offsetX, event.offsetY];
}

// Initial resize
resizeCanvas();

// Add event listener to resize the canvas when the window is resized
window.addEventListener('resize', resizeCanvas);

// Mouse event listeners for drawing
canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mousemove', drawLine);
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mouseout', stopDrawing);
