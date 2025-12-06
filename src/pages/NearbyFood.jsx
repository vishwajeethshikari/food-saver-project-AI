import React, { useEffect, useMemo, useState } from "react";
import "./NearbyFood.css";

/*
  NearbyFood.jsx
  - Live timers (expiresInSeconds per item)
  - Expandable cards
  - Availability meter (visual)
  - User quick actions (Take / Save / Notify / Hide)
  - Pickup slot booking (visual)
  - All UI-driven; no textual AI outputs or alerts.
*/

const initialFood = [
  {
    id: 1,
    icon: "🍛",
    name: "Veg curry",
    distanceKm: 1.2,
    // expiry in seconds (for demo set minutes -> convert to seconds)
    expiresInSeconds: 60 * 45, // 45 minutes
    quantity: 8,
    unit: "portions",
    freshness: "Fresh",
    donor: { name: "Hostel A", hygiene: 4.8, contact: "Hidden" },
  },
  {
    id: 2,
    icon: "🍚",
    name: "Steamed rice",
    distanceKm: 2.5,
    expiresInSeconds: 60 * 120, // 2 hours
    quantity: 15,
    unit: "portions",
    freshness: "Good",
    donor: { name: "Canteen B", hygiene: 4.3, contact: "Hidden" },
  },
  {
    id: 3,
    icon: "🥗",
    name: "Salad bowls",
    distanceKm: 3.8,
    expiresInSeconds: 60 * 25, // 25 minutes
    quantity: 6,
    unit: "portions",
    freshness: "Soon",
    donor: { name: "Cafe C", hygiene: 4.6, contact: "Hidden" },
  },
  {
    id: 4,
    icon: "🍕",
    name: "Pizza slices",
    distanceKm: 4.9,
    expiresInSeconds: 60 * 12, // 12 minutes
    quantity: 10,
    unit: "slices",
    freshness: "Urgent",
    donor: { name: "Party D", hygiene: 3.9, contact: "Hidden" },
  },
];

export default function NearbyFood() {
  // items state keeps dynamic properties like remainingSeconds, hidden, saved, notified, bookedSlot
  const [items, setItems] = useState(() =>
    initialFood.map((f) => ({
      ...f,
      remaining: f.expiresInSeconds,
      expanded: false,
      saved: false,
      notified: false,
      hidden: false,
      bookedSlot: null,
    }))
  );

  // radius slider state
  const [radius, setRadius] = useState(2.0);

  // saved list (IDs)
  const savedIds = useMemo(() => items.filter((i) => i.saved).map((i) => i.id), [items]);

  // visible items based on radius and not hidden
  const visible = useMemo(
    () => items.filter((it) => it.distanceKm <= radius && !it.hidden),
    [items, radius]
  );

  // global tick updating remaining seconds every second
  useEffect(() => {
    const t = setInterval(() => {
      setItems((prev) =>
        prev.map((it) =>
          it.remaining > 0 ? { ...it, remaining: it.remaining - 1 } : { ...it, remaining: 0 }
        )
      );
    }, 1000);

    return () => clearInterval(t);
  }, []);

  // helper: format seconds mm:ss or "0:00"
  const fmt = (s) => {
    if (!s || s <= 0) return "0:00";
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  // helper: freshness color by remaining seconds percentage
  const freshnessColor = (remaining, original) => {
    if (!original || original <= 0) return "red";
    const pct = (remaining / original) * 100;
    if (pct > 50) return "green";
    if (pct > 20) return "yellow";
    return "red";
  };

  // Take now action (user) — reduces quantity visually; if zero, item gets hidden from visible list
  function takeNow(id, amount = 1) {
    setItems((prev) =>
      prev
        .map((it) => {
          if (it.id !== id) return it;
          const take = it.unit === "slices" ? Math.floor(amount) : amount;
          const newQty = Math.max(0, it.quantity - take);
          return { ...it, quantity: newQty };
        })
        .map((it) => (it.quantity <= 0 ? { ...it, hidden: true } : it))
    );
  }

  // Save action toggles saved state
  function toggleSave(id) {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, saved: !it.saved } : it)));
  }

  // Notify toggles notified state (icon glows)
  function toggleNotify(id) {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, notified: !it.notified } : it)));
  }

  // Hide removes from visible UI (but keeps in items)
  function hideItem(id) {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, hidden: true } : it)));
  }

  // Toggle expand
  function toggleExpand(id) {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, expanded: !it.expanded } : it)));
  }

  // Book pickup slot (slot is a string e.g. "10:00")
  function bookSlot(id, slot) {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, bookedSlot: it.bookedSlot === slot ? null : slot } : it)));
  }

  // handle radius change
  function handleRadiusChange(val) {
    setRadius(Number(val));
  }

  // compute max quantity among visible for normalization of meters
  const maxQty = useMemo(() => {
    const all = items.filter((i) => !i.hidden).map((i) => i.quantity);
    const mx = Math.max(...all, 5);
    return mx < 5 ? 5 : mx;
  }, [items]);

  // Predefined pickup slots for booking
  const pickupSlots = ["10:00", "10:30", "11:00", "11:30", "12:00"];

  return (
    <div className="nearby-page">
      <div className="nearby-shell">
        {/* Header */}
        <header className="nearby-header">
          <div>
            <h1>Nearby Food</h1>
            <p className="subtitle">Tap items to expand. Interact with the UI (no text outputs).</p>
          </div>
        </header>

        {/* Radius control + mini map */}
        <section className="card radius-card">
          <div className="radius-header">
            <h2>Search radius</h2>
            <span className="radius-value">{radius} km</span>
          </div>

          <div className="radius-control">
            <input
              type="range"
              min={1}
              max={5}
              step={0.1}
              value={radius}
              onChange={(e) => handleRadiusChange(e.target.value)}
            />
          </div>

          <div className="fake-map">
            <div className="fake-map-circle">
              <div className="map-center" />
              {items.map((item, index) => {
                // position based on index for demo
                const top = 30 + (index % 3) * 12;
                const left = 35 + (index % 4) * 11;
                const active = item.distanceKm <= radius && !item.hidden;
                return (
                  <div
                    key={item.id}
                    className={`map-dot ${active ? "map-dot-active" : "map-dot-far"}`}
                    style={{ top: `${top}%`, left: `${left}%` }}
                    onClick={() => {
                      if (active) toggleExpand(item.id);
                    }}
                    title={item.name}
                  />
                );
              })}
              <span className="map-label">{radius} km radius</span>
            </div>
          </div>

          <div className="radius-legend">
            <div className="legend-item"><span className="dot mini green" /> Fresh</div>
            <div className="legend-item"><span className="dot mini yellow" /> Soon</div>
            <div className="legend-item"><span className="dot mini red" /> Urgent</div>
          </div>
        </section>

        {/* Food list */}
        <section className="card list-card">
          <div className="section-header">
            <h2>Available food near you</h2>
            <span className="muted small">Tap a card to expand details & use quick actions</span>
          </div>

          <div className="food-list">
            {visible.length === 0 && (
              <div className="empty-state">No food currently within this radius.</div>
            )}

            {visible.map((item) => {
              const percentQty = Math.min(100, Math.round((item.quantity / maxQty) * 100));
              const color = freshnessColor(item.remaining, item.expiresInSeconds);
              return (
                <article key={item.id} className={`food-item ${item.expanded ? "expanded" : ""}`}>
                  <div className="food-left" onClick={() => toggleExpand(item.id)}>
                    <div className="food-avatar">{item.icon}</div>

                    <div className="food-meta">
                      <h3>{item.name}</h3>
                      <div className="muted small">
                        {item.distanceKm.toFixed(1)} km • {item.quantity} {item.unit}
                      </div>

                      {/* availability (C) */}
                      <div className="availability">
                        <div className="avail-bar">
                          <div className={`avail-fill ${color}`} style={{ width: `${percentQty}%` }} />
                        </div>
                        <div className="avail-percent">{percentQty}%</div>
                      </div>
                    </div>
                  </div>

                  {/* Right side: freshness timer + action icons */}
                  <div className="food-right">
                    <div className="fresh-timer">
                      <div className={`timer-dot ${color}`} />
                      <div className="timer-text">{fmt(item.remaining)}</div>
                    </div>

                    <div className="icons-row">
                      <button
                        className={`icon-btn notify ${item.notified ? "active" : ""}`}
                        onClick={() => toggleNotify(item.id)}
                        title="Notify"
                      >
                        🔔
                      </button>

                      <button
                        className={`icon-btn save ${item.saved ? "active" : ""}`}
                        onClick={() => toggleSave(item.id)}
                        title="Save"
                      >
                        ❤️
                      </button>

                      <button className="icon-btn hide" onClick={() => hideItem(item.id)} title="Hide">
                        ✖
                      </button>
                    </div>
                  </div>

                  {/* Expandable details (B) */}
                  {item.expanded && (
                    <div className="food-expanded">

                      {/* top details row */}
                      <div className="expanded-top">
                        <div className="donor-block">
                          <div className="donor-name">{item.donor.name}</div>
                          <div className="hygiene">
                            <div className="hygiene-bar">
                              <div className="hygiene-fill" style={{ width: `${(item.donor.hygiene / 5) * 100}%` }} />
                            </div>
                            <div className="muted tiny">Hygiene {item.donor.hygiene}/5</div>
                          </div>
                        </div>

                        <div className="slot-block">
                          <div className="muted tiny">Pickup slots</div>
                          <div className="slots-row">
                            {pickupSlots.map((slot) => {
                              const booked = item.bookedSlot === slot;
                              return (
                                <button
                                  key={slot}
                                  className={`slot-btn ${booked ? "booked" : ""}`}
                                  onClick={() => bookSlot(item.id, slot)}
                                >
                                  {slot}
                                  {booked && <span className="slot-check">✔</span>}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      {/* middle actions row (D) */}
                      <div className="expanded-actions">
                        <div className="take-controls">
                          <button className="btn-action take" onClick={() => takeNow(item.id, 1)}>Take 1</button>
                          <button className="btn-action take-2" onClick={() => takeNow(item.id, 2)}>Take 2</button>
                          <button className="btn-action take-max" onClick={() => takeNow(item.id, item.quantity)}>Take All</button>
                        </div>

                        <div className="secondary-actions">
                          <button className={`btn-small ${item.saved ? "active" : ""}`} onClick={() => toggleSave(item.id)}>Save</button>
                          <button className={`btn-small ${item.notified ? "active" : ""}`} onClick={() => toggleNotify(item.id)}>Notify</button>
                          <button className="btn-small" onClick={() => hideItem(item.id)}>Hide</button>
                        </div>
                      </div>

                      {/* bottom extra info */}
                      <div className="expanded-bottom">
                        <div className="pickup-info">
                          <div className="muted tiny">Pickup instructions</div>
                          <div className="pickup-text">Collect from main gate. Bring a container.</div>
                        </div>

                        <div className="remaining-info">
                          <div className="muted tiny">Remaining</div>
                          <div className="remaining-number">{item.quantity} {item.unit}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}

// Shared pickup slots used in JSX
const pickupSlots = ["10:00", "10:30", "11:00", "11:30", "12:00"];
