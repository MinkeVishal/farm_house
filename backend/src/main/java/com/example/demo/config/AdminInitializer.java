package com.example.demo.config;

import com.example.demo.entity.User;
import com.example.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import java.time.LocalDateTime;

@Configuration
public class AdminInitializer {
    
    @Autowired
    private UserRepository userRepository;
    
    // Temporarily disabled - database schema needs to be reset first
    // Run these SQL commands in MySQL manually:
    // DROP TABLE IF EXISTS farmhouse.users;
    // DROP TABLE IF EXISTS farmhouse.bookings;
    // DROP TABLE IF EXISTS farmhouse.farm_houses;
    // DROP TABLE IF EXISTS farmhouse.payments;
    // Then uncomment @Bean below
    
    @Bean
    public ApplicationRunner initializeAdminAccounts() {
        return args -> {
            try {
                // Check and create SUPERADMIN account
                if (!userRepository.existsByEmail("superadmin@farmhouse.com")) {
                    User superadmin = new User();
                    superadmin.setName("Super Administrator");
                    superadmin.setEmail("superadmin@farmhouse.com");
                    superadmin.setPassword(new BCryptPasswordEncoder().encode("SuperAdmin@123"));
                    superadmin.setPhone("9999999999");
                    superadmin.setRole(User.Role.SUPERADMIN);
                    superadmin.setIsVerified(true);
                    superadmin.setIsBlocked(false);
                    superadmin.setCreatedAt(LocalDateTime.now());
                    superadmin.setUpdatedAt(LocalDateTime.now());
                    userRepository.save(superadmin);
                    System.out.println("✓ SUPERADMIN account created: superadmin@farmhouse.com / SuperAdmin@123");
                } else {
                    System.out.println("✓ SUPERADMIN account already exists");
                }
            } catch (Exception e) {
                System.err.println("✗ Failed to create SUPERADMIN account: " + e.getMessage());
            }
            
            try {
                // Check and create ADMIN account
                if (!userRepository.existsByEmail("admin@farmhouse.com")) {
                    User admin = new User();
                    admin.setName("Administrator");
                    admin.setEmail("admin@farmhouse.com");
                    admin.setPassword(new BCryptPasswordEncoder().encode("Admin@123"));
                    admin.setPhone("8888888888");
                    admin.setRole(User.Role.ADMIN);
                    admin.setIsVerified(true);
                    admin.setIsBlocked(false);
                    admin.setCreatedAt(LocalDateTime.now());
                    admin.setUpdatedAt(LocalDateTime.now());
                    userRepository.save(admin);
                    System.out.println("✓ ADMIN account created: admin@farmhouse.com / Admin@123");
                } else {
                    System.out.println("✓ ADMIN account already exists");
                }
            } catch (Exception e) {
                System.err.println("✗ Failed to create ADMIN account: " + e.getMessage());
            }
        };
    }
}
