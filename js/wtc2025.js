const INCH = 25.4;
const BOARD_WIDTH_IN = 60;

const TERRAIN_DEFS = {
  three_storey_blue: {
    color: "blue",
    w: 12 * INCH,
    h: 6 * INCH,
    walls: [
      [[12.7, 25.4], [257.175, 25.4]],
      [[25.4, 25.4], [25.4, 149.225]]
    ]
  },
  three_storey_blue_inv: {
    color: "blue",
    w: 12 * INCH,
    h: 6 * INCH,
    walls: [
      [[47.625, 25.4], [292.1, 25.4]],
      [[279.4, 25.4], [279.4, 149.225]]
    ]
  },
  two_storey_red: {
    color: "red",
    w: 12 * INCH,
    h: 6 * INCH,
    walls: [
      [[12.7, 25.4], [257.175, 25.4]],
      [[25.4, 25.4], [25.4, 149.225]]
    ]
  },
  two_storey_red_inv: {
    color: "red",
    w: 12 * INCH,
    h: 6 * INCH,
    walls: [
      [[47.625, 25.4], [292.1, 25.4]],
      [[279.4, 25.4], [279.4, 149.225]]
    ]
  },
  container: {
    color: "gray",
    w: 5 * INCH,
    h: 2.5 * INCH,
    walls: []
  },
  prototype_ruin: {
    color: "gray",
    w: 6 * INCH,
    h: 5 * INCH,
    walls: []
  }
};

const DEPLOYMENT_LABELS = {
  CrucibleOfBattleStrikeForce: "Crucible of Battle",
  SearchAndDestroyStrikeForce: "Search and Destroy",
  DawnOfWarStrikeForce: "Dawn of War",
  HammerAndAnvilStrikeForce: "Hammer and Anvil",
  SweepingEngagementStrikeForce: "Sweeping Engagement",
  TippingPointStrikeForce: "Tipping Point"
};

function toMm(v) {
  return Math.round(v * INCH * 1000) / 1000;
}

function toRad(v) {
  return (v * Math.PI) / 180;
}

function tokenizePath(path) {
  return path
    .replace(/,/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

function approxArcPoints(x1, y1, rxInput, ryInput, xAxisRotation, largeArcFlag, sweepFlag, x2, y2) {
  let rx = Math.abs(rxInput);
  let ry = Math.abs(ryInput);

  if (!rx || !ry) {
    return [[x2, y2]];
  }

  const phi = toRad(xAxisRotation % 360);
  const sinPhi = Math.sin(phi);
  const cosPhi = Math.cos(phi);

  const dx = (x1 - x2) / 2;
  const dy = (y1 - y2) / 2;

  const x1p = cosPhi * dx + sinPhi * dy;
  const y1p = -sinPhi * dx + cosPhi * dy;

  const lambda = (x1p * x1p) / (rx * rx) + (y1p * y1p) / (ry * ry);
  if (lambda > 1) {
    const scale = Math.sqrt(lambda);
    rx *= scale;
    ry *= scale;
  }

  const sign = largeArcFlag === sweepFlag ? -1 : 1;
  const num = rx * rx * ry * ry - rx * rx * y1p * y1p - ry * ry * x1p * x1p;
  const den = rx * rx * y1p * y1p + ry * ry * x1p * x1p;
  const coef = sign * Math.sqrt(Math.max(0, num / den));

  const cxp = coef * ((rx * y1p) / ry);
  const cyp = coef * (-(ry * x1p) / rx);

  const cx = cosPhi * cxp - sinPhi * cyp + (x1 + x2) / 2;
  const cy = sinPhi * cxp + cosPhi * cyp + (y1 + y2) / 2;

  function vectorAngle(ux, uy, vx, vy) {
    const dot = ux * vx + uy * vy;
    const len = Math.hypot(ux, uy) * Math.hypot(vx, vy);
    const ang = Math.acos(Math.max(-1, Math.min(1, dot / len)));
    return (ux * vy - uy * vx) < 0 ? -ang : ang;
  }

  const v1x = (x1p - cxp) / rx;
  const v1y = (y1p - cyp) / ry;
  const v2x = (-x1p - cxp) / rx;
  const v2y = (-y1p - cyp) / ry;

  let theta1 = vectorAngle(1, 0, v1x, v1y);
  let delta = vectorAngle(v1x, v1y, v2x, v2y);

  if (!sweepFlag && delta > 0) delta -= 2 * Math.PI;
  if (sweepFlag && delta < 0) delta += 2 * Math.PI;

  const segments = Math.max(8, Math.ceil(Math.abs(delta) / (Math.PI / 12)));
  const points = [];

  for (let i = 1; i <= segments; i++) {
    const t = theta1 + (delta * i) / segments;
    const cosT = Math.cos(t);
    const sinT = Math.sin(t);

    const x = cx + cosPhi * rx * cosT - sinPhi * ry * sinT;
    const y = cy + sinPhi * rx * cosT + cosPhi * ry * sinT;
    points.push([x, y]);
  }

  return points;
}

function parsePathToPoly(path) {
  const tokens = tokenizePath(path);
  const points = [];

  let i = 0;
  let x = 0;
  let y = 0;

  const push = (px, py) => {
    points.push([toMm(px), toMm(py)]);
    x = px;
    y = py;
  };

  while (i < tokens.length) {
    const cmd = tokens[i++];

    if (cmd === "M" || cmd === "L") {
      const nx = Number(tokens[i++]);
      const ny = Number(tokens[i++]);
      push(nx, ny);
      continue;
    }

    if (cmd === "A") {
      const rx = Number(tokens[i++]);
      const ry = Number(tokens[i++]);
      const rot = Number(tokens[i++]);
      const largeArc = Number(tokens[i++]);
      const sweep = Number(tokens[i++]);
      const nx = Number(tokens[i++]);
      const ny = Number(tokens[i++]);

      approxArcPoints(x, y, rx, ry, rot, largeArc, sweep, nx, ny).forEach(([ax, ay]) => push(ax, ay));
      continue;
    }

    break;
  }

  return points;
}

function mapPieceType(type, flip) {
  if (type === "three_storey_blue") return flip ? "three_storey_blue_inv" : "three_storey_blue";
  if (type === "two_storey_red") return flip ? "two_storey_red_inv" : "two_storey_red";
  return type;
}

function mirrorPieceType(type) {
  if (type === "three_storey_blue") return "three_storey_blue_inv";
  if (type === "three_storey_blue_inv") return "three_storey_blue";
  if (type === "two_storey_red") return "two_storey_red_inv";
  if (type === "two_storey_red_inv") return "two_storey_red";
  return type;
}

function getLayoutNumber(id) {
  const match = id.match(/-(\d+)$/);
  return match ? Number(match[1]) : null;
}

function normalizeRotation(rotation) {
  const r = Number(rotation) || 0;
  return ((r % 360) + 360) % 360;
}

export async function loadWtc2025Pack() {
  const res = await fetch("data/wtc_2025_translated.json");
  if (!res.ok) throw new Error("Could not load WTC 2025 translated data");
  return res.json();
}

export function listWtc2025Deployments(pack) {
  const present = new Set(pack.layouts.map(l => l.deployment));

  return Object.keys(DEPLOYMENT_LABELS)
    .filter(id => present.has(id))
    .map(id => ({ id, label: DEPLOYMENT_LABELS[id] }));
}

export function listWtc2025LayoutsByDeployment(pack, deployment) {
  return pack.layouts
    .filter(l => l.deployment === deployment)
    .sort((a, b) => {
      const aNum = getLayoutNumber(a.id);
      const bNum = getLayoutNumber(b.id);

      if (aNum === null && bNum === null) return a.id.localeCompare(b.id);
      if (aNum === null) return 1;
      if (bNum === null) return -1;
      return aNum - bNum;
    })
    .map(l => ({
      id: l.id,
      number: String(getLayoutNumber(l.id) ?? l.id)
    }));
}

export function buildWtcMission(pack, layoutId) {
  const layout = pack.layouts.find(l => l.id === layoutId);
  if (!layout) return null;

  const zones = pack.deployment_zones[layout.deployment];
  const objectives = pack.objectives_by_deployment[layout.deployment] || [];

  return {
    name: layout.id,
    zones: {
      player: [parsePathToPoly(zones.attacker_path)],
      enemy: [parsePathToPoly(zones.defender_path)]
    },
    objectives: objectives.map(o => ({ x: toMm(o.x), y: toMm(o.y) }))
  };
}

export function buildWtcTerrain(pack, layoutId) {
  const layout = pack.layouts.find(l => l.id === layoutId);
  if (!layout) return null;

  const basePieces = layout.placements.map(p => {
    const resolvedType = mapPieceType(p.type, p.flip);
    const def = TERRAIN_DEFS[resolvedType];
    if (!def) throw new Error(`Unknown terrain type: ${resolvedType}`);

    return {
      type: resolvedType,
      color: def.color,
      x: toMm(p.x),
      y: toMm(p.y),
      w: def.w,
      h: def.h,
      rotation: normalizeRotation(p.rotation),
      walls: def.walls
    };
  });

  const mirroredPieces = basePieces.map(p => ({
    ...p,
    type: mirrorPieceType(p.type),
    x: toMm(BOARD_WIDTH_IN) - p.x - p.w,
    rotation: normalizeRotation(180 - p.rotation)
  }));

  return {
    pieces: [...basePieces, ...mirroredPieces]
  };
}
