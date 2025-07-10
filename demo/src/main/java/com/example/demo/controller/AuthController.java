package com.example.demo.controller;

import com.example.demo.model.User;
import com.example.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@CrossOrigin("http://localhost:3000")
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody User user) {
        try {
            // Check if user already exists
            if (userRepository.existsByEmail(user.getEmail())) {
                Map<String, String> response = new HashMap<>();
                response.put("error", "User with this email already exists");
                return ResponseEntity.badRequest().body(response);
            }

            // Set default role as CUSTOMER for new registrations
            user.setRole("CUSTOMER");
            user.setIsActive(true);

            // In a real application, you should hash the password here
            // For now, we'll store it as plain text (NOT recommended for production)

            User savedUser = userRepository.save(user);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "User registered successfully");
            response.put("user", savedUser);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("error", "Registration failed: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody Map<String, String> loginRequest) {
        try {
            String email = loginRequest.get("email");
            String password = loginRequest.get("password");

            Optional<User> userOptional = userRepository.findByEmailAndIsActiveTrue(email);

            if (userOptional.isPresent()) {
                User user = userOptional.get();

                // In a real application, you should compare hashed passwords
                if (user.getPassword().equals(password)) {
                    Map<String, Object> response = new HashMap<>();
                    response.put("message", "Login successful");
                    response.put("user", user);
                    return ResponseEntity.ok(response);
                } else {
                    Map<String, String> response = new HashMap<>();
                    response.put("error", "Invalid password");
                    return ResponseEntity.badRequest().body(response);
                }
            } else {
                Map<String, String> response = new HashMap<>();
                response.put("error", "User not found");
                return ResponseEntity.badRequest().body(response);
            }

        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("error", "Login failed: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/admin/check")
    public ResponseEntity<?> checkAdminAccess(@RequestParam String email) {
        try {
            Optional<User> userOptional = userRepository.findByEmail(email);

            if (userOptional.isPresent()) {
                User user = userOptional.get();
                Map<String, Object> response = new HashMap<>();
                response.put("isAdmin", "ADMIN".equals(user.getRole()));
                response.put("user", user);
                return ResponseEntity.ok(response);
            } else {
                Map<String, String> response = new HashMap<>();
                response.put("error", "User not found");
                return ResponseEntity.badRequest().body(response);
            }

        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("error", "Check failed: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    // Temporary endpoint to create admin user (REMOVE AFTER USE)
    @PostMapping("/admin/setup")
    public ResponseEntity<?> setupAdmin(@RequestBody Map<String, String> adminRequest) {
        try {
            String email = adminRequest.get("email");
            String password = adminRequest.get("password");
            String firstName = adminRequest.get("firstName");
            String lastName = adminRequest.get("lastName");

            Optional<User> existingUser = userRepository.findByEmail(email);

            if (existingUser.isPresent()) {
                // Update existing user to admin
                User user = existingUser.get();
                user.setRole("ADMIN");
                user.setPassword(password);
                user.setFirstName(firstName);
                user.setLastName(lastName);
                user.setIsActive(true);

                User savedUser = userRepository.save(user);

                Map<String, Object> response = new HashMap<>();
                response.put("message", "User updated to admin successfully");
                response.put("user", savedUser);
                return ResponseEntity.ok(response);
            } else {
                // Create new admin user
                User newAdmin = new User();
                newAdmin.setEmail(email);
                newAdmin.setPassword(password);
                newAdmin.setFirstName(firstName);
                newAdmin.setLastName(lastName);
                newAdmin.setRole("ADMIN");
                newAdmin.setIsActive(true);

                User savedUser = userRepository.save(newAdmin);

                Map<String, Object> response = new HashMap<>();
                response.put("message", "Admin user created successfully");
                response.put("user", savedUser);
                return ResponseEntity.ok(response);
            }

        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("error", "Admin setup failed: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
}