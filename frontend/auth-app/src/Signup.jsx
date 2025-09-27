import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import api from "./api";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem("token");
      try {
        const response = await fetch(
          `https://lyceumapi.turingon.tech/auth/verify_token/${token}`,
        );
        console.log(response.ok);
        if (response.ok) {
          navigate("/settings");
        }
        if (!response.ok) {
          throw new Error("Token verification failed");
        }
      } catch (error) { }
    };
    verifyToken();
  }, [navigate]);

  const validateForm = () => {
    if (!username || !password) {
      setError("Username and password are required");
      return false;
    }
    setError("");
    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateForm()) return;
    setLoading(true);

    const formDetails = new URLSearchParams();
    formDetails.append("username", username);
    formDetails.append("password", password);

    try {
      const response = await fetch("https://lyceumapi.turingon.tech/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: username, // or whatever your variable is
          hashed_password: password,
        }),
      });

      setLoading(false);
      console.log("test" + response.ok);
      if (response.ok) {
        const data = await response.json();
        console.log(data)
        localStorage.setItem("token", data.access_token);
        navigate("/settings");
      } else {
        const errorData = await response.json();
        setError(errorData.detail || "Authentication failed!");
      }
    } catch (error) {
      setLoading(false);
      setError("An error occurred. Please try again later." + error);
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Username:</label>
          <input
            className="form-input"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Password:</label>
          <input
            className="form-input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button className="login-button" type="submit" disabled={loading}>
          {loading ? "Sign Upping..." : "Sign Up"}
        </button>
        {error && <p className="error-text">{error}</p>}
      </form>
    </div>
  );
}

export default Login;
