import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import "./OrderManagement.css";

const OrderManagement = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);

  const API_BASE_URL = "http://localhost:8080/api";

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/orders/user/${user.id}`);
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
        fetchOrders(); // Refresh orders
        setShowOrderDetails(false);
        setSelectedOrder(null);
      } else {
        setError("Failed to update order status");
      }
    } catch (err) {
      setError("Error updating order: " + err.message);
    }
  };

  const cancelOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}/cancel`, {
        method: "PUT",
      });

      if (response.ok) {
        fetchOrders(); // Refresh orders
        setShowOrderDetails(false);
        setSelectedOrder(null);
      } else {
        const errorData = await response.text();
        setError("Failed to cancel order: " + errorData);
      }
    } catch (err) {
      setError("Error cancelling order: " + err.message);
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

  if (loading) {
    return <div className="order-management-loading">Loading orders...</div>;
  }

  return (
    <div className="order-management">
      <div className="order-management-header">
        <h2>Order Management</h2>
        <p>Manage your orders and track their status</p>
      </div>

      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError("")}>×</button>
        </div>
      )}

      {/* Orders List */}
      <div className="orders-section">
        <h3>Your Orders</h3>
        {orders.length === 0 ? (
          <div className="no-orders">
            <p>No orders found. Start shopping to see your orders here!</p>
          </div>
        ) : (
          <div className="orders-grid">
            {orders.map((order) => (
              <div key={order.id} className="order-card">
                <div className="order-header">
                  <h4>Order #{order.id}</h4>
                  <span
                    className="order-status"
                    style={{ backgroundColor: getStatusColor(order.status) }}
                  >
                    {order.status}
                  </span>
                </div>

                <div className="order-details">
                  <p>
                    <strong>Date:</strong> {formatDate(order.orderDate)}
                  </p>
                  <p>
                    <strong>Total:</strong> {formatPrice(order.totalAmount)}
                  </p>
                  {order.trackingNumber && (
                    <p>
                      <strong>Tracking:</strong> {order.trackingNumber}
                    </p>
                  )}
                </div>

                <div className="order-actions">
                  <button
                    className="btn-view"
                    onClick={() => {
                      setSelectedOrder(order);
                      setShowOrderDetails(true);
                    }}
                  >
                    View Details
                  </button>

                  {order.status === "PENDING" && (
                    <button
                      className="btn-cancel"
                      onClick={() => cancelOrder(order.id)}
                    >
                      Cancel Order
                    </button>
                  )}
                </div>
              </div>
            ))}
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
                <p>
                  <strong>Order Date:</strong>{" "}
                  {formatDate(selectedOrder.orderDate)}
                </p>
                <p>
                  <strong>Status:</strong>
                  <span
                    className="status-badge"
                    style={{
                      backgroundColor: getStatusColor(selectedOrder.status),
                    }}
                  >
                    {selectedOrder.status}
                  </span>
                </p>
                <p>
                  <strong>Total Amount:</strong>{" "}
                  {formatPrice(selectedOrder.totalAmount)}
                </p>
                {selectedOrder.shippingAddress && (
                  <p>
                    <strong>Shipping Address:</strong>{" "}
                    {selectedOrder.shippingAddress}
                  </p>
                )}
                {selectedOrder.paymentMethod && (
                  <p>
                    <strong>Payment Method:</strong>{" "}
                    {selectedOrder.paymentMethod}
                  </p>
                )}
                {selectedOrder.trackingNumber && (
                  <p>
                    <strong>Tracking Number:</strong>{" "}
                    {selectedOrder.trackingNumber}
                  </p>
                )}
                {selectedOrder.notes && (
                  <p>
                    <strong>Notes:</strong> {selectedOrder.notes}
                  </p>
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
              {user && user.role === "ADMIN" && (
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
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderManagement;
