import React, { useState, useEffect } from 'react';

// Curated list of rotating showcase items
const FEATURED_SLIDES = [
  {
    title: "Interstellar Voyage",
    desc: "A team of explorers travel beyond this galaxy through a wormhole to discover whether mankind has a future among the stars.",
    bg: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=1925",
    tag: "Sci-Fi Masterpiece"
  },
  {
    title: "The Silent Cosmos",
    desc: "An isolated deep-space researcher uncovers an encrypted signal echoing from the dark edge of a dead moon.",
    bg: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1920",
    tag: "Mystery Thriller"
  },
  {
    title: "Neon Horizon",
    desc: "In a sprawling rain-slicked futuristic city, a retired operative is pulled back into the underworld to track a ghost protocol.",
    bg: "https://images.unsplash.com/photo-1515621061946-eff1c2a352bd?q=80&w=1920",
    tag: "Cyberpunk Action"
  }
];

function HeroBanner() {
  const [currentIdx, setCurrentIdx] = useState(0);

  // Automatically switch slides every 6 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % FEATURED_SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const slide = FEATURED_SLIDES[currentIdx];

  return (
    <div 
      style={{
        position: "relative",
        height: "40vw",
        minHeight: "380px",
        maxHeight: "550px",
        width: "100%",
        backgroundImage: `url('${slide.bg}')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        color: "white",
        display: "flex",
        alignItems: "flex-end",
        transition: "background-image 0.8s ease-in-out" // Smooth cross-fade transition
      }}
    >
      {/* Deep Vignette Ambient Shadow */}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, #141414 5%, transparent 60%)", zIndex: 1 }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, rgba(20,20,20,0.85) 10%, transparent 70%)", zIndex: 1 }} />

      {/* Slide Content Box */}
      <div style={{ position: "relative", zIndex: 2, padding: "0 4% 4% 4%", maxWidth: "650px", display: "flex", flexDirection: "column", gap: "12px" }}>
        
        <span style={{ fontSize: "11px", backgroundColor: "rgba(255,255,255,0.15)", padding: "4px 10px", borderRadius: "20px", width: "fit-content", textTransform: "uppercase", letterSpacing: "1px", fontWeight: "bold", border: "1px solid rgba(255,255,255,0.2)" }}>
          {slide.tag}
        </span>

        <h1 style={{ fontSize: "clamp(1.8rem, 4vw, 3.2rem)", margin: 0, fontWeight: "800", letterSpacing: "-0.5px" }}>
          {slide.title}
        </h1>

        <p style={{ fontSize: "clamp(13px, 1.3vw, 16px)", lineHeight: "1.5", color: "#cbcbcb", margin: "0 0 8px 0" }}>
          {slide.desc}
        </p>
        
        {/* Clean Info Action Interface (Play Button completely removed!) */}
        <div>
          <button style={{ 
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "10px 22px", 
            backgroundColor: "rgba(255, 255, 255, 0.12)", 
            color: "white", 
            border: "1px solid rgba(255,255,255,0.25)", 
            borderRadius: "6px", 
            fontWeight: "600", 
            cursor: "pointer", 
            fontSize: "14px", 
            backdropFilter: "blur(8px)",
            transition: "all 0.2s"
          }}
          onMouseEnter={(e) => { e.target.style.backgroundColor = "rgba(255,255,255,0.25)"; e.target.style.borderColor = "white"; }}
          onMouseLeave={(e) => { e.target.style.backgroundColor = "rgba(255,255,255,0.12)"; e.target.style.borderColor = "rgba(255,255,255,0.25)"; }}
          >
            Explore Title Details →
          </button>
        </div>
      </div>

      {/* Slide Indicator Dots (Bottom Right) */}
      <div style={{ position: "absolute", bottom: "4%", right: "4%", zIndex: 3, display: "flex", gap: "8px" }}>
        {FEATURED_SLIDES.map((_, idx) => (
          <div 
            key={idx}
            onClick={() => setCurrentIdx(idx)}
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              backgroundColor: currentIdx === idx ? "white" : "rgba(255,255,255,0.4)",
              cursor: "pointer",
              transition: "background-color 0.3s"
            }}
          />
        ))}
      </div>
    </div>
  );
}

export default HeroBanner;