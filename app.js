import { setModels } from "./js/state.js";
import { importNewRecruit } from "./js/importer.js";
import { renderSidebar } from "./js/sidebar.js";
import { spawnModel, draw } from "./js/board.js";

document.getElementById("fileInput").onchange = e => {
  const file = e.target.files[0];
  const reader = new FileReader();

  reader.onload = () => {
    const json = JSON.parse(reader.result);
    const models = importNewRecruit(json);
    setModels(models);
    renderSidebar(spawnModel);
    draw();
  };

  reader.readAsText(file);
};
