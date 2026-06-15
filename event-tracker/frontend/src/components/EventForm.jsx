import { useState } from "react";
import { createEvent } from "../api/events";

const EVENT_TYPES = ["login", "transaction", "report"];

export default function EventForm({ onCreated }) {
  const [form, setForm] = useState({ user_id: "", type: "login" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!form.user_id.trim()) {
      setError("L'identifiant utilisateur est requis.");
      return;
    }
    setLoading(true);
    try {
      await createEvent(form);
      setForm({ user_id: "", type: "login" });
      onCreated();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2>Créer un événement</h2>
      <form onSubmit={handleSubmit}>
        <div className="field">
          <label>User ID</label>
          <input
            type="text"
            name="user_id"
            value={form.user_id}
            onChange={handleChange}
            placeholder="ex: user_42"
          />
        </div>
        <div className="field">
          <label>Type</label>
          <select name="type" value={form.type} onChange={handleChange}>
            {EVENT_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        {error && <p className="error">{error}</p>}
        <button type="submit" disabled={loading}>
          {loading ? "Envoi..." : "Créer"}
        </button>
      </form>
    </div>
  );
}
