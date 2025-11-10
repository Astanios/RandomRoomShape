export async function fetchShapeJson(name) {
  const res = await fetch(`/shapes/${name}.json`);
  if (!res.ok) throw new Error(`Failed to load ${name}.json (${res.status})`);
  return res.json();
}

export function buildEdges(verts) {
  const e = [];
  for (let i = 0; i < verts.length; i++) {
    e.push({ p0: verts[i], p1: verts[(i + 1) % verts.length] });
  }
  return e;
}

export function computeCentroid(verts) {
  let sx = 0,
    sy = 0;
  verts.forEach((v) => {
    sx += v.x;
    sy += v.y;
  });
  return { x: sx / verts.length, y: sy / verts.length };
}

export function vector(a, b) {
  return { x: b.x - a.x, y: b.y - a.y };
}
export function length(v) {
  return Math.hypot(v.x, v.y);
}
export function normalize(v) {
  const len = length(v);
  return { x: v.x / len, y: v.y / len };
}
export function perp(v) {
  return { x: -v.y, y: v.x };
}
export function dot(a, b) {
  return a.x * b.x + a.y * b.y;
}
export function subtract(a, b) {
  return { x: a.x - b.x, y: a.y - b.y };
}
export function add(a, b) {
  return { x: a.x + b.x, y: a.y + b.y };
}
export function scale(v, s) {
  return { x: v.x * s, y: v.y * s };
}

export function intersectLineSegment(center, dir, segA, segB) {
  const p = segA,
    r = vector(segA, segB);
  const q = center,
    s = dir;

  const rxs = r.x * s.y - r.y * s.x;
  if (Math.abs(rxs) < 1e-10) return null;

  const qmp = subtract(q, p);
  const u = (qmp.x * s.y - qmp.y * s.x) / rxs;

  if (u < 0 || u > 1) return null;

  const intersection = add(p, scale(r, u));
  const tLine = dot(subtract(intersection, center), dir) / dot(dir, dir);
  return { point: intersection, t: tLine };
}

export function getLineSegmentEndpoints(center, dir, edges) {
  const intersections = [];
  for (let i = 0; i < edges.length; i++) {
    const { p0, p1 } = edges[i];
    const res = intersectLineSegment(center, dir, p0, p1);
    if (res) intersections.push(res);
  }
  if (intersections.length < 2) return null; // Should never happen

  // Sort by t so we can take the farthest points
  intersections.sort((a, b) => a.t - b.t);
  const p1 = intersections[0].point;
  const p2 = intersections[intersections.length - 1].point;
  return { p1, p2 };
}
