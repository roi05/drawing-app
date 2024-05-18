import './style.css';

const canvas = document.getElementById('canvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

// Variables to keep track of drawing state
let isDrawing: boolean = false;

let lastX: number = 0;
let lastY: number = 0;
let paths: { points: { x: number; y: number }[] }[] = [];

function resizeCanvas(): void {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  redrawPaths();
}

function stopDrawing(): void {
  isDrawing = false;
}

function startDrawing(event: MouseEvent): void {
  isDrawing = true;
  lastX = event.offsetX;
  lastY = event.offsetY;
  paths.push({ points: [{ x: lastX, y: lastY }] });
}

function drawLine(event: MouseEvent): void {
  if (!isDrawing) return;

  const currentX = event.offsetX;
  const currentY = event.offsetY;

  paths[paths.length - 1].points.push({ x: currentX, y: currentY });

  ctx.strokeStyle = 'white';
  ctx.lineWidth = 5;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  ctx.beginPath();
  ctx.moveTo(lastX, lastY);
  ctx.lineTo(currentX, currentY);
  ctx.stroke();

  lastX = currentX;
  lastY = currentY;

  savePathsToLocalStorage();
}

function redrawPaths(): void {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  paths.forEach(path => {
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 5;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    ctx.beginPath();
    ctx.moveTo(path.points[0].x, path.points[0].y);
    path.points.slice(1).forEach(point => {
      ctx.lineTo(point.x, point.y);
    });
    ctx.stroke();
  });
}

function savePathsToLocalStorage(): void {
  localStorage.setItem('drawnPaths', JSON.stringify(paths));
}

function loadPathsFromLocalStorage(): void {
  const savedPaths = localStorage.getItem('drawnPaths');
  if (savedPaths) {
    paths = JSON.parse(savedPaths);
    redrawPaths();
  }
}

function undoLastPath(): void {
  if (paths.length > 0) {
    paths.pop();
    redrawPaths();
    savePathsToLocalStorage();
  }
}

resizeCanvas();
loadPathsFromLocalStorage();

window.addEventListener('resize', resizeCanvas);

canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mousemove', drawLine);
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mouseout', stopDrawing);

window.addEventListener('keydown', (event: KeyboardEvent) => {
  if (event.key === 'z' && (event.ctrlKey || event.metaKey)) {
    undoLastPath();
  }
});
