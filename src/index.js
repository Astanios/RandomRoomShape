import {
  fetchShapeJson,
  buildEdges,
  computeCentroid,
  vector,
  normalize,
  perp,
  getLineSegmentEndpoints,
} from "./helpers.js";
import "./index.css";

const canvas = document.getElementById("roomCanvas");
const ctx = canvas.getContext("2d");
const btnOrientation = document.getElementById("changeOrientationBtn");
const btnChangeShape = document.getElementById("changeShapeBtn");
const options = ["triangle", "simple", "t_shape"];
ctx.moveTo(0, 0);
ctx.lineTo(200, 100);
ctx.stroke();
let currentShapeName, vertices, edges, cent, edgeIndex;

async function loadShapeByName(name) {
  currentShapeName = name;
  try {
    const raw = await fetchShapeJson(name);
    const vertsArray = raw.vertices || raw;
    vertices = vertsArray.map((v) => ({ x: v[0], y: v[1] }));
    edges = buildEdges(vertices);
    cent = computeCentroid(vertices);
    edgeIndex = 0;
  } catch (error) {
    throw new Error(`Failed to fetch shape ${name}`);
  }
}

async function loadRandomShape() {
  const names = currentShapeName
    ? options.filter((option) => option !== currentShapeName)
    : options;
  const pick = names[Math.floor(Math.random() * names.length)];
  await loadShapeByName(pick);
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const pad = 40;
  const xs = vertices.map((v) => v.x),
    ys = vertices.map((v) => v.y);
  const minX = Math.min(...xs),
    maxX = Math.max(...xs);
  const minY = Math.min(...ys),
    maxY = Math.max(...ys);
  const shapeW = maxX - minX,
    shapeH = maxY - minY;

  const scaleX = (canvas.width - 2 * pad) / shapeW;
  const scaleY = (canvas.height - 2 * pad) / shapeH;
  const scale = Math.min(scaleX, scaleY);

  const offsetX = (canvas.width - shapeW * scale) / 2;
  const offsetY = (canvas.height - shapeH * scale) / 2;

  const transform = (pt) => {
    return {
      x: offsetX + (pt.x - minX) * scale,
      y: offsetY + (pt.y - minY) * scale,
    };
  };

  ctx.beginPath();
  {
    const t0 = transform(vertices[0]);
    ctx.moveTo(t0.x, t0.y);
  }
  for (let i = 1; i < vertices.length; i++) {
    const ti = transform(vertices[i]);
    ctx.lineTo(ti.x, ti.y);
  }
  ctx.closePath();
  ctx.strokeStyle = "#333";
  ctx.lineWidth = 2;
  ctx.stroke();

  const baseEdge = edges[edgeIndex];
  const dirRaw = vector(baseEdge.p0, baseEdge.p1);
  const dir = normalize(dirRaw);
  const perpDir = normalize(perp(dir));

  const lenSeg = getLineSegmentEndpoints(cent, dir, edges);
  const widSeg = getLineSegmentEndpoints(cent, perpDir, edges);

  if (lenSeg) {
    ctx.strokeStyle = "red";
    ctx.lineWidth = 4;
    ctx.beginPath();
    {
      const a = transform(lenSeg.p1);
      const b = transform(lenSeg.p2);
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
    }
    ctx.stroke();

    ctx.fillStyle = "#c00";
    [lenSeg.p1, lenSeg.p2].forEach((p) => {
      const tp = transform(p);
      ctx.beginPath();
      ctx.arc(tp.x, tp.y, 6, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  if (widSeg) {
    ctx.strokeStyle = "blue";
    ctx.lineWidth = 4;
    ctx.beginPath();
    {
      const a = transform(widSeg.p1);
      const b = transform(widSeg.p2);
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
    }
    ctx.stroke();

    // endpoints
    ctx.fillStyle = "#004";
    [widSeg.p1, widSeg.p2].forEach((p) => {
      const tp = transform(p);
      ctx.beginPath();
      ctx.arc(tp.x, tp.y, 6, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  ctx.fillStyle = "#000";
  ctx.font = "18px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(`Shape: ${currentShapeName}`, canvas.width / 2, 30);
  ctx.fillText(
    `Current baseline wall: ${edgeIndex + 1} → ${edgeIndex + 2}`,
    canvas.width / 2,
    55
  );
}

btnOrientation.addEventListener("click", () => {
  edgeIndex = (edgeIndex + 1) % edges.length;
  draw();
});

btnChangeShape.addEventListener("click", () => {
  loadShape();
});

const loadShape = async (name) => {
  await loadRandomShape();
  draw();
};

loadShape();
