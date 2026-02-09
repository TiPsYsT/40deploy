import { setModels } from "./js/state.js";
import { importNewRecruit } from "./js/importer.js";
import { renderSidebar } from "./js/sidebar.js";
import { initBoard } from "./js/board.js";
import { loadBases } from "./js/baseResolver.js";
import { loadMission } from "./js/missionLoader.js";
import { loadTerrain } from "./js/terrainLoader.js";
import { loadWtc2025Pack, listWtc2025Layouts, buildWtcMission, buildWtcTerrain } from "./js/wtc2025.js";

const fileInput = document.getElementById("fileInput");
const missionSelect = document.getElementById("missionSelect");
const terrainSelect = document.getElementById("terrainSelect");
const wtcLayoutSelect = document.getElementById("wtcLayoutSelect");

let currentMission = null;
let currentTerrain = null;
let wtc2025Pack = null;

(async function init() {
  await loadBases();
  wtc2025Pack = await loadWtc2025Pack();

  listWtc2025Layouts(wtc2025Pack).forEach(l => {
    const opt = document.createElement("option");
    opt.value = l.id;
    opt.textContent = l.label;
    wtcLayoutSelect.appendChild(opt);
  });

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
  wtcLayoutSelect.value = "";

  currentMission = e.target.value
    ? await loadMission(e.target.value)
    : null;

  initBoard(currentMission, currentTerrain);
});

terrainSelect.addEventListener("change", async e => {
  wtcLayoutSelect.value = "";

  currentTerrain = e.target.value
    ? await loadTerrain(e.target.value)
    : null;

  initBoard(currentMission, currentTerrain);
});


wtcLayoutSelect.addEventListener("change", e => {
  const layoutId = e.target.value;

  if (!layoutId) {
    return;
  }

  missionSelect.value = "";
  terrainSelect.value = "";

  currentMission = buildWtcMission(wtc2025Pack, layoutId);
  currentTerrain = buildWtcTerrain(wtc2025Pack, layoutId);

  initBoard(currentMission, currentTerrain);
});
