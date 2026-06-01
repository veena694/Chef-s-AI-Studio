import React, { useEffect } from "react";
import { motion } from "framer-motion";

/**
 * Toast - Animated notification card.
 * Auto-dismisses after 3 seconds.
 */
function Toast({ message, type = "success", onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const icons = {
    success: "🥗",
    error: "🌶️",
    info: "🍳",
  };

  const getBorderColor = () => {
    if (type === "success") return "var(--accent-rosemary)";
    if (type === "error") return "var(--accent-terracotta)";
    return "var(--accent-saffron)";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, x: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, x: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, x: 50, scale: 0.9 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "var(--spacing-md)",
        padding: "var(--spacing-md) var(--spacing-lg)",
        backgroundColor: "var(--bg-secondary)",
        color: "var(--text-primary)",
        borderRadius: "var(--border-radius-md)",
        boxShadow: "var(--shadow-3)",
        borderLeft: `5px solid ${getBorderColor()}`,
        pointerEvents: "auto",
        width: "320px",
        backdropFilter: "var(--glass-blur)",
        zIndex: 99999,
        position: "relative",
      }}
    >
      <span style={{ fontSize: "1.5rem" }}>{icons[type] || "✨"}</span>
      <span style={{ flexGrow: 1, fontWeight: 500, fontSize: "0.95rem" }}>
        {message}
      </span>
      <button
        onClick={onClose}
        style={{
          background: "none",
          border: "none",
          color: "var(--text-secondary)",
          fontSize: "1.2rem",
          cursor: "pointer",
          padding: "var(--spacing-xs)",
          transition: "var(--transition-fast)",
        }}
        onMouseEnter={(e) => (e.target.style.color = "var(--text-primary)")}
        onMouseLeave={(e) => (e.target.style.color = "var(--text-secondary)")}
      >
        ×
      </button>
    </motion.div>
  );
}

/**
 * ToastContainer - Wrapper that anchors toasts to the top-right corner.
 */
export function ToastContainer({ children }) {
  return (
    <div
      style={{
        position: "fixed",
        top: "24px",
        right: "24px",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        zIndex: 99999,
        pointerEvents: "none",
      }}
    >
      {children}
    </div>
  );
}

export default Toast;
