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
      <div className="App">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/recipes" element={<RecipesPage />} />
          <Route path="/favorites" element={<FavoritesPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
