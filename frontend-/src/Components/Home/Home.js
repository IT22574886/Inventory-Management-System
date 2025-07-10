import React from "react";
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

function Home() {
  const { isAuthenticated, isAdmin, isCustomer, user } = useAuth();

  return (
    <div className="container text-center mt-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card shadow-lg">
            <div className="card-body p-5">
              <h1 className="card-title mb-4">
                <i className="fas fa-store text-primary"></i> Welcome to
                InventoryApp
              </h1>

              {!isAuthenticated() ? (
                <div>
                  <p className="card-text mb-4">
                    Please log in to access the inventory management system or
                    continue as a guest to shop.
                  </p>
                  <div className="d-flex justify-content-center gap-3">
                    <Link to="/login" className="btn btn-primary btn-lg">
                      <i className="fas fa-sign-in-alt"></i> Login
                    </Link>
                    <Link
                      to="/register"
                      className="btn btn-outline-primary btn-lg"
                    >
                      <i className="fas fa-user-plus"></i> Register
                    </Link>
                    <Link to="/shop" className="btn btn-success btn-lg">
                      <i className="fas fa-shopping-bag"></i> Shop as Guest
                    </Link>
                  </div>
                </div>
              ) : isAdmin() ? (
                <div>
                  <p className="card-text mb-4">
                    Welcome back, <strong>{user?.firstName}</strong>! You have
                    administrator privileges.
                  </p>
                  <div className="d-flex justify-content-center gap-3 flex-wrap">
                    <Link to="/AddItem" className="btn btn-primary btn-lg">
                      <i className="fas fa-plus"></i> Add Item
                    </Link>
                    <Link
                      to="/admin/inventory"
                      className="btn btn-success btn-lg"
                    >
                      <i className="fas fa-list"></i> Manage Inventory
                    </Link>
                    <Link to="/admin/dashboard" className="btn btn-info btn-lg">
                      <i className="fas fa-tachometer-alt"></i> Dashboard
                    </Link>
                    <Link to="/shop" className="btn btn-warning btn-lg">
                      <i className="fas fa-shopping-bag"></i> View Shop
                    </Link>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="card-text mb-4">
                    Welcome back, <strong>{user?.firstName}</strong>! You can
                    shop and manage your cart.
                  </p>
                  <div className="d-flex justify-content-center gap-3">
                    <Link to="/shop" className="btn btn-primary btn-lg">
                      <i className="fas fa-shopping-bag"></i> Shop
                    </Link>
                    <Link to="/cart" className="btn btn-success btn-lg">
                      <i className="fas fa-shopping-cart"></i> My Cart
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
