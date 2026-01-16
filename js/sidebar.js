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
    // 1. filtrera bort metadata
    if (META_NAMES.some(k => m.name.includes(k))) return;

    // 2. filtrera bort units utan bas (null)
    if (!m.base) return;

    const key = m.name; // 🔑 INGEN bas i nyckeln

    if (!grouped[key]) {
      grouped[key] = {
        name: m.name,
        count: 0
      };
    }

    grouped[key].count++;
  });

  Object.values(grouped).forEach(unit => {
    const div = document.createElement("div");
    div.className = "unit";

    // ✅ ENDA texten som visas
    div.textContent = `${unit.name} (${unit.count})`;

    div.onclick = () => onSelect(unit);

    sidebar.appendChild(div);
  });
}
