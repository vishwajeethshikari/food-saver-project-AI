// src/pages/Reminders.jsx
import React, { useState } from "react";

const initialReminders = [
  { id: 1, name: "Curry", expiresIn: "2 days", priority: "high", icon: "🍛" },
  { id: 2, name: "Bread", expiresIn: "Tomorrow", priority: "critical", icon: "🍞" },
  { id: 3, name: "Milk", expiresIn: "4 days", priority: "medium", icon: "🥛" },
  { id: 4, name: "Apples", expiresIn: "5 days", priority: "low", icon: "🍎" },
];

function priorityClass(priority) {
  switch (priority) {
    case "critical":
      return "priority priority-critical";
    case "high":
      return "priority priority-high";
    case "medium":
      return "priority priority-medium";
    case "low":
    default:
      return "priority priority-low";
  }
}

export default function Reminders() {
  const [list, setList] = useState(initialReminders);
  const [showForm, setShowForm] = useState(false);
  const [foodName, setFoodName] = useState("");
  const [expiresIn, setExpiresIn] = useState("Tomorrow");
  const [priority, setPriority] = useState("medium");
  const [status, setStatus] = useState("");
  const [lastActionAt, setLastActionAt] = useState(null);
  const [toast, setToast] = useState("");

  function showToast(message) {
    setToast(message);
    setTimeout(() => setToast(""), 2500);
  }

  function handleAddReminder(e) {
    e.preventDefault();
    if (!foodName.trim()) return;

    const newReminder = {
      id: Date.now(),
      name: foodName.trim(),
      expiresIn,
      priority,
      icon: "🍽️",
    };

    setList((prev) => [...prev, newReminder]);
    setFoodName("");
    setExpiresIn("Tomorrow");
    setPriority("medium");
    setShowForm(false);

    const now = new Date();
    setLastActionAt(now);
    const timeLabel = now.toLocaleTimeString();
    setStatus(
      `Reminder created for ${newReminder.name}. A notification will be sent before expiry.`
    );
    showToast(`Reminder scheduled at ${timeLabel}`);
  }

  function handleDone(id) {
    setList((prev) => prev.filter((item) => item.id !== id));
    const now = new Date();
    setLastActionAt(now);
    setStatus("Great! That item is marked as used / donated.");
    showToast("Nice! One less item to waste.");
  }

  function handleSnoozeAll() {
    const now = new Date();
    setLastActionAt(now);
    setStatus("All reminders snoozed for 1 day. You will get messages later.");
    showToast("All reminders snoozed +1 day.");
  }

  function handleSettings() {
    const now = new Date();
    setLastActionAt(now);
    setStatus("Settings updated. You will receive messages on time.");
    showToast("Reminder notifications updated.");
  }

  return (
    <div className="page reminders-page">
      <div className="page-card">
        <section className="section-header row">
          <div>
            <h1>Food Reminders</h1>
            <p className="subtitle">Never waste food again</p>
          </div>
          <button
            className="primary-btn small"
            onClick={() => setShowForm((v) => !v)}
          >
            Add
          </button>
        </section>

        <section className="card">
          <div className="section-title-row">
            <h2>Active Reminders</h2>
            <span className="muted">{list.length} items</span>
          </div>

          {showForm && (
            <form className="form-row reminders-form" onSubmit={handleAddReminder}>
              <input
                type="text"
                value={foodName}
                onChange={(e) => setFoodName(e.target.value)}
                placeholder="Food name (e.g. Leftover biryani)"
              />
              <select
                value={expiresIn}
                onChange={(e) => setExpiresIn(e.target.value)}
              >
                <option>Tomorrow</option>
                <option>In 2 days</option>
                <option>In 3 days</option>
                <option>In 5 days</option>
              </select>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                <option value="critical">critical</option>
                <option value="high">high</option>
                <option value="medium">medium</option>
                <option value="low">low</option>
              </select>
              <button type="submit" className="primary-btn small">
                Save
              </button>
            </form>
          )}

          <div className="reminders-grid">
            {list.map((item) => (
              <article key={item.id} className="reminder-card">
                <div className="reminder-icon">{item.icon}</div>
                <div className="reminder-content">
                  <h3>{item.name}</h3>
                  <p className="expires">Expires in {item.expiresIn}</p>
                  <span className={priorityClass(item.priority)}>
                    {item.priority}
                  </span>
                </div>
                <button
                  className="outline-btn small"
                  onClick={() => handleDone(item.id)}
                >
                  Done
                </button>
              </article>
            ))}
          </div>
        </section>

        <section className="quick-actions">
          <div className="quick-actions-row">
            <button className="outline-btn" onClick={handleSnoozeAll}>
              Snooze All
            </button>
            <button className="outline-btn" onClick={handleSettings}>
              Settings
            </button>
          </div>

          <div className="pro-tip">
            <h3>Pro Tip</h3>
            <p>
              Set reminders 1–2 days before expiry to have time to use or donate
              the food!
            </p>
          </div>
        </section>

        {lastActionAt && (
          <p className="muted small">
            Last reminder update at {lastActionAt.toLocaleTimeString()}
          </p>
        )}

        {status && <p className="status-text success">{status}</p>}

        {toast && <div className="toast">{toast}</div>}
      </div>
    </div>
  );
}
