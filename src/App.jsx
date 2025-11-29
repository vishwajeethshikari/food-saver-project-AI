// src/App.jsx
import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useLocation,
} from "react-router-dom";
import Dashboard from "./pages/Dashboard.jsx";
import Portion from "./pages/Portion.jsx";
import Donation from "./pages/Donation.jsx";
import Reminders from "./pages/Reminders.jsx";
import "./App.css";


function Layout({ children }) {
  const { pathname } = useLocation();


  return (
    <div className="app-root">
      <header className="app-header">
        <div className="logo-main">
          <span className="logo-mark">Food</span>
          <span className="logo-mark highlight">Saver</span>
        </div>
        <button className="notifications-btn">Notifications</button>
      </header>


      <main className="app-main">{children}</main>


      <nav className="bottom-nav">
        <Link
          to="/dashboard"
          className={`nav-item ${
            pathname === "/dashboard" || pathname === "/" ? "nav-item-active" : ""
          }`}
        >
          <span className="nav-icon">🏠</span>
          <span>Home</span>
        </Link>


        <Link
          to="/portion"
          className={`nav-item ${
            pathname === "/portion" ? "nav-item-active" : ""
          }`}
        >
          <span className="nav-icon">🍽️</span>
          <span>Portion</span>
        </Link>


        <Link
          to="/donation"
          className={`nav-item ${
            pathname === "/donation" ? "nav-item-active" : ""
          }`}
        >
          <span className="nav-icon">💚</span>
          <span>Donate</span>
        </Link>


        <Link
          to="/reminders"
          className={`nav-item ${
            pathname === "/reminders" ? "nav-item-active" : ""
          }`}
        >
          <span className="nav-icon">⏰</span>
          <span>Reminders</span>
        </Link>
      </nav>
    </div>
  );
}


function AppShell() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/portion" element={<Portion />} />
          <Route path="/donation" element={<Donation />} />
          <Route path="/reminders" element={<Reminders />} />
        </Routes>
      </Layout>
    </Router>
  );
}


export default function App() {
  const [user, setUser] = useState(null);
  const [name, setName] = useState("");
  const [area, setArea] = useState("");


  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !area.trim()) return;
    setUser({ name, area });
  };


  // Show login with food background first
  if (!user) {
    return (
      <div className="landing-bg">
        <div className="landing-overlay">
          <div className="landing-content">
            <h1>FoodSaver</h1>
            <p>Reduce food waste and help your community.</p>


            <form className="login-card" onSubmit={handleSubmit}>
              <h2>Welcome</h2>
              <label>
                Name
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                />
              </label>
              <label>
                Area
                <input
                  type="text"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  placeholder="e.g. Hyderabad, Madhapur"
                />
              </label>
              <button type="submit" className="primary-btn full">
                Continue
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }


  // After login, show the normal app
  return <AppShell />;
} 