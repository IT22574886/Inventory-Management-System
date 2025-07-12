package com.example.demo.controller;

import com.example.demo.model.InventoryModel;
import com.example.demo.model.Order;
import com.example.demo.model.User;
import com.example.demo.repository.InventoryRepository;
import com.example.demo.repository.OrderRepository;
import com.example.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    @Autowired
    private InventoryRepository inventoryRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private UserRepository userRepository;

    // Dashboard statistics
    @GetMapping("/dashboard/stats")
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        try {
            Map<String, Object> stats = new HashMap<>();

            // Get total products
            long totalProducts = inventoryRepository.count();

            // Get total orders
            long totalOrders = orderRepository.count();

            // Get total users
            long totalUsers = userRepository.count();

            // Calculate total revenue
            List<Order> allOrders = orderRepository.findAll();
            double totalRevenue = allOrders.stream()
                    .filter(order -> !"CANCELLED".equals(order.getStatus()))
                    .mapToDouble(Order::getTotalAmount)
                    .sum();

            stats.put("totalProducts", totalProducts);
            stats.put("totalOrders", totalOrders);
            stats.put("totalUsers", totalUsers);
            stats.put("totalRevenue", totalRevenue);

            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Failed to load dashboard statistics: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    // Recent orders
    @GetMapping("/orders/recent")
    public ResponseEntity<List<Order>> getRecentOrders() {
        try {
            // Get the 5 most recent orders
            List<Order> recentOrders = orderRepository.findAllByOrderByOrderDateDesc();
            if (recentOrders.size() > 5) {
                recentOrders = recentOrders.subList(0, 5);
            }
            return ResponseEntity.ok(recentOrders);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    // Low stock products
    @GetMapping("/products/low-stock")
    public ResponseEntity<List<InventoryModel>> getLowStockProducts() {
        try {
            List<InventoryModel> allProducts = inventoryRepository.findAll();

            // Filter products with low stock (less than 10 items)
            List<InventoryModel> lowStockProducts = allProducts.stream()
                    .filter(product -> {
                        try {
                            int quantity = Integer.parseInt(product.getItemQuantity());
                            return quantity < 10 && quantity > 0;
                        } catch (NumberFormatException e) {
                            return false;
                        }
                    })
                    .toList();

            return ResponseEntity.ok(lowStockProducts);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(null);
        }
    }
}