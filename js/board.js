import { drawBoard } from "./board/render.js";
import { registerBoardEvents } from "./board/input.js";
import { setMission, setTerrain } from "./board/state.js";

let eventsReady = false;

export function initBoard(mission = null, terrain = null) {
  setMission(mission);
  setTerrain(terrain);

  if (!eventsReady) {
    registerBoardEvents(drawBoard);
    eventsReady = true;
  }

  drawBoard();
}
