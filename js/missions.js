export function loadMission(json, state) {
  state.mission.deployZones = json.deployZones;
  state.mission.objectives = json.objectives;
}

export function drawMission(ctx, board, mission) {
  ctx.strokeStyle = "blue";
  ctx.lineWidth = 2;

  mission.deployZones.forEach(z => {
    ctx.strokeRect(
      z.xMm * board.pxPerMm,
      z.yMm * board.pxPerMm,
      z.wMm * board.pxPerMm,
      z.hMm * board.pxPerMm
    );
  });

  ctx.fillStyle = "yellow";
  mission.objectives.forEach(o => {
    ctx.beginPath();
    ctx.arc(
      o.xMm * board.pxPerMm,
      o.yMm * board.pxPerMm,
      20 * board.pxPerMm,
      0, Math.PI * 2
    );
    ctx.fill();
  });
}
