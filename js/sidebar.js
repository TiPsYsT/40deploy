import { getModels } from "./state.js";

export function renderSidebar(onSelect) {
  const sidebar = document.getElementById("sidebar");
  sidebar.innerHTML = "";

  const grouped = {};

  getModels().forEach(m => {
    const key = `${m.name}-${m.base}`;
    grouped[key] ??= { ...m, count: 0 };
    grouped[key].count++;
  });

  Object.values(grouped).forEach(unit => {
    const div = document.createElement("div");
    div.className = "unit";
    div.textContent = `${unit.name} (${unit.count}) – ${unit.base}`;
    div.onclick = () => onSelect(unit);
    sidebar.appendChild(div);
  });
}
