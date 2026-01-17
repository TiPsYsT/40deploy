export function loadTerrain(json, state) {
  state.terrain.pieces = json.pieces;
}

export function drawTerrain(ctx, board, terrain) {
  ctx.fillStyle = "#555";

  terrain.pieces.forEach(t => {
    ctx.fillRect(
      t.xMm * board.pxPerMm,
      t.yMm * board.pxPerMm,
      t.wMm * board.pxPerMm,
      t.hMm * board.pxPerMm
    );
  });
}
