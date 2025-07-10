import axios from "axios";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { jsPDF } from "jspdf";
import autotable from "jspdf-autotable";
import { useAuth } from "../../context/AuthContext";
import "./DisplayItem.css";

function DisplayItem() {
  const [inventory, setInventory] = useState([]);
  const { id } = useParams();
  const { user } = useAuth();

  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = async () => {
    const result = await axios.get("http://localhost:8080/inventory");
    setInventory(result.data);
  };

  const updateNavigate = (itemId) => {
    window.location.href = `/updateItem/${itemId}`;
  };

  const deleteItem = async (id) => {
    const confirmationMassage = window.confirm(
      "Are you sure you want to delete this item?"
    );
    if (confirmationMassage) {
      try {
        //send delete request
        await axios.delete(`http://localhost:8080/inventory/${id}`, {
          headers: {
            "User-Data": JSON.stringify(user),
          },
        });
        //after delete,reload invnetory data
        loadInventory();
        //display success massage
        alert("Item Deleted Successfully");
      } catch (error) {
        if (error.response?.status === 403) {
          alert("Access denied. Admin privileges required.");
        } else {
          alert("Error Deleting Item");
        }
      }
    }
  };

  //PDF genearation
  const generatePdf = () => {
    if (!Array.isArray(inventory)) {
      alert("Inventory data is not loaded properly");
      return;
    }

    if (inventory.length === 0) {
      alert("No data available to generate PDF");
      return;
    }

    // Initialize jsPDF
    const doc = new jsPDF();

    // Add title
    doc.text("Inventory Item List", 14, 10);

    // Prepare table data
    const headers = [
      ["ID", "Name", "Category", "Quantity", "Selling Price", "Details"],
    ];
    const tableData = inventory.map((item) => [
      item.itemId,
      item.itemName,
      item.itemCategory,
      item.itemQuantity,
      `$${(item.sellingPrice || item.price || 0).toFixed(2)}`,
      item.itemDetails,
    ]);

    // Add table using autoTable
    // Use autoTable directly (not as doc.autoTable)
    autotable(doc, {
      head: headers,
      body: tableData,
      startY: 25,
      styles: {
        fontSize: 10,
        cellPadding: 3,
        overflow: "linebreak",
      },
      headStyles: {
        fillColor: [33, 150, 243],
        textColor: 255,
        fontStyle: "bold",
      },
    });

    // Save the PDF
    doc.save("inventory_list.pdf");
  };

  const [searchQuaery, setSearchQuery] = useState("");
  const filteredData = inventory.filter(
    (item) =>
      item.itemName.toLowerCase().includes(searchQuaery.toLowerCase()) ||
      item.itemId.toLowerCase().includes(searchQuaery.toLowerCase())
  );

  return (
    <div className="display-item-container">
      <div className="background-art"></div>
      <div className="content-wrapper">
        <div className="header-section">
          <h1 className="page-title">
            <i className="fas fa-boxes"></i> Inventory Management
          </h1>
          <p className="page-subtitle">Manage and track your inventory items</p>
        </div>

        <div className="controls-section">
          <div className="search-container">
            <div className="input-group">
              <span className="input-group-text">
                <i className="fas fa-search"></i>
              </span>
              <input
                type="text"
                className="form-control search-input"
                placeholder="Search by Item Name or ID..."
                value={searchQuaery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <button className="btn btn-primary pdf-btn" onClick={generatePdf}>
            <i className="fas fa-file-pdf"></i> Generate PDF
          </button>
        </div>

        <div className="table-container">
          <div className="table-responsive">
            <table className="table table-hover inventory-table">
              <thead className="table-header">
                <tr>
                  <th scope="col">Item ID</th>
                  <th scope="col">Item Name</th>
                  <th scope="col">Item Image</th>
                  <th scope="col">Category</th>
                  <th scope="col">Quantity</th>
                  <th scope="col">Selling Price</th>
                  <th scope="col">Details</th>
                  <th scope="col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((item, index) => (
                  <tr key={index} className="table-row">
                    <td className="item-id">
                      <span className="id-badge">{item.itemId}</span>
                    </td>
                    <td className="item-name">
                      <strong>{item.itemName}</strong>
                    </td>
                    <td className="item-image">
                      <div className="image-container">
                        <img
                          src={`http://localhost:8080/demo/uploads/${item.itemImage}`}
                          alt={item.itemName}
                          className="item-img"
                        />
                      </div>
                    </td>
                    <td className="item-category">
                      <span className="category-badge">
                        {item.itemCategory}
                      </span>
                    </td>
                    <td className="item-quantity">
                      <span
                        className={`quantity-badge ${
                          item.itemQuantity > 10
                            ? "high"
                            : item.itemQuantity > 5
                            ? "medium"
                            : "low"
                        }`}
                      >
                        {item.itemQuantity}
                      </span>
                    </td>
                    <td className="item-price">
                      <span className="price-badge">
                        ${(item.sellingPrice || item.price || 0).toFixed(2)}
                      </span>
                    </td>
                    <td className="item-details">
                      <div className="details-text">{item.itemDetails}</div>
                    </td>
                    <td className="item-actions">
                      <div className="action-buttons">
                        <button
                          className="btn btn-sm btn-outline-primary update-btn"
                          onClick={() => updateNavigate(item.id)}
                        >
                          <i className="fas fa-edit"></i> Edit
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger delete-btn"
                          onClick={() => deleteItem(item.id)}
                        >
                          <i className="fas fa-trash"></i> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredData.length === 0 && (
            <div className="no-data-message">
              <i className="fas fa-inbox"></i>
              <p>No inventory items found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DisplayItem;
