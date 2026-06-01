import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";

import ThreeDCard from "../components/ThreeDCard";
import CookingMode from "../components/CookingMode";
import Toast, { ToastContainer } from "../components/Toast";
import { generateRecipe, analyzeFridgeImage, fetchSpoonacularSuggestions } from "../utils/api";
import "../styles/RecipesPage.css";

// Pool of 8 premium Gourmet Chef Recommendations that serve as fallbacks
const GOURMET_POOL = [
  {
    title: "Pan-Seared Salmon with Rosemary Lemon Butter",
    cuisine: "Mediterranean",
    prepTime: "10 mins",
    cookTime: "15 mins",
    image: "https://fitandflex.in/cdn/shop/articles/istockphoto-1127563435-612x612_1445x.jpg?v=1720790357",
    ingredients: [
      "4 fresh salmon fillets (approx. 6 oz each)",
      "2 tbsp fresh rosemary leaves, chopped",
      "3 tbsp unsalted butter",
      "1 tbsp olive oil",
      "2 cloves garlic, minced",
      "1 whole lemon, sliced into rounds",
      "1/2 tsp kosher salt",
      "1/4 tsp cracked black pepper"
    ],
    steps: [
      "Pat the salmon fillets dry with paper towels and season both sides evenly with salt and pepper.",
      "Heat olive oil and 1 tbsp butter in a large skillet over medium-high heat until hot and foaming.",
      "Place the salmon skin-side up in the skillet and sear undisturbed for 5 minutes until a golden crust forms.",
      "Flip the fillets and add the remaining 2 tbsp butter, garlic, rosemary, and lemon slices to the pan.",
      "Spoon the melting, fragrant garlic-rosemary butter over the salmon fillets continuously for another 4 to 5 minutes.",
      "Remove from heat, plate beautifully, and spoon the remaining pan juices and caramelized lemon slices over the top."
    ]
  },
  {
    title: "Indulgent Chocolate Lava Cake",
    cuisine: "French Dessert",
    prepTime: "10 mins",
    cookTime: "12 mins",
    image: "https://images.squarespace-cdn.com/content/v1/578753d7d482e9c3a909de40/1716723686939-PL6TLRAF3SJU8ISSCLEV/We+Idliwale+Barroom+%286%29.jpg?format=1500w",
    ingredients: [
      "1/2 cup dark chocolate chips",
      "1/4 cup unsalted butter",
      "2 large eggs",
      "1/4 cup granulated sugar",
      "2 tbsp cocoa powder",
      "1 pinch salt"
    ],
    steps: [
      "Preheat your oven to 400°F (200°C) and grease four ramekins generously.",
      "Melt the dark chocolate chips and butter together in a heatproof bowl in 30-second increments, stirring until smooth.",
      "In a separate bowl, whisk the eggs and sugar together until pale and slightly thickened, about 2 minutes.",
      "Gently fold the melted chocolate mixture, cocoa powder, and a pinch of salt into the egg mixture until just combined.",
      "Divide the batter evenly among the ramekins and bake for 12 minutes until the edges are firm but the center is slightly jiggly.",
      "Let cool for 1 minute, invert onto serving plates, and dust with powdered sugar. Serve hot immediately!"
    ]
  },
  {
    title: "Tuscan Garlic Cream Chicken",
    cuisine: "Italian",
    prepTime: "10 mins",
    cookTime: "20 mins",
    image: "https://images.indianexpress.com/2024/03/processed-food.jpg",
    ingredients: [
      "4 boneless chicken breasts",
      "1 cup heavy cream",
      "1/2 cup chicken broth",
      "1 tsp garlic powder",
      "1 cup spinach, fresh",
      "1/2 cup sun-dried tomatoes",
      "1/2 cup grated parmesan cheese",
      "2 tbsp olive oil"
    ],
    steps: [
      "Season chicken breasts with salt, pepper, and garlic powder.",
      "Heat olive oil in a large skillet over medium-high heat and sear the chicken for 5 minutes on each side until golden brown and cooked through.",
      "Remove chicken from the skillet and set aside on a plate.",
      "In the same skillet, pour in the chicken broth, heavy cream, and grated parmesan cheese. Bring to a simmer for 3 minutes.",
      "Add the fresh spinach and sun-dried tomatoes, letting the spinach wilt in the cream sauce.",
      "Return chicken to the skillet, spoon the rich garlic cream sauce over the breasts, and simmer for 2 minutes before serving."
    ]
  },
  {
    title: "Gourmet Mushroom Truffle Risotto",
    cuisine: "Italian",
    prepTime: "15 mins",
    cookTime: "30 mins",
    image: "https://fitandflex.in/cdn/shop/articles/istockphoto-1127563435-612x612_1445x.jpg?v=1720790357",
    ingredients: [
      "1.5 cups Arborio rice",
      "4 cups vegetable broth, warm",
      "2 cups cremini mushrooms, sliced",
      "1/2 cup dry white wine",
      "1 small onion, finely chopped",
      "2 cloves garlic, minced",
      "3 tbsp grated parmesan",
      "2 tbsp white truffle oil"
    ],
    steps: [
      "In a wide pot, sauté the chopped onion and minced garlic in olive oil for 3 minutes until translucent.",
      "Add the sliced cremini mushrooms and sauté until they are brown and tender, about 5 minutes.",
      "Stir in the Arborio rice, coating it in the oil for 1 minute until the edges of the grains are translucent.",
      "Pour in the white wine and stir constantly until the liquid is fully absorbed by the rice.",
      "Begin adding the warm vegetable broth, one ladle at a time, stirring constantly. Wait until each ladle is fully absorbed before adding the next.",
      "Once the rice is creamy and al dente (approx. 20 minutes), stir in the grated parmesan cheese and drizzle with white truffle oil. Serve warm."
    ]
  },
  {
    title: "Classic Avocado Caprese Bruschetta",
    cuisine: "Italian Fusion",
    prepTime: "10 mins",
    cookTime: "5 mins",
    image: "https://cdn.georgeinstitute.org/sites/default/files/styles/width1920_fallback/public/2020-10/world-food-day-2020.png",
    ingredients: [
      "1 fresh French baguette, sliced",
      "2 ripe avocados, diced",
      "2 cups cherry tomatoes, quartered",
      "1 cup fresh mozzarella, cubed",
      "1/4 cup fresh basil leaves, torn",
      "2 tbsp balsamic glaze",
      "2 tbsp olive oil",
      "1 clove garlic, halved"
    ],
    steps: [
      "Preheat oven to 400°F (200°C). Brush baguette slices with olive oil and toast on a baking sheet for 5 minutes until crispy.",
      "While bread toasts, rub the cut side of the halved garlic clove over the warm toasted bread surfaces for aromatic flavor.",
      "In a bowl, gently toss the diced avocados, cherry tomatoes, mozzarella cubes, and torn basil leaves with a drizzle of olive oil, salt, and pepper.",
      "Spoon the fresh avocado caprese mixture generously onto each toasted baguette slice.",
      "Drizzle with sweet balsamic glaze right before serving and enjoy immediately."
    ]
  },
  {
    title: "Crispy Honey Garlic Chicken Wings",
    cuisine: "Asian Fusion",
    prepTime: "15 mins",
    cookTime: "25 mins",
    image: "https://images.indianexpress.com/2024/03/processed-food.jpg",
    ingredients: [
      "2 lbs chicken wings, split",
      "1/2 cup honey",
      "4 cloves garlic, minced",
      "2 tbsp soy sauce",
      "1 tbsp apple cider vinegar",
      "1/2 tsp ginger, grated",
      "1 tbsp sesame seeds",
      "1/4 cup cornstarch"
    ],
    steps: [
      "Preheat oven to 420°F (215°C) and line a baking sheet with foil and a metal rack.",
      "Toss chicken wings in cornstarch until lightly coated, shaking off excess.",
      "Bake the wings for 25 minutes, flipping halfway through, until skin is extremely crispy and golden.",
      "While baking, simmer honey, minced garlic, soy sauce, vinegar, and grated ginger in a small saucepan for 5 minutes until thickened.",
      "Toss hot baked wings in the sticky honey garlic sauce until fully coated.",
      "Transfer to a plate, sprinkle with sesame seeds, and serve hot."
    ]
  },
  {
    title: "Zesty Lemon Blueberry Oats Bowl",
    cuisine: "Healthy Breakfast",
    prepTime: "5 mins",
    cookTime: "5 mins",
    image: "https://fitandflex.in/cdn/shop/articles/istockphoto-1127563435-612x612_1445x.jpg?v=1720790357",
    ingredients: [
      "1 cup rolled oats",
      "2 cups almond milk",
      "1 cup fresh blueberries",
      "1 whole lemon, zested and juiced",
      "2 tbsp pure maple syrup",
      "1 tbsp chia seeds",
      "1/4 cup crushed almonds"
    ],
    steps: [
      "In a small pot, combine rolled oats, almond milk, and chia seeds. Cook over medium heat, stirring occasionally, for 5 minutes.",
      "Remove pot from heat and stir in the fresh lemon juice, lemon zest, and pure maple syrup.",
      "Gently fold in half of the fresh blueberries, letting them burst slightly from the residual heat.",
      "Transfer the warm oatmeal to a serving bowl.",
      "Top with the remaining blueberries, crushed almonds, and a touch of extra lemon zest for a bright breakfast start."
    ]
  },
  {
    title: "Spicy Shrimp Tacos with Mango Salsa",
    cuisine: "Mexican Fusion",
    prepTime: "15 mins",
    cookTime: "10 mins",
    image: "https://cdn.georgeinstitute.org/sites/default/files/styles/width1920_fallback/public/2020-10/world-food-day-2020.png",
    ingredients: [
      "1 lb medium shrimp, peeled and deveined",
      "1 tbsp chili powder",
      "1 ripe mango, diced",
      "1/2 cup red bell pepper, diced",
      "1/4 cup fresh cilantro, chopped",
      "1 whole lime, juiced",
      "8 warm corn tortillas",
      "1 tbsp olive oil"
    ],
    steps: [
      "In a small bowl, prepare the fresh mango salsa by tossing the diced mango, red bell pepper, cilantro, and fresh lime juice together.",
      "Season the peeled shrimp evenly with chili powder, salt, and pepper.",
      "Heat olive oil in a skillet over medium-high heat. Sear the shrimp for 2 minutes on each side until pink and cooked through.",
      "Warm the corn tortillas in a dry skillet for 30 seconds on each side.",
      "Assemble tacos by placing 3-4 spicy seared shrimp inside each warm tortilla.",
      "Top generously with the vibrant sweet mango salsa and serve with lime wedges."
    ]
  }
];

function RecipesPage() {
  const navigate = useNavigate();

  // Core App States
  const [ingredientInput, setIngredientInput] = useState("");
  const [ingredients, setIngredients] = useState([]);
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentServings, setCurrentServings] = useState(4);
  const [savedRecipes, setSavedRecipes] = useState([]);
  const [suggestedRecipes, setSuggestedRecipes] = useState([]);
  const [loadingMoreSuggestions, setLoadingMoreSuggestions] = useState(false);

  const handleLoadMoreSuggestions = async () => {
    setLoadingMoreSuggestions(true);
    const liveSuggestions = await fetchSpoonacularSuggestions(3);
    if (liveSuggestions && liveSuggestions.length > 0) {
      setSuggestedRecipes((prev) => [...prev, ...liveSuggestions]);
    } else {
      // Uniform shuffled fallback
      const poolCopy = [...GOURMET_POOL];
      for (let i = poolCopy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [poolCopy[i], poolCopy[j]] = [poolCopy[j], poolCopy[i]];
      }
      setSuggestedRecipes((prev) => [...prev, ...poolCopy.slice(0, 3)]);
    }
    setLoadingMoreSuggestions(false);
  };

  // UI Interactive States
  const [dragActive, setDragActive] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageScanning, setImageScanning] = useState(false);
  const [cookingModeOpen, setCookingModeOpen] = useState(false);
  const [toasts, setToasts] = useState([]);

  const fileInputRef = useRef(null);
  const recipeOutputRef = useRef(null);

  // Load Saved Recipes, Local Settings, & Shuffled Specials
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("savedRecipes")) || [];
    setSavedRecipes(saved);

    const loadSuggestions = async () => {
      // 1. Try to fetch live suggestions from Spoonacular API
      const liveSuggestions = await fetchSpoonacularSuggestions();
      
      if (liveSuggestions && liveSuggestions.length > 0) {
        setSuggestedRecipes(liveSuggestions);
      } else {
        // 2. Mathematically uniform shuffling (Fisher-Yates Shuffle Algorithm) fallback
        const poolCopy = [...GOURMET_POOL];
        for (let i = poolCopy.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [poolCopy[i], poolCopy[j]] = [poolCopy[j], poolCopy[i]];
        }
        setSuggestedRecipes(poolCopy.slice(0, 3));
      }
    };

    loadSuggestions();
  }, []);

  // Toast Helper
  const addToast = (message, type = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Keyboard accessibility
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && cookingModeOpen) {
        setCookingModeOpen(false);
        addToast("Exited cooking mode", "info");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [cookingModeOpen]);

  // Keyboard Enter Submits Tag
  const handleInputKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddIngredient();
    }
  };

  // Tag Management
  const handleAddIngredient = () => {
    const cleanVal = ingredientInput.trim().toLowerCase();
    if (!cleanVal) return;
    if (cleanVal.length > 30) {
      addToast("Ingredient name is too long!", "error");
      return;
    }
    if (ingredients.includes(cleanVal)) {
      addToast("Ingredient already added!", "info");
      return;
    }
    setIngredients((prev) => [...prev, cleanVal]);
    setIngredientInput("");
  };

  const handleRemoveIngredient = (ingredient) => {
    setIngredients((prev) => prev.filter((i) => i !== ingredient));
  };

  const handleClearAll = () => {
    setIngredients([]);
    setImagePreview(null);
    setRecipe(null);
    addToast("Workspace cleared", "info");
  };

  // Feature 1 — Fridge Photo Scanner File Handlers
  const handleImageFile = (file) => {
    if (!file) return;

    // Validation: Only jpg, png, webp
    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      addToast("File format must be JPG, PNG or WEBP!", "error");
      return;
    }

    // Validation: Max 5MB
    if (file.size > 5 * 1024 * 1024) {
      addToast("File is too large! Maximum limit is 5MB.", "error");
      return;
    }

    // Image Preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
      scanFridgeImage(reader.result, file.type);
    };
    reader.readAsDataURL(file);
  };

  // Claude Vision image scanner execution
  const scanFridgeImage = async (base64String, mimeType) => {
    setImageScanning(true);
    addToast("Scanning photo for ingredients...", "info");
    try {
      const result = await analyzeFridgeImage(base64String, mimeType);
      
      // Split detected list and append as tags
      const detected = result
        .split(",")
        .map((i) => i.trim().toLowerCase())
        .filter((i) => i.length > 0);

      if (detected.length === 0) {
        addToast("No ingredients detected in the photo.", "error");
      } else {
        // Merge detected with unique tags
        setIngredients((prev) => {
          const merged = [...prev];
          detected.forEach((item) => {
            if (!merged.includes(item)) merged.push(item);
          });
          return merged;
        });
        addToast(`Successfully scanned ${detected.length} ingredients!`, "success");
      }
    } catch (error) {
      console.error(error);
      addToast(error.message || "Failed to scan photo.", "error");
    } finally {
      setImageScanning(false);
    }
  };

  // Drag and Drop Scanner Triggers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageFile(e.dataTransfer.files[0]);
    }
  };

  const triggerFileSelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Recipe AI Generation
  const handleGenerateRecipe = async () => {
    if (ingredients.length === 0) {
      addToast("Please add at least one ingredient first!", "error");
      return;
    }

    setLoading(true);
    setRecipe(null);
    setCurrentServings(4); // Reset servings stepper to default
    addToast("Our AI Chef is crafting your recipe...", "info");

    try {
      const generated = await generateRecipe(ingredients);
      setRecipe(generated);
      
      // Confetti burst celebration!
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: ["#F4A319", "#C1440E", "#3B6B35", "#FFFFFF"],
      });

      addToast("Chef's AI creation successfully generated!", "success");

      // Smooth scroll to recipe panel
      setTimeout(() => {
        if (recipeOutputRef.current) {
          recipeOutputRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 300);
    } catch (error) {
      console.error(error);
      addToast(error.message || "Could not generate recipe.", "error");
    } finally {
      setLoading(false);
    }
  };

  // "Surprise me!" randomized common ingredients
  const handleSurpriseMe = () => {
    const surprises = [
      ["salmon", "lemon", "rosemary"],
      ["chocolate", "butter", "eggs"],
      ["chicken", "bell pepper", "onion"],
      ["tomato", "basil", "garlic"],
      ["apple", "cinnamon", "honey"],
      ["shrimp", "butter", "garlic"],
    ];

    const randomIndex = Math.floor(Math.random() * surprises.length);
    const chosen = surprises[randomIndex];

    setIngredients(chosen);
    setImagePreview(null);
    addToast("Surprise ingredients selected!", "info");

    // Automatically trigger recipe generation right after filling the tags
    setTimeout(() => {
      setLoading(true);
      setRecipe(null);
      setCurrentServings(4);
      generateRecipe(chosen)
        .then((generated) => {
          setRecipe(generated);
          confetti({
            particleCount: 150,
            spread: 80,
            origin: { y: 0.6 },
            colors: ["#F4A319", "#C1440E", "#3B6B35", "#FFFFFF"],
          });
          addToast("Chef's Surprise Recipe is ready!", "success");
          setTimeout(() => {
            if (recipeOutputRef.current) {
              recipeOutputRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
            }
          }, 300);
        })
        .catch((error) => {
          addToast("Failed to generate surprise recipe.", "error");
        })
        .finally(() => {
          setLoading(false);
        });
    }, 100);
  };

  // Suggested Daily Specials Click Trigger: confettis, loads, and scrolls
  const handleOpenSuggestedRecipe = (selectedSuggestion) => {
    setRecipe(selectedSuggestion);
    setCurrentServings(4);

    confetti({
      particleCount: 130,
      spread: 75,
      origin: { y: 0.65 },
      colors: ["#F4A319", "#C1440E", "#3B6B35", "#FFFFFF"],
    });

    addToast(`Loaded: ${selectedSuggestion.title}`, "success");

    setTimeout(() => {
      if (recipeOutputRef.current) {
        recipeOutputRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 250);
  };

  // LocalStorage Favorite Bookmarking
  const toggleBookmark = () => {
    if (!recipe) return;
    const isSaved = savedRecipes.some((r) => r.title === recipe.title);
    let updated;

    if (isSaved) {
      updated = savedRecipes.filter((r) => r.title !== recipe.title);
      addToast("Removed recipe from Cookbook", "info");
    } else {
      const newSavedObj = {
        id: `ai-${Date.now()}`,
        title: recipe.title,
        ingredients: recipe.ingredients,
        steps: recipe.steps,
        cuisine: recipe.cuisine || "Fusion",
        prepTime: recipe.prepTime || "15 mins",
        cookTime: recipe.cookTime || "20 mins",
        timestamp: Date.now(),
        rating: 0,
        notes: "",
      };
      updated = [newSavedObj, ...savedRecipes];
      addToast("Saved recipe to My Cookbook!", "success");
    }

    setSavedRecipes(updated);
    localStorage.setItem("savedRecipes", JSON.stringify(updated));
  };

  // Fractional Scaling Parser
  const scaleQuantity = (ingredientStr, currentSrv) => {
    const ratio = currentSrv / 4;
    if (ratio === 1) return { display: ingredientStr };

    // Matches leading quantity integers, floats, fractions, or mixed numbers
    // e.g. "2 cups", "1.5 tbsp", "1/2 tsp", "2 1/4 cups"
    const quantityRegex = /^(\d+\s+\d+\/\d+|\d+\/\d+|\d+(?:\.\d+)?)/;
    const match = ingredientStr.match(quantityRegex);

    if (!match) {
      // If no leading number is found (e.g. "pinch of salt", "fresh parsley to taste"), skip scaling
      return { display: ingredientStr };
    }

    const rawQty = match[1].trim();
    const restOfIngredient = ingredientStr.slice(rawQty.length);

    // Parse string value (decimal or fractional) to float
    const parseVal = (str) => {
      if (str.includes("/")) {
        const parts = str.split(/\s+/);
        if (parts.length === 2) {
          const integerVal = parseFloat(parts[0]);
          const fracParts = parts[1].split("/");
          return integerVal + parseFloat(fracParts[0]) / parseFloat(fracParts[1]);
        } else {
          const fracParts = str.split("/");
          return parseFloat(fracParts[0]) / parseFloat(fracParts[1]);
        }
      }
      return parseFloat(str);
    };

    // Format float back to clean kitchen decimal or factional string representation
    const formatVal = (val) => {
      const rounded = Math.round(val * 100) / 100;
      if (rounded % 1 === 0) return String(rounded);

      const decimal = rounded % 1;
      const integer = Math.floor(rounded);

      let fracStr = "";
      if (Math.abs(decimal - 0.25) < 0.05) fracStr = "1/4";
      else if (Math.abs(decimal - 0.5) < 0.05) fracStr = "1/2";
      else if (Math.abs(decimal - 0.75) < 0.05) fracStr = "3/4";
      else if (Math.abs(decimal - 0.33) < 0.05) fracStr = "1/3";
      else if (Math.abs(decimal - 0.66) < 0.05) fracStr = "2/3";

      if (fracStr) {
        return integer > 0 ? `${integer} ${fracStr}` : fracStr;
      }
      return String(rounded);
    };

    const originalValue = parseVal(rawQty);
    const scaledValue = originalValue * ratio;

    return {
      display: `${formatVal(scaledValue)}${restOfIngredient}`,
      original: ingredientStr,
      changed: true,
    };
  };

  const handleIncrementServings = () => {
    setCurrentServings((prev) => Math.min(prev + 1, 20));
  };

  const handleDecrementServings = () => {
    setCurrentServings((prev) => Math.max(prev - 1, 1));
  };

  const isCurrentRecipeBookmarked =
    recipe && savedRecipes.some((r) => r.title === recipe.title);

  return (
    <div className="recipes-studio-container">
      {/* Studio Header */}
      <div className="studio-header">
        <div className="studio-title-area">
          <span style={{ fontSize: "2rem" }}>👨‍🍳</span>
          <div>
            <h2 style={{ fontSize: "1.6rem", margin: 0, fontWeight: 700 }}>
              AI Chef's Workshop
            </h2>
            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", margin: 0 }}>
              Drag your fridge photo or type ingredients to generate gourmet recipes.
            </p>
          </div>
        </div>
        <button className="back-home-link" onClick={() => navigate("/")}>
          ← Exit Studio
        </button>
      </div>

      {/* Main Two-Column Workshop */}
      <div className="studio-layout">
        {/* Left Column Controls */}
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-lg)" }}>
          <div className="studio-card">
            <h3>🖼️ Fridge Photo Scanner</h3>
            <p style={{ fontSize: "0.85rem", marginBottom: "var(--spacing-md)", color: "var(--text-secondary)" }}>
              Upload or drop a picture of your pantry. Our AI chef will visually identify all ingredients!
            </p>

            <div
              className={`scanner-dashed-area ${dragActive ? "dragging" : ""}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={triggerFileSelect}
            >
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: "none" }}
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => handleImageFile(e.target.files[0])}
              />

              {imageScanning ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
                  <div className="shimmer-skeleton" style={{ width: "60px", height: "60px", borderRadius: "50%" }} />
                  <p style={{ fontWeight: 600, color: "var(--accent-saffron)" }}>Scanning Fridge Items...</p>
                </div>
              ) : imagePreview ? (
                <div className="scanner-thumbnail-container">
                  <img src={imagePreview} alt="Fridge scan preview" className="scanner-thumbnail" />
                  <p style={{ fontSize: "0.85rem", fontWeight: "600" }}>Tap to upload another photo</p>
                </div>
              ) : (
                <>
                  <span className="scanner-icon">📷</span>
                  <p style={{ fontWeight: "600", fontSize: "0.95rem", margin: "4px 0" }}>
                    Drag & Drop image here
                  </p>
                  <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                    Supports JPG, PNG, WEBP (Max 5MB)
                  </p>
                </>
              )}
            </div>
          </div>

          <div className="studio-card">
            <h3>🥕 Ingredients Tag Editor</h3>
            <p style={{ fontSize: "0.85rem", marginBottom: "var(--spacing-md)", color: "var(--text-secondary)" }}>
              Enter individual ingredients or edit scanned entries below. Press Enter to add.
            </p>

            <div className="input-tag-wrapper">
              <input
                type="text"
                maxLength={30}
                placeholder="Add ingredient (e.g. Garlic, Tomato)"
                value={ingredientInput}
                onChange={(e) => setIngredientInput(e.target.value)}
                onKeyDown={handleInputKeyDown}
              />
              <button onClick={handleAddIngredient}>Add</button>
            </div>
            
            <div className="char-counter">{ingredientInput.length}/30 chars</div>

            {/* Framer Motion Staggered Tag Fly-in */}
            <motion.div className="tags-list-container">
              <AnimatePresence>
                {ingredients.map((item, idx) => (
                  <motion.div
                    key={item}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{
                      type: "spring",
                      stiffness: 500,
                      damping: 30,
                      delay: idx * 0.03,
                    }}
                    className="tag-badge"
                  >
                    {item}
                    <button className="tag-delete-btn" onClick={() => handleRemoveIngredient(item)}>
                      ×
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
              {ingredients.length === 0 && (
                <div style={{ fontSize: "0.9rem", color: "var(--text-secondary)", fontStyle: "italic", alignSelf: "center" }}>
                  No ingredients added yet.
                </div>
              )}
            </motion.div>

            {/* Studio Action Row */}
            <div className="studio-buttons-row">
              <button
                className="btn-generate"
                disabled={ingredients.length === 0 || loading || imageScanning}
                onClick={handleGenerateRecipe}
              >
                {loading ? "🧑‍🍳 Crafting Recipe..." : "✨ Generate AI Gourmet Recipe"}
              </button>
              
              <button className="btn-surprise" onClick={handleSurpriseMe} disabled={loading || imageScanning}>
                🎲 Surprise me!
              </button>
              
              <button className="btn-clear" onClick={handleClearAll} disabled={ingredients.length === 0 || loading}>
                🗑️ Clear All
              </button>
            </div>
          </div>
        </div>

        {/* Right Column Active Recipe Outputs */}
        <div ref={recipeOutputRef}>
          {loading ? (
            /* Skeleton Loading State during Generation */
            <div className="glass-recipe-output">
              <div className="shimmer-skeleton skeleton-title" />
              <div className="shimmer-skeleton skeleton-meta" />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "32px" }}>
                <div className="shimmer-skeleton" style={{ height: "100px", borderRadius: "12px" }} />
                <div className="shimmer-skeleton" style={{ height: "100px", borderRadius: "12px" }} />
              </div>
              <div className="shimmer-skeleton skeleton-item" style={{ width: "40%" }} />
              <div className="shimmer-skeleton skeleton-item" />
              <div className="shimmer-skeleton skeleton-item" />
              <div className="shimmer-skeleton skeleton-item" style={{ width: "80%" }} />
              <div className="shimmer-skeleton skeleton-item" style={{ height: "45px", borderRadius: "12px", marginTop: "24px" }} />
            </div>
          ) : recipe ? (
            /* Premium 3D Glassmorphic AI Recipe Output */
            <ThreeDCard>
              <div className="glass-recipe-output">
                {/* Recipe Header */}
                <div className="recipe-header-block">
                  <div>
                    <h2 className="recipe-title-text">{recipe.title}</h2>
                    <div className="recipe-meta-row" style={{ marginTop: "12px" }}>
                      <span className="meta-badge cuisine">🌐 {recipe.cuisine || "Fusion"}</span>
                      <span className="meta-badge">⏱️ Prep: {recipe.prepTime || "15 mins"}</span>
                      <span className="meta-badge">🍳 Cook: {recipe.cookTime || "25 mins"}</span>
                    </div>
                  </div>

                  <button
                    className="heart-bookmark-btn"
                    onClick={toggleBookmark}
                    style={{ color: isCurrentRecipeBookmarked ? "var(--accent-terracotta)" : "var(--text-secondary)" }}
                    title={isCurrentRecipeBookmarked ? "Remove from cookbook" : "Save to cookbook"}
                  >
                    {isCurrentRecipeBookmarked ? "❤️" : "🤍"}
                  </button>
                </div>

                {/* Serving Size Scaler Stepper Component */}
                <div className="scaler-container">
                  <span className="scaler-label">👥 Servings: {currentServings} servings (Base: 4)</span>
                  <div className="scaler-controls">
                    <button className="scaler-btn" onClick={handleDecrementServings}>
                      -
                    </button>
                    <span className="scaler-value">{currentServings}</span>
                    <button className="scaler-btn" onClick={handleIncrementServings}>
                      +
                    </button>
                  </div>
                </div>

                {/* Ingredients Listing with side-by-side scaling comparison */}
                <h3 className="recipe-section-title">Ingredients</h3>
                <ul className="ingredients-list">
                  {recipe.ingredients.map((ingStr, idx) => {
                    const parsed = scaleQuantity(ingStr, currentServings);
                    return (
                      <li key={idx} className="ingredient-item">
                        <span className="ingredient-bullet">✦</span>
                        <span>
                          {parsed.changed ? (
                            <>
                              <span className="scaled-display">{parsed.display}</span>
                              <span className="original-strike">({parsed.original})</span>
                            </>
                          ) : (
                            parsed.display
                          )}
                        </span>
                      </li>
                    );
                  })}
                </ul>

                {/* Sequential Step checklist fade-in */}
                <h3 className="recipe-section-title">Cooking Steps</h3>
                <div className="steps-ordered-list">
                  {recipe.steps.map((step, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: idx * 0.1 }}
                      className="step-card-item"
                    >
                      {step}
                    </motion.div>
                  ))}
                </div>

                 {/* Active Recipe Action Controls */}
                <div style={{ display: "flex", gap: "12px", marginTop: "var(--spacing-lg)", flexWrap: "wrap" }}>
                  <button className="btn-start-cooking" onClick={() => setCookingModeOpen(true)} style={{ flex: 1, minWidth: "200px", margin: 0 }}>
                    👨‍🍳 Start Hands-Free Cooking Mode
                  </button>
                  <button 
                    onClick={toggleBookmark}
                    style={{
                      flex: 1,
                      minWidth: "200px",
                      backgroundColor: isCurrentRecipeBookmarked ? "rgba(193, 68, 14, 0.12)" : "var(--accent-saffron)",
                      color: isCurrentRecipeBookmarked ? "var(--accent-terracotta)" : "#FFFFFF",
                      border: isCurrentRecipeBookmarked ? "1px solid var(--accent-terracotta)" : "none",
                      padding: "14px 24px",
                      borderRadius: "8px",
                      fontWeight: "700",
                      fontSize: "1rem",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      transition: "var(--transition-smooth)",
                    }}
                    onMouseEnter={(e) => {
                      if (!isCurrentRecipeBookmarked) {
                        e.target.style.backgroundColor = "var(--accent-terracotta)";
                        e.target.style.color = "var(--accent-white)";
                      } else {
                        e.target.style.backgroundColor = "rgba(193, 68, 14, 0.22)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isCurrentRecipeBookmarked) {
                        e.target.style.backgroundColor = "var(--accent-saffron)";
                        e.target.style.color = "#FFFFFF";
                      } else {
                        e.target.style.backgroundColor = "rgba(193, 68, 14, 0.12)";
                      }
                    }}
                  >
                    {isCurrentRecipeBookmarked ? "❤️ Saved in Cookbook" : "📖 Save to Cookbook"}
                  </button>
                </div>
              </div>
            </ThreeDCard>
          ) : (
            /* Empty State Placeholder */
            <div className="empty-recipe-placeholder">
              <div className="placeholder-chef-hat">👨‍🍳</div>
              <h3>Gourmet Kitchen is Empty</h3>
              <p style={{ fontSize: "0.9rem", maxWidth: "340px", color: "var(--text-secondary)", marginTop: "8px" }}>
                Add your pantry ingredients or capture a picture of your fridge, then hit generate to witness culinary AI magic.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Suggested Daily Specials - Shuffles on Mount & Click to Cook Instantly */}
      <div style={{ marginTop: "var(--spacing-xl)", borderTop: "1px solid var(--border-color)", paddingTop: "var(--spacing-xl)" }}>
        <h3 style={{ fontFamily: "var(--font-title)", fontSize: "1.8rem", textAlign: "center", marginBottom: "6px" }}>
          👨‍🍳 Lovely suggestions for you
        </h3>
        <p style={{ textAlign: "center", color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: "var(--spacing-lg)" }}>
          Fresh premium recommendations that rotate every time you open the studio. Click card to cook instantly!
        </p>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "var(--spacing-lg)",
          marginBottom: "var(--spacing-md)"
        }}>
          {suggestedRecipes.map((recipeConcept, idx) => (
            <ThreeDCard key={idx} onClick={() => handleOpenSuggestedRecipe(recipeConcept)}>
              <div style={{
                background: "var(--glass-bg)",
                backdropFilter: "var(--glass-blur)",
                border: "1px solid var(--glass-border)",
                borderRadius: "var(--border-radius-md)",
                padding: "var(--spacing-md)",
                height: "260px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                textAlign: "left"
              }}>
                <img 
                  src={recipeConcept.image} 
                  alt={recipeConcept.title} 
                  style={{ width: "100%", height: "130px", objectFit: "cover", borderRadius: "var(--border-radius-sm)", marginBottom: "var(--spacing-sm)" }}
                />
                <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                  <span style={{ fontSize: "0.75rem", color: "var(--accent-terracotta)", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    🌐 {recipeConcept.cuisine}
                  </span>
                  <h4 style={{ fontSize: "1.05rem", margin: 0, fontWeight: "600", color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {recipeConcept.title}
                  </h4>
                  <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", margin: 0 }}>
                    ⏱️ Prep: {recipeConcept.prepTime} | Cook: {recipeConcept.cookTime}
                  </p>
                </div>
              </div>
            </ThreeDCard>
          ))}

          {/* Suggested Specials Shimmer skeletons */}
          {loadingMoreSuggestions && (
            [1, 2, 3].map((n) => (
              <div
                key={"more-sug-" + n}
                className="shimmer-skeleton"
                style={{
                  height: "260px",
                  borderRadius: "var(--border-radius-md)",
                  border: "1px solid var(--border-color)",
                }}
              />
            ))
          )}
        </div>

        {/* View More Suggestions Button */}
        <div style={{ display: "flex", justifyContent: "center", marginTop: "var(--spacing-md)", marginBottom: "var(--spacing-xl)" }}>
          <button
            onClick={handleLoadMoreSuggestions}
            disabled={loadingMoreSuggestions}
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
            }}
            onMouseEnter={(e) => (e.target.style.backgroundColor = "rgba(244, 163, 25, 0.25)")}
            onMouseLeave={(e) => (e.target.style.backgroundColor = "rgba(244, 163, 25, 0.15)")}
          >
            {loadingMoreSuggestions ? "🔄 Loading More Suggestions..." : "🔄 View More Suggestions"}
          </button>
        </div>
      </div>

      {/* Cooking Mode Fullscreen Overlay */}
      {cookingModeOpen && recipe && (
        <CookingMode recipe={recipe} onClose={() => setCookingModeOpen(false)} />
      )}

      {/* Dynamic Toast Notifications */}
      <ToastContainer>
        <AnimatePresence>
          {toasts.map((toast) => (
            <Toast
              key={toast.id}
              message={toast.message}
              type={toast.type}
              onClose={() => removeToast(toast.id)}
            />
          ))}
        </AnimatePresence>
      </ToastContainer>
    </div>
  );
}

export default RecipesPage;
