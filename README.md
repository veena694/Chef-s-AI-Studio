# Chef's AI Studio 🍳

> **A gorgeous modern recipe generator integrating OpenAI's API. Provides contextual cooking recommendations based on ingredients, dietary rules, dynamic search, and custom animation menus.**

Chef's AI Studio is a premium web application designed to revolutionize the culinary experience. By combining state-of-the-art artificial intelligence with a stunning, high-end 3D glassmorphic user interface, the app allows users to scan their ingredients, receive real-time recipe generation, adjust portion sizes dynamically, and cook hands-free using advanced voice recognition.

---

## 🛠️ Technology Stack

- **Frontend**: React (Hooks, Context, Web Speech APIs)
- **Styling**: Pure CSS (CSS Modules & custom design system tokens)
- **Animations**: Framer Motion (for staggered fades, smooth page transitions, and interactive tilt effects)
- **API Integration**: OpenAI API (for natural language processing and advanced custom recipe remixes) & Spoonacular API (for quick recommendations and standard recipes)
- **Package Management**: npm

---

## ✨ Premium Core Features

### 1. 🔍 Dynamic suggested specials
- Loads 4 random gourmet recipes on the homepage automatically every time the page refreshes.
- "View More Recipes" button loads and appends additional recommendations in real-time.

### 2. 📸 Fridge Photo Scanner
- Interactive drag-and-drop or select file uploader with robust validations (file size < 5MB, format checks).
- Vision parsing scans uploaded fridge or pantry photos to identify available ingredients instantly.

### 3. 🎙️ Hands-free Voice Cooking Mode
- An advanced continuous speech recognition engine that lets you control the steps entirely via voice commands (e.g., "Next step", "Previous step", "Repeat step", "Start timer").
- Built-in text-to-speech engine to read steps back to you.
- Adaptive regex-based kitchen timers that detect time frames (e.g., "Simmer for 15 minutes") and count down with premium retro chimes.

### 4. 📖 Saved Cookbook & Remix Studio
- Rate recipes with a beautiful interactive 5-star rating system.
- Save persistent, auto-saving notes for any bookmarked recipe.
- Custom recipe creation wizard to manually add your secret family recipes to your personal cookbook.
- Claude/OpenAI AI Remix system that takes any existing recipe and applies a customized twist (e.g., "Make it extra spicy" or "Convert to Vegan").

### 5. ⚖️ Proportional Stepper Scaler
- Seamlessly scale ingredients up or down side-by-side using a proportional fraction and number scaler while ignoring non-numeric text like "pinch" or "to taste".


