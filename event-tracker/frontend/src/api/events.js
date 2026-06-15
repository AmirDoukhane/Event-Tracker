const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

export async function fetchEvents(filters = {}) {
  const params = new URLSearchParams();
  if (filters.user_id) params.append("user_id", filters.user_id);
  if (filters.type) params.append("type", filters.type);

  const res = await fetch(`${BASE_URL}/events/?${params.toString()}`);
  if (!res.ok) throw new Error("Erreur lors du chargement des événements");
  return res.json();
}

export async function createEvent(data) {
  const res = await fetch(`${BASE_URL}/events/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Erreur lors de la création");
  }
  return res.json();
}

export async function fetchUserSummary(userId) {
  const res = await fetch(`${BASE_URL}/users/${userId}/summary`);
  if (!res.ok) throw new Error("Utilisateur introuvable ou sans événements");
  return res.json();
}
