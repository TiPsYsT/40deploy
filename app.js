import { setModels } from "./js/state.js";
import { importNewRecruit } from "./js/importer.js";
import { renderSidebar } from "./js/sidebar.js";
import { initBoard } from "./js/board.js";
import { loadBases } from "./js/baseResolver.js";
import { loadMission } from "./js/missionLoader.js";
import { loadTerrain, parseTerrainInput } from "./js/terrainLoader.js";

const fileInput = document.getElementById("fileInput");
const missionSelect = document.getElementById("missionSelect");
const terrainSelect = document.getElementById("terrainSelect");
const terrainInput = document.getElementById("terrainInput");
const terrainImport = document.getElementById("terrainImport");
const terrainClear = document.getElementById("terrainClear");

let currentMission = null;
let currentTerrain = null;

(async function init() {
  await loadBases();
  initBoard();
})();

fileInput.addEventListener("change", e => {
  const file = e.target.files[0];
  const reader = new FileReader();

  reader.onload = e => {
    const json = JSON.parse(e.target.result);
    const models = importNewRecruit(json);

    setModels(models);      // ✅ färger sätts här
    renderSidebar();        // ✅ sidebar ser färger
    initBoard(currentMission, currentTerrain);
  };

  reader.readAsText(file);
});

missionSelect.addEventListener("change", async e => {
  currentMission = e.target.value
    ? await loadMission(e.target.value)
    : null;

  initBoard(currentMission, currentTerrain);
});

terrainSelect.addEventListener("change", async e => {
  currentTerrain = e.target.value
    ? await loadTerrain(e.target.value)
    : null;

  if (terrainInput) {
    terrainInput.value = "";
  }

  initBoard(currentMission, currentTerrain);
});

if (terrainImport) {
  terrainImport.addEventListener("click", () => {
    if (!terrainInput || !terrainInput.value.trim()) return;

    try {
      currentTerrain = parseTerrainInput(terrainInput.value);
      terrainSelect.value = "";
      initBoard(currentMission, currentTerrain);
    } catch (error) {
      alert(error.message);
    }
  });
}

if (terrainClear) {
  terrainClear.addEventListener("click", () => {
    currentTerrain = null;
    terrainSelect.value = "";
    if (terrainInput) terrainInput.value = "";
    initBoard(currentMission, currentTerrain);
  });
}
