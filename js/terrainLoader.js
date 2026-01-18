export async function loadTerrain(id) {
  const res = await fetch(`terrain/${id}.json`);
  return res.json();
}
