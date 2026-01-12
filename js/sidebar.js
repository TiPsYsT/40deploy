import { state } from "./state.js";
import { spawnUnit } from "./board.js";

export function setupSidebar() {
  renderSidebar();
}

export function renderSidebar() {
  const list = document.getElementById("unit-list");
  list.innerHTML = "";

  state.armyUnits.forEach((u, i) => {
    const div = document.createElement("div");
    div.className = "unit";
    div.innerText = `${u.name} (${u.count})`;
    div.onclick = () => spawnUnit(u);
    list.appendChild(div);
  });
}

