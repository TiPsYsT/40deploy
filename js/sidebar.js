import { getModels } from "./state.js";

export function renderSidebar(onSelect) {
  const sidebar = document.getElementById("sidebar");
  sidebar.innerHTML = "";

  const hiddenKeywords = [
    "Battle Size",
    "Detachment",
    "Show/Hide",
    "visible",
    "Warlord"
  ];

  const grouped = {};

  getModels().forEach(m => {
    // filtrera bort skräp VISUELLT
    if (hiddenKeywords.some(k => m.name.includes(k))) return;

    const key = `${m.name}-${m.base}`;
    if (!grouped[key]) {
      grouped[key] = {
        name: m.name,
        base: m.base,
        count: 0
      };
    }
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
