import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import "./AdminOrderManagement.css";

const AdminOrderManagement = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [statistics, setStatistics] = useState(null);
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  const API_BASE_URL = "http://localhost:8080/api";

  useEffect(() => {
    if (user && user.role === "ADMIN") {
      fetchAllOrders();
      fetchStatistics();
    }
  }, [user, filterStatus]);

  const fetchAllOrders = async () => {
    setLoading(true);
    try {
      let url = `${API_BASE_URL}/orders/all`;
      if (filterStatus !== "ALL") {
        url = `${API_BASE_URL}/orders/status/${filterStatus}`;
      }

      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      } else {
        setError("Failed to fetch orders");
      }
    } catch (err) {
      setError("Error fetching orders: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/orders/statistics`);
      if (response.ok) {
        const data = await response.json();
        setStatistics(data);
      }
    } catch (err) {
      console.error("Error fetching statistics:", err);
    }
  };

  const updateOrderStatus = async (
    orderId,
    newStatus,
    trackingNumber = null
  ) => {
    try {
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: newStatus,
          trackingNumber: trackingNumber,
        }),
      });

      if (response.ok) {
        fetchAllOrders(); // Refresh orders
        fetchStatistics(); // Refresh statistics
        setShowOrderDetails(false);
        setSelectedOrder(null);
      } else {
        setError("Failed to update order status");
      }
    } catch (err) {
      setError("Error updating order: " + err.message);
    }
  };

  const deleteOrder = async (orderId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this order? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchAllOrders();
        fetchStatistics();
      } else {
        setError("Failed to delete order");
      }
    } catch (err) {
      setError("Error deleting order: " + err.message);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "PENDING":
        return "#ff9800";
      case "CONFIRMED":
        return "#2196f3";
      case "SHIPPED":
        return "#9c27b0";
      case "DELIVERED":
        return "#4caf50";
      case "CANCELLED":
        return "#f44336";
      default:
        return "#757575";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatPrice = (price) => {
    return `$${parseFloat(price).toFixed(2)}`;
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toString().includes(searchTerm) ||
      order.user?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user?.lastName?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  if (loading) {
    return <div className="admin-order-loading">Loading orders...</div>;
  }

  return (
    <div className="admin-order-management">
      <div className="admin-header">
        <h2>Admin Order Management</h2>
        <p>Monitor and manage all customer orders</p>
      </div>

      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError("")}>×</button>
        </div>
      )}

      {/* Statistics Dashboard */}
      {statistics && (
        <div className="statistics-dashboard">
          <h3>Order Statistics</h3>
          <div className="stats-grid">
            <div className="stat-card">
              <span className="stat-number">{statistics.totalOrders}</span>
              <span className="stat-label">Total Orders</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">{statistics.pendingOrders}</span>
              <span className="stat-label">Pending</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">{statistics.confirmedOrders}</span>
              <span className="stat-label">Confirmed</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">{statistics.shippedOrders}</span>
              <span className="stat-label">Shipped</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">{statistics.deliveredOrders}</span>
              <span className="stat-label">Delivered</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">
                {formatPrice(statistics.totalRevenue)}
              </span>
              <span className="stat-label">Total Revenue</span>
            </div>
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="filters-section">
        <div className="filter-controls">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search by order ID or customer name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <div className="status-filter">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="filter-select"
            >
              <option value="ALL">All Orders</option>
              <option value="PENDING">Pending</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="SHIPPED">Shipped</option>
              <option value="DELIVERED">Delivered</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="orders-section">
        <h3>All Orders ({filteredOrders.length})</h3>
        {filteredOrders.length === 0 ? (
          <div className="no-orders">
            <p>No orders found matching your criteria.</p>
          </div>
        ) : (
          <div className="orders-table">
            <table>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Total</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order.id}>
                    <td>#{order.id}</td>
                    <td>
                      {order.user?.firstName} {order.user?.lastName}
                    </td>
                    <td>{formatDate(order.orderDate)}</td>
                    <td>
                      <span
                        className="status-badge"
                        style={{
                          backgroundColor: getStatusColor(order.status),
                        }}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td>{formatPrice(order.totalAmount)}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-view"
                          onClick={() => {
                            setSelectedOrder(order);
                            setShowOrderDetails(true);
                          }}
                        >
                          View
                        </button>
                        <button
                          className="btn-delete"
                          onClick={() => deleteOrder(order.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {showOrderDetails && selectedOrder && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Order Details #{selectedOrder.id}</h3>
              <button
                className="close-btn"
                onClick={() => {
                  setShowOrderDetails(false);
                  setSelectedOrder(null);
                }}
              >
                ×
              </button>
            </div>

            <div className="order-details-modal">
              <div className="order-info">
                <div className="info-row">
                  <span>
                    <strong>Customer:</strong>
                  </span>
                  <span>
                    {selectedOrder.user?.firstName}{" "}
                    {selectedOrder.user?.lastName}
                  </span>
                </div>
                <div className="info-row">
                  <span>
                    <strong>Email:</strong>
                  </span>
                  <span>{selectedOrder.user?.email}</span>
                </div>
                <div className="info-row">
                  <span>
                    <strong>Order Date:</strong>
                  </span>
                  <span>{formatDate(selectedOrder.orderDate)}</span>
                </div>
                <div className="info-row">
                  <span>
                    <strong>Status:</strong>
                  </span>
                  <span
                    className="status-badge"
                    style={{
                      backgroundColor: getStatusColor(selectedOrder.status),
                    }}
                  >
                    {selectedOrder.status}
                  </span>
                </div>
                <div className="info-row">
                  <span>
                    <strong>Total Amount:</strong>
                  </span>
                  <span>{formatPrice(selectedOrder.totalAmount)}</span>
                </div>
                {selectedOrder.shippingAddress && (
                  <div className="info-row">
                    <span>
                      <strong>Shipping Address:</strong>
                    </span>
                    <span>{selectedOrder.shippingAddress}</span>
                  </div>
                )}
                {selectedOrder.paymentMethod && (
                  <div className="info-row">
                    <span>
                      <strong>Payment Method:</strong>
                    </span>
                    <span>{selectedOrder.paymentMethod}</span>
                  </div>
                )}
                {selectedOrder.trackingNumber && (
                  <div className="info-row">
                    <span>
                      <strong>Tracking Number:</strong>
                    </span>
                    <span>{selectedOrder.trackingNumber}</span>
                  </div>
                )}
                {selectedOrder.notes && (
                  <div className="info-row">
                    <span>
                      <strong>Notes:</strong>
                    </span>
                    <span>{selectedOrder.notes}</span>
                  </div>
                )}
              </div>

              {selectedOrder.orderItems &&
                selectedOrder.orderItems.length > 0 && (
                  <div className="order-items">
                    <h4>Order Items</h4>
                    <div className="items-list">
                      {selectedOrder.orderItems.map((item, index) => (
                        <div key={index} className="order-item">
                          <div className="item-info">
                            <h5>{item.product.itemName}</h5>
                            <p>Quantity: {item.quantity}</p>
                            <p>Unit Price: {formatPrice(item.unitPrice)}</p>
                            <p>Total: {formatPrice(item.totalPrice)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* Admin Actions */}
              <div className="admin-actions">
                <h4>Admin Actions</h4>
                <div className="action-buttons">
                  {selectedOrder.status === "PENDING" && (
                    <button
                      className="btn-confirm"
                      onClick={() =>
                        updateOrderStatus(selectedOrder.id, "CONFIRMED")
                      }
                    >
                      Confirm Order
                    </button>
                  )}
                  {selectedOrder.status === "CONFIRMED" && (
                    <button
                      className="btn-ship"
                      onClick={() => {
                        const tracking = prompt("Enter tracking number:");
                        if (tracking) {
                          updateOrderStatus(
                            selectedOrder.id,
                            "SHIPPED",
                            tracking
                          );
                        }
                      }}
                    >
                      Mark as Shipped
                    </button>
                  )}
                  {selectedOrder.status === "SHIPPED" && (
                    <button
                      className="btn-deliver"
                      onClick={() =>
                        updateOrderStatus(selectedOrder.id, "DELIVERED")
                      }
                    >
                      Mark as Delivered
                    </button>
                  )}
                  {selectedOrder.status === "PENDING" && (
                    <button
                      className="btn-cancel"
                      onClick={() =>
                        updateOrderStatus(selectedOrder.id, "CANCELLED")
                      }
                    >
                      Cancel Order
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrderManagement;
