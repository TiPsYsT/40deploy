import { setModels } from "./js/state.js";
import { importNewRecruit } from "./js/importer.js";
import { renderSidebar } from "./js/sidebar.js";
import { initBoard } from "./js/board.js";
import { loadBases } from "./js/baseResolver.js";
import { loadMission } from "./js/missionLoader.js";
import { loadTerrain } from "./js/terrainLoader.js";

const fileInput = document.getElementById("fileInput");
const missionSelect = document.getElementById("missionSelect");
const terrainSelect = document.getElementById("terrainSelect");

let currentMission = null;
let currentTerrain = null;

/* ================= INIT ================= */

(async function init() {
  await loadBases();
  initBoard();
})();

/* ================= IMPORT ARMY ================= */

fileInput.addEventListener("change", e => {
  const file = e.target.files[0];
  const reader = new FileReader();

  reader.onload = e => {
    const json = JSON.parse(e.target.result);
    const models = importNewRecruit(json);

    setModels(models);
    renderSidebar();
    initBoard(currentMission, currentTerrain);
  };

  reader.readAsText(file);
});

/* ================= MISSION ================= */

missionSelect.addEventListener("change", async e => {
  currentMission = e.target.value
    ? await loadMission(e.target.value)
    : null;

  initBoard(currentMission, currentTerrain);
});

/* ================= TERRAIN ================= */

terrainSelect.addEventListener("change", async e => {
  if (!e.target.value) {
    currentTerrain = null;
    initBoard(currentMission, null);
    return;
  }

  const terrainJson = await loadTerrain(e.target.value);

  // 🔑 NYCKELRADEN – stödjer GAMMALT + NYTT FORMAT
  currentTerrain = terrainJson?.terrain ?? terrainJson;

  initBoard(currentMission, currentTerrain);
});
