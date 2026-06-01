import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import HomePage from "./pages/HomePage";
import RecipesPage from "./pages/RecipesPage";
import FavoritesPage from "./pages/FavoritesPage";
import "./styles/App.css";

/**
 * App - Primary Router of Chef's AI Studio.
 * Integrates three primary gourmet sections:
 * 1. Landing Welcome Studio (/)
 * 2. Active AI Chef's Workshop (/recipes)
 * 3. Bookmarked Recipe Archive Cookbook (/favorites)
 */
function App() {
  return (
    <Router>
      <div className="App" style={{ position: "relative", minHeight: "100vh", overflowX: "hidden" }}>
        {/* Global 3D Glass Orbs Background */}
        <div className="glass-orb glass-orb-1"></div>
        <div className="glass-orb glass-orb-2"></div>
        <div className="glass-orb glass-orb-3"></div>

        {/* Global Floating 3D Food Figures */}
        <div className="floating-3d-figure fig-1">🥑</div>
        <div className="floating-3d-figure fig-2">🥦</div>
        <div className="floating-3d-figure fig-3">🍅</div>
        <div className="floating-3d-figure fig-4">🍳</div>
        <div className="floating-3d-figure fig-5" style={{ top: "45%", left: "88%", animation: "float-fig-1 18s infinite ease-in-out" }}>🍕</div>
        <div className="floating-3d-figure fig-6" style={{ top: "85%", left: "40%", animation: "float-fig-2 20s infinite ease-in-out" }}>🍰</div>

        {/* Main Content Pages */}
        <div style={{ position: "relative", zIndex: 1 }}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/recipes" element={<RecipesPage />} />
            <Route path="/favorites" element={<FavoritesPage />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
