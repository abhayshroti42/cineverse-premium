import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react"; // 1. FIXED: Imported state helpers

// Component Imports
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import WatchHistory from "./pages/WatchHistory";
import MovieDetails from "./pages/MovieDetails";

function App() {
  // 2. FIXED: Use dynamic state so React tracks when this variable updates
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem("userId"));

  // 3. FIXED: Listen for storage token shifts to instantly release or apply route guards
  useEffect(() => {
    const checkAuth = () => {
      setIsAuthenticated(!!localStorage.getItem("userId"));
    };

    // Listen for custom events when logging in
    window.addEventListener("storage", checkAuth);
    window.addEventListener("authChange", checkAuth);

    return () => {
      window.removeEventListener("storage", checkAuth);
      window.removeEventListener("authChange", checkAuth);
    };
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* Auth Pages: If already logged in, redirect them away from login back to Home */}
        <Route path="/login" element={isAuthenticated ? <Navigate to="/" /> : <Login />} />
        <Route path="/signup" element={isAuthenticated ? <Navigate to="/" /> : <Signup />} />

        {/* Protected Routes */}
        <Route 
          path="/" 
          element={isAuthenticated ? <Home /> : <Navigate to="/login" />} 
          />
        <Route 
          path="/history" 
          element={isAuthenticated ? <WatchHistory /> : <Navigate to="/login" />} 
          />
        <Route 
          path="/movie/:id" 
          element={isAuthenticated ? <MovieDetails /> : <Navigate to="/login" />} 
          />

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;