import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./UpdateItem.css";

function UpdateItem() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    itemId: "",
    itemName: "",
    itemImage: null,
    itemCategory: "",
    itemQuantity: "",
    itemDetails: "",
    costPrice: "",
    sellingPrice: "",
  });
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [currentImage, setCurrentImage] = useState(null);

  useEffect(() => {
    const fetchItemData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `http://localhost:8080/inventory/${id}`
        );
        const itemData = response.data;

        setFormData({
          itemId: itemData.itemId || "",
          itemName: itemData.itemName || "",
          itemImage: null, // Reset to null for new file selection
          itemCategory: itemData.itemCategory || "",
          itemQuantity: itemData.itemQuantity || "",
          itemDetails: itemData.itemDetails || "",
          costPrice: itemData.costPrice || "",
          sellingPrice: itemData.sellingPrice || "",
        });

        // Set current image for display
        if (itemData.itemImage) {
          setCurrentImage(
            `http://localhost:8080/demo/uploads/${itemData.itemImage}`
          );
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to load item data");
      } finally {
        setLoading(false);
      }
    };

    fetchItemData();
  }, [id]);

  const onInputChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "itemImage" && files && files[0]) {
      const file = files[0];
      setFormData({
        ...formData,
        [name]: file,
      });

      // Create preview for new image
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const data = new FormData();

      // Create proper JSON payload
      const itemDetails = {
        itemId: formData.itemId,
        itemName: formData.itemName,
        itemCategory: formData.itemCategory,
        itemQuantity: formData.itemQuantity,
        itemDetails: formData.itemDetails,
        costPrice: formData.costPrice,
        sellingPrice: formData.sellingPrice,
      };

      data.append("itemDetails", JSON.stringify(itemDetails));

      if (formData.itemImage instanceof File) {
        data.append("file", formData.itemImage);
      }

      const response = await axios.put(
        `http://localhost:8080/inventory/${id}`,
        data,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            "User-Data": JSON.stringify(user),
          },
        }
      );
      alert("Item updated successfully!");
      navigate("/AllItem");
    } catch (error) {
      console.error(
        "Error updating item:",
        error.response?.data || error.message
      );
      if (error.response?.status === 403) {
        alert("Access denied. Admin privileges required.");
      } else {
        alert(
          `Error updating item: ${
            error.response?.data?.message || error.message
          }`
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading item data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <i className="fas fa-exclamation-triangle"></i>
        <h3>Error Loading Item</h3>
        <p>{error}</p>
        <button
          className="btn btn-primary"
          onClick={() => navigate("/AllItem")}
        >
          <i className="fas fa-arrow-left"></i> Back to Inventory
        </button>
      </div>
    );
  }

  return (
    <div className="update-item-container">
      <div className="background-art"></div>
      <div className="content-wrapper">
        <div className="form-container">
          <div className="form-header">
            <h1 className="form-title">
              <i className="fas fa-edit"></i> Update Item
            </h1>
            <p className="form-subtitle">
              Modify the details of your inventory item
            </p>
            <div className="item-id-display">
              <span className="id-badge">ID: {formData.itemId}</span>
            </div>
          </div>

          <form className="update-item-form" onSubmit={onSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="itemId" className="form-label">
                  <i className="fas fa-barcode"></i> Item ID
                </label>
                <input
                  type="text"
                  id="itemId"
                  name="itemId"
                  className="form-control"
                  onChange={onInputChange}
                  value={formData.itemId}
                  placeholder="Enter item ID"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="itemName" className="form-label">
                  <i className="fas fa-tag"></i> Item Name
                </label>
                <input
                  type="text"
                  id="itemName"
                  name="itemName"
                  className="form-control"
                  onChange={onInputChange}
                  value={formData.itemName}
                  placeholder="Enter item name"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="itemQuantity" className="form-label">
                  <i className="fas fa-layer-group"></i> Quantity
                </label>
                <input
                  type="number"
                  id="itemQuantity"
                  name="itemQuantity"
                  className="form-control"
                  onChange={onInputChange}
                  value={formData.itemQuantity}
                  placeholder="Enter quantity"
                  min="0"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="itemCategory" className="form-label">
                  <i className="fas fa-folder"></i> Category
                </label>
                <select
                  id="itemCategory"
                  name="itemCategory"
                  className="form-control"
                  onChange={onInputChange}
                  value={formData.itemCategory}
                  required
                >
                  <option value="" disabled>
                    Select a category
                  </option>
                  <option value="Electronics">Electronics</option>
                  <option value="Clothing">Clothing</option>
                  <option value="Furniture">Furniture</option>
                  <option value="Books">Books</option>
                  <option value="Food">Food</option>
                  <option value="Sports">Sports</option>
                  <option value="Tools">Tools</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="costPrice" className="form-label">
                  <i className="fas fa-dollar-sign"></i> Cost Price
                </label>
                <input
                  type="number"
                  id="costPrice"
                  name="costPrice"
                  className="form-control"
                  onChange={onInputChange}
                  value={formData.costPrice}
                  placeholder="Enter cost price"
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="sellingPrice" className="form-label">
                  <i className="fas fa-tag"></i> Selling Price
                </label>
                <input
                  type="number"
                  id="sellingPrice"
                  name="sellingPrice"
                  className="form-control"
                  onChange={onInputChange}
                  value={formData.sellingPrice}
                  placeholder="Enter selling price"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="itemDetails" className="form-label">
                <i className="fas fa-info-circle"></i> Item Details
              </label>
              <textarea
                id="itemDetails"
                name="itemDetails"
                className="form-control"
                onChange={onInputChange}
                value={formData.itemDetails}
                placeholder="Enter item description and details..."
                rows="4"
                required
              ></textarea>
            </div>

            <div className="form-group">
              <label htmlFor="itemImage" className="form-label">
                <i className="fas fa-image"></i> Item Image
              </label>

              {/* Current Image Display */}
              {currentImage && !previewImage && (
                <div className="current-image-section">
                  <h4>Current Image:</h4>
                  <div className="current-image-container">
                    <img
                      src={currentImage}
                      alt="Current item"
                      className="current-img"
                    />
                    <span className="current-image-label">Current Image</span>
                  </div>
                </div>
              )}

              <div className="image-upload-container">
                <input
                  type="file"
                  id="itemImage"
                  name="itemImage"
                  className="file-input"
                  accept="image/*"
                  onChange={onInputChange}
                />
                <label htmlFor="itemImage" className="file-label">
                  <i className="fas fa-cloud-upload-alt"></i>
                  <span>Choose a new image or drag it here</span>
                </label>
              </div>

              {/* New Image Preview */}
              {previewImage && (
                <div className="image-preview">
                  <h4>New Image Preview:</h4>
                  <img
                    src={previewImage}
                    alt="Preview"
                    className="preview-img"
                  />
                  <span className="preview-text">New Image Preview</span>
                </div>
              )}
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="btn btn-secondary cancel-btn"
                onClick={() => navigate("/AllItem")}
              >
                <i className="fas fa-times"></i> Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary submit-btn"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="spinner-small"></div>
                    Updating Item...
                  </>
                ) : (
                  <>
                    <i className="fas fa-save"></i> Update Item
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default UpdateItem;
