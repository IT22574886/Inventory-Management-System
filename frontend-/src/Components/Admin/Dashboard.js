import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "./Admin.css";

function Dashboard() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalRevenue: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user || user.role !== "ADMIN") {
        setError("Access denied. Admin privileges required.");
        setLoading(false);
        return;
      }

      // Load dashboard statistics
      const statsResponse = await axios.get(
        "http://localhost:8080/api/admin/dashboard/stats"
      );
      setStats(statsResponse.data);

      // Load recent orders
      const ordersResponse = await axios.get(
        "http://localhost:8080/api/admin/orders/recent"
      );
      setRecentOrders(ordersResponse.data);

      // Load low stock products
      const lowStockResponse = await axios.get(
        "http://localhost:8080/api/admin/products/low-stock"
      );
      setLowStockProducts(lowStockResponse.data);
    } catch (error) {
      setError("Failed to load dashboard data. Please try again.");
      console.error("Error loading dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      PENDING: { class: "status-pending", icon: "clock" },
      PROCESSING: { class: "status-processing", icon: "cog" },
      SHIPPED: { class: "status-shipped", icon: "truck" },
      DELIVERED: { class: "status-delivered", icon: "check-circle" },
      CANCELLED: { class: "status-cancelled", icon: "times-circle" },
    };

    const config = statusConfig[status] || {
      class: "status-pending",
      icon: "question",
    };

    return (
      <span className={`status-badge ${config.class}`}>
        <i className={`fas fa-${config.icon}`}></i>
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="admin-container">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-container">
        <div className="error-container">
          <i className="fas fa-exclamation-triangle"></i>
          <h3>Access Denied</h3>
          <p>{error}</p>
          <Link to="/login" className="btn btn-primary">
            <i className="fas fa-sign-in-alt"></i> Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <div className="background-art"></div>
      <div className="content-wrapper">
        {/* Header */}
        <div className="dashboard-header">
          <h1 className="dashboard-title">
            <i className="fas fa-tachometer-alt"></i> Admin Dashboard
          </h1>
          <p className="dashboard-subtitle">
            Welcome back! Here's what's happening with your store.
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon products">
              <i className="fas fa-box"></i>
            </div>
            <div className="stat-content">
              <h3 className="stat-number">{stats.totalProducts}</h3>
              <p className="stat-label">Total Products</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon orders">
              <i className="fas fa-shopping-bag"></i>
            </div>
            <div className="stat-content">
              <h3 className="stat-number">{stats.totalOrders}</h3>
              <p className="stat-label">Total Orders</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon users">
              <i className="fas fa-users"></i>
            </div>
            <div className="stat-content">
              <h3 className="stat-number">{stats.totalUsers}</h3>
              <p className="stat-label">Total Users</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon revenue">
              <i className="fas fa-dollar-sign"></i>
            </div>
            <div className="stat-content">
              <h3 className="stat-number">${stats.totalRevenue.toFixed(2)}</h3>
              <p className="stat-label">Total Revenue</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions">
          <h2 className="section-title">
            <i className="fas fa-bolt"></i> Quick Actions
          </h2>
          <div className="actions-grid">
            <Link to="/admin/products/add" className="action-card">
              <i className="fas fa-plus"></i>
              <h3>Add Product</h3>
              <p>Create a new product listing</p>
            </Link>

            <Link to="/admin/products" className="action-card">
              <i className="fas fa-box"></i>
              <h3>Manage Products</h3>
              <p>View and edit all products</p>
            </Link>

            <Link to="/admin/orders" className="action-card">
              <i className="fas fa-shopping-bag"></i>
              <h3>View Orders</h3>
              <p>Process and track orders</p>
            </Link>

            <Link to="/admin/users" className="action-card">
              <i className="fas fa-users"></i>
              <h3>Manage Users</h3>
              <p>View and manage user accounts</p>
            </Link>
          </div>
        </div>

        {/* Recent Orders and Low Stock */}
        <div className="dashboard-content">
          <div className="content-grid">
            {/* Recent Orders */}
            <div className="content-card">
              <div className="card-header">
                <h3 className="card-title">
                  <i className="fas fa-clock"></i> Recent Orders
                </h3>
                <Link to="/admin/orders" className="view-all-link">
                  View All <i className="fas fa-arrow-right"></i>
                </Link>
              </div>

              <div className="orders-list">
                {recentOrders.length === 0 ? (
                  <div className="empty-state">
                    <i className="fas fa-shopping-bag"></i>
                    <p>No recent orders</p>
                  </div>
                ) : (
                  recentOrders.map((order) => (
                    <div key={order.id} className="order-item">
                      <div className="order-info">
                        <h4 className="order-id">Order #{order.id}</h4>
                        <p className="order-customer">
                          {order.user.firstName} {order.user.lastName}
                        </p>
                        <p className="order-date">
                          {new Date(order.orderDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="order-details">
                        <div className="order-amount">
                          ${order.totalAmount.toFixed(2)}
                        </div>
                        {getStatusBadge(order.status)}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Low Stock Products */}
            <div className="content-card">
              <div className="card-header">
                <h3 className="card-title">
                  <i className="fas fa-exclamation-triangle"></i> Low Stock
                  Alert
                </h3>
                <Link to="/admin/products" className="view-all-link">
                  View All <i className="fas fa-arrow-right"></i>
                </Link>
              </div>

              <div className="low-stock-list">
                {lowStockProducts.length === 0 ? (
                  <div className="empty-state">
                    <i className="fas fa-check-circle"></i>
                    <p>All products are well stocked</p>
                  </div>
                ) : (
                  lowStockProducts.map((product) => (
                    <div key={product.id} className="stock-item">
                      <div className="product-image">
                        <img
                          src={`http://localhost:8080/demo/uploads/${product.itemImage}`}
                          alt={product.itemName}
                          className="product-img"
                        />
                      </div>
                      <div className="product-info">
                        <h4 className="product-name">{product.itemName}</h4>
                        <p className="product-category">
                          {product.itemCategory}
                        </p>
                        <div className="stock-status">
                          <span className="stock-count">
                            {product.itemQuantity} left
                          </span>
                          <span className="stock-badge low">Low Stock</span>
                        </div>
                      </div>
                      <Link
                        to={`/admin/products/edit/${product.id}`}
                        className="restock-btn"
                      >
                        <i className="fas fa-plus"></i> Restock
                      </Link>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
