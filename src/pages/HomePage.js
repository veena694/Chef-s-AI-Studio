import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import ThreeDCard from "../components/ThreeDCard";

function HomePage() {
  const navigate = useNavigate();

  // Theme State & Toggle
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "light";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  const foodCards = [
    {
      title: "Gourmet Pasta",
      image: "https://fitandflex.in/cdn/shop/articles/istockphoto-1127563435-612x612_1445x.jpg?v=1720790357",
      desc: "Perfect al dente creation",
    },
    {
      title: "Artisan Dessert",
      image: "https://images.squarespace-cdn.com/content/v1/578753d7d482e9c3a909de40/1716723686939-PL6TLRAF3SJU8ISSCLEV/We+Idliwale+Barroom+%286%29.jpg?format=1500w",
      desc: "Warm caramel textures",
    },
    {
      title: "Healthy Harvest",
      image: "https://cdn.georgeinstitute.org/sites/default/files/styles/width1920_fallback/public/2020-10/world-food-day-2020.png",
      desc: "Vibrant garden ingredients",
    },
  ];

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
          maxWidth: "1000px",
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
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "var(--spacing-lg)",
            width: "100%",
            marginTop: "var(--spacing-xl)",
            perspective: "1000px",
          }}
        >
          {foodCards.map((food, idx) => (
            <ThreeDCard key={idx}>
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
                  height: "220px",
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
                <div>
                  <h3 style={{ fontSize: "1.15rem", margin: 0 }}>{food.title}</h3>
                  <p style={{ fontSize: "0.85rem", margin: 0, color: "var(--text-secondary)" }}>
                    {food.desc}
                  </p>
                </div>
              </div>
            </ThreeDCard>
          ))}
        </div>
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
