import { setModels } from "./js/state.js";
import { importNewRecruit } from "./js/importer.js";
import { renderSidebar } from "./js/sidebar.js";
import { spawnModel, draw } from "./js/board.js";

reader.onload = () => {
  const json = JSON.parse(reader.result);
  console.log("IMPORTERAD JSON:", json);

  const models = importNewRecruit(json);
  console.log("MODELS:", models);

  setModels(models);
  renderSidebar(spawnModel);
  draw();
};


  reader.onload = () => {
    const json = JSON.parse(reader.result);
    const models = importNewRecruit(json);
    setModels(models);
    renderSidebar(spawnModel);
    draw();
  };

  reader.readAsText(file);
};
