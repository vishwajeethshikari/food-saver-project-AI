// src/pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

export default function Dashboard({ user, onLogout }) {
  const navigate = useNavigate();

  // ------------------------------------------
  // LOCAL STORAGE TRACKING
  // ------------------------------------------
  const [totalSaved, setTotalSaved] = useState(
    Number(localStorage.getItem("totalSaved") || 0)
  );
  const [dailySave, setDailySave] = useState("");
  const [streak, setStreak] = useState(
    Number(localStorage.getItem("streak") || 0)
  );

  // ------------------------------------------
  // TOAST + AI CHAT
  // ------------------------------------------
  const [toast, setToast] = useState("");
  const [aiOpen, setAiOpen] = useState(false);
  const [aiInput, setAiInput] = useState("");

  const [aiMessages, setAiMessages] = useState([
    { from: "ai", text: "Tell me what food you saved today." }
  ]);

  // ------------------------------------------
  // LOGOUT
  // ------------------------------------------
  const handleLogout = () => {
    onLogout();
    navigate("/");
  };

  // ------------------------------------------
  // TOAST FUNCTION
  // ------------------------------------------
  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2000);
  };

  // ------------------------------------------
  // USER: SAVE TODAY'S FOOD
  // ------------------------------------------
  const saveTodayFood = () => {
    if (!dailySave.trim()) {
      showToast("Enter grams first!");
      return;
    }

    const amount = Number(dailySave);
    const newTotal = totalSaved + amount;
    const newStreak = streak + 1;

    setTotalSaved(newTotal);
    setStreak(newStreak);

    localStorage.setItem("totalSaved", newTotal);
    localStorage.setItem("streak", newStreak);

    showToast("✔ Saved!");

    setDailySave("");
  };

  // ------------------------------------------
  // AI CHAT BOT RESPONSE
  // ------------------------------------------
  const handleAiSend = () => {
    if (!aiInput.trim()) return;

    const msg = aiInput;
    const lower = msg.toLowerCase();

    setAiMessages((prev) => [...prev, { from: "user", text: msg }]);
    setAiInput("");

    let reply = "";

    if (lower.includes("rice")) reply = "Rice stays fresh 4–5 hrs. Use first!";
    else if (lower.includes("dal") || lower.includes("lentils"))
      reply = "Dal can be refrigerated for 24 hrs safely.";
    else if (lower.includes("bread")) reply = "Bread expiring? Toast or donate.";
    else if (lower.includes("saved"))
      reply = `You've saved ${totalSaved}g so far—great!`;
    else if (!isNaN(msg))
      reply = `Tracking ${msg} grams. Want me to add this to your log?`;
    else reply = "Tell me any item, I’ll guide you.";

    setTimeout(
      () =>
        setAiMessages((prev) => [...prev, { from: "ai", text: reply }]),
      600
    );
  };

  // ------------------------------------------
  // ROLE-BASED NAVIGATION
  // ------------------------------------------
  const handleDonate = () => {
    if (user.role !== "donor") {
      showToast("❌ Only donors can donate");
      return;
    }
    navigate("/donation");
  };

  const handleNearby = () => {
    if (user.role !== "user") {
      showToast("❌ Donors cannot claim food");
      return;
    }
    navigate("/nearby-food");
  };

  const handleReminder = () => navigate("/reminders");
  const handleStats = () => showToast("📊 Stats coming soon");

  // ------------------------------------------
  // UI
  // ------------------------------------------
  return (
    <div className="dashboard-page fade-in">

      {/* LOGOUT BTN */}
      <button className="logout-btn" onClick={handleLogout}>⏻ Logout</button>

      {/* WELCOME CARD */}
      <section className="hero-card">
        <h1 className="hero-title">👋 Hello {user.username}!</h1>
        <p className="hero-sub">
          {user.role === "donor"
            ? "You can donate food and manage contributors."
            : "Track your food-saving progress here."}
        </p>
      </section>

      {/* IMPACT CARDS */}
      <section className="impact-row">
        <div className="impact-card card-shadow">
          <span className="impact-icon">🥗</span>
          <div>
            <h2>{totalSaved} <span className="unit">g</span></h2>
            <p>Total Food Saved</p>
          </div>
        </div>

        <div className="impact-card card-shadow">
          <span className="impact-icon">🔥</span>
          <div>
            <h2>{streak} <span className="unit">days</span></h2>
            <p>Saving Streak</p>
          </div>
        </div>
      </section>

      {/* USER ONLY → DAILY SAVE INPUT */}
      {user.role === "user" && (
        <section className="card projected-live">
          <h3>Log Today’s Saved Food</h3>

          <input
            type="number"
            placeholder="e.g. 120 grams"
            value={dailySave}
            onChange={(e) => setDailySave(e.target.value)}
          />

          <button className="save-btn" onClick={saveTodayFood}>Save</button>
        </section>
      )}

      {/* QUICK ACTIONS */}
      <section className="card quick-section">
        <h3>Quick Actions</h3>

        <div className="quick-grid">
          <button onClick={handleReminder}>🔔 Reminders</button>
          <button onClick={handleDonate}>🤝 Donate</button>
          <button onClick={handleNearby}>📍 Nearby</button>
          <button onClick={handleStats}>📊 Stats</button>
        </div>

        {toast && <div className="toast-popup">{toast}</div>}
      </section>

      {/* AI CHAT */}
      <section className="card ai-section">
        <h3>AI Suggestions</h3>

        {!aiOpen && (
          <p className="muted small clickable" onClick={() => setAiOpen(true)}>
            Tap to chat →
          </p>
        )}

        {aiOpen && (
          <div className="ai-chat fade-in">
            <div className="chat-area">
              {aiMessages.map((m, i) => (
                <div key={i} className={m.from === "ai" ? "msg-ai" : "msg-user"}>
                  {m.text}
                </div>
              ))}
            </div>

            <div className="chat-input">
              <input
                type="text"
                value={aiInput}
                placeholder="Ask your assistant..."
                onChange={(e) => setAiInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAiSend()}
              />
              <button onClick={handleAiSend}>➤</button>
            </div>
          </div>
        )}
      </section>

    </div>
  );
}
