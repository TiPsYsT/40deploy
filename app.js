import { setModels } from "./js/state.js";
import { importNewRecruit } from "./js/importer.js";
import { renderSidebar } from "./js/sidebar.js";
import { spawnModel, draw } from "./js/board.js";

console.log("APP STARTAR");

const fileInput = document.getElementById("fileInput");

fileInput.onchange = e => {
  console.log("FIL VALD");

  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();

  reader.onload = () => {
    console.log("FILE READ OK");

    const json = JSON.parse(reader.result);

    // 🔍 Struktur-logg (viktigt nu)
    console.log("JSON ROOT KEYS:", Object.keys(json));

    if (json.roster) {
      console.log("ROSTER KEYS:", Object.keys(json.roster));
      console.log("FORCES:", json.roster.forces);
      if (json.roster.forces?.length > 0) {
        console.log(
          "FIRST FORCE KEYS:",
          Object.keys(json.roster.forces[0])
        );
        console.log(
          "FIRST FORCE SELECTIONS:",
          json.roster.forces[0].selections
        );
      }
    }

    const models = importNewRecruit(json);
    console.log("MODELS:", models);

    setModels(models);
    renderSidebar(spawnModel);
    draw();
  };

  reader.readAsText(file);
};
