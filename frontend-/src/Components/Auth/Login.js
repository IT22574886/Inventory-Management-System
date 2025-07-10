import React, { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import "./Auth.css";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  
  // Get the page user was trying to access
  const from = location.state?.from?.pathname || '/';
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await axios.post(
        "http://localhost:8080/api/auth/login",
        formData
      );

      if (response.data.user) {
        // Use AuthContext to login
        login(response.data.user);

        // Redirect based on role or to the page they were trying to access
        if (response.data.user.role === "ADMIN") {
          navigate("/admin/dashboard");
        } else {
          navigate(from);
        }
      }
    } catch (error) {
      setError(
        error.response?.data?.error || "Login failed. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="background-art"></div>
      <div className="content-wrapper">
        <div className="auth-card">
          <div className="auth-header">
            <h1 className="auth-title">
              <i className="fas fa-sign-in-alt"></i> Welcome Back
            </h1>
            <p className="auth-subtitle">
              Sign in to your account to continue shopping
            </p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            {error && (
              <div className="error-message">
                <i className="fas fa-exclamation-circle"></i>
                {error}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="email" className="form-label">
                <i className="fas fa-envelope"></i> Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                className="form-control"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">
                <i className="fas fa-lock"></i> Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                className="form-control"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter your password"
                required
              />
            </div>

            <button
              type="submit"
              className="auth-btn primary-btn"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="spinner-small"></div>
                  Signing In...
                </>
              ) : (
                <>
                  <i className="fas fa-sign-in-alt"></i>
                  Sign In
                </>
              )}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              Don't have an account?
              <Link to="/register" className="auth-link">
                Sign up here
              </Link>
            </p>
            <Link to="/shop" className="guest-link">
              <i className="fas fa-shopping-bag"></i>
              Continue as Guest
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
