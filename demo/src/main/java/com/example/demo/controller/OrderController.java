package com.example.demo.controller;

import com.example.demo.model.Order;
import com.example.demo.model.OrderItem;
import com.example.demo.model.User;
import com.example.demo.model.InventoryModel;
import com.example.demo.repository.OrderRepository;
import com.example.demo.repository.UserRepository;
import com.example.demo.repository.InventoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "*")
public class OrderController {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private InventoryRepository inventoryRepository;

    // Create a new order
    @PostMapping("/create")
    public ResponseEntity<?> createOrder(@RequestBody OrderRequest orderRequest) {
        try {
            // Find the user
            Optional<User> userOpt = userRepository.findById(orderRequest.getUserId());
            if (!userOpt.isPresent()) {
                return ResponseEntity.badRequest().body("User not found");
            }

            User user = userOpt.get();

            // Create new order
            Order order = new Order();
            order.setUser(user);
            order.setOrderDate(LocalDateTime.now());
            order.setStatus("PENDING");
            order.setTotalAmount(0.0);
            order.setShippingAddress(orderRequest.getShippingAddress());
            order.setPaymentMethod(orderRequest.getPaymentMethod());
            order.setNotes(orderRequest.getNotes());

            // Save the order first
            Order savedOrder = orderRepository.save(order);

            // Process order items
            double totalAmount = 0.0;
            for (OrderItemRequest itemRequest : orderRequest.getOrderItems()) {
                Optional<InventoryModel> productOpt = inventoryRepository.findById(itemRequest.getProductId());
                if (!productOpt.isPresent()) {
                    return ResponseEntity.badRequest().body("Product not found: " + itemRequest.getProductId());
                }

                InventoryModel product = productOpt.get();

                // Check stock availability
                int currentStock = Integer.parseInt(product.getItemQuantity());
                if (currentStock < itemRequest.getQuantity()) {
                    return ResponseEntity.badRequest().body("Insufficient stock for product: " + product.getItemName());
                }

                // Create order item
                OrderItem orderItem = new OrderItem();
                orderItem.setOrder(savedOrder);
                orderItem.setProduct(product);
                orderItem.setQuantity(itemRequest.getQuantity());
                orderItem.setUnitPrice(product.getPrice());
                orderItem.setTotalPrice(itemRequest.getQuantity() * product.getPrice());

                // Update product stock
                product.setItemQuantity(String.valueOf(currentStock - itemRequest.getQuantity()));
                inventoryRepository.save(product);

                totalAmount += orderItem.getTotalPrice();
            }

            // Update order total
            savedOrder.setTotalAmount(totalAmount);
            Order finalOrder = orderRepository.save(savedOrder);

            return ResponseEntity.ok(finalOrder);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error creating order: " + e.getMessage());
        }
    }

    // Get all orders
    @GetMapping("/all")
    public ResponseEntity<List<Order>> getAllOrders() {
        List<Order> orders = orderRepository.findAll();
        return ResponseEntity.ok(orders);
    }

    // Get order by ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getOrderById(@PathVariable Long id) {
        Optional<Order> order = orderRepository.findById(id);
        if (order.isPresent()) {
            return ResponseEntity.ok(order.get());
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // Get orders by user ID
    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getOrdersByUser(@PathVariable Long userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (!userOpt.isPresent()) {
            return ResponseEntity.badRequest().body("User not found");
        }

        List<Order> orders = orderRepository.findByUserOrderByOrderDateDesc(userOpt.get());
        return ResponseEntity.ok(orders);
    }

    // Get orders by status
    @GetMapping("/status/{status}")
    public ResponseEntity<List<Order>> getOrdersByStatus(@PathVariable String status) {
        List<Order> orders = orderRepository.findByStatus(status);
        return ResponseEntity.ok(orders);
    }

    // Update order status
    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateOrderStatus(@PathVariable Long id, @RequestBody StatusUpdateRequest request) {
        Optional<Order> orderOpt = orderRepository.findById(id);
        if (!orderOpt.isPresent()) {
            return ResponseEntity.notFound().build();
        }

        Order order = orderOpt.get();
        order.setStatus(request.getStatus());

        if (request.getTrackingNumber() != null) {
            order.setTrackingNumber(request.getTrackingNumber());
        }

        Order updatedOrder = orderRepository.save(order);
        return ResponseEntity.ok(updatedOrder);
    }

    // Cancel order
    @PutMapping("/{id}/cancel")
    public ResponseEntity<?> cancelOrder(@PathVariable Long id) {
        Optional<Order> orderOpt = orderRepository.findById(id);
        if (!orderOpt.isPresent()) {
            return ResponseEntity.notFound().build();
        }

        Order order = orderOpt.get();

        // Only allow cancellation of pending orders
        if (!"PENDING".equals(order.getStatus())) {
            return ResponseEntity.badRequest().body("Only pending orders can be cancelled");
        }

        order.setStatus("CANCELLED");
        Order cancelledOrder = orderRepository.save(order);
        return ResponseEntity.ok(cancelledOrder);
    }

    // Delete order (admin only)
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteOrder(@PathVariable Long id) {
        Optional<Order> orderOpt = orderRepository.findById(id);
        if (!orderOpt.isPresent()) {
            return ResponseEntity.notFound().build();
        }

        orderRepository.deleteById(id);
        return ResponseEntity.ok("Order deleted successfully");
    }

    // Get order statistics
    @GetMapping("/statistics")
    public ResponseEntity<?> getOrderStatistics() {
        List<Order> allOrders = orderRepository.findAll();

        long totalOrders = allOrders.size();
        long pendingOrders = allOrders.stream().filter(o -> "PENDING".equals(o.getStatus())).count();
        long confirmedOrders = allOrders.stream().filter(o -> "CONFIRMED".equals(o.getStatus())).count();
        long shippedOrders = allOrders.stream().filter(o -> "SHIPPED".equals(o.getStatus())).count();
        long deliveredOrders = allOrders.stream().filter(o -> "DELIVERED".equals(o.getStatus())).count();
        long cancelledOrders = allOrders.stream().filter(o -> "CANCELLED".equals(o.getStatus())).count();

        double totalRevenue = allOrders.stream()
                .filter(o -> !"CANCELLED".equals(o.getStatus()))
                .mapToDouble(Order::getTotalAmount)
                .sum();

        OrderStatistics stats = new OrderStatistics();
        stats.setTotalOrders(totalOrders);
        stats.setPendingOrders(pendingOrders);
        stats.setConfirmedOrders(confirmedOrders);
        stats.setShippedOrders(shippedOrders);
        stats.setDeliveredOrders(deliveredOrders);
        stats.setCancelledOrders(cancelledOrders);
        stats.setTotalRevenue(totalRevenue);

        return ResponseEntity.ok(stats);
    }

    // Request/Response classes
    public static class OrderRequest {
        private Long userId;
        private String shippingAddress;
        private String paymentMethod;
        private String notes;
        private List<OrderItemRequest> orderItems;

        // Getters and Setters
        public Long getUserId() {
            return userId;
        }

        public void setUserId(Long userId) {
            this.userId = userId;
        }

        public String getShippingAddress() {
            return shippingAddress;
        }

        public void setShippingAddress(String shippingAddress) {
            this.shippingAddress = shippingAddress;
        }

        public String getPaymentMethod() {
            return paymentMethod;
        }

        public void setPaymentMethod(String paymentMethod) {
            this.paymentMethod = paymentMethod;
        }

        public String getNotes() {
            return notes;
        }

        public void setNotes(String notes) {
            this.notes = notes;
        }

        public List<OrderItemRequest> getOrderItems() {
            return orderItems;
        }

        public void setOrderItems(List<OrderItemRequest> orderItems) {
            this.orderItems = orderItems;
        }
    }

    public static class OrderItemRequest {
        private Long productId;
        private Integer quantity;

        // Getters and Setters
        public Long getProductId() {
            return productId;
        }

        public void setProductId(Long productId) {
            this.productId = productId;
        }

        public Integer getQuantity() {
            return quantity;
        }

        public void setQuantity(Integer quantity) {
            this.quantity = quantity;
        }
    }

    public static class StatusUpdateRequest {
        private String status;
        private String trackingNumber;

        // Getters and Setters
        public String getStatus() {
            return status;
        }

        public void setStatus(String status) {
            this.status = status;
        }

        public String getTrackingNumber() {
            return trackingNumber;
        }

        public void setTrackingNumber(String trackingNumber) {
            this.trackingNumber = trackingNumber;
        }
    }

    public static class OrderStatistics {
        private long totalOrders;
        private long pendingOrders;
        private long confirmedOrders;
        private long shippedOrders;
        private long deliveredOrders;
        private long cancelledOrders;
        private double totalRevenue;

        // Getters and Setters
        public long getTotalOrders() {
            return totalOrders;
        }

        public void setTotalOrders(long totalOrders) {
            this.totalOrders = totalOrders;
        }

        public long getPendingOrders() {
            return pendingOrders;
        }

        public void setPendingOrders(long pendingOrders) {
            this.pendingOrders = pendingOrders;
        }

        public long getConfirmedOrders() {
            return confirmedOrders;
        }

        public void setConfirmedOrders(long confirmedOrders) {
            this.confirmedOrders = confirmedOrders;
        }

        public long getShippedOrders() {
            return shippedOrders;
        }

        public void setShippedOrders(long shippedOrders) {
            this.shippedOrders = shippedOrders;
        }

        public long getDeliveredOrders() {
            return deliveredOrders;
        }

        public void setDeliveredOrders(long deliveredOrders) {
            this.deliveredOrders = deliveredOrders;
        }

        public long getCancelledOrders() {
            return cancelledOrders;
        }

        public void setCancelledOrders(long cancelledOrders) {
            this.cancelledOrders = cancelledOrders;
        }

        public double getTotalRevenue() {
            return totalRevenue;
        }

        public void setTotalRevenue(double totalRevenue) {
            this.totalRevenue = totalRevenue;
        }
    }
}