// src/Components/Navbar/Navbar.js
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./Navbar.css";

function Navbar() {
  const { user, logout, isAuthenticated, isAdmin, isCustomer } = useAuth();
  const [cartCount, setCartCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (showDropdown && !event.target.closest(".dropdown")) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [showDropdown]);

  const handleLogout = () => {
    logout();
    setShowDropdown(false);
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-4">
      <Link className="navbar-brand" to="/">
        <i className="fas fa-store"></i> InventoryApp
      </Link>

      <button
        className="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarNav"
      >
        <span className="navbar-toggler-icon"></span>
      </button>

      <div className="collapse navbar-collapse" id="navbarNav">
        <ul className="navbar-nav me-auto">
          <li className="nav-item">
            <Link className="nav-link" to="/">
              <i className="fas fa-home"></i> Home
            </Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" to="/shop">
              <i className="fas fa-shopping-bag"></i> Shop
            </Link>
          </li>
          {isAdmin() && (
            <>
              <li className="nav-item">
                <Link className="nav-link" to="/AddItem">
                  <i className="fas fa-plus"></i> Add Item
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/admin/inventory">
                  <i className="fas fa-list"></i> Manage Inventory
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/admin/dashboard">
                  <i className="fas fa-tachometer-alt"></i> Dashboard
                </Link>
              </li>
            </>
          )}
          {isCustomer() && (
            <li className="nav-item">
              <Link className="nav-link" to="/cart">
                <i className="fas fa-shopping-cart"></i> My Cart
              </Link>
            </li>
          )}
        </ul>

        <ul className="navbar-nav ms-auto">
          {!isAuthenticated() ? (
            <>
              <li className="nav-item">
                <Link className="nav-link" to="/login">
                  <i className="fas fa-sign-in-alt"></i> Login
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/register">
                  <i className="fas fa-user-plus"></i> Register
                </Link>
              </li>
            </>
          ) : (
            <>
              <li className="nav-item">
                <Link className="nav-link" to="/cart">
                  <i className="fas fa-shopping-cart"></i> Cart
                  {cartCount > 0 && (
                    <span className="cart-badge">{cartCount}</span>
                  )}
                </Link>
              </li>
              <li className="nav-item">
                <button className="nav-link logout-btn" onClick={handleLogout}>
                  <i className="fas fa-sign-out-alt"></i> Logout
                </button>
              </li>
              <li className="nav-item dropdown">
                <button
                  className="nav-link dropdown-toggle"
                  onClick={toggleDropdown}
                  type="button"
                >
                  <i className="fas fa-user"></i> {user.firstName}
                </button>
                <ul className={`dropdown-menu ${showDropdown ? "show" : ""}`}>
                  <li>
                    <Link
                      className="dropdown-item"
                      to="/profile"
                      onClick={() => setShowDropdown(false)}
                    >
                      <i className="fas fa-user-circle"></i> Profile
                    </Link>
                  </li>
                  <li>
                    <Link
                      className="dropdown-item"
                      to="/orders"
                      onClick={() => setShowDropdown(false)}
                    >
                      <i className="fas fa-shopping-bag"></i> My Orders
                    </Link>
                  </li>
                  <li>
                    <hr className="dropdown-divider" />
                  </li>
                  <li>
                    <button className="dropdown-item" onClick={handleLogout}>
                      <i className="fas fa-sign-out-alt"></i> Logout
                    </button>
                  </li>
                </ul>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;
