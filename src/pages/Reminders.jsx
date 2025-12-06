// src/pages/FoodReminders.jsx
import React, { useMemo, useState } from "react";
import "./FoodReminders.css";

/**
 * FoodReminders (Donor / User tabs)
 *
 * Top tabs: Donor | User
 * - Donor: add items, add-more, quick edit, stock bars, low/med/high coloring
 * - User: pick an item and take quantity (with validation), visual depletion, history
 *
 * UI-first: visual bars, icons, badges; no textual AI outputs.
 */

export default function FoodReminders() {
  const [tab, setTab] = useState("donor"); // "donor" or "user"

  // Stock state
  const [stock, setStock] = useState([
    { id: 1, name: "Rice", quantity: 5, unit: "kg", icon: "🍚" },
    { id: 2, name: "Dal", quantity: 3, unit: "kg", icon: "🍲" },
    { id: 3, name: "Bread", quantity: 10, unit: "pcs", icon: "🍞" },
  ]);

  // Donor form
  const [newName, setNewName] = useState("");
  const [newQty, setNewQty] = useState("");
  const [newUnit, setNewUnit] = useState("kg");

  // User selection
  const [selectedId, setSelectedId] = useState("");
  const [takeQty, setTakeQty] = useState("");

  // History log
  const [history, setHistory] = useState([
    { id: Date.now(), text: "Session started", when: new Date() },
  ]);

  // Helpers
  const maxStock = useMemo(() => {
    // choose a max visual cap (for bar lengths). If stock contains wildly different numbers, normalize a bit.
    const vals = stock.map((s) => s.quantity || 0);
    const mx = Math.max(...vals, 5);
    return mx < 5 ? 5 : Math.ceil(mx);
  }, [stock]);

  // Donor: add new food
  function handleAddNew() {
    if (!newName.trim() || !newQty || Number(newQty) <= 0) return;
    const exists = stock.find(
      (s) => s.name.toLowerCase() === newName.trim().toLowerCase()
    );
    if (exists) {
      // if exists, just add to that item
      setStock((prev) =>
        prev.map((s) =>
          s.id === exists.id
            ? { ...s, quantity: Number(s.quantity) + Number(newQty) }
            : s
        )
      );
      pushHistory(`➕ Added ${newQty} ${newUnit} to ${exists.name}`);
    } else {
      const id = Date.now();
      const icon = guessIcon(newName);
      setStock((prev) => [
        ...prev,
        { id, name: newName.trim(), quantity: Number(newQty), unit: newUnit, icon },
      ]);
      pushHistory(`➕ Created ${newName.trim()} (${newQty} ${newUnit})`);
    }

    setNewName("");
    setNewQty("");
    setNewUnit("kg");
  }

  // Donor: add more to an item (inline)
  function handleAddMore(itemId, amount) {
    if (!amount || Number(amount) <= 0) return;
    setStock((prev) =>
      prev.map((s) => (s.id === itemId ? { ...s, quantity: s.quantity + Number(amount) } : s))
    );
    const item = stock.find((s) => s.id === itemId);
    pushHistory(`➕ Donor added ${amount} ${item?.unit || "kg"} to ${item?.name}`);
  }

  // Donor: quick edit quantity (replace)
  function handleSetQty(itemId, value) {
    setStock((prev) => prev.map((s) => (s.id === itemId ? { ...s, quantity: Number(value) } : s)));
    const item = stock.find((s) => s.id === itemId);
    pushHistory(`✏️ Set ${item?.name} to ${value} ${item?.unit || "kg"}`);
  }

  // User: take food
  function handleTake() {
    if (!selectedId) return;
    const item = stock.find((s) => s.id === Number(selectedId));
    if (!item) return;
    if (!takeQty || Number(takeQty) <= 0) return;

    // unit awareness: if unit is "pcs" treat as integer
    const take = item.unit === "pcs" ? Math.floor(Number(takeQty)) : Number(takeQty);

    if (take > item.quantity) {
      // don't change state, show small inline feedback (we'll just push history for visual trace)
      pushHistory(`⚠️ Attempt to take ${take}${item.unit} ${item.name} (not enough)`);
      return;
    }

    setStock((prev) =>
      prev
        .map((s) => (s.id === item.id ? { ...s, quantity: item.quantity - take } : s))
        .filter((s) => (s.quantity > 0 ? true : false))
    );

    pushHistory(`🛒 User took ${take}${item.unit} ${item.name}`);

    setSelectedId("");
    setTakeQty("");
  }

  // Remove item completely (donor)
  function handleRemove(itemId) {
    const item = stock.find((s) => s.id === itemId);
    setStock((prev) => prev.filter((s) => s.id !== itemId));
    pushHistory(`🗑️ Removed ${item?.name}`);
  }

  // Log helper
  function pushHistory(text) {
    setHistory((prev) => [{ id: Date.now(), text, when: new Date() }, ...prev].slice(0, 60));
  }

  // Guess icon from name (small helper)
  function guessIcon(name) {
    const n = name.toLowerCase();
    if (n.includes("rice")) return "🍚";
    if (n.includes("dal") || n.includes("lentil")) return "🥣";
    if (n.includes("bread") || n.includes("toast")) return "🍞";
    if (n.includes("cake") || n.includes("dessert")) return "🍰";
    if (n.includes("fruit") || n.includes("apple") || n.includes("banana")) return "🍎";
    return "🍽️";
  }

  // Visual helpers
  const stockStatus = (q) => {
    if (q >= Math.max(4, maxStock * 0.6)) return "high";
    if (q >= Math.max(2, maxStock * 0.25)) return "medium";
    return "low";
  };

  return (
    <div className="food-rem-page">
      <div className="food-rem-shell">
        {/* Header */}
        <div className="food-rem-header">
          <div className="header-left">
            <div className="header-icon">🍏</div>
            <div>
              <h1>Food Inventory</h1>
              <p className="header-subtitle">Donor & User — manage and take items</p>
            </div>
          </div>

          {/* Top tabs */}
          <div className="tabs">
            <button
              className={`tab-btn ${tab === "donor" ? "active" : ""}`}
              onClick={() => setTab("donor")}
            >
              Donor
            </button>
            <button
              className={`tab-btn ${tab === "user" ? "active" : ""}`}
              onClick={() => setTab("user")}
            >
              User
            </button>
          </div>
        </div>

        {/* Layout: donor and user render below based on tab */}
        <div className="tab-content">
          {tab === "donor" && (
            <div className="donor-view">

              {/* Add new */}
              <section className="card add-food-card">
                <div className="add-grid">
                  <div className="add-left">
                    <input
                      className="input text"
                      placeholder="Food name (Rice, Dal...)"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                    />
                    <div className="row">
                      <input
                        className="input small"
                        placeholder="Qty"
                        type="number"
                        min="0"
                        step="0.1"
                        value={newQty}
                        onChange={(e) => setNewQty(e.target.value)}
                      />
                      <select className="input small" value={newUnit} onChange={(e) => setNewUnit(e.target.value)}>
                        <option value="kg">kg</option>
                        <option value="pcs">pcs</option>
                      </select>
                    </div>
                  </div>

                  <div className="add-right">
                    <button className="btn-add-primary" onClick={handleAddNew}>Add / Update</button>
                    <div className="muted tiny">Add a new food item or increase quantity of existing item</div>
                  </div>
                </div>
              </section>

              {/* Stock list */}
              <section className="card stock-card">
                <div className="section-header">
                  <h2>Current Stock</h2>
                  <div className="section-pill">Live</div>
                </div>

                <div className="stock-grid">
                  {stock.length === 0 && <div className="muted">No stock available</div>}

                  {stock.map((item) => {
                    const percent = Math.min(100, Math.round((item.quantity / maxStock) * 100));
                    const status = stockStatus(item.quantity);
                    return (
                      <div key={item.id} className="stock-card">
                        <div className="stock-left">
                          <div className="stock-icon">{item.icon}</div>
                          <div>
                            <div className="stock-name">{item.name}</div>
                            <div className="muted tiny">{item.quantity} {item.unit}</div>
                          </div>
                        </div>

                        <div className="stock-mid">
                          <div className="stock-bar">
                            <div className={`stock-fill ${status}`} style={{ width: `${percent}%` }} />
                          </div>
                        </div>

                        <div className="stock-actions">
                          <input
                            className="input-qty"
                            type="number"
                            min="0"
                            step={item.unit === "pcs" ? 1 : 0.1}
                            placeholder="+ add"
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                handleAddMore(item, e.target.value);
                                e.target.value = "";
                              }
                            }}
                            title="Type amount and press Enter to add"
                          />
                          <button className="btn-small" onClick={() => {
                            const v = prompt(`Set exact quantity for ${item.name} (${item.unit})`, item.quantity);
                            if (v !== null) handleSetQty(item.id, Number(v));
                          }}>Edit</button>
                          <button className="btn-remove" onClick={() => handleRemove(item.id)}>Remove</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            </div>
          )}

          {tab === "user" && (
            <div className="user-view">
              {/* Visual row: quick overview */}
              <section className="card overview-card">
                <div className="overview-left">
                  <h2>Pick & Take</h2>
                  <div className="muted tiny">Select an item and enter quantity — visual feedback only</div>
                </div>

                <div className="overview-right">
                  <div className="mini-card">
                    <div className="mini-number">{stock.length}</div>
                    <div className="mini-label">Items</div>
                  </div>

                  <div className="mini-card">
                    <div className="mini-number">{history.length}</div>
                    <div className="mini-label">Actions</div>
                  </div>
                </div>
              </section>

              {/* Take food */}
              <section className="card take-card">
                <div className="take-grid">
                  <select
                    className="select-food"
                    value={selectedId}
                    onChange={(e) => setSelectedId(e.target.value)}
                  >
                    <option value="">Select item</option>
                    {stock.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} — {s.quantity} {s.unit}
                      </option>
                    ))}
                  </select>

                  <input
                    className="input small"
                    placeholder="Qty"
                    type="number"
                    min="0"
                    step="0.1"
                    value={takeQty}
                    onChange={(e) => setTakeQty(e.target.value)}
                  />

                  <button className="btn-primary" onClick={handleTake}>Take</button>
                </div>

                {/* Quick visual stock snapshot */}
                <div className="visual-shelf">
                  {stock.map((s) => {
                    const percent = Math.min(100, Math.round((s.quantity / maxStock) * 100));
                    const status = stockStatus(s.quantity);
                    return (
                      <div key={s.id} className="shelf-card">
                        <div className="shelf-top">
                          <div className="shelf-icon">{s.icon}</div>
                          <div className="shelf-name">{s.name}</div>
                        </div>

                        <div className="shelf-bar">
                          <div className={`shelf-fill ${status}`} style={{ width: `${percent}%` }} />
                        </div>

                        <div className="shelf-meta">
                          <span className="muted tiny">{s.quantity} {s.unit}</span>
                          {status === "low" && <span className="badge red">Low</span>}
                          {status === "medium" && <span className="badge yellow">Medium</span>}
                          {status === "high" && <span className="badge green">Good</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            </div>
          )}
        </div>

        {/* History / activity (common below tabs) */}
        <section className="card history-card">
          <div className="section-header">
            <h2>Activity Log</h2>
            <div className="muted tiny">{history.length} events</div>
          </div>

          <div className="history-list">
            {history.length === 0 && <div className="muted">No actions yet</div>}
            {history.map((h) => (
              <div key={h.id} className="history-row">
                <div className="history-dot" />
                <div className="history-body">
                  <div className="history-text">{h.text}</div>
                  <div className="muted tiny">{new Date(h.when).toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
