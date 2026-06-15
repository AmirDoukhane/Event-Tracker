import { useState, useEffect } from "react";
import { fetchEvents } from "../api/events";

const EVENT_TYPES = ["", "login", "transaction", "report"];

export default function EventList({ refreshTrigger }) {
  const [events, setEvents] = useState([]);
  const [filters, setFilters] = useState({ user_id: "", type: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchEvents(filters);
      setEvents(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [refreshTrigger]);

  const handleFilter = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const formatDate = (iso) =>
    new Date(iso).toLocaleString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="card">
      <h2>Événements</h2>
      <div className="filters">
        <input
          type="text"
          name="user_id"
          placeholder="Filtrer par user ID"
          value={filters.user_id}
          onChange={handleFilter}
        />
        <select name="type" value={filters.type} onChange={handleFilter}>
          {EVENT_TYPES.map((t) => (
            <option key={t} value={t}>
              {t === "" ? "Tous les types" : t}
            </option>
          ))}
        </select>
        <button onClick={load}>Rechercher</button>
      </div>

      {loading && <p className="muted">Chargement...</p>}
      {error && <p className="error">{error}</p>}
      {!loading && events.length === 0 && (
        <p className="muted">Aucun événement trouvé.</p>
      )}
      {!loading && events.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>User ID</th>
              <th>Type</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {events.map((e) => (
              <tr key={e.id}>
                <td>{e.user_id}</td>
                <td>
                  <span className={`badge badge-${e.type}`}>{e.type}</span>
                </td>
                <td>{formatDate(e.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
