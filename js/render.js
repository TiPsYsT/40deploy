import { drawBoard } from "./board.js";
import { drawMission } from "./mission.js";
import { drawTerrain } from "./terrain.js";
import { drawModels } from "./models.js";

export function render(ctx, state) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  drawBoard(ctx, state.board);
  drawMission(ctx, state.board, state.mission);
  drawTerrain(ctx, state.board, state.terrain);
  drawModels(ctx, state.board, state.models);
}
