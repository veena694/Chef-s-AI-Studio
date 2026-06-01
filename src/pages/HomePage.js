import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import ThreeDCard from "../components/ThreeDCard";
import { fetchSpoonacularSuggestions } from "../utils/api";

// Fallback pool of 4 beautiful recipes in case of Spoonacular limits or offline
const HOME_FALLBACKS = [
  {
    title: "Gourmet Creamy Pasta",
    image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80",
    cuisine: "Italian",
    prepTime: "15 mins",
    cookTime: "15 mins",
    ingredients: ["8 oz pasta", "1 cup heavy cream", "2 cloves garlic", "1/2 cup parmesan"],
    steps: ["Boil pasta.", "Sauté garlic, add cream and cheese.", "Toss pasta in cream sauce."]
  },
  {
    title: "Artisan Dessert Souffle",
    image: "https://images.unsplash.com/photo-1579372786545-d24232daf58c?auto=format&fit=crop&w=800&q=80",
    cuisine: "French",
    prepTime: "15 mins",
    cookTime: "20 mins",
    ingredients: ["4 oz dark chocolate", "3 eggs, separated", "2 tbsp sugar"],
    steps: ["Melt chocolate.", "Whisk egg whites with sugar.", "Fold into chocolate and bake."]
  },
  {
    title: "Healthy Harvest Salad",
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80",
    cuisine: "Contemporary",
    prepTime: "10 mins",
    cookTime: "0 mins",
    ingredients: ["3 cups mixed greens", "1 avocado", "1/2 cup cherry tomatoes"],
    steps: ["Wash greens.", "Chop avocado and tomatoes.", "Toss together with olive oil."]
  },
  {
    title: "Crispy Garlic Butter Wings",
    image: "https://images.unsplash.com/photo-1567620832903-9fc6debc209f?auto=format&fit=crop&w=800&q=80",
    cuisine: "Asian Fusion",
    prepTime: "10 mins",
    cookTime: "25 mins",
    ingredients: ["1 lb chicken wings", "4 cloves garlic", "2 tbsp butter"],
    steps: ["Bake wings until crispy.", "Sauté garlic in butter.", "Toss crispy wings in sauce."]
  }
];

function HomePage() {
  const navigate = useNavigate();

  // Theme State & Toggle
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "light";
  });

  // Dynamic Home Recipes Feed
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  // Sync Theme
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  // Fetch initial 4 random recipes on mount
  useEffect(() => {
    const loadInitialRecipes = async () => {
      setLoading(true);
      const fetched = await fetchSpoonacularSuggestions(4);
      if (fetched && fetched.length > 0) {
        setRecipes(fetched);
      } else {
        // Fallback shuffle
        const shuffled = [...HOME_FALLBACKS].sort(() => 0.5 - Math.random());
        setRecipes(shuffled);
      }
      setLoading(false);
    };

    loadInitialRecipes();
  }, []);

  // Fetch 4 more random recipes on click
  const handleLoadMore = async () => {
    setLoadingMore(true);
    const fetched = await fetchSpoonacularSuggestions(4);
    if (fetched && fetched.length > 0) {
      setRecipes((prev) => [...prev, ...fetched]);
    } else {
      // Append fallback reshuffled
      const shuffled = [...HOME_FALLBACKS].sort(() => 0.5 - Math.random());
      setRecipes((prev) => [...prev, ...shuffled]);
    }
    setLoadingMore(false);
  };

  // Card click triggers instant load in studio
  const handleCardClick = (selectedRecipe) => {
    localStorage.setItem("activeRecipe", JSON.stringify(selectedRecipe));
    navigate("/recipes");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "var(--spacing-lg)",
        position: "relative",
        background: "radial-gradient(circle at 10% 20%, rgba(244, 163, 25, 0.05) 0%, transparent 40%)",
      }}
    >
      {/* Top Header Controls */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          width: "100%",
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "1.8rem" }}>🍳</span>
          <span
            style={{
              fontFamily: "var(--font-title)",
              fontSize: "1.4rem",
              fontWeight: 700,
              letterSpacing: "0.5px",
            }}
          >
            Chef's AI Studio
          </span>
        </div>

        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <button
            onClick={() => navigate("/favorites")}
            style={{
              background: "none",
              border: "1px solid var(--border-color)",
              color: "var(--text-primary)",
              padding: "8px 16px",
              borderRadius: "20px",
              fontWeight: "600",
              fontSize: "0.9rem",
              cursor: "pointer",
              transition: "var(--transition-fast)",
            }}
            onMouseEnter={(e) => (e.target.style.backgroundColor = "var(--border-color)")}
            onMouseLeave={(e) => (e.target.style.backgroundColor = "transparent")}
          >
            📖 My Cookbook
          </button>
          
          <button
            onClick={toggleTheme}
            style={{
              background: "var(--bg-secondary)",
              border: "1px solid var(--border-color)",
              color: "var(--text-primary)",
              padding: "10px 16px",
              borderRadius: "30px",
              fontWeight: "600",
              cursor: "pointer",
              boxShadow: "var(--shadow-1)",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              transition: "var(--transition-smooth)",
            }}
            title="Toggle Theme"
          >
            {theme === "light" ? "🌙 Chef's Kitchen" : "☀️ Light Kitchen"}
          </button>
        </div>
      </div>

      {/* Main Hero & Content Section */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        style={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          maxWidth: "1200px",
          width: "100%",
          margin: "0 auto",
          padding: "var(--spacing-xl) 0",
        }}
      >
        <h4
          style={{
            color: "var(--accent-terracotta)",
            textTransform: "uppercase",
            letterSpacing: "3px",
            fontWeight: 700,
            fontSize: "0.95rem",
            marginBottom: "12px",
          }}
        >
          AI-Powered Culinary Craft
        </h4>
        <h1
          style={{
            fontFamily: "var(--font-title)",
            fontSize: "clamp(2.5rem, 6vw, 4.5rem)",
            lineHeight: "1.15",
            marginBottom: "18px",
            fontWeight: 700,
          }}
        >
          Craft Gourmet Recipes <br />
          <span style={{ color: "var(--accent-saffron)", fontStyle: "italic" }}>
            From Your Fridge
          </span>
        </h1>
        <p
          style={{
            fontSize: "1.15rem",
            maxWidth: "600px",
            color: "var(--text-secondary)",
            marginBottom: "var(--spacing-xl)",
          }}
        >
          Unlock culinary masterpieces tailored exactly to what you have. Simply enter ingredients, scan your fridge, or let our AI chef surprise you with instant recipes.
        </p>

        <button
          onClick={() => navigate("/recipes")}
          style={{
            backgroundColor: "var(--accent-terracotta)",
            color: "var(--accent-white)",
            border: "none",
            padding: "16px 36px",
            fontSize: "1.15rem",
            fontWeight: "700",
            borderRadius: "var(--border-radius-md)",
            cursor: "pointer",
            boxShadow: "var(--shadow-2)",
            transition: "var(--transition-smooth)",
            marginBottom: "var(--spacing-xl)",
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = "var(--accent-saffron)";
            e.target.style.transform = "scale(1.05)";
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = "var(--accent-terracotta)";
            e.target.style.transform = "scale(1)";
          }}
        >
          🍳 Enter Cooking Studio
        </button>

        {/* 3D Floating Food Showcase cards */}
        <h3 style={{ fontFamily: "var(--font-title)", fontSize: "1.8rem", marginBottom: "var(--spacing-md)", marginTop: "var(--spacing-md)" }}>
          ✨ Discover Daily Recommendations
        </h3>
        <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", marginTop: "-10px", marginBottom: "var(--spacing-lg)" }}>
          Fresh gourmet ideas loaded in real-time. Click any card to cook instantly!
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "var(--spacing-lg)",
            width: "100%",
            perspective: "1000px",
            marginBottom: "var(--spacing-lg)",
          }}
        >
          {loading ? (
            /* Shimmer Skeleton Loader for Homepage Cards */
            [1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className="shimmer-skeleton"
                style={{
                  height: "230px",
                  borderRadius: "var(--border-radius-md)",
                  border: "1px solid var(--border-color)",
                }}
              />
            ))
          ) : (
            /* Dynamic Random Recipes Cards Grid */
            <AnimatePresence>
              {recipes.map((food, idx) => (
                <motion.div
                  key={food.title + idx}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: (idx % 4) * 0.1 }}
                >
                  <ThreeDCard onClick={() => handleCardClick(food)}>
                    <div
                      style={{
                        background: "var(--glass-bg)",
                        border: "1px solid var(--glass-border)",
                        borderRadius: "var(--border-radius-md)",
                        padding: "var(--spacing-md)",
                        backdropFilter: "var(--glass-blur)",
                        textAlign: "left",
                        display: "flex",
                        flexDirection: "column",
                        height: "240px",
                        justifyContent: "space-between",
                      }}
                    >
                      <img
                        src={food.image}
                        alt={food.title}
                        style={{
                          width: "100%",
                          height: "120px",
                          objectFit: "cover",
                          borderRadius: "var(--border-radius-sm)",
                          marginBottom: "var(--spacing-sm)",
                        }}
                      />
                      <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                        <span style={{ fontSize: "0.75rem", color: "var(--accent-terracotta)", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                          🌐 {food.cuisine}
                        </span>
                        <h3 style={{ fontSize: "1.05rem", margin: 0, fontWeight: "600", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {food.title}
                        </h3>
                        <p style={{ fontSize: "0.8rem", margin: 0, color: "var(--text-secondary)" }}>
                          ⏱️ Prep: {food.prepTime}
                        </p>
                      </div>
                    </div>
                  </ThreeDCard>
                </motion.div>
              ))}
            </AnimatePresence>
          )}

          {/* Shimmer items when loading more */}
          {loadingMore && (
            [1, 2, 3, 4].map((n) => (
              <div
                key={"more-" + n}
                className="shimmer-skeleton"
                style={{
                  height: "230px",
                  borderRadius: "var(--border-radius-md)",
                  border: "1px solid var(--border-color)",
                }}
              />
            ))
          )}
        </div>

        {/* Dynamic Load More Button */}
        {!loading && (
          <button
            onClick={handleLoadMore}
            disabled={loadingMore}
            style={{
              backgroundColor: "rgba(244, 163, 25, 0.15)",
              border: "1px solid var(--accent-saffron)",
              color: "var(--text-primary)",
              padding: "12px 28px",
              fontSize: "1rem",
              fontWeight: "600",
              borderRadius: "30px",
              cursor: "pointer",
              transition: "var(--transition-fast)",
              marginTop: "var(--spacing-md)",
            }}
            onMouseEnter={(e) => (e.target.style.backgroundColor = "rgba(244, 163, 25, 0.25)")}
            onMouseLeave={(e) => (e.target.style.backgroundColor = "rgba(244, 163, 25, 0.15)")}
          >
            {loadingMore ? "🔄 Fetching More Recommendations..." : "🔄 View More Recipes"}
          </button>
        )}
      </motion.div>

      {/* Footer */}
      <div
        style={{
          textAlign: "center",
          fontSize: "0.85rem",
          color: "var(--text-secondary)",
          borderTop: "1px solid var(--border-color)",
          paddingTop: "var(--spacing-md)",
          width: "100%",
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        Chef's AI Studio © 2026. Made with culinary perfection.
      </div>
    </div>
  );
}

export default HomePage;
