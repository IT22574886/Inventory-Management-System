import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({
  children,
  requireAuth = true,
  requireAdmin = false,
  requireCustomer = false,
}) => {
  const { isAuthenticated, isAdmin, isCustomer, loading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        }}
      >
        <div
          style={{
            background: "rgba(255, 255, 255, 0.95)",
            padding: "2rem",
            borderRadius: "20px",
            textAlign: "center",
            boxShadow: "0 15px 35px rgba(0, 0, 0, 0.1)",
          }}
        >
          <div
            style={{
              width: "50px",
              height: "50px",
              border: "4px solid #e1e8ed",
              borderTop: "4px solid #667eea",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              margin: "0 auto 1rem",
            }}
          ></div>
          <p style={{ margin: 0, color: "#2c3e50", fontWeight: "600" }}>
            Loading...
          </p>
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Check if authentication is required but user is not authenticated
  if (requireAuth && !isAuthenticated()) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if admin role is required but user is not admin
  if (requireAdmin && !isAdmin()) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        }}
      >
        <div
          style={{
            background: "rgba(255, 255, 255, 0.95)",
            padding: "2rem",
            borderRadius: "20px",
            textAlign: "center",
            boxShadow: "0 15px 35px rgba(0, 0, 0, 0.1)",
            maxWidth: "400px",
          }}
        >
          <div
            style={{ fontSize: "3rem", color: "#e74c3c", marginBottom: "1rem" }}
          >
            🚫
          </div>
          <h2 style={{ color: "#2c3e50", marginBottom: "1rem" }}>
            Access Denied
          </h2>
          <p style={{ color: "#636e72", marginBottom: "1.5rem" }}>
            You need administrator privileges to access this page.
          </p>
          <button
            onClick={() => window.history.back()}
            style={{
              background: "linear-gradient(135deg, #667eea, #764ba2)",
              color: "white",
              border: "none",
              padding: "0.75rem 1.5rem",
              borderRadius: "12px",
              cursor: "pointer",
              fontWeight: "600",
            }}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Check if customer role is required but user is not customer
  if (requireCustomer && !isCustomer()) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        }}
      >
        <div
          style={{
            background: "rgba(255, 255, 255, 0.95)",
            padding: "2rem",
            borderRadius: "20px",
            textAlign: "center",
            boxShadow: "0 15px 35px rgba(0, 0, 0, 0.1)",
            maxWidth: "400px",
          }}
        >
          <div
            style={{ fontSize: "3rem", color: "#e74c3c", marginBottom: "1rem" }}
          >
            🚫
          </div>
          <h2 style={{ color: "#2c3e50", marginBottom: "1rem" }}>
            Access Denied
          </h2>
          <p style={{ color: "#636e72", marginBottom: "1.5rem" }}>
            This page is only accessible to customers.
          </p>
          <button
            onClick={() => window.history.back()}
            style={{
              background: "linear-gradient(135deg, #667eea, #764ba2)",
              color: "white",
              border: "none",
              padding: "0.75rem 1.5rem",
              borderRadius: "12px",
              cursor: "pointer",
              fontWeight: "600",
            }}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // If all checks pass, render the protected content
  return children;
};

export default ProtectedRoute;
