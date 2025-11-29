// src/pages/Dashboard.jsx
import React, { useState } from "react";

export default function Dashboard() {
  // make stats dynamic so donations can change them
  const [foodSaved, setFoodSaved] = useState(250);
  const [moneySaved, setMoneySaved] = useState(12);
  const [weekWaste, setWeekWaste] = useState(1.2);

  // reminder form state
  const [showReminderForm, setShowReminderForm] = useState(false);
  const [reminderText, setReminderText] = useState("");
  const [reminderTime, setReminderTime] = useState("");
  const [reminderMessage, setReminderMessage] = useState("");

  // donation form state
  const [showDonationForm, setShowDonationForm] = useState(false);
  const [donationItem, setDonationItem] = useState("");
  const [donationQty, setDonationQty] = useState("");
  const [donationMessage, setDonationMessage] = useState("");

  function handleSetReminder(e) {
    e.preventDefault();
    if (!reminderText.trim() || !reminderTime) {
      setReminderMessage("Please enter reminder text and time.");
      return;
    }
    const timeLabel = new Date(reminderTime).toLocaleString();
    setReminderMessage(
      `Reminder set: "${reminderText.trim()}" at ${timeLabel}. You will get a notification at that time.`
    );
    setReminderText("");
    setReminderTime("");
  }

  function handleDonate(e) {
    e.preventDefault();
    if (!donationItem.trim() || !donationQty.trim()) {
      setDonationMessage("Please enter item and quantity.");
      return;
    }
    setDonationMessage(
      `Thanks! Your donation of ${donationQty.trim()} ${donationItem.trim()} is recorded.`
    );
    setDonationItem("");
    setDonationQty("");

    // small visual change in stats when donating
    setFoodSaved((prev) => prev + 100);
    setMoneySaved((prev) => prev + 3);
    setWeekWaste((prev) => Math.max(0, prev - 0.1));
  }

  return (
    <div className="page dashboard-page">
      <div className="page-card">
        <section className="section-header">
          <p className="subtitle">Welcome back!</p>
          <h1>Let's save food together</h1>
        </section>

        <section className="card dashboard-today">
          <h2>Today's Impact</h2>
          <div className="impact-grid">
            <div className="impact-card">
              <h3>Food Saved</h3>
              <p className="impact-value">{foodSaved}g</p>
              <p className="muted">vs yesterday</p>
            </div>
            <div className="impact-card">
              <h3>Money Saved</h3>
              <p className="impact-value">₹{moneySaved}</p>
              <p className="muted">this week</p>
            </div>
          </div>
        </section>

        <section className="card dashboard-week">
          <h2>This Week</h2>
          <p className="muted">Food Waste Reduced</p>
          <p className="impact-value">{weekWaste.toFixed(1)}kg</p>
          <p className="muted">-23% from last week</p>
          <p className="muted">Goal: 1.5kg reduction</p>
        </section>

        <section className="dashboard-actions">
          <h2>Quick Actions</h2>
          <div className="quick-grid">
            <button
              className="tile-btn"
              onClick={() => setShowReminderForm((v) => !v)}
            >
              <h3>Set Reminder</h3>
              <p className="muted">Never forget expiry dates</p>
            </button>
            <button
              className="tile-btn"
              onClick={() => setShowDonationForm((v) => !v)}
            >
              <h3>Donate Food</h3>
              <p className="muted">Help those in need</p>
            </button>
          </div>
        </section>

        {showReminderForm && (
          <section className="card">
            <h2>New Reminder</h2>
            <form className="form-column" onSubmit={handleSetReminder}>
              <label>
                Reminder text
                <input
                  type="text"
                  value={reminderText}
                  onChange={(e) => setReminderText(e.target.value)}
                  placeholder="e.g. Use leftover curry"
                />
              </label>
              <label>
                Time
                <input
                  type="datetime-local"
                  value={reminderTime}
                  onChange={(e) => setReminderTime(e.target.value)}
                />
              </label>
              <button type="submit" className="primary-btn">
                Save reminder
              </button>
            </form>
            {reminderMessage && (
              <p className="status-text success">{reminderMessage}</p>
            )}
          </section>
        )}

        {showDonationForm && (
          <section className="card">
            <h2>Quick Donation</h2>
            <form className="form-column" onSubmit={handleDonate}>
              <label>
                Food item
                <input
                  value={donationItem}
                  onChange={(e) => setDonationItem(e.target.value)}
                  placeholder="e.g. Rice, curry"
                />
              </label>
              <label>
                Quantity
                <input
                  value={donationQty}
                  onChange={(e) => setDonationQty(e.target.value)}
                  placeholder="e.g. 2 boxes"
                />
              </label>
              <button type="submit" className="primary-btn">
                Record donation
              </button>
            </form>
            {donationMessage && (
              <p className="status-text success">{donationMessage}</p>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
