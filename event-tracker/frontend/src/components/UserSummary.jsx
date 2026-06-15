import { useState } from "react";
import { fetchUserSummary } from "../api/events";

export default function UserSummary() {
  const [userId, setUserId] = useState("");
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!userId.trim()) return;
    setLoading(true);
    setError(null);
    setSummary(null);
    try {
      const data = await fetchUserSummary(userId.trim());
      setSummary(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (iso) =>
    iso
      ? new Date(iso).toLocaleString("fr-FR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "—";

  return (
    <div className="card">
      <h2>Résumé utilisateur</h2>
      <form onSubmit={handleSearch} className="filters">
        <input
          type="text"
          placeholder="Entrez un user ID"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
        />
        <button type="submit" disabled={loading}>
          {loading ? "..." : "Rechercher"}
        </button>
      </form>

      {error && <p className="error">{error}</p>}

      {summary && (
        <div className="summary">
          <p>
            <strong>User :</strong> {summary.user_id}
          </p>
          <p>
            <strong>Total événements :</strong> {summary.total_events}
          </p>
          <p>
            <strong>Premier événement :</strong> {formatDate(summary.first_event)}
          </p>
          <p>
            <strong>Dernier événement :</strong> {formatDate(summary.last_event)}
          </p>
          <div className="by-type">
            <strong>Répartition par type :</strong>
            <ul>
              {Object.entries(summary.by_type).map(([type, count]) => (
                <li key={type}>
                  <span className={`badge badge-${type}`}>{type}</span> — {count}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
