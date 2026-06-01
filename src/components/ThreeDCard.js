import React, { useState, useRef } from "react";

/**
 * ThreeDCard - A premium interactive 3D Card wrapper.
 * Applies a 3D tilt effect on hover using perspective and rotate transforms,
 * capped at 8 degrees tilt, with layered depth spacing.
 */
function ThreeDCard({ children, className = "", onClick }) {
  const cardRef = useRef(null);
  const [transformStyle, setTransformStyle] = useState("rotateX(0deg) rotateY(0deg) scale(1)");
  const [shadowStyle, setShadowStyle] = useState("var(--shadow-2)");

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    // Mouse coordinates relative to the card's center
    const x = e.clientX - rect.left - width / 2;
    const y = e.clientY - rect.top - height / 2;

    // Calculate rotation angles (capped at 8deg)
    const rotateY = (x / (width / 2)) * 8;
    const rotateX = -(y / (height / 2)) * 8;

    setTransformStyle(`rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.03)`);
    setShadowStyle("var(--shadow-3)");
  };

  const handleMouseLeave = () => {
    setTransformStyle("rotateX(0deg) rotateY(0deg) scale(1)");
    setShadowStyle("var(--shadow-2)");
  };

  return (
    <div
      ref={cardRef}
      className={`threed-card-outer ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{
        perspective: "1000px",
        transformStyle: "preserve-3d",
        transition: "transform 0.15s ease-out, box-shadow 0.3s ease",
        transform: transformStyle,
        boxShadow: shadowStyle,
        cursor: onClick ? "pointer" : "default",
        borderRadius: "var(--border-radius-md)",
      }}
    >
      <div 
        style={{ 
          transform: "translateZ(30px)", 
          transformStyle: "preserve-3d",
          height: "100%", 
          width: "100%" 
        }}
      >
        {children}
      </div>
    </div>
  );
}

export default ThreeDCard;
