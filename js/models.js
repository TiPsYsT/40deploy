export function drawModels(ctx, board, models) {
  ctx.fillStyle = "black";

  models.forEach(m => {
    if (m.xMm == null || !m.base) return;

    const r = (m.base.mm / 2) * board.pxPerMm;

    ctx.beginPath();
    ctx.arc(
      m.xMm * board.pxPerMm,
      m.yMm * board.pxPerMm,
      r,
      0, Math.PI * 2
    );
    ctx.fill();
  });
}
