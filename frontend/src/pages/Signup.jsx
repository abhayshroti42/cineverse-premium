import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../services/api";

function Signup() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    
    if (!username || !email || !password) {
      alert("Please fill out all fields");
      return;
    }

    try {
      // Sends data to your backend registration endpoint
      await API.post("/register", {
        username,
        email,
        password
      });

      alert("Account created successfully! Please log in.");
      navigate("/login"); // Take them back to login page
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.detail || "Registration failed. Try a different email or username.");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Create New Account</h1>
      <form onSubmit={handleSignup}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <br /><br />
        <input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <br /><br />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <br /><br />
        <button type="submit">Sign Up</button>
      </form>

      <p style={{ marginTop: "15px" }}>
        Already have an account? <Link to="/login">Log in here</Link>
      </p>
    </div>
  );
}

export default Signup;