import { registerBoardEvents } from "./board/input.js";
import { drawBoard } from "./board/render.js";
import { setMission, setTerrain } from "./board/state.js";

let initialized = false;

export function initBoard(mission = null, terrain = null) {
  setMission(mission);
  setTerrain(terrain);

  if (!initialized) {
    registerBoardEvents(drawBoard);
    initialized = true;
  }

  drawBoard();
}
