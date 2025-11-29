// src/pages/Portion.jsx
import React, { useState } from "react";

const basePortions = [
  { id: 1, icon: "🍚", name: "Rice", note: "Based on your usual portions", perPerson: 150 },
  { id: 2, icon: "🍛", name: "Curry", note: "Perfect for one serving", perPerson: 1 }, // cups
  { id: 3, icon: "🥗", name: "Salad", note: "Healthy side portion", perPerson: 100 },
];

export default function Portion() {
  const [people, setPeople] = useState(1);
  const [portions, setPortions] = useState(basePortions);
  const [status, setStatus] = useState("");

  function handleAccept() {
    setStatus("Suggestions saved for today. Portions updated for your household.");
  }

  function handleNewSuggestions() {
    // simple variation: +/− 10% random change
    const updated = basePortions.map((p) => {
      const factor = 0.9 + Math.random() * 0.2; // 0.9–1.1
      return { ...p, perPerson: Math.round(p.perPerson * factor) || 1 };
    });
    setPortions(updated);
    setStatus("New AI suggestions generated based on recent patterns.");
  }

  const displayPortions = portions.map((p) => {
    if (p.name === "Curry") {
      const totalCups = (p.perPerson * people).toFixed(1);
      return { ...p, displayAmount: `${totalCups} cup${totalCups === "1.0" ? "" : "s"}` };
    }
    const total = p.perPerson * people;
    return { ...p, displayAmount: `${total}g` };
  });

  return (
    <div className="page portion-page">
      <div className="page-card">
        <section className="section-header">
          <h1>AI Portion Suggestions</h1>
          <p className="subtitle">Personalized for you</p>
        </section>

        <section className="card">
          <div className="section-title-row">
            <h2>Today&apos;s Recommendations</h2>
            <span className="muted">
              Based on your eating habits and preferences
            </span>
          </div>

          <div className="portion-people-control">
            <label>
              Number of people
              <input
                type="number"
                min={1}
                value={people}
                onChange={(e) =>
                  setPeople(Math.max(1, Number(e.target.value) || 1))
                }
              />
            </label>
          </div>

          <div className="portion-list">
            {displayPortions.map((item) => (
              <div key={item.id} className="portion-row">
                <div className="portion-icon">{item.icon}</div>
                <div className="portion-text">
                  <h3>{item.name}</h3>
                  <p className="muted">{item.note}</p>
                </div>
                <div className="portion-amount">{item.displayAmount}</div>
              </div>
            ))}
          </div>

          <div className="portion-actions">
            <button className="primary-btn" onClick={handleAccept}>
              Accept Suggestions
            </button>
            <button className="outline-btn" onClick={handleNewSuggestions}>
              Get New Suggestions
            </button>
          </div>

          {status && <p className="status-text success">{status}</p>}
        </section>

        <section className="tips-section">
          <h2>Portion Tips</h2>

          <div className="tip-card">
            <div className="tip-icon">💡</div>
            <div>
              <h3>Start Small</h3>
              <p>You can always get more if needed</p>
            </div>
          </div>

          <div className="tip-card">
            <div className="tip-icon">📏</div>
            <div>
              <h3>Use Visual Cues</h3>
              <p>A cupped palm is about 1/2 cup of rice</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
