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
import NearbyFood from "./pages/NearbyFood.jsx";

import "./App.css";

// ---------------- Layout ---------------- //

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

      {/* Bottom Navigation */}
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
          className={`nav-item ${pathname === "/portion" ? "nav-item-active" : ""}`}
        >
          <span className="nav-icon">🍽️</span>
          <span>Portion</span>
        </Link>

        <Link
          to="/donation"
          className={`nav-item ${pathname === "/donation" ? "nav-item-active" : ""}`}
        >
          <span className="nav-icon">💚</span>
          <span>Donate</span>
        </Link>

        <Link
          to="/reminders"
          className={`nav-item ${pathname === "/reminders" ? "nav-item-active" : ""}`}
        >
          <span className="nav-icon">⏰</span>
          <span>Reminders</span>
        </Link>

        <Link
          to="/nearby-food"
          className={`nav-item ${
            pathname === "/nearby-food" ? "nav-item-active" : ""
          }`}
        >
          <span className="nav-icon">📍</span>
          <span>Nearby</span>
        </Link>
      </nav>
    </div>
  );
}

// ---------------- AppShell (Routes) ---------------- //

function AppShell({ user, onLogout }) {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route
            path="/"
            element={<Dashboard user={user} onLogout={onLogout} />}
          />
          <Route
            path="/dashboard"
            element={<Dashboard user={user} onLogout={onLogout} />}
          />

          <Route path="/portion" element={<Portion />} />
          <Route path="/donation" element={<Donation />} />
          <Route path="/reminders" element={<Reminders />} />
          <Route path="/nearby-food" element={<NearbyFood />} />
        </Routes>
      </Layout>
    </Router>
  );
}

// ---------------- Main App ---------------- //

export default function App() {
  const [user, setUser] = useState(null);

  // Login / Signup state
  const [mode, setMode] = useState("login");
  const [role, setRole] = useState("user");
  const [username, setUsername] = useState("");
  const [area, setArea] = useState("");
  const [organization, setOrganization] = useState("");

  // Read/Write Accounts
  const getAccounts = () => JSON.parse(localStorage.getItem("accounts") || "[]");
  const saveAccounts = (list) =>
    localStorage.setItem("accounts", JSON.stringify(list));

  // LOGIN + SIGNUP handler
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!username.trim() || !area.trim()) {
      alert("Please enter all fields");
      return;
    }

    let accounts = getAccounts();

    // SIGNUP
    if (mode === "signup") {
      const exists = accounts.find((a) => a.username === username);

      if (exists) {
        alert("⚠ Username already exists!");
        return;
      }

      const newAccount = {
        id: Date.now(),
        username,
        area,
        role,
        organization: role === "donor" ? organization : "",
      };

      accounts.push(newAccount);
      saveAccounts(accounts);

      alert("Account created! Please login.");
      setMode("login");
      return;
    }

    // LOGIN
    if (mode === "login") {
      const found = accounts.find(
        (a) => a.username === username && a.role === role
      );

      if (!found) {
        alert("❌ Incorrect username or role.");
        return;
      }

      setUser(found); // SUCCESS login
    }
  };

  // If NOT logged in → Show Login Page
  if (!user) {
    return (
      <div className="landing-bg">
        <div className="landing-overlay">
          <div className="landing-content fade-in">
            <h1>FoodSaver</h1>
            <p>Reduce food waste and help your community.</p>

            <form className="login-card" onSubmit={handleSubmit}>
              <h2>{mode === "login" ? "Login" : "Sign Up"}</h2>

              {/* Login/Signup switch */}
              <div className="role-switch">
                <button
                  type="button"
                  className={mode === "login" ? "active" : ""}
                  onClick={() => setMode("login")}
                >
                  Login
                </button>

                <button
                  type="button"
                  className={mode === "signup" ? "active" : ""}
                  onClick={() => setMode("signup")}
                >
                  Sign Up
                </button>
              </div>

              {/* User/Donor switch */}
              <div className="role-switch">
                <button
                  type="button"
                  className={role === "user" ? "active" : ""}
                  onClick={() => setRole("user")}
                >
                  User
                </button>

                <button
                  type="button"
                  className={role === "donor" ? "active" : ""}
                  onClick={() => setRole("donor")}
                >
                  Donor
                </button>
              </div>

              <label>
                Username
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Unique username"
                />
              </label>

              <label>
                Area
                <input
                  type="text"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  placeholder="e.g. Hyderabad"
                />
              </label>

              {role === "donor" && (
                <label>
                  Organization
                  <input
                    type="text"
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    placeholder="Restaurant / Hostel"
                  />
                </label>
              )}

              <button type="submit" className="primary-btn full">
                {mode === "login" ? "Login" : "Create Account"}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // If logged in → Show dashboard
  return (
    <AppShell
      user={user}
      onLogout={() => {
        setUser(null);          // Remove user from state
        // Optional: remove persistent login (if added later)
        // localStorage.removeItem("loggedUser");
      }}
    />
  );
}
