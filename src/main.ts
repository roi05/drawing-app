import './style.css';

const canvas = document.getElementById('canvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

type Path = {
  type: 'line' | 'square';
  points: {
    x: number;
    y: number;
    width?: number;
    height?: number;
    propery: { color: string };
  }[];
};

let isDrawing: boolean = false;
let isErasing: boolean = false;
let hasMoved: boolean = false;

let lastX: number = 0;
let lastY: number = 0;
let firstX: number = 0;
let firstY: number = 0;

let drawingType: 'line' | 'square' | undefined = 'line';

let paths: Path[] = [];

function resizeCanvas(): void {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  redraw();
}

function stopDrawing(): void {
  if (!isDrawing) return;
  isDrawing = false;

  if (drawingType === 'square' && hasMoved) {
    const width = lastX - firstX;
    const height = lastY - firstY;

    paths.push({
      type: 'square',
      points: [
        {
          x: firstX,
          y: firstY,
          width,
          height,
          propery: {
            color: 'white',
          },
        },
      ],
    });
    savePathsToLocalStorage();
    redraw();
  }

  hasMoved = false;
}

function startDraw(event: MouseEvent): void {
  isDrawing = true;
  hasMoved = false;
  lastX = event.offsetX;
  lastY = event.offsetY;
  firstX = event.offsetX;
  firstY = event.offsetY;

  if (drawingType === 'line') {
    paths.push({
      type: 'line',
      points: [
        {
          x: lastX,
          y: lastY,
          propery: {
            color: isErasing ? 'black' : 'white',
          },
        },
      ],
    });
  }
}

function drawing(event: MouseEvent): void {
  if (!isDrawing) return;

  const currentX = event.offsetX;
  const currentY = event.offsetY;

  hasMoved = true;

  redraw();

  if (drawingType === 'line') {
    paths[paths.length - 1].points.push({
      x: currentX,
      y: currentY,
      propery: {
        color: isErasing ? 'black' : 'white',
      },
    });
    ctx.lineWidth = 5;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(currentX, currentY);
    ctx.stroke();
  }

  if (drawingType === 'square') {
    ctx.strokeStyle = 'gray';
    ctx.strokeRect(firstX, firstY, lastX - firstX, lastY - firstY);
  }

  lastX = currentX;
  lastY = currentY;

  savePathsToLocalStorage();
}

function redraw(): void {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  paths.forEach(path => {
    if (path.type === 'line') {
      ctx.lineWidth = 5;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';

      ctx.beginPath();
      ctx.moveTo(path.points[0].x, path.points[0].y);
      path.points.slice(1).forEach(point => {
        ctx.strokeStyle = point?.propery?.color || 'white';
        ctx.lineTo(point.x, point.y);
      });
      ctx.stroke();
    }

    if (path.type === 'square') {
      path.points.forEach(rect => {
        ctx.strokeStyle = rect.propery.color;
        ctx.strokeRect(rect.x, rect.y, rect.width || 0, rect.height || 0);
      });
    }
  });
}

function savePathsToLocalStorage(): void {
  localStorage.setItem('drawnPaths', JSON.stringify(paths));
}

function loadPathsFromLocalStorage(): void {
  const savedPaths = localStorage.getItem('drawnPaths');
  if (savedPaths) {
    paths = JSON.parse(savedPaths);
    redraw();
  }
}

function undoLastPath(): void {
  if (paths.length > 0) {
    paths.pop();
    redraw();
    savePathsToLocalStorage();
  }
}

resizeCanvas();
loadPathsFromLocalStorage();

window.addEventListener('resize', resizeCanvas);

canvas.addEventListener('mousedown', startDraw);
canvas.addEventListener('mousemove', drawing);
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mouseout', stopDrawing);

window.addEventListener('keydown', (event: KeyboardEvent) => {
  if (event.key === 'z' && (event.ctrlKey || event.metaKey)) {
    undoLastPath();
  }
});
