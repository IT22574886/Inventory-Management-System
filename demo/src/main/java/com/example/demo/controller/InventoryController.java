package com.example.demo.controller;

import com.example.demo.exception.InventoryNotFoundException;
import com.example.demo.model.InventoryModel;
import com.example.demo.repository.InventoryRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.FileSystemResource;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin("http://localhost:3000")
public class InventoryController {
    @Autowired
    private InventoryRepository inventoryRepository;

    private static final String UPLOAD_DIR = System.getProperty("user.dir") + "/demo/uploads/"; 



    // Authorization helper methods
    private boolean isAdmin(Map<String, Object> userData) {
        if (userData == null)
            return false;
        String role = (String) userData.get("role");
        return "ADMIN".equals(role);
    }

    private ResponseEntity<?> unauthorizedResponse() {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(Map.of("error", "Access denied. Admin privileges required."));
    }

    ////////////////////////////// Insert (Admin Only)
    @PostMapping("/inventory")
    public ResponseEntity<?> newInventoryModel(@RequestBody InventoryModel newInventoryModel,
            @RequestHeader(value = "User-Data", required = false) String userDataHeader) {
        // Check authorization
        Map<String, Object> userData = null;
        if (userDataHeader != null) {
            try {
                ObjectMapper mapper = new ObjectMapper();
                userData = mapper.readValue(userDataHeader, Map.class);
            } catch (Exception e) {
                return unauthorizedResponse();
            }
        }

        if (!isAdmin(userData)) {
            return unauthorizedResponse();
        }
        // Set default values for new products
        if (newInventoryModel.getIsAvailable() == null) {
            newInventoryModel.setIsAvailable(true);
        }
        if (newInventoryModel.getStockStatus() == null) {
            int quantity = Integer.parseInt(newInventoryModel.getItemQuantity());
            if (quantity > 10) {
                newInventoryModel.setStockStatus("In Stock");
            } else if (quantity > 0) {
                newInventoryModel.setStockStatus("Low Stock");
            } else {
                newInventoryModel.setStockStatus("Out of Stock");
                newInventoryModel.setIsAvailable(false);
            }
        }
        if (newInventoryModel.getRating() == null) {
            newInventoryModel.setRating(0.0);
        }
        if (newInventoryModel.getReviewCount() == null) {
            newInventoryModel.setReviewCount(0);
        }
        if (newInventoryModel.getCostPrice() == null) {
            newInventoryModel.setCostPrice(0.0);
        }
        if (newInventoryModel.getSellingPrice() == null) {
            newInventoryModel.setSellingPrice(0.0);
        }

        InventoryModel savedItem = inventoryRepository.save(newInventoryModel);
        return ResponseEntity.ok(savedItem);
    }

    @PostMapping("/inventory/itemImg")
    public ResponseEntity<?> itemImage(@RequestParam("file") MultipartFile file,
            @RequestHeader(value = "User-Data", required = false) String userDataHeader) {
        // Check authorization
        Map<String, Object> userData = null;
        if (userDataHeader != null) {
            try {
                ObjectMapper mapper = new ObjectMapper();
                userData = mapper.readValue(userDataHeader, Map.class);
            } catch (Exception e) {
                return unauthorizedResponse();
            }
        }

        if (!isAdmin(userData)) {
            return unauthorizedResponse();
        }
        // 1. Use relative path from project root
        String folder = UPLOAD_DIR;

        // 2. Basic filename sanitization
        String originalFilename = file.getOriginalFilename();
        String safeFilename = originalFilename != null
                ? originalFilename.replace(" ", "_").replaceAll("[^a-zA-Z0-9._-]", "")
                : "uploaded_file";

        try {
            // 3. Create directories including parent directories if needed
            Path uploadPath = Paths.get(folder).toAbsolutePath().normalize();
            Files.createDirectories(uploadPath); // Better than mkdir()

            // 4. Create complete file path
            Path targetPath = uploadPath.resolve(safeFilename);

            // 5. Save file with proper error handling
            file.transferTo(targetPath);

            return ResponseEntity.ok(Map.of("filename", safeFilename));

        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error Uploading File: " + e.getMessage()));
        }
    }

    //////////////// GetItem details
    @GetMapping("/inventory")
    public ResponseEntity<?> getAllItems() {
        try {
            System.out.println("Attempting to fetch inventory items..."); // Debug log
            List<InventoryModel> items = inventoryRepository.findAll();

            if (items == null) {
                return ResponseEntity.status(500).body("Inventory list is null");
            }

            System.out.println("Successfully fetched " + items.size() + " items");
            return ResponseEntity.ok(items);
        } catch (Exception e) {
            System.err.println("ERROR in getAllItems: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body("Database error: " + e.getMessage());
        }
    }

    // Get specific item by ID (without image)
    @GetMapping("/inventory/{id}")
    InventoryModel getItemId(@PathVariable Long id) {
        return inventoryRepository.findById(id).orElseThrow(() -> new InventoryNotFoundException(id));

    }

    // Get item image only
    

    @GetMapping("demo/uploads/{filename}")
    public ResponseEntity<FileSystemResource> getImage(@PathVariable String filename) {
        File file = new File(UPLOAD_DIR + filename);
        if (!file.exists()) {
            return ResponseEntity.notFound().build();

        }
        return ResponseEntity.ok(new FileSystemResource(file));

    }

    @PutMapping("/inventory/{id}")
    public ResponseEntity<?> UpdateItem(
            @RequestPart(value = "itemDetails") String itemDetails,
            @RequestPart(value = "file", required = false) MultipartFile file,
            @PathVariable Long id,
            @RequestHeader(value = "User-Data", required = false) String userDataHeader) {
        // Check authorization
        Map<String, Object> userData = null;
        if (userDataHeader != null) {
            try {
                ObjectMapper mapper = new ObjectMapper();
                userData = mapper.readValue(userDataHeader, Map.class);
            } catch (Exception e) {
                return unauthorizedResponse();
            }
        }

        if (!isAdmin(userData)) {
            return unauthorizedResponse();
        }
        System.out.println("Item Details: " + itemDetails);
        if (file != null) {
            System.out.println("File received: " + file.getOriginalFilename());
        } else {
            System.out.println("No File Uploaded");
        }
        ObjectMapper mapper = new ObjectMapper();
        InventoryModel newInventory;
        try {
            newInventory = mapper.readValue(itemDetails, InventoryModel.class);
        } catch (Exception e) {
            throw new RuntimeException("Error Parsing itemDetails", e);
        }

        return inventoryRepository.findById(id).map(existingInventory -> {
            existingInventory.setItemId(newInventory.getItemId());
            existingInventory.setItemName(newInventory.getItemName());
            existingInventory.setItemCategory(newInventory.getItemCategory());
            existingInventory.setItemQuantity(newInventory.getItemQuantity());
            existingInventory.setItemDetails(newInventory.getItemDetails());
            existingInventory.setCostPrice(newInventory.getCostPrice());
            existingInventory.setSellingPrice(newInventory.getSellingPrice());

            if (file != null && !file.isEmpty()) {
                // Use the same folder path as the upload method
                String folder = "demo/uploads/";

                // Sanitize filename like in the upload method
                String originalFilename = file.getOriginalFilename();
                String safeFilename = originalFilename != null
                        ? originalFilename.replace(" ", "_").replaceAll("[^a-zA-Z0-9._-]", "")
                        : "uploaded_file";

                try {
                    // Create directories if they don't exist
                    Path uploadPath = Paths.get(folder).toAbsolutePath().normalize();
                    Files.createDirectories(uploadPath);

                    // Create complete file path
                    Path targetPath = uploadPath.resolve(safeFilename);

                    // Save the file
                    file.transferTo(targetPath);

                    // Update the item image name in database
                    existingInventory.setItemImage(safeFilename);

                    System.out.println("Image updated successfully: " + safeFilename);
                } catch (IOException e) {
                    throw new RuntimeException("Error Saving Upload File", e);
                }
            }
            InventoryModel updatedItem = inventoryRepository.save(existingInventory);
            return ResponseEntity.ok(updatedItem);
        }).orElseThrow(() -> new InventoryNotFoundException(id));
    }

    @DeleteMapping("/inventory/{id}")
    public ResponseEntity<?> deleteItem(@PathVariable Long id,
            @RequestHeader(value = "User-Data", required = false) String userDataHeader) {
        // Check authorization
        Map<String, Object> userData = null;
        if (userDataHeader != null) {
            try {
                ObjectMapper mapper = new ObjectMapper();
                userData = mapper.readValue(userDataHeader, Map.class);
            } catch (Exception e) {
                return unauthorizedResponse();
            }
        }

        if (!isAdmin(userData)) {
            return unauthorizedResponse();
        }

        // check Item exist in db
        InventoryModel inventoryItem = inventoryRepository.findById(id)
                .orElseThrow(() -> new InventoryNotFoundException(id));

        String itemImage = inventoryItem.getItemImage();
        if (itemImage != null && !itemImage.isEmpty()) {
            // Use the same folder path as other methods
            File imageFile = new File("demo/uploads/" + itemImage);
            if (imageFile.exists()) {
                if (imageFile.delete()) {
                    System.out.println("Image Deleted: " + itemImage);
                } else {
                    System.out.println("Failed to delete image: " + itemImage);
                }
            } else {
                System.out.println("Image file not found: " + itemImage);
            }
        }

        // Delete item from the repo
        inventoryRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Item with id " + id + " and image deleted successfully"));
    }

}
