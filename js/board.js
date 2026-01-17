export function setBoard(board) {
  return {
    widthMm: board.widthMm,
    heightMm: board.heightMm,
    pxPerMm: board.pxPerMm
  };
}

export function drawBoard(ctx, board) {
  ctx.fillStyle = "#2f6b3f";
  ctx.fillRect(0, 0,
    board.widthMm * board.pxPerMm,
    board.heightMm * board.pxPerMm
  );
}
