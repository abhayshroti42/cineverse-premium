import React from "react";
import { Link } from "react-router-dom";

function MovieRow({ title, movies }) {
  return (
    <div style={{ padding: "20px 0" }}>
      {/* Row Title */}
      <h2 style={{ color: "white", marginBottom: "15px", fontSize: "20px", fontWeight: "bold" }}>
        {title}
      </h2>
      
      {/* Horizontal Scroll Container */}
      <div style={{ 
        display: "flex", 
        overflowX: "auto", 
        gap: "15px", 
        paddingBottom: "15px",
        scrollbarWidth: "none" 
      }}>
        {movies && movies.map((movie) => (
          
          /* Native Interactive Movie Card Container */
          <div
            key={movie.movieId}
            style={{ 
              flexShrink: 0, 
              width: "160px", 
              cursor: "pointer",
              borderRadius: "6px",
              overflow: "hidden",
              boxShadow: "0 4px 6px rgba(0,0,0,0.3)",
              transition: "transform 0.2s ease, box-shadow 0.2s ease" 
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.1) translateY(-5px)";
              e.currentTarget.style.boxShadow = "0 10px 20px rgba(0,0,0,0.5)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1) translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 6px rgba(0,0,0,0.3)";
            }}
          >
            <Link to={`/movie/${movie.movieId}`} style={{ display: "block", textDecoration: "none" }}>
              
              {/* FIXED: If a movie poster exists, show it. Otherwise, render a clean text fallback box */}
              {movie.poster ? (
                <img 
                  src={movie.poster} 
                  alt={movie.title} 
                  style={{ width: "100%", height: "240px", objectFit: "cover", display: "block" }}
                />
              ) : (
                <div style={{ 
                  width: "100%", 
                  height: "240px", 
                  backgroundColor: "#2a2a2a", 
                  color: "#aaa", 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "center", 
                  padding: "15px", 
                  boxSizing: "border-box",
                  textAlign: "center",
                  fontSize: "14px",
                  fontWeight: "600"
                }}>
                  {movie.title}
                </div>
              )}

            </Link>
          </div>

        ))}
      </div>
    </div>
  );
}

export default MovieRow;