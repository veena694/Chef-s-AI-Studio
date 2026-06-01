import axios from "axios";

// Base Environment Variables
const SPOONACULAR_BASE = process.env.REACT_APP_API_URL || "https://api.spoonacular.com/recipes";
const API_KEY = process.env.REACT_APP_API_KEY || "8947aeb90a7448dcabd53a297bdb21b0";

// Claude Configurations (falls back if a separate Claude key is provided in Vercel)
const CLAUDE_KEY = process.env.REACT_APP_CLAUDE_KEY || ""; 
const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
const MODEL_NAME = "claude-3-5-sonnet-20241022";

const isClaudeActive = () => {
  return CLAUDE_KEY && CLAUDE_KEY.startsWith("sk-ant-");
};

const getClaudeHeaders = () => ({
  "content-type": "application/json",
  "x-api-key": CLAUDE_KEY,
  "anthropic-version": "2023-06-01",
  "anthropic-dangerous-direct-browser-access": "true",
});

/**
 * Clean and parse JSON responses from Claude.
 */
function parseClaudeJSON(responseText) {
  const text = responseText.trim();
  try {
    return JSON.parse(text);
  } catch (e) {
    const jsonRegex = /\{[\s\S]*\}/;
    const match = text.match(jsonRegex);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch (err) {
        console.error("Failed to parse extracted JSON:", err);
      }
    }
    throw new Error("Failed to parse valid recipe JSON from Claude response.");
  }
}

/**
 * 1. USE OF REACT_APP_API_URL & REACT_APP_API_KEY:
 * Fetches matching base recipe from Spoonacular using ingredients.
 * Dynamically appends "/findByIngredients" and "/{id}/information" to your base URL!
 */
export const getRecipesByIngredients = async (ingredients) => {
  try {
    const findByIngredientsUrl = `${SPOONACULAR_BASE}/findByIngredients`;
    const response = await axios.get(findByIngredientsUrl, {
      params: {
        ingredients: ingredients.join(","),
        apiKey: API_KEY,
        number: 1, // Fetch the best matching recipe
      },
    });

    if (response.data && response.data[0]) {
      const bestMatch = response.data[0];
      
      // Fetch full details using dynamic ID information endpoint
      const detailsResponse = await axios.get(
        `${SPOONACULAR_BASE}/${bestMatch.id}/information`,
        {
          params: {
            apiKey: API_KEY,
          },
        }
      );

      const recipeData = detailsResponse.data;
      return {
        title: recipeData.title,
        cuisine: recipeData.cuisines?.[0] || "Fusion",
        prepTime: `${Math.max(5, Math.round(recipeData.readyInMinutes * 0.3))} mins`,
        cookTime: `${Math.max(5, Math.round(recipeData.readyInMinutes * 0.7))} mins`,
        ingredients: recipeData.extendedIngredients.map((i) => i.original),
        steps: recipeData.analyzedInstructions?.[0]?.steps.map((s) => s.step) || 
               (recipeData.instructions ? [recipeData.instructions] : ["Follow standard cooking instructions."]),
      };
    }
    return null;
  } catch (error) {
    console.error("Spoonacular getRecipesByIngredients error:", error);
    return null;
  }
};

/**
 * 2. USE OF REACT_APP_API_URL & REACT_APP_API_KEY:
 * Fetches 3 dynamic, totally fresh suggested specials directly from Spoonacular on mount.
 * Dynamically appends "/random" to your base URL!
 */
export const fetchSpoonacularSuggestions = async (count = 3) => {
  try {
    const randomUrl = `${SPOONACULAR_BASE}/random`;
    const response = await axios.get(randomUrl, {
      params: {
        number: count,
        apiKey: API_KEY,
      },
    });

    if (response.data && response.data.recipes) {
      return response.data.recipes.map((recipeData) => ({
        title: recipeData.title,
        cuisine: recipeData.cuisines?.[0] || "Fusion",
        prepTime: `${Math.max(5, Math.round(recipeData.readyInMinutes * 0.3))} mins`,
        cookTime: `${Math.max(5, Math.round(recipeData.readyInMinutes * 0.7))} mins`,
        image: recipeData.image || "https://fitandflex.in/cdn/shop/articles/istockphoto-1127563435-612x612_1445x.jpg?v=1720790357",
        ingredients: recipeData.extendedIngredients.map((i) => i.original),
        steps: recipeData.analyzedInstructions?.[0]?.steps.map((s) => s.step) || 
               (recipeData.instructions ? [recipeData.instructions] : ["Follow standard cooking guidelines."]),
      }));
    }
    return null;
  } catch (error) {
    console.error("Spoonacular suggestions error:", error);
    return null;
  }
};

/**
 * Generate a recipe.
 * Uses Spoonacular to find a matching base recipe, and then remixes it with Claude
 * if a Claude key is active. Otherwise, returns the real Spoonacular recipe directly!
 */
export const generateRecipe = async (ingredients) => {
  // Query Spoonacular first to get a real recipe matching entered ingredients
  const baseRecipe = await getRecipesByIngredients(ingredients);

  // If Claude is active, gourmet-remix it using AI!
  if (isClaudeActive()) {
    const prompt = `Generate an advanced and creative gourmet recipe based on this base recipe:
Title: ${baseRecipe ? baseRecipe.title : "Improvised Pantry Dish"}
Ingredients: ${baseRecipe ? JSON.stringify(baseRecipe.ingredients) : JSON.stringify(ingredients)}
Steps: ${baseRecipe ? JSON.stringify(baseRecipe.steps) : "None"}

You MUST return the recipe strictly as a JSON object with the following structure, with NO surrounding markdown or explanatory text:
{
  "title": "Recipe Name",
  "cuisine": "Cuisine style",
  "prepTime": "Prep time (e.g. 15 mins)",
  "cookTime": "Cook time (e.g. 25 mins)",
  "servings": 4,
  "ingredients": [
    "quantity unit name"
  ],
  "steps": [
    "Step 1 details...",
    "Step 2 details..."
  ]
}`;

    try {
      const response = await axios.post(
        ANTHROPIC_URL,
        {
          model: MODEL_NAME,
          max_tokens: 3000,
          messages: [{ role: "user", content: prompt }],
        },
        { headers: getClaudeHeaders() }
      );

      return parseClaudeJSON(response.data.content[0].text);
    } catch (e) {
      console.warn("Claude generation failed, returning Spoonacular base directly:", e);
      if (baseRecipe) return baseRecipe;
    }
  }

  // If no Claude key is active, return the real Spoonacular recipe directly!
  if (baseRecipe) {
    return baseRecipe;
  }

  // Ultimate fallback to mock recipe if Spoonacular key is rate-limited or fails
  return getMockRecipe(ingredients);
};

/**
 * Analyze an uploaded fridge/pantry photo.
 * Uses Claude Vision if a Claude key is active, otherwise returns mock scanned items.
 */
export const analyzeFridgeImage = async (base64Data, mimeType) => {
  if (isClaudeActive()) {
    const cleanBase64 = base64Data.split(",")[1] || base64Data;
    try {
      const response = await axios.post(
        ANTHROPIC_URL,
        {
          model: MODEL_NAME,
          max_tokens: 1000,
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "image",
                  source: {
                    type: "base64",
                    media_type: mimeType,
                    data: cleanBase64,
                  },
                },
                {
                  type: "text",
                  text: "Look at this fridge/pantry photo carefully. List every food ingredient you can see as a simple comma-separated list. Only list ingredients, nothing else.",
                },
              ],
            },
          ],
        },
        { headers: getClaudeHeaders() }
      );

      return response.data.content[0].text.trim();
    } catch (error) {
      console.error("Claude Vision error:", error);
    }
  }

  // Fallback scanner items
  return "eggs, milk, cheese, bread, butter, tomato, bell pepper";
};

/**
 * Remix an existing recipe with a custom twist.
 */
export const remixRecipe = async (recipe, twist) => {
  if (isClaudeActive()) {
    const prompt = `Take this existing recipe and create an amazing, detailed, and creative twist on it.
Original Recipe Title: ${recipe.title}
Original Ingredients: ${JSON.stringify(recipe.ingredients)}
Original Steps: ${JSON.stringify(recipe.steps)}

Requested Twist: Make it "${twist}".

You MUST return the modified recipe strictly as a JSON object with the exact same structure as the original (title, cuisine, prepTime, cookTime, servings, ingredients, steps), and NO surrounding markdown:
{
  "title": "Remixed Recipe Name",
  "cuisine": "Cuisine style",
  "prepTime": "Prep time",
  "cookTime": "Cook time",
  "servings": 4,
  "ingredients": [
    "modified ingredients here"
  ],
  "steps": [
    "modified cooking steps here"
  ]
}`;

    try {
      const response = await axios.post(
        ANTHROPIC_URL,
        {
          model: MODEL_NAME,
          max_tokens: 3000,
          messages: [{ role: "user", content: prompt }],
        },
        { headers: getClaudeHeaders() }
      );

      return parseClaudeJSON(response.data.content[0].text);
    } catch (error) {
      console.error("Claude remix error:", error);
    }
  }

  // Fallback remix
  return {
    ...recipe,
    title: `${recipe.title} (${twist} Remix)`,
    steps: [
      `[${twist} modification] Start by adjusting your base ingredients.`,
      ...recipe.steps,
    ],
  };
};

/**
 * Bulletproof Fallback Mock Recipes
 */
const getMockRecipe = (ingredients) => {
  const ingrList = ingredients.map((i) => i.toLowerCase());
  const hasChocolate = ingrList.some((i) => i.includes("choc") || i.includes("cocoa"));
  const hasSalmon = ingrList.some((i) => i.includes("salmon") || i.includes("fish"));

  if (hasChocolate) {
    return {
      title: "Indulgent Chef's Chocolate Lava Cake",
      cuisine: "French Dessert",
      prepTime: "10 mins",
      cookTime: "12 mins",
      servings: 4,
      ingredients: [
        "1/2 cup dark chocolate chips",
        "1/4 cup unsalted butter",
        "2 large eggs",
        "1/4 cup granulated sugar",
        "2 tbsp cocoa powder",
        "1 pinch salt",
      ],
      steps: [
        "Preheat your oven to 400°F (200°C) and grease four ramekins generously.",
        "Melt the dark chocolate chips and butter together in a heatproof bowl in 30-second increments in the microwave, stirring until smooth.",
        "In a separate bowl, whisk the eggs and granulated sugar together until pale and slightly thickened, about 2 minutes.",
        "Gently fold the melted chocolate mixture, cocoa powder, and a pinch of salt into the egg mixture until just combined.",
        "Divide the batter evenly among the ramekins and bake for 12 minutes until the edges are firm but the center is slightly jiggly.",
        "Let cool for 1 minute, invert onto serving plates, and dust with powdered sugar. Serve hot immediately!",
      ],
    };
  }

  if (hasSalmon) {
    return {
      title: "Pan-Seared Salmon with Rosemary Lemon Butter",
      cuisine: "Mediterranean",
      prepTime: "10 mins",
      cookTime: "15 mins",
      servings: 4,
      ingredients: [
        "4 fresh salmon fillets (approx. 6 oz each)",
        "2 tbsp fresh rosemary leaves, chopped",
        "3 tbsp unsalted butter",
        "1 tbsp olive oil",
        "2 cloves garlic, minced",
        "1 whole lemon, sliced into rounds",
        "1/2 tsp kosher salt",
        "1/4 tsp cracked black pepper",
      ],
      steps: [
        "Pat the salmon fillets dry with paper towels and season both sides evenly with 1/2 tsp salt and 1/4 tsp cracked black pepper.",
        "Heat 1 tbsp olive oil and 1 tbsp butter in a large skillet over medium-high heat until the butter is hot and foaming.",
        "Carefully place the salmon skin-side up in the skillet. Sear undisturbed for 5 minutes until a golden crust forms.",
        "Flip the fillets and add the remaining 2 tbsp butter, garlic, minced rosemary, and lemon slices to the pan.",
        "Spoon the melting, fragrant garlic-rosemary butter over the tops of the salmon fillets continuously for another 4 to 5 minutes as they finish cooking.",
        "Remove the pan from heat and transfer the salmon to plates. Spoon the pan juices and caramelized lemon slices over the fish and serve immediately.",
      ],
    };
  }

  // General fallback medley
  return {
    title: `Gourmet Chef's ${ingredients[0] ? ingredients[0].charAt(0).toUpperCase() + ingredients[0].slice(1) : "Pantry"} Medley`,
    cuisine: "Contemporary Fusion",
    prepTime: "15 mins",
    cookTime: "20 mins",
    servings: 4,
    ingredients: [
      ...ingredients.map((ing) => `2 units of fresh ${ing}`),
      "2 tbsp olive oil",
      "1 clove garlic, minced",
      "1/2 cup vegetable stock",
      "1 pinch salt",
      "to taste cracked pepper",
    ],
    steps: [
      `Wash and prepare all your key fresh ingredients, focusing on ${ingredients.join(", ")}.`,
      "Heat olive oil in a wide sauté pan over medium heat. Sauté the minced garlic for 1 minute until fragrant.",
      `Carefully add the prepared ingredients: ${ingredients.join(", ")} to the pan and toss in the hot garlic oil.`,
      "Pour in the vegetable stock and season with salt and cracked pepper to taste. Bring to a gentle simmer.",
      "Cover and simmer for 10 to 12 minutes until all ingredients are tender and the pan sauce has reduced by half.",
      "Plate beautifully, drizzle with extra virgin olive oil, and garnish with fresh herbs. Serve hot alongside rice or crusty bread.",
    ],
  };
};
