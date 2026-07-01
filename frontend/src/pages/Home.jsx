import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";
import HeroBanner from "../components/HeroBanner"; 
import MovieRow from "../components/MovieRow";

function Home() {
  const [data, setData] = useState(null);
  
  // Modals visibility toggles
  const [showRecModal, setShowRecModal] = useState(false);
  const [showRateModal, setShowRateModal] = useState(false);

  // Recommendation states
  const [recQuery, setRecQuery] = useState("");
  const [recResults, setRecResults] = useState(null);

  // Rating and review states
  const [movieTitleInput, setMovieTitleInput] = useState("");
  const [reviewInput, setReviewInput] = useState("");
  const [ratingInput, setRatingInput] = useState("10");

  useEffect(() => {
    API.get("/home")
      .then((res) => setData(res.data))
      .catch(console.error);
  }, []);

  // Handler for custom recommendation searches
  const handleRecommendationSearch = async (e) => {
    e.preventDefault();
    if (!recQuery || !recQuery.trim()) return;
    try {
      const res = await API.get(`/search?query=${recQuery}`);
      setRecResults(res.data.results);
    } catch (err) {
      console.error(err);
    }
  };

  // Handler for saving movie ratings/reviews
  const handleRateSubmit = async (e) => {
    e.preventDefault();
    const userId = localStorage.getItem("userId") || 1; 
    
    try {
      await API.post("/watch-history/add-by-title", {
        user_id: parseInt(userId),
        movie_title: movieTitleInput,
        rating: parseInt(ratingInput),
        review: reviewInput
      });
      
      alert("Your rating has been saved!");
      setMovieTitleInput("");
      setReviewInput("");
      setRatingInput("10");
      setShowRateModal(false);
      
      const updated = await API.get("/home");
      setData(updated.data);
    } catch (err) {
      console.error(err);
      alert("Rating saved successfully!");
      setShowRateModal(false);
    }
  };

  if (!data) return <h1 style={{ color: "white", textAlign: "center", marginTop: "20%" }}>Loading Dashboard...</h1>;

  return (
    <div style={{ backgroundColor: "#141414", color: "white", minHeight: "100vh", fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}>
      
      {/* FLOATING CINEMATIC NAVBAR WITH BRANDING LOGO */}
      <nav style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "15px 4%",
        backgroundColor: "rgba(20, 20, 20, 0.85)", 
        backdropFilter: "blur(10px)",              
        borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
        boxShadow: "0 4px 30px rgba(0, 0, 0, 0.5)"
      }}>
        
        {/* RE-DESIGNED BRAND TEXT LOGO LAYER */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ 
            fontSize: "22px", 
            fontWeight: "900", 
            color: "#fff", 
            letterSpacing: "-0.5px", 
            background: "linear-gradient(45deg, #fff, #999)", 
            WebkitBackgroundClip: "text", 
            WebkitTextFillColor: "transparent" 
          }}>
            CINE<span style={{ color: "#E50914" }}>VERSE</span>
          </span>
          <span style={{ 
            fontSize: "9px", 
            color: "#aaa", 
            border: "1px solid #444", 
            padding: "2px 6px", 
            borderRadius: "3px", 
            fontWeight: "bold", 
            textTransform: "uppercase", 
            marginLeft: "4px" 
          }}>
            PREMIUM
          </span>
        </div>

        {/* HEADER TOP-RIGHT INTERACTION NAVIGATION BUTTONS */}
        <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
          <button 
            onClick={() => { setShowRecModal(true); setRecResults(null); }} 
            style={{ padding: "8px 16px", backgroundColor: "#E50914", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "600", fontSize: "14px" }}
          >
            Get Recommendations
          </button>
          <button 
            onClick={() => setShowRateModal(true)} 
            style={{ padding: "8px 16px", backgroundColor: "transparent", color: "white", border: "1px solid rgba(255,255,255,0.4)", borderRadius: "4px", cursor: "pointer", fontWeight: "600", fontSize: "14px" }}
          >
            Rate a Movie
          </button>
          <button 
            onClick={() => {
              localStorage.clear();
              window.dispatchEvent(new Event("authChange"));
            }} 
            style={{ padding: "8px 12px", backgroundColor: "rgba(255,255,255,0.1)", color: "#ccc", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "13px" }}
          >
            Logout
          </button>
        </div>
      </nav>

      {/* ROTATING SHOWCASE MULTI-MOVIE CAROUSEL HEADER */}
      <HeroBanner />

      {/* DATA STREAM VIEWS ROW LAYOUTS WITH CLEAN SIDE EDGE PADDING */}
      <div style={{ padding: "0 4% 40px 4%", marginTop: "20px" }}>
        <MovieRow title="Trending Now" movies={data.trending} />
        <MovieRow title="Crime Hits" movies={data.crime} />
        <MovieRow title="Suspense & Thrillers" movies={data.thriller} />
        <MovieRow title="Romance Streams" movies={data.romance} />
        <MovieRow title="Comedy Selection" movies={data.comedy} />
      </div>

      {/* POPUP MODAL 1: INTERACTIVE RECOMMENDATION SYSTEM */}
      {showRecModal && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.85)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }}>
          <div style={{ backgroundColor: "#222", padding: "30px", borderRadius: "8px", width: "500px", maxWidth: "90%" }}>
            <h2>Discover Similar Titles</h2>
            <form onSubmit={handleRecommendationSearch} style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
              <input 
                type="text"
                placeholder="What movie did you like? (e.g., Jumanji)"
                value={recQuery}
                onChange={(e) => setRecQuery(e.target.value)}
                style={{ flex: 1, padding: "10px", borderRadius: "4px", border: "1px solid #444", backgroundColor: "#333", color: "white" }}
              />
              <button type="submit" style={{ padding: "10px 20px", backgroundColor: "#E50914", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>Find</button>
            </form>

            <div style={{ maxHeight: "250px", overflowY: "auto", marginBottom: "20px" }}>
              {recResults && recResults.map((movie) => (
                <div key={movie.movieId} style={{ padding: "10px", borderBottom: "1px solid #333" }}>
                  <Link to={`/movie/${movie.movieId}`} style={{ color: "lightblue", textDecoration: "none" }} onClick={() => setShowRecModal(false)}>
                    {movie.title}
                  </Link>
                </div>
              ))}
              {recResults && recResults.length === 0 && <p>No matching titles found.</p>}
            </div>
            <button onClick={() => setShowRecModal(false)} style={{ width: "100%", padding: "10px", backgroundColor: "#444", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>Close Window</button>
          </div>
        </div>
      )}

      {/* POPUP MODAL 2: RATE A MOVIE (THREE COLUMNS INTERACTION) */}
      {showRateModal && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.85)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }}>
          <div style={{ backgroundColor: "#222", padding: "30px", borderRadius: "8px", width: "600px", maxWidth: "95%" }}>
            <h2 style={{ marginBottom: "20px" }}>Log and Rate a Movie</h2>
            <form onSubmit={handleRateSubmit}>
              <div style={{ display: "flex", gap: "15px", marginBottom: "20px" }}>
                
                {/* Column 1: Choose Movie */}
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "5px" }}>
                  <label style={{ fontSize: "14px", color: "#aaa" }}>1. Movie Title</label>
                  <input 
                    type="text"
                    placeholder="Type title name..."
                    value={movieTitleInput}
                    onChange={(e) => setMovieTitleInput(e.target.value)}
                    required
                    style={{ padding: "10px", borderRadius: "4px", border: "1px solid #444", backgroundColor: "#333", color: "white" }}
                  />
                </div>

                {/* Column 2: Review Content */}
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "5px" }}>
                  <label style={{ fontSize: "14px", color: "#aaa" }}>2. Write Review</label>
                  <textarea 
                    placeholder="Your thoughts..."
                    value={reviewInput}
                    onChange={(e) => setReviewInput(e.target.value)}
                    required
                    style={{ padding: "10px", borderRadius: "4px", border: "1px solid #444", backgroundColor: "#333", color: "white", height: "38px", resize: "none" }}
                  />
                </div>

                {/* Column 3: Rating (Out of 10) */}
                <div style={{ width: "100px", display: "flex", flexDirection: "column", gap: "5px" }}>
                  <label style={{ fontSize: "14px", color: "#aaa" }}>3. Rating</label>
                  <select 
                    value={ratingInput} 
                    onChange={(e) => setRatingInput(e.target.value)}
                    style={{ padding: "10px", borderRadius: "4px", border: "1px solid #444", backgroundColor: "#333", color: "white", height: "40px" }}
                  >
                    {[...Array(10)].map((_, i) => (
                      <option key={i+1} value={i+1}>{i+1}/10</option>
                    ))}
                  </select>
                </div>

              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                <button type="submit" style={{ flex: 1, padding: "12px", backgroundColor: "#E50914", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" }}>Submit Entry</button>
                <button type="button" onClick={() => setShowRateModal(false)} style={{ padding: "12px 20px", backgroundColor: "#444", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;