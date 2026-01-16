import { setModels } from "./js/state.js";
import { importNewRecruit } from "./js/importer.js";
import { renderSidebar } from "./js/sidebar.js";
import { draw, spawnModel } from "./js/board.js";
import { loadBases } from "./js/baseResolver.js";

console.log("APP STARTAR");

const fileInput = document.getElementById("fileInput");

(async function init() {
  await loadBases();
  console.log("BASES LADDADE");
})();

fileInput.addEventListener("change", e => {
  console.log("FIL VALD");

  const file = e.target.files[0];
  const reader = new FileReader();

  reader.onload = e => {
    console.log("FILE READ OK");

    const json = JSON.parse(e.target.result);
    const models = importNewRecruit(json);

    setModels(models);
    renderSidebar(spawnModel);
    draw();
  };

  reader.readAsText(file);
});
