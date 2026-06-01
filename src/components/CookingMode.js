import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * CookingMode - Premium Hands-free Cooking UI
 * Upgraded with a continuous single-mount Speech Recognition engine utilizing React Refs
 * to provide instant, lag-free voice controls and fluid responsive mobile views (down to 320px).
 */
function CookingMode({ recipe, onClose }) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [timerDuration, setTimerDuration] = useState(null); // total seconds
  const [timerSecondsLeft, setTimerSecondsLeft] = useState(null); // active seconds left
  const [timerActive, setTimerActive] = useState(false);
  const [micActive, setMicActive] = useState(false);
  const [isSpeechSupported, setIsSpeechSupported] = useState(false);

  const containerRef = useRef(null);
  const recognitionRef = useRef(null);
  const timerIntervalRef = useRef(null);

  // React Refs to feed the continuous speech listener with real-time values
  const currentStepIndexRef = useRef(currentStepIndex);
  const timerDurationRef = useRef(timerDuration);
  const timerActiveRef = useRef(timerActive);
  const recipeRef = useRef(recipe);

  const totalSteps = recipe?.steps?.length || 0;
  const currentStepText = recipe?.steps?.[currentStepIndex] || "";

  // Synchronize refs with states
  useEffect(() => {
    currentStepIndexRef.current = currentStepIndex;
  }, [currentStepIndex]);

  useEffect(() => {
    timerDurationRef.current = timerDuration;
  }, [timerDuration]);

  useEffect(() => {
    timerActiveRef.current = timerActive;
  }, [timerActive]);

  useEffect(() => {
    recipeRef.current = recipe;
  }, [recipe]);

  // 1. Fullscreen API with support for Webkit (iOS Safari fallback)
  useEffect(() => {
    const el = containerRef.current;
    if (el) {
      if (el.requestFullscreen) {
        el.requestFullscreen().catch((err) => {
          console.warn("Fullscreen request rejected:", err);
        });
      } else if (el.webkitRequestFullscreen) {
        el.webkitRequestFullscreen();
      }
    }

    // Clean up fullscreen on unmount
    return () => {
      if (document.fullscreenElement || document.webkitFullscreenElement) {
        if (document.exitFullscreen) {
          document.exitFullscreen().catch(() => {});
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
        }
      }
    };
  }, []);

  // 2. Synthesize audio chime using pure Web Audio API
  const playTimerChime = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      
      // Tone 1: E5
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(659.25, ctx.currentTime);
      gain1.gain.setValueAtTime(0.3, ctx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
      osc1.start();
      osc1.stop(ctx.currentTime + 0.4);

      // Tone 2: A5 (played slightly later)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(880.00, ctx.currentTime + 0.18);
      gain2.gain.setValueAtTime(0.3, ctx.currentTime + 0.18);
      gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);
      osc2.start(ctx.currentTime + 0.18);
      osc2.stop(ctx.currentTime + 0.6);
    } catch (e) {
      console.error("AudioContext chime error:", e);
    }
  };

  // 3. Auto-detect time mentions in current step text using regex
  // Matches e.g., "cook for 25 minutes", "bake for 1 hour", "fry for 30 seconds"
  useEffect(() => {
    // Reset timer when changing steps
    stopTimer();
    setTimerDuration(null);
    setTimerSecondsLeft(null);

    const timeRegex = /(\d+)\s*(min|minute|mins|minutes|hour|hours|sec|second|secs|seconds)/i;
    const match = currentStepText.match(timeRegex);

    if (match) {
      const quantity = parseInt(match[1], 10);
      const unit = match[2].toLowerCase();
      let totalSeconds = quantity;

      if (unit.startsWith("min")) {
        totalSeconds = quantity * 60;
      } else if (unit.startsWith("hour")) {
        totalSeconds = quantity * 3600;
      }

      setTimerDuration(totalSeconds);
      setTimerSecondsLeft(totalSeconds);
    }
  }, [currentStepIndex, currentStepText]);

  // 4. Timer control functions
  const startTimer = () => {
    if (timerIntervalRef.current) return;
    setTimerActive(true);
    timerIntervalRef.current = setInterval(() => {
      setTimerSecondsLeft((prev) => {
        if (prev <= 1) {
          stopTimer();
          playTimerChime();
          alert(`⏰ Timer finished for Step ${currentStepIndexRef.current + 1}!`);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const stopTimer = () => {
    setTimerActive(false);
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  };

  const toggleTimer = () => {
    if (timerActiveRef.current) {
      stopTimer();
    } else {
      startTimer();
    }
  };

  const resetTimer = () => {
    stopTimer();
    setTimerSecondsLeft(timerDurationRef.current);
  };

  // 5. Speech Synthesis for "repeat" step command
  const speakCurrentStep = () => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const activeText = recipeRef.current?.steps?.[currentStepIndexRef.current] || "";
    const cleanedText = activeText.replace(/[^a-zA-Z0-9\s.,?!]/g, "");
    const utterance = new SpeechSynthesisUtterance(cleanedText);
    utterance.rate = 0.95; // Slightly slower for clear kitchen speaking
    window.speechSynthesis.speak(utterance);
  };

  const handleNextStep = () => {
    setCurrentStepIndex((prev) => {
      if (prev < totalSteps - 1) return prev + 1;
      return prev;
    });
  };

  const handlePrevStep = () => {
    setCurrentStepIndex((prev) => {
      if (prev > 0) return prev - 1;
      return prev;
    });
  };

  // 6. Web Speech API - Single Mount Continuous Speech Engine
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSpeechSupported(false);
      return;
    }

    setIsSpeechSupported(true);
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      setMicActive(true);
    };

    recognition.onend = () => {
      setMicActive(false);
      // Restart listening while Cooking Mode is still open (checks if recognitionRef is active)
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch (e) {
          // Ignore start overlaps
        }
      }
    };

    recognition.onerror = (e) => {
      console.warn("Speech recognition error:", e.error);
      if (e.error === "not-allowed") {
        setIsSpeechSupported(false);
      }
    };

    recognition.onresult = (event) => {
      const latestResult = event.results[event.results.length - 1][0].transcript.toLowerCase().trim();
      console.log("Voice Command recognized:", latestResult);

      // Matches broader variations of the commands
      if (latestResult.includes("next") || latestResult.includes("forward")) {
        handleNextStep();
      } else if (latestResult.includes("previous") || latestResult.includes("back")) {
        handlePrevStep();
      } else if (latestResult.includes("repeat") || latestResult.includes("say again") || latestResult.includes("read")) {
        speakCurrentStep();
      } else if (latestResult.includes("timer") || latestResult.includes("start") || latestResult.includes("pause") || latestResult.includes("stop")) {
        toggleTimer();
      }
    };

    recognitionRef.current = recognition;
    
    try {
      recognition.start();
    } catch (e) {
      console.error("Continuous speech engine start failed:", e);
    }

    return () => {
      // Complete teardown on component unmount
      const rec = recognitionRef.current;
      recognitionRef.current = null;
      if (rec) {
        try {
          rec.stop();
        } catch (e) {}
      }
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run EXACTLY once on mount. All values are read from mutable refs.

  const formatTime = (totalSecs) => {
    if (totalSecs === null || totalSecs < 0) return "";
    const hours = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    
    const pad = (num) => String(num).padStart(2, "0");
    if (hours > 0) {
      return `${pad(hours)}:${pad(mins)}:${pad(secs)}`;
    }
    return `${pad(mins)}:${pad(secs)}`;
  };

  const progressPercent = totalSteps > 0 ? ((currentStepIndex + 1) / totalSteps) * 100 : 0;

  return (
    <div
      ref={containerRef}
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "#1A1410", // Dark chef's kitchen mode
        color: "#FDF6EC",
        zIndex: 999999,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "clamp(var(--spacing-md), 4vw, var(--spacing-xl)) var(--spacing-md)",
        fontFamily: "var(--font-body)",
        overflowY: "auto",
      }}
    >
      {/* HEADER SECTION - Stacked on Mobile, Row on Desktop */}
      <div 
        style={{ 
          display: "flex", 
          flexDirection: "row",
          flexWrap: "wrap",
          justifyContent: "space-between", 
          alignItems: "center",
          gap: "12px",
          width: "100%"
        }}
      >
        <div style={{ flex: "1 1 200px" }}>
          <h4 style={{ color: "var(--accent-saffron)", fontSize: "0.9rem", marginBottom: "2px", textTransform: "uppercase", letterSpacing: "1px" }}>
            Cooking Mode
          </h4>
          <h2 style={{ fontFamily: "var(--font-title)", fontSize: "clamp(1.25rem, 4vw, 1.8rem)", color: "#FFFFFF", fontWeight: "600", margin: 0 }}>
            {recipe?.title}
          </h2>
        </div>
        
        <div 
          style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: "10px",
            flexWrap: "wrap"
          }}
        >
          {isSpeechSupported ? (
            <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "rgba(255,255,255,0.06)", padding: "6px 12px", borderRadius: "20px" }}>
              <span 
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  backgroundColor: micActive ? "#539E49" : "#888",
                  boxShadow: micActive ? "0 0 10px #539E49" : "none",
                  display: "inline-block",
                  transition: "all 0.3s ease"
                }}
              />
              <span style={{ fontSize: "0.78rem", color: "#CDBFAD", fontWeight: 500 }}>
                Voice Active ("Next", "Back")
              </span>
            </div>
          ) : (
            <div style={{ background: "rgba(255,255,255,0.05)", padding: "6px 12px", borderRadius: "20px", fontSize: "0.75rem", color: "var(--accent-amber)" }}>
              🎤 Voice: Chrome only
            </div>
          )}
          
          <button
            onClick={onClose}
            style={{
              background: "rgba(255, 255, 255, 0.1)",
              border: "none",
              color: "#FFFFFF",
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              fontSize: "1.25rem",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "var(--transition-fast)"
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = "rgba(255, 255, 255, 0.2)"}
            onMouseLeave={(e) => e.target.style.backgroundColor = "rgba(255, 255, 255, 0.1)"}
          >
            ✕
          </button>
        </div>
      </div>

      {/* PROGRESS BAR */}
      <div style={{ width: "100%", height: "4px", backgroundColor: "rgba(255,255,255,0.1)", borderRadius: "2px", margin: "16px 0", overflow: "hidden" }}>
        <div 
          style={{ 
            height: "100%", 
            width: `${progressPercent}%`, 
            backgroundColor: "var(--accent-saffron)", 
            transition: "width 0.3s ease-out" 
          }}
        />
      </div>

      {/* MAIN STEP TEXT AREA */}
      <div 
        style={{ 
          flexGrow: 1, 
          display: "flex", 
          flexDirection: "column", 
          justifyContent: "center", 
          alignItems: "center", 
          maxWidth: "800px", 
          margin: "0 auto",
          textAlign: "center",
          width: "100%",
          padding: "var(--spacing-md) 0"
        }}
      >
        <div style={{ fontSize: "1.1rem", color: "var(--accent-saffron)", fontWeight: "600", marginBottom: "12px" }}>
          Step {currentStepIndex + 1} of {totalSteps}
        </div>
        
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStepIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            style={{
              fontSize: "clamp(1.4rem, 4.8vw, 2.1rem)",
              lineHeight: "1.45",
              fontWeight: "500",
              color: "#FFFFFF",
              marginBottom: "var(--spacing-lg)"
            }}
          >
            {currentStepText}
          </motion.div>
        </AnimatePresence>

        {/* TIMER CONTAINER */}
        {timerDuration !== null && (
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{ 
              display: "flex", 
              flexWrap: "wrap",
              justifyContent: "center",
              alignItems: "center", 
              gap: "10px",
              background: "rgba(244, 163, 25, 0.08)",
              border: "1px solid rgba(244, 163, 25, 0.2)",
              padding: "12px 24px",
              borderRadius: "30px",
              marginTop: "8px"
            }}
          >
            <span style={{ fontSize: "1.6rem", fontWeight: "700", fontFamily: "monospace", color: "var(--accent-saffron)", letterSpacing: "1px" }}>
              {formatTime(timerSecondsLeft)}
            </span>
            <div style={{ display: "flex", gap: "6px" }}>
              <button
                onClick={toggleTimer}
                style={{
                  backgroundColor: timerActive ? "var(--accent-terracotta)" : "var(--accent-rosemary)",
                  color: "#FFFFFF",
                  border: "none",
                  padding: "6px 14px",
                  borderRadius: "15px",
                  fontSize: "0.85rem",
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "var(--transition-fast)"
                }}
              >
                {timerActive ? "Pause" : "Start"}
              </button>
              <button
                onClick={resetTimer}
                style={{
                  backgroundColor: "rgba(255,255,255,0.1)",
                  color: "#FFFFFF",
                  border: "none",
                  padding: "6px 14px",
                  borderRadius: "15px",
                  fontSize: "0.85rem",
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "var(--transition-fast)"
                }}
              >
                Reset
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {/* FOOTER CONTROLS - Highly responsive flex wrapper */}
      <div 
        style={{ 
          display: "flex", 
          flexWrap: "wrap",
          justifyContent: "center", 
          alignItems: "center", 
          maxWidth: "600px", 
          width: "100%", 
          margin: "0 auto",
          gap: "10px"
        }}
      >
        <button
          onClick={handlePrevStep}
          disabled={currentStepIndex === 0}
          style={{
            flex: "1 1 130px",
            backgroundColor: currentStepIndex === 0 ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.1)",
            color: currentStepIndex === 0 ? "#555" : "#FFFFFF",
            border: "none",
            height: "56px",
            borderRadius: "var(--border-radius-sm)",
            fontSize: "1rem",
            fontWeight: "600",
            cursor: currentStepIndex === 0 ? "default" : "pointer",
            transition: "var(--transition-smooth)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px"
          }}
          onMouseEnter={(e) => {
            if (currentStepIndex !== 0) e.target.style.backgroundColor = "rgba(255, 255, 255, 0.18)";
          }}
          onMouseLeave={(e) => {
            if (currentStepIndex !== 0) e.target.style.backgroundColor = "rgba(255, 255, 255, 0.1)";
          }}
        >
          ← Previous
        </button>

        <button
          onClick={speakCurrentStep}
          style={{
            width: "56px",
            height: "56px",
            borderRadius: "var(--border-radius-sm)",
            backgroundColor: "rgba(244, 163, 25, 0.15)",
            border: "1px solid rgba(244, 163, 25, 0.3)",
            color: "var(--accent-saffron)",
            fontSize: "1.3rem",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "var(--transition-smooth)"
          }}
          title="Read step aloud"
          onMouseEnter={(e) => e.target.style.backgroundColor = "rgba(244, 163, 25, 0.25)"}
          onMouseLeave={(e) => e.target.style.backgroundColor = "rgba(244, 163, 25, 0.15)"}
        >
          🔊
        </button>

        <button
          onClick={handleNextStep}
          disabled={currentStepIndex === totalSteps - 1}
          style={{
            flex: "1 1 130px",
            backgroundColor: currentStepIndex === totalSteps - 1 ? "rgba(255,255,255,0.03)" : "var(--accent-terracotta)",
            color: currentStepIndex === totalSteps - 1 ? "#555" : "#FFFFFF",
            border: "none",
            height: "56px",
            borderRadius: "var(--border-radius-sm)",
            fontSize: "1rem",
            fontWeight: "600",
            cursor: currentStepIndex === totalSteps - 1 ? "default" : "pointer",
            transition: "var(--transition-smooth)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px"
          }}
          onMouseEnter={(e) => {
            if (currentStepIndex !== totalSteps - 1) e.target.style.backgroundColor = "var(--accent-amber)";
          }}
          onMouseLeave={(e) => {
            if (currentStepIndex !== totalSteps - 1) e.target.style.backgroundColor = "var(--accent-terracotta)";
          }}
        >
          Next Step →
        </button>
      </div>
    </div>
  );
}

export default CookingMode;
