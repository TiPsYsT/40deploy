import { setModels } from "./js/state.js";
import { importNewRecruit } from "./js/importer.js";
import { renderSidebar } from "./js/sidebar.js";
import { initBoard } from "./js/board.js";
import { loadBases } from "./js/baseResolver.js";
import { loadWtc2025Pack, listWtc2025Deployments, listWtc2025LayoutsByDeployment, buildWtcMission, buildWtcTerrain } from "./js/wtc2025.js";

const fileInput = document.getElementById("fileInput");
const setupSelect = document.getElementById("setupSelect");
setupSelect.disabled = true;
const deploymentSelect = document.getElementById("deploymentSelect");
const layoutNumberSelect = document.getElementById("layoutNumberSelect");

let currentMission = null;
let currentTerrain = null;
let wtc2025Pack = null;

(async function init() {
  await loadBases();
  wtc2025Pack = await loadWtc2025Pack();

  setupSelect.disabled = false;
  initBoard();
})();

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

setupSelect.addEventListener("change", () => {
  currentMission = null;
  currentTerrain = null;

  deploymentSelect.innerHTML = '<option value="">– mission –</option>';
  layoutNumberSelect.innerHTML = '<option value="">– layout –</option>';
  deploymentSelect.value = "";
  layoutNumberSelect.value = "";

  const setup = setupSelect.value;
  const isWtc = setup === "wtc";

  deploymentSelect.disabled = !isWtc;
  layoutNumberSelect.disabled = true;

  if (isWtc && wtc2025Pack) {
    listWtc2025Deployments(wtc2025Pack).forEach(d => {
      const opt = document.createElement("option");
      opt.value = d.id;
      opt.textContent = d.label;
      deploymentSelect.appendChild(opt);
    });
  }

  initBoard(currentMission, currentTerrain);
});

deploymentSelect.addEventListener("change", () => {
  currentMission = null;
  currentTerrain = null;

  layoutNumberSelect.innerHTML = '<option value="">– layout –</option>';
  layoutNumberSelect.value = "";

  const deployment = deploymentSelect.value;
  layoutNumberSelect.disabled = !deployment;

  if (deployment && wtc2025Pack) {
    listWtc2025LayoutsByDeployment(wtc2025Pack, deployment).forEach(l => {
      const opt = document.createElement("option");
      opt.value = l.id;
      opt.textContent = l.number;
      layoutNumberSelect.appendChild(opt);
    });
  }

  initBoard(currentMission, currentTerrain);
});

layoutNumberSelect.addEventListener("change", e => {
  const layoutId = e.target.value;

  if (!layoutId) {
    currentMission = null;
    currentTerrain = null;
    initBoard(currentMission, currentTerrain);
    return;
  }

  if (!wtc2025Pack) return;

  currentMission = buildWtcMission(wtc2025Pack, layoutId);
  currentTerrain = buildWtcTerrain(wtc2025Pack, layoutId);

  initBoard(currentMission, currentTerrain);
});
