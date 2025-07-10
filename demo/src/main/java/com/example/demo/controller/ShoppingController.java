package com.example.demo.controller;

import com.example.demo.model.InventoryModel;
import com.example.demo.model.Order;
import com.example.demo.model.OrderItem;
import com.example.demo.model.User;
import com.example.demo.repository.InventoryRepository;
import com.example.demo.repository.OrderRepository;
import com.example.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@CrossOrigin("http://localhost:3000")
@RequestMapping("/api/shop")
public class ShoppingController {

    @Autowired
    private InventoryRepository inventoryRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OrderRepository orderRepository;

    // Get all available products for customers
    @GetMapping("/products")
    public ResponseEntity<?> getAllProducts() {
        try {
            List<InventoryModel> products = inventoryRepository.findAll();

            // Filter only available products
            List<InventoryModel> availableProducts = products.stream()
                    .filter(product -> product.getIsAvailable() != null && product.getIsAvailable())
                    .toList();

            return ResponseEntity.ok(availableProducts);
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("error", "Failed to fetch products: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    // Get products by category
    @GetMapping("/products/category/{category}")
    public ResponseEntity<?> getProductsByCategory(@PathVariable String category) {
        try {
            List<InventoryModel> allProducts = inventoryRepository.findAll();

            List<InventoryModel> categoryProducts = allProducts.stream()
                    .filter(product -> product.getIsAvailable() != null && product.getIsAvailable())
                    .filter(product -> category.equalsIgnoreCase(product.getItemCategory()))
                    .toList();

            return ResponseEntity.ok(categoryProducts);
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("error", "Failed to fetch products: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    // Get single product details
    @GetMapping("/products/{id}")
    public ResponseEntity<?> getProductById(@PathVariable Long id) {
        try {
            Optional<InventoryModel> product = inventoryRepository.findById(id);

            if (product.isPresent() && product.get().getIsAvailable()) {
                return ResponseEntity.ok(product.get());
            } else {
                Map<String, String> response = new HashMap<>();
                response.put("error", "Product not found or not available");
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("error", "Failed to fetch product: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    // Place an order
    @PostMapping("/order")
    public ResponseEntity<?> placeOrder(@RequestBody Map<String, Object> orderRequest) {
        try {
            String userEmail = (String) orderRequest.get("userEmail");
            String shippingAddress = (String) orderRequest.get("shippingAddress");
            String paymentMethod = (String) orderRequest.get("paymentMethod");
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> items = (List<Map<String, Object>>) orderRequest.get("items");

            // Find user
            Optional<User> userOptional = userRepository.findByEmail(userEmail);
            if (!userOptional.isPresent()) {
                Map<String, String> response = new HashMap<>();
                response.put("error", "User not found");
                return ResponseEntity.badRequest().body(response);
            }

            User user = userOptional.get();

            // Calculate total amount
            double totalAmount = 0.0;
            for (Map<String, Object> item : items) {
                Long productId = Long.valueOf(item.get("productId").toString());
                Integer quantity = Integer.valueOf(item.get("quantity").toString());

                Optional<InventoryModel> productOptional = inventoryRepository.findById(productId);
                if (productOptional.isPresent()) {
                    InventoryModel product = productOptional.get();
                    totalAmount += product.getPrice() * quantity;

                    // Update stock
                    int currentStock = Integer.parseInt(product.getItemQuantity());
                    if (currentStock < quantity) {
                        Map<String, String> response = new HashMap<>();
                        response.put("error", "Insufficient stock for product: " + product.getItemName());
                        return ResponseEntity.badRequest().body(response);
                    }

                    // Update product stock
                    product.setItemQuantity(String.valueOf(currentStock - quantity));
                    if (currentStock - quantity <= 5) {
                        product.setStockStatus("Low Stock");
                    }
                    if (currentStock - quantity == 0) {
                        product.setStockStatus("Out of Stock");
                        product.setIsAvailable(false);
                    }
                    inventoryRepository.save(product);
                }
            }

            // Create order
            Order order = new Order();
            order.setUser(user);
            order.setOrderDate(LocalDateTime.now());
            order.setStatus("PENDING");
            order.setTotalAmount(totalAmount);
            order.setShippingAddress(shippingAddress);
            order.setPaymentMethod(paymentMethod);

            Order savedOrder = orderRepository.save(order);

            // Create order items
            for (Map<String, Object> item : items) {
                Long productId = Long.valueOf(item.get("productId").toString());
                Integer quantity = Integer.valueOf(item.get("quantity").toString());

                Optional<InventoryModel> productOptional = inventoryRepository.findById(productId);
                if (productOptional.isPresent()) {
                    InventoryModel product = productOptional.get();

                    OrderItem orderItem = new OrderItem();
                    orderItem.setOrder(savedOrder);
                    orderItem.setProduct(product);
                    orderItem.setQuantity(quantity);
                    orderItem.setUnitPrice(product.getPrice());
                    orderItem.setTotalPrice(product.getPrice() * quantity);

                    // Save order item (you'll need to create OrderItemRepository)
                    // orderItemRepository.save(orderItem);
                }
            }

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Order placed successfully");
            response.put("orderId", savedOrder.getId());
            response.put("totalAmount", totalAmount);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("error", "Failed to place order: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    // Get user's order history
    @GetMapping("/orders/{userEmail}")
    public ResponseEntity<?> getUserOrders(@PathVariable String userEmail) {
        try {
            Optional<User> userOptional = userRepository.findByEmail(userEmail);
            if (!userOptional.isPresent()) {
                Map<String, String> response = new HashMap<>();
                response.put("error", "User not found");
                return ResponseEntity.badRequest().body(response);
            }

            User user = userOptional.get();
            List<Order> orders = orderRepository.findByUserOrderByOrderDateDesc(user);

            return ResponseEntity.ok(orders);
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("error", "Failed to fetch orders: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
}