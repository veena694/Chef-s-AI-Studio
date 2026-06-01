import axios from "axios";

// Anthropic configuration
const API_KEY = process.env.REACT_APP_API_KEY;
const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
const MODEL_NAME = "claude-3-5-sonnet-20241022";

const getHeaders = () => ({
  "content-type": "application/json",
  "x-api-key": API_KEY || "",
  "anthropic-version": "2023-06-01",
  "anthropic-dangerous-direct-browser-access": "true",
});

/**
 * Clean and parse JSON responses from Claude.
 * Handles cases where Claude wraps JSON in markdown blocks.
 */
function parseClaudeJSON(responseText) {
  const text = responseText.trim();
  try {
    return JSON.parse(text);
  } catch (e) {
    // Look for a JSON block in the text
    const jsonRegex = /\{[\s\S]*\}/;
    const match = text.match(jsonRegex);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch (err) {
        console.error("Failed to parse regex-extracted JSON block:", err);
      }
    }
    throw new Error("Failed to parse valid recipe JSON from Claude response.");
  }
}

/**
 * Generate a recipe using Claude 3.5 Sonnet based on a list of ingredients.
 */
export const generateRecipe = async (ingredients) => {
  if (!API_KEY || API_KEY.startsWith("8947ae")) {
    console.warn("Using mock recipe generation due to missing or invalid Anthropic API key.");
    return getMockRecipe(ingredients);
  }

  const prompt = `Generate a creative and detailed recipe using these ingredients: ${ingredients.join(", ")}.
You are allowed to include standard pantry staples (like salt, pepper, oil, water, flour, sugar, butter) if necessary, but keep the focus on the provided ingredients.

You MUST return the recipe strictly as a JSON object with the following structure, with NO surrounding markdown, explanatory text, or code block markers:
{
  "title": "Recipe Name",
  "cuisine": "Cuisine style (e.g. Italian, Fusion, Mexican)",
  "prepTime": "Prep time (e.g., 15 mins)",
  "cookTime": "Cook time (e.g., 25 mins)",
  "servings": 4,
  "ingredients": [
    "2 cups flour",
    "1/2 tsp salt",
    "3 large tomatoes"
  ],
  "steps": [
    "Step 1 details: Preheat your oven to 370 degrees...",
    "Step 2 details: Mix the flour and salt in a bowl...",
    "Step 3 details: Slice the tomatoes..."
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
      { headers: getHeaders() }
    );

    const contentText = response.data.content[0].text;
    return parseClaudeJSON(contentText);
  } catch (error) {
    console.error("Error generating recipe from Claude:", error);
    throw new Error(
      error.response?.data?.error?.message || "Failed to generate recipe. Please try again."
    );
  }
};

/**
 * Analyze an uploaded fridge/pantry photo using Claude 3.5 Sonnet Vision.
 */
export const analyzeFridgeImage = async (base64Data, mimeType) => {
  if (!API_KEY || API_KEY.startsWith("8947ae")) {
    console.warn("Using mock image scanner due to missing or invalid Anthropic API key.");
    return "eggs, milk, cheese, bread, butter, tomato, bell pepper";
  }

  // Ensure base64 string doesn't include the data:image/... header
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
      { headers: getHeaders() }
    );

    return response.data.content[0].text.trim();
  } catch (error) {
    console.error("Error scanning image from Claude:", error);
    throw new Error(
      error.response?.data?.error?.message || "Failed to analyze the photo. Please try again."
    );
  }
};

/**
 * Remix an existing recipe with a custom twist using Claude.
 */
export const remixRecipe = async (recipe, twist) => {
  if (!API_KEY || API_KEY.startsWith("8947ae")) {
    console.warn("Using mock remix due to missing or invalid Anthropic API key.");
    return {
      ...recipe,
      title: `${recipe.title} (${twist} Remix)`,
      steps: [
        `[${twist} modification] Start by adjusting your base ingredients.`,
        ...recipe.steps,
      ],
    };
  }

  const prompt = `Take this existing recipe and create an amazing, detailed, and creative twist on it.
Original Recipe Title: ${recipe.title}
Original Ingredients: ${JSON.stringify(recipe.ingredients)}
Original Steps: ${JSON.stringify(recipe.steps)}

Requested Twist: Make it "${twist}".

You MUST return the modified recipe strictly as a JSON object with the exact same structure as the original (title, cuisine, prepTime, cookTime, servings, ingredients, steps), and NO surrounding markdown, explanatory text, or code block markers:
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
      { headers: getHeaders() }
    );

    const contentText = response.data.content[0].text;
    return parseClaudeJSON(contentText);
  } catch (error) {
    console.error("Error remixing recipe from Claude:", error);
    throw new Error(
      error.response?.data?.error?.message || "Failed to remix recipe. Please try again."
    );
  }
};

/**
 * Bulletproof Fallback Mock Recipes when API Key is Spoonacular's or empty.
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
        "Flip the fillets and add the remaining 2 tbsp butter, minced garlic, chopped rosemary, and lemon slices to the pan.",
        "Spoon the melting, fragrant garlic-rosemary butter over the tops of the salmon fillets continuously for another 4 to 5 minutes as they finish cooking.",
        "Remove the pan from heat and transfer the salmon to plates. Spoon the pan juices and caramelized lemon slices over the fish and serve immediately.",
      ],
    };
  }

  // General fallback recipe based on ingredients provided
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
