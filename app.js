import { state } from "./js/state.js";
import { setBoard } from "./js/board.js";
import { loadMission } from "./js/mission.js";
import { loadTerrain } from "./js/terrain.js";
import { render } from "./js/render.js";

const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

// board
state.board = setBoard({
  widthMm: 1524,
  heightMm: 1118,
  pxPerMm: 3.78
});

canvas.width  = state.board.widthMm  * state.board.pxPerMm;
canvas.height = state.board.heightMm * state.board.pxPerMm;

// load mission + terrain (sen via UI)
loadMission(await fetch("data/missions/take_and_hold.json").then(r => r.json()), state);
loadTerrain(await fetch("data/terrain/wtc_2024.json").then(r => r.json()), state);

render(ctx, state);
