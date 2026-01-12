document.getElementById("import").addEventListener("change", e => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    const data = JSON.parse(reader.result);
    importFromNewRecruit(data);
  };
  reader.readAsText(file);
});

function importFromNewRecruit(data) {
  if (!data.roster || !data.roster.forces) {
    alert("Fel fil – exportera JSON från New Recruit");
    return;
  }

  let spawnX = 120;
  let spawnY = 200;

  data.roster.forces.forEach(force => {
    force.selections.forEach(unit => {
      spawnModelsFromSelection(unit, spawnX, spawnY);
      spawnY += 60;
    });
  });
}

function spawnModelsFromSelection(selection, x, y) {
  // Om detta är en modell (har base)
  if (selection.base) {
    const base = parseBase(selection.base);
    models.push({
      type: selection.name,
      r: base.r,
      w: base.w,
      h: base.h,
      shape: base.shape,
      x,
      y
    });
    return;
  }

  // Annars: gå djupare (units innehåller modeller)
  if (selection.selections) {
    selection.selections.forEach((s, i) => {
      spawnModelsFromSelection(s, x + i * 28, y);
    });
  }
}

function parseBase(baseString) {
  // Ex: "25mm", "32mm", "60x35mm"
  if (baseString.includes("x")) {
    const [w, h] = baseString.replace("mm", "").split("x").map(Number);
    return {
      shape: "oval",
      w: w * 0.06 * 15,
      h: h * 0.06 * 15
    };
  } else {
    const d = Number(baseString.replace("mm", ""));
    return {
      shape: "circle",
      r: (d / 2) * 0.06 * 15
    };
  }
}
