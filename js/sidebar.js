import { state } from "./state.js";
import { spawnUnit } from "./board.js";

// 4.1 init
export function setupSidebar() {
  renderSidebar();
}

// 4.2 render
export function renderSidebar() {
  const list = document.getElementById("unit-list");
  list.innerHTML = "";

  state.armyUnits.forEach(unit => {
    const div = document.createElement("div");
    div.className = "unit";
    div.textContent = `${unit.name} (${unit.count})`;
    div.onclick = () => spawnUnit(unit);
    list.appendChild(div);
  });
}
