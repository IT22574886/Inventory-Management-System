import React, { useEffect, useState } from "react";
import { Await, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import "./AddItem.css";

function AddItem() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [inventory, setInventory] = useState({
    itemId: "",
    itemName: "",
    itemImage: null,
    itemCategory: "",
    itemQuantity: "",
    itemDetails: "",
    costPrice: "",
    sellingPrice: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  const {
    itemId,
    itemName,
    itemCategory,
    itemQuantity,
    itemDetails,
    costPrice,
    sellingPrice,
  } = inventory;

  const onInputChange = (e) => {
    if (e.target.name === "itemImage") {
      const file = e.target.files[0];
      setInventory({ ...inventory, itemImage: file });

      // Create preview for image
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewImage(reader.result);
        };
        reader.readAsDataURL(file);
      }
    } else {
      setInventory({ ...inventory, [e.target.name]: e.target.value });
    }
  };

  const onsubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("file", inventory.itemImage);
    let imageName = "";

    try {
      const response = await axios.post(
        "http://localhost:8080/inventory/itemImg",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            "User-Data": JSON.stringify(user),
          },
        }
      );
      imageName = response.data.filename;
    } catch (error) {
      if (error.response?.status === 403) {
        alert("Access denied. Admin privileges required.");
      } else {
        alert("Error uploading Image");
      }
      setIsSubmitting(false);
      return;
    }

    try {
      const updateInventory = { ...inventory, itemImage: imageName };
      await axios.post("http://localhost:8080/inventory", updateInventory, {
        headers: {
          "User-Data": JSON.stringify(user),
        },
      });
      alert("Item Added successfully");
      navigate("/AllItem");
    } catch (error) {
      if (error.response?.status === 403) {
        alert("Access denied. Admin privileges required.");
      } else {
        alert("Error adding item");
      }
      setIsSubmitting(false);
    }
  };

  return (
    <div className="add-item-container">
      <div className="background-art"></div>
      <div className="content-wrapper">
        <div className="form-container">
          <div className="form-header">
            <h1 className="form-title">
              <i className="fas fa-plus-circle"></i> Add New Item
            </h1>
            <p className="form-subtitle">
              Enter the details for your new inventory item
            </p>
          </div>

          <form className="add-item-form" onSubmit={(e) => onsubmit(e)}>
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
                  onChange={(e) => onInputChange(e)}
                  value={itemId}
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
                  onChange={(e) => onInputChange(e)}
                  value={itemName}
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
                  onChange={(e) => onInputChange(e)}
                  value={itemQuantity}
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
                  onChange={(e) => onInputChange(e)}
                  value={itemCategory}
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
                  onChange={(e) => onInputChange(e)}
                  value={costPrice}
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
                  onChange={(e) => onInputChange(e)}
                  value={sellingPrice}
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
                onChange={(e) => onInputChange(e)}
                value={itemDetails}
                placeholder="Enter item description and details..."
                rows="4"
                required
              ></textarea>
            </div>

            <div className="form-group">
              <label htmlFor="itemImage" className="form-label">
                <i className="fas fa-image"></i> Item Image
              </label>
              <div className="image-upload-container">
                <input
                  type="file"
                  id="itemImage"
                  name="itemImage"
                  className="file-input"
                  accept="image/*"
                  onChange={(e) => onInputChange(e)}
                  required
                />
                <label htmlFor="itemImage" className="file-label">
                  <i className="fas fa-cloud-upload-alt"></i>
                  <span>Choose an image or drag it here</span>
                </label>
              </div>

              {previewImage && (
                <div className="image-preview">
                  <img
                    src={previewImage}
                    alt="Preview"
                    className="preview-img"
                  />
                  <span className="preview-text">Image Preview</span>
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
                    Adding Item...
                  </>
                ) : (
                  <>
                    <i className="fas fa-save"></i> Add Item
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

export default AddItem;
