import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../services/api";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate(); // Ensures the router navigation tool is ready

  const handleLogin = async (e) => {
    if (e) e.preventDefault(); // Prevents page from doing an old-school refresh reload
    
    try {
      const res = await API.post("/login", { 
        email: email.trim(), 
        password: password 
      });
      
      const idToStore = res.data.id || res.data.user_id;
      localStorage.setItem("userId", idToStore);

      // 1. Alert the user FIRST
      alert("Login Successful");

      // 2. Tell App.jsx to update its authentication permissions state
      window.dispatchEvent(new Event("authChange"));
      
      // 3. Move the user straight into the dashboard view
      navigate("/");
      
    } catch (err) {
      console.error(err);
      alert("Invalid credentials. Please verify your email and password.");
    }
  };

  return (
    <div style={{ 
      display: "flex", 
      flexDirection: "column", 
      alignItems: "center", 
      justifyContent: "center", 
      minHeight: "100vh", 
      backgroundColor: "#141414", 
      color: "white" 
    }}>
      <div style={{ backgroundColor: "#222", padding: "40px", borderRadius: "8px", width: "350px" }}>
        <h1 style={{ marginBottom: "20px", textAlign: "center" }}>Login</h1>
        
        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ padding: "10px", borderRadius: "4px", border: "1px solid #444", backgroundColor: "#333", color: "white" }}
          />
          
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ padding: "10px", borderRadius: "4px", border: "1px solid #444", backgroundColor: "#333", color: "white" }}
          />
          
          <button 
            type="submit" 
            style={{ padding: "12px", backgroundColor: "#E50914", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold", marginTop: "10px" }}
          >
            Login
          </button>
        </form>
        
        <p style={{ marginTop: "20px", textAlign: "center", fontSize: "14px", color: "#aaa" }}>
          Don't have an account? <Link to="/signup" style={{ color: "#E50914", textDecoration: "none" }}>Sign up now</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;