import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Shop.css";

function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = () => {
    try {
      setLoading(true);
      if (!isAuthenticated()) {
        setError("Please login to view your cart");
        setLoading(false);
        return;
      }

      // Load cart from localStorage
      const cartData = JSON.parse(localStorage.getItem("cart") || "[]");
      setCartItems(cartData);
    } catch (error) {
      setError("Failed to load cart. Please try again.");
      console.error("Error loading cart:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = (itemId, newQuantity) => {
    try {
      if (!isAuthenticated()) return;

      const updatedCart = cartItems.map((item) =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      );

      setCartItems(updatedCart);
      localStorage.setItem("cart", JSON.stringify(updatedCart));
    } catch (error) {
      console.error("Error updating quantity:", error);
    }
  };

  const removeItem = (itemId) => {
    try {
      if (!isAuthenticated()) return;

      const updatedCart = cartItems.filter((item) => item.id !== itemId);
      setCartItems(updatedCart);
      localStorage.setItem("cart", JSON.stringify(updatedCart));
    } catch (error) {
      console.error("Error removing item:", error);
    }
  };

  const clearCart = () => {
    try {
      if (!isAuthenticated()) return;

      setCartItems([]);
      localStorage.removeItem("cart");
    } catch (error) {
      console.error("Error clearing cart:", error);
    }
  };

  const checkout = () => {
    try {
      if (!isAuthenticated()) {
        setError("Please login to checkout");
        return;
      }

      // For now, just clear the cart and show success message
      // In a real application, you would send the order to the backend
      setCartItems([]);
      localStorage.removeItem("cart");
      alert("Order placed successfully! Thank you for your purchase.");
    } catch (error) {
      setError("Failed to place order. Please try again.");
      console.error("Error placing order:", error);
    }
  };

  // Calculate totals using selling price
  const subtotal = cartItems.reduce(
    (sum, item) => sum + (item.price || 0) * item.quantity,
    0
  );
  const tax = subtotal * 0.1; // 10% tax
  const shipping = subtotal > 50 ? 0 : 5.99; // Free shipping over $50
  const total = subtotal + tax + shipping;

  if (loading) {
    return (
      <div className="shop-container">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading your cart...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="shop-container">
        <div className="error-container">
          <i className="fas fa-exclamation-triangle"></i>
          <h3>Error Loading Cart</h3>
          <p>{error}</p>
          <Link to="/login" className="btn btn-primary">
            <i className="fas fa-sign-in-alt"></i> Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="shop-container">
      <div className="background-art"></div>
      <div className="content-wrapper">
        <div className="cart-container">
          {/* Header */}
          <div className="cart-header">
            <h1 className="cart-title">
              <i className="fas fa-shopping-cart"></i> Shopping Cart
            </h1>
            <p className="cart-subtitle">
              {cartItems.length} item{cartItems.length !== 1 ? "s" : ""} in your
              cart
            </p>
          </div>

          {cartItems.length === 0 ? (
            <div className="empty-cart">
              <i className="fas fa-shopping-bag"></i>
              <h3>Your cart is empty</h3>
              <p>Start shopping to add items to your cart</p>
              <Link to="/shop" className="btn btn-primary">
                <i className="fas fa-shopping-bag"></i> Continue Shopping
              </Link>
            </div>
          ) : (
            <div className="cart-content">
              {/* Cart Items */}
              <div className="cart-items">
                {cartItems.map((item) => (
                  <div key={item.id} className="cart-item">
                    <div className="item-image">
                      <img
                        src={`http://localhost:8080/demo/uploads/${item.itemImage}`}
                        alt={item.itemName}
                        className="item-img"
                      />
                    </div>

                    <div className="item-details">
                      <h3 className="item-name">{item.itemName}</h3>
                      <p className="item-category">{item.itemCategory}</p>
                      <div className="item-price">
                        ${(item.price || 0).toFixed(2)}
                      </div>
                    </div>

                    <div className="item-quantity">
                      <label
                        htmlFor={`quantity-${item.id}`}
                        className="quantity-label"
                      >
                        Quantity
                      </label>
                      <div className="quantity-controls">
                        <button
                          className="quantity-btn"
                          onClick={() =>
                            updateQuantity(
                              item.id,
                              Math.max(1, item.quantity - 1)
                            )
                          }
                          disabled={item.quantity <= 1}
                        >
                          <i className="fas fa-minus"></i>
                        </button>
                        <input
                          type="number"
                          id={`quantity-${item.id}`}
                          className="quantity-input"
                          value={item.quantity}
                          onChange={(e) =>
                            updateQuantity(
                              item.id,
                              parseInt(e.target.value) || 1
                            )
                          }
                          min="1"
                          max={item.itemQuantity}
                        />
                        <button
                          className="quantity-btn"
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                          disabled={item.quantity >= item.itemQuantity}
                        >
                          <i className="fas fa-plus"></i>
                        </button>
                      </div>
                    </div>

                    <div className="item-total">
                      <div className="total-amount">
                        ${((item.price || 0) * item.quantity).toFixed(2)}
                      </div>
                    </div>

                    <div className="item-actions">
                      <button
                        className="remove-btn"
                        onClick={() => removeItem(item.id)}
                        title="Remove item"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Cart Summary */}
              <div className="cart-summary">
                <h3 className="summary-title">
                  <i className="fas fa-receipt"></i> Order Summary
                </h3>

                <div className="summary-items">
                  <div className="summary-item">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="summary-item">
                    <span>Tax (10%)</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  <div className="summary-item">
                    <span>Shipping</span>
                    <span>
                      {shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="summary-item total">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>

                {shipping > 0 && (
                  <div className="free-shipping-notice">
                    <i className="fas fa-truck"></i>
                    Add ${(50 - subtotal).toFixed(2)} more for free shipping!
                  </div>
                )}

                <div className="cart-actions">
                  <button className="btn btn-secondary" onClick={clearCart}>
                    <i className="fas fa-trash"></i> Clear Cart
                  </button>
                  <Link to="/shop" className="btn btn-outline">
                    <i className="fas fa-arrow-left"></i> Continue Shopping
                  </Link>
                  <button
                    className="btn btn-primary checkout-btn"
                    onClick={checkout}
                  >
                    <i className="fas fa-credit-card"></i> Proceed to Checkout
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Cart;
