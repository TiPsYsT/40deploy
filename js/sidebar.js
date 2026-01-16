import { getModels } from "./state.js";

export function renderSidebar(onSelect) {
  const sidebar = document.getElementById("sidebar");
  sidebar.innerHTML = "";

  const META_NAMES = [
    "battle size",
    "detachment",
    "show/hide",
    "visible",
    "warlord"
  ];

  const grouped = {};

  getModels().forEach(m => {
    // filtrera bort metadata
    if (META_NAMES.some(k => m.name.includes(k))) return;

    // filtrera bort units utan bas
    if (!m.base) return;

    // 🔑 NORMALISERA plural → singular
    const baseName = normalizeUnitName(m.name);

    if (!grouped[baseName]) {
      grouped[baseName] = {
        name: baseName,
        count: 0
      };
    }

    grouped[baseName].count++;
  });

  Object.values(grouped).forEach(unit => {
    const div = document.createElement("div");
    div.className = "unit";
    div.textContent = `${unit.name} (${unit.count})`;

    div.onclick = () => onSelect(unit);
    sidebar.appendChild(div);
  });
}

// 👇 ENDA “regeln” – extremt enkel
function normalizeUnitName(name) {
  if (name.endsWith("es")) return name.slice(0, -2);
  if (name.endsWith("s")) return name.slice(0, -1);
  return name;
}
