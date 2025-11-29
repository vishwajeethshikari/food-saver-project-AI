// src/pages/Donation.jsx
import React, { useState } from "react";

const dummyPlaces = [
  { id: 1, name: "Helping Hands NGO", distance: 1.2 },
  { id: 2, name: "City Food Bank", distance: 2.8 },
  { id: 3, name: "Local Shelter", distance: 4.3 },
];

export default function Donation() {
  const [radius, setRadius] = useState(3);
  const [selectedPlace, setSelectedPlace] = useState(null);

  const [item, setItem] = useState("");
  const [quantity, setQuantity] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [status, setStatus] = useState("");

  function handleRadiusChange(e) {
    const value = Number(e.target.value) || 1;
    setRadius(value);
    setSelectedPlace(null);
  }

  const visiblePlaces = dummyPlaces.map((p) => {
    const isInside = p.distance <= radius;
    const label = isInside ? "Near" : "Far away";
    return { ...p, isInside, label };
  });

  function handleImageChange(e) {
    const file = e.target.files?.[0];
    setImageFile(file || null);
    if (file) {
      const url = URL.createObjectURL(file);
      setImagePreview(url);
    } else {
      setImagePreview(null);
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!item.trim() || !quantity.trim() || !selectedPlace) {
      setStatus("Please fill all fields and select a place.");
      return;
    }
    setStatus(
      `Donation request sent to ${selectedPlace.name}. You will be contacted soon.`
    );
    setItem("");
    setQuantity("");
    setImageFile(null);
    setImagePreview(null);
  }

  return (
    <div className="page donation-page">
      <div className="page-card">
        <section className="section-header">
          <h1>Donate Food</h1>
          <p className="subtitle">Help those in need</p>
        </section>

        <section className="card">
          <h2>Donate Surplus Food</h2>
          <p className="muted">
            Share extra food instead of wasting it by connecting with nearby
            people or organizations.
          </p>

          {/* Radius + fake map */}
          <div className="donation-map-section">
            <div className="radius-control">
              <label>
                Search radius:
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={radius}
                  onChange={handleRadiusChange}
                />
                <span>{radius} km</span>
              </label>
            </div>

            <div className="fake-map">
              <div className="fake-map-circle">
                <span>{radius} km</span>
              </div>
              <p className="muted small">
                Approximate area around your location (demo view).
              </p>
            </div>
          </div>

          {/* Places list */}
          <div className="places-list">
            {visiblePlaces.map((p) => (
              <button
                key={p.id}
                type="button"
                className={
                  "place-card" +
                  (selectedPlace?.id === p.id ? " place-card-active" : "") +
                  (!p.isInside ? " place-card-far" : "")
                }
                onClick={() => setSelectedPlace(p)}
              >
                <h3>{p.name}</h3>
                <p className="muted">
                  {p.distance} km away • {p.label}
                </p>
              </button>
            ))}
          </div>

          {/* Donation form */}
          <form className="form-column donation-form" onSubmit={handleSubmit}>
            <label>
              Food item
              <input
                value={item}
                onChange={(e) => setItem(e.target.value)}
                placeholder="e.g. Rice, curry, chapati"
              />
            </label>
            <label>
              Quantity
              <input
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="e.g. 3 boxes"
              />
            </label>
            <label>
              Add image (optional)
              <input type="file" accept="image/*" onChange={handleImageChange} />
            </label>

            {imagePreview && (
              <div className="image-preview">
                <img src={imagePreview} alt="Food preview" />
              </div>
            )}

            <button type="submit" className="primary-btn">
              Send donation request
            </button>
          </form>

          {status && <p className="status-text success">{status}</p>}
        </section>

        <section className="tips-section">
          <h2>Donation Tips</h2>

          <div className="tip-card">
            <div className="tip-icon">✅</div>
            <div>
              <h3>Check Freshness</h3>
              <p>Only donate food that is safe and within expiry.</p>
            </div>
          </div>

          <div className="tip-card">
            <div className="tip-icon">📦</div>
            <div>
              <h3>Pack Properly</h3>
              <p>Use clean containers and label contents when possible.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

