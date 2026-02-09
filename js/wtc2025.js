const INCH = 25.4;

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

function toMm(v) {
  return Math.round(v * INCH * 1000) / 1000;
}

function tokenizePath(path) {
  return path
    .replace(/,/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
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
      // A rx ry x-axis-rotation large-arc-flag sweep-flag x y
      i += 5;
      const nx = Number(tokens[i++]);
      const ny = Number(tokens[i++]);
      // Approximation: use arc end point so shape remains valid for fill.
      push(nx, ny);
      continue;
    }

    // Unknown token: stop hard to avoid bad geometry.
    break;
  }

  return points;
}

function mapPieceType(type, flip) {
  if (type === "three_storey_blue") return flip ? "three_storey_blue_inv" : "three_storey_blue";
  if (type === "two_storey_red") return flip ? "two_storey_red_inv" : "two_storey_red";
  return type;
}

export async function loadWtc2025Pack() {
  const res = await fetch("data/wtc_2025_translated.json");
  if (!res.ok) throw new Error("Could not load WTC 2025 translated data");
  return res.json();
}

export function listWtc2025Layouts(pack) {
  return pack.layouts.map(l => ({ id: l.id, label: `${l.id} (${l.deployment})` }));
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

  return {
    pieces: layout.placements.map(p => {
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
        rotation: p.rotation,
        walls: def.walls
      };
    })
  };
}
