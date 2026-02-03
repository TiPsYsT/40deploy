export async function loadTerrain(id) {
  const res = await fetch(`terrain/${id}.json`);

  if (!res.ok) {
    throw new Error(`Failed to load terrain: ${id}`);
  }

  const data = await res.json();
  return normalizeTerrainData(data);
}

export function parseTerrainInput(raw, options = {}) {
  const data = coerceToJson(raw);
  return normalizeTerrainData(data, options);
}

function coerceToJson(raw) {
  if (typeof raw !== "string") return raw;

  const trimmed = raw.trim();
  if (!trimmed) {
    throw new Error("Terrain input is empty.");
  }

  try {
    return JSON.parse(trimmed);
  } catch (error) {
    const candidate = extractJson(trimmed);
    if (!candidate) {
      throw new Error("Terrain input does not contain valid JSON.");
    }
    return JSON.parse(candidate);
  }
}

function extractJson(text) {
  const firstObj = text.indexOf("{");
  const firstArr = text.indexOf("[");

  if (firstObj === -1 && firstArr === -1) return null;

  const useArray = firstArr !== -1 && (firstObj === -1 || firstArr < firstObj);
  const start = useArray ? firstArr : firstObj;
  const endChar = useArray ? "]" : "}";
  const end = text.lastIndexOf(endChar);

  if (end <= start) return null;

  return text.slice(start, end + 1);
}

function normalizeTerrainData(data, options = {}) {
  let payload;
  if (Array.isArray(data)) {
    payload = { pieces: data };
  } else if (data && Array.isArray(data.pieces)) {
    payload = { ...data, pieces: data.pieces };
  } else if (data && Array.isArray(data.terrain)) {
    payload = { pieces: data.terrain };
  } else if (data && Array.isArray(data.items)) {
    payload = { pieces: data.items };
  } else {
    throw new Error("Unsupported terrain format.");
  }

  return {
    ...payload,
    pieces: payload.pieces.map(piece => transformPiece(piece, options)),
  };
}

const INCH = 25.4;
const BOARD_HEIGHT = 1118;

function transformPiece(piece, options) {
  const units = options.units || "mm";
  const unitScale = units === "inch" ? INCH : 1;
  const anchor = options.anchor || "top-left";
  const origin = options.origin || "top-left";

  const scaled = {
    ...piece,
    x: piece.x * unitScale,
    y: piece.y * unitScale,
    w: piece.w * unitScale,
    h: piece.h * unitScale,
  };

  if (Array.isArray(piece.walls)) {
    scaled.walls = piece.walls.map(wall => [
      [wall[0][0] * unitScale, wall[0][1] * unitScale],
      [wall[1][0] * unitScale, wall[1][1] * unitScale],
    ]);
  }

  if (anchor === "center") {
    scaled.x = scaled.x - scaled.w / 2;
    scaled.y = scaled.y - scaled.h / 2;
  }

  if (origin === "bottom-left") {
    scaled.y = BOARD_HEIGHT - scaled.y - scaled.h;
  }

  return scaled;
}
