export async function loadTerrain(id) {
  const res = await fetch(`terrain/${id}.json`);

  if (!res.ok) {
    throw new Error(`Failed to load terrain: ${id}`);
  }

  return await res.json();
}
