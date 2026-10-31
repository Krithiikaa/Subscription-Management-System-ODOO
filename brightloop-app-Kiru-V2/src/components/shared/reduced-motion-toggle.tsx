"use client";

import { useEffect, useState } from "react";

export function ReducedMotionToggle() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("bl-reduced-motion") === "true";
      if (stored) {
        document.documentElement.setAttribute("data-reduced-motion", "true");
        setReduced(true);
      }
    } catch {
      // ignore
    }
  }, []);

  function toggle() {
    const next = !reduced;
    if (next) {
      document.documentElement.setAttribute("data-reduced-motion", "true");
    } else {
      document.documentElement.removeAttribute("data-reduced-motion");
    }
    try {
      localStorage.setItem("bl-reduced-motion", String(next));
    } catch {
      // ignore
    }
    setReduced(next);
  }

  return (
    <button
      type="button"
      className="icon-btn"
      onClick={toggle}
      aria-pressed={reduced}
      aria-label={reduced ? "Reduced motion on" : "Reduce motion"}
      title={reduced ? "Reduced motion on" : "Reduce motion"}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        {reduced ? (
          <path d="M5 12h14" />
        ) : (
          <path d="M13 5l7 7-7 7M5 5l7 7-7 7" />
        )}
      </svg>
    </button>
  );
}
