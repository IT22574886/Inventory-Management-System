package com.example.demo.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;

@Entity
public class InventoryModel {

    @Id
    @GeneratedValue
    private Long id;
    private String itemId;
    private String itemName;
    private String itemImage;
    private String itemCategory;
    private String itemQuantity;
    private String itemDetails;

    // New fields for online shopping
    private Double costPrice; // Internal cost price
    private Double sellingPrice; // Customer-facing price
    private Boolean isAvailable;
    private String stockStatus; // "In Stock", "Low Stock", "Out of Stock"
    private String brand;
    private String description;
    private Double rating;
    private Integer reviewCount;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getItemId() {
        return itemId;
    }

    public void setItemId(String itemId) {
        this.itemId = itemId;
    }

    public String getItemName() {
        return itemName;
    }

    public void setItemName(String itemName) {
        this.itemName = itemName;
    }

    public String getItemImage() {
        return itemImage;
    }

    public void setItemImage(String itemImage) {
        this.itemImage = itemImage;
    }

    public String getItemCategory() {
        return itemCategory;
    }

    public void setItemCategory(String itemCategory) {
        this.itemCategory = itemCategory;
    }

    public String getItemQuantity() {
        return itemQuantity;
    }

    public void setItemQuantity(String itemQuantity) {
        this.itemQuantity = itemQuantity;
    }

    public String getItemDetails() {
        return itemDetails;
    }

    public void setItemDetails(String itemDetails) {
        this.itemDetails = itemDetails;
    }

    // New getters and setters for shopping fields
    public Double getCostPrice() {
        return costPrice;
    }

    public void setCostPrice(Double costPrice) {
        this.costPrice = costPrice;
    }

    public Double getSellingPrice() {
        return sellingPrice;
    }

    public void setSellingPrice(Double sellingPrice) {
        this.sellingPrice = sellingPrice;
    }

    // Keep the old price getter for backward compatibility (returns selling price)
    public Double getPrice() {
        return sellingPrice;
    }

    public void setPrice(Double price) {
        this.sellingPrice = price;
    }

    public Boolean getIsAvailable() {
        return isAvailable;
    }

    public void setIsAvailable(Boolean isAvailable) {
        this.isAvailable = isAvailable;
    }

    public String getStockStatus() {
        return stockStatus;
    }

    public void setStockStatus(String stockStatus) {
        this.stockStatus = stockStatus;
    }

    public String getBrand() {
        return brand;
    }

    public void setBrand(String brand) {
        this.brand = brand;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Double getRating() {
        return rating;
    }

    public void setRating(Double rating) {
        this.rating = rating;
    }

    public Integer getReviewCount() {
        return reviewCount;
    }

    public void setReviewCount(Integer reviewCount) {
        this.reviewCount = reviewCount;
    }

    public InventoryModel() {
    } // Required by JPA

    public InventoryModel(Long id, String itemId, String itemName, String itemImage, String itemCategory,
            String itemQuantity, String itemDetails) {
        this.id = id;
        this.itemId = itemId;
        this.itemName = itemName;
        this.itemImage = itemImage;
        this.itemCategory = itemCategory;
        this.itemQuantity = itemQuantity;
        this.itemDetails = itemDetails;
    }

    // New constructor with shopping fields
    public InventoryModel(Long id, String itemId, String itemName, String itemImage, String itemCategory,
            String itemQuantity, String itemDetails, Double costPrice, Double sellingPrice, Boolean isAvailable,
            String stockStatus, String brand, String description, Double rating, Integer reviewCount) {
        this.id = id;
        this.itemId = itemId;
        this.itemName = itemName;
        this.itemImage = itemImage;
        this.itemCategory = itemCategory;
        this.itemQuantity = itemQuantity;
        this.itemDetails = itemDetails;
        this.costPrice = costPrice;
        this.sellingPrice = sellingPrice;
        this.isAvailable = isAvailable;
        this.stockStatus = stockStatus;
        this.brand = brand;
        this.description = description;
        this.rating = rating;
        this.reviewCount = reviewCount;
    }
}
