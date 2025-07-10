import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import "./ProductList.css";

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:8080/inventory");
      setProducts(response.data);
    } catch (error) {
      console.error("Error loading products:", error);
      setError("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product) => {
    if (!isAuthenticated()) {
      alert("Please log in to add items to cart");
      navigate("/login");
      return;
    }

    // Get existing cart from localStorage
    const existingCart = JSON.parse(localStorage.getItem("cart") || "[]");

    // Check if product already in cart
    const existingItem = existingCart.find((item) => item.id === product.id);

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      existingCart.push({
        id: product.id,
        itemId: product.itemId,
        itemName: product.itemName,
        itemImage: product.itemImage,
        itemCategory: product.itemCategory,
        itemQuantity: product.itemQuantity,
        itemDetails: product.itemDetails,
        price: product.sellingPrice || product.price || 0, // Use selling price, fallback to old price field
        quantity: 1,
      });
    }

    localStorage.setItem("cart", JSON.stringify(existingCart));
    alert(`${product.itemName} added to cart!`);
  };

  const addToWishlist = (product) => {
    if (!isAuthenticated()) {
      alert("Please log in to add items to wishlist");
      navigate("/login");
      return;
    }

    // Get existing wishlist from localStorage
    const existingWishlist = JSON.parse(
      localStorage.getItem("wishlist") || "[]"
    );

    // Check if product already in wishlist
    const existingItem = existingWishlist.find(
      (item) => item.id === product.id
    );

    if (existingItem) {
      alert(`${product.itemName} is already in your wishlist!`);
      return;
    }

    existingWishlist.push({
      id: product.id,
      itemId: product.itemId,
      itemName: product.itemName,
      itemImage: product.itemImage,
      itemCategory: product.itemCategory,
      itemQuantity: product.itemQuantity,
      itemDetails: product.itemDetails,
    });

    localStorage.setItem("wishlist", JSON.stringify(existingWishlist));
    alert(`${product.itemName} added to wishlist!`);
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.itemId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.itemDetails.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "" || product.itemCategory === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = [
    ...new Set(products.map((product) => product.itemCategory)),
  ];

  if (loading) {
    return (
      <div className="shop-container">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="shop-container">
        <div className="error-container">
          <i className="fas fa-exclamation-triangle"></i>
          <h3>Error Loading Products</h3>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={loadProducts}>
            <i className="fas fa-redo"></i> Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="shop-container">
      <div className="background-art"></div>
      <div className="content-wrapper">
        {/* Header Section */}
        <div className="shop-header">
          <h1 className="shop-title">
            <i className="fas fa-shopping-bag"></i> Our Products
          </h1>
          <p className="shop-subtitle">Browse our complete inventory</p>
        </div>

        {/* Filters Section */}
        <div className="filters-section">
          <div className="search-container">
            <div className="input-group">
              <span className="input-group-text">
                <i className="fas fa-search"></i>
              </span>
              <input
                type="text"
                className="form-control search-input"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="filter-controls">
            <div className="filter-group">
              <label htmlFor="category" className="filter-label">
                <i className="fas fa-filter"></i> Category
              </label>
              <select
                id="category"
                className="form-control filter-select"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {isAuthenticated() && (
              <button
                className="btn btn-primary cart-btn"
                onClick={() => navigate("/cart")}
              >
                <i className="fas fa-shopping-cart"></i> View Cart
              </button>
            )}
          </div>
        </div>

        {/* Products Grid */}
        <div className="products-section">
          {filteredProducts.length === 0 ? (
            <div className="no-products">
              <i className="fas fa-search"></i>
              <h3>No products found</h3>
              <p>Try adjusting your search or filter criteria</p>
            </div>
          ) : (
            <div className="products-grid">
              {filteredProducts.map((product) => (
                <div key={product.id} className="product-card">
                  <div className="product-image">
                    <img
                      src={`http://localhost:8080/demo/uploads/${product.itemImage}`}
                      alt={product.itemName}
                      className="product-img"
                    />
                    <div className="product-overlay">
                      <div className="overlay-content">
                        <button
                          className="btn btn-light quick-view-btn"
                          onClick={() => {
                            // Quick view functionality can be added here
                            alert(`Quick view: ${product.itemName}`);
                          }}
                        >
                          <i className="fas fa-eye"></i>
                          Quick View
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="product-info">
                    <div className="product-header">
                      <h3 className="product-name">{product.itemName}</h3>
                    </div>

                    <div className="product-category">
                      <span className="category-badge">
                        {product.itemCategory}
                      </span>
                    </div>

                    <div className="product-stock">
                      <span
                        className={`stock-badge ${
                          parseInt(product.itemQuantity) > 10
                            ? "in-stock"
                            : parseInt(product.itemQuantity) > 0
                            ? "low-stock"
                            : "out-of-stock"
                        }`}
                      >
                        {parseInt(product.itemQuantity) > 10
                          ? "In Stock"
                          : parseInt(product.itemQuantity) > 0
                          ? "Low Stock"
                          : "Out of Stock"}
                      </span>
                      <span className="quantity-text">
                        ({product.itemQuantity} available)
                      </span>
                    </div>

                    <div className="product-price">
                      <span className="price-amount">
                        $
                        {(product.sellingPrice || product.price || 0).toFixed(
                          2
                        )}
                      </span>
                    </div>

                    <p className="product-description">
                      {product.itemDetails.length > 100
                        ? `${product.itemDetails.substring(0, 100)}...`
                        : product.itemDetails}
                    </p>

                    {/* Action Buttons */}
                    <div className="product-actions">
                      {isAuthenticated() ? (
                        <div className="action-buttons">
                          <div className="button-left">
                            <button
                              className="btn btn-primary add-to-cart-btn"
                              onClick={() => addToCart(product)}
                            >
                              <i className="fas fa-cart-plus"></i>
                              Add to Cart
                            </button>
                          </div>
                          <div className="button-right">
                            <button
                              className="btn btn-outline-primary wishlist-btn"
                              onClick={() => addToWishlist(product)}
                            >
                              <i className="fas fa-heart"></i>
                              Wishlist
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="guest-actions">
                          <button
                            className="btn btn-primary login-to-add-btn"
                            onClick={() => navigate("/login")}
                          >
                            <i className="fas fa-sign-in-alt"></i>
                            Login to Add
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Results Summary */}
        <div className="results-summary">
          <p>
            Showing {filteredProducts.length} of {products.length} products
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProductList;
