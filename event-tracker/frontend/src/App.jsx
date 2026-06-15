import { useState } from "react";
import EventForm from "./components/EventForm";
import EventList from "./components/EventList";
import UserSummary from "./components/UserSummary";
import "./App.css";

export default function App() {
  const [refresh, setRefresh] = useState(0);

  const handleEventCreated = () => {
    setRefresh((r) => r + 1);
  };

  return (
    <div className="app">
      <header>
        <h1>Event Tracker</h1>
        <p>Suivi d'événements utilisateurs</p>
      </header>
      <main>
        <div className="column">
          <EventForm onCreated={handleEventCreated} />
          <UserSummary />
        </div>
        <div className="column wide">
          <EventList refreshTrigger={refresh} />
        </div>
      </main>
    </div>
  );
}
