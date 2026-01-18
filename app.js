import { setModels } from "./js/state.js";
import { importNewRecruit } from "./js/importer.js";
import { renderSidebar } from "./js/sidebar.js";
import { redrawBoard, spawnModel } from "./js/board.js";
import { loadBases } from "./js/baseResolver.js";
import { loadMission } from "./js/missionLoader.js";
import { loadTerrain } from "./js/terrainLoader.js";

const fileInput = document.getElementById("fileInput");
const missionSelect = document.getElementById("missionSelect");
const terrainSelect = document.getElementById("terrainSelect");

let currentMission = null;
let currentTerrain = null;

(async function init() {
  await loadBases();
})();

fileInput.addEventListener("change", e => {
  const file = e.target.files[0];
  const reader = new FileReader();

  reader.onload = e => {
    const json = JSON.parse(e.target.result);
    const models = importNewRecruit(json);

    setModels(models);
    renderSidebar(spawnModel);
    redrawBoard(currentMission, currentTerrain);
  };

  reader.readAsText(file);
});

missionSelect.addEventListener("change", async e => {
  currentMission = e.target.value
    ? await loadMission(e.target.value)
    : null;

  redrawBoard(currentMission, currentTerrain);
});

terrainSelect.addEventListener("change", async e => {
  currentTerrain = e.target.value
    ? await loadTerrain(e.target.value)
    : null;

  redrawBoard(currentMission, currentTerrain);
});
