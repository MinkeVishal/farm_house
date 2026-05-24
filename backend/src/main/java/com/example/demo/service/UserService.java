package com.example.demo.service;

import com.example.demo.dto.UserDTO;
import com.example.demo.entity.User;
import com.example.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class UserService {
    
    @Autowired
    private UserRepository userRepository;
    
    /**
     * Get user by ID
     */
    public UserDTO getUserById(Long userId) {
        Optional<User> user = userRepository.findById(userId);
        if (user.isEmpty()) {
            throw new RuntimeException("User not found");
        }
        return convertToDTO(user.get());
    }
    
    /**
     * Get user by email
     */
    public UserDTO getUserByEmail(String email) {
        Optional<User> user = userRepository.findByEmail(email);
        if (user.isEmpty()) {
            throw new RuntimeException("User not found");
        }
        return convertToDTO(user.get());
    }
    
    /**
     * Get all users by role
     */
    public List<UserDTO> getUsersByRole(String role) {
        List<User> users = userRepository.findByRole(User.Role.valueOf(role.toUpperCase()));
        return users.stream().map(this::convertToDTO).collect(Collectors.toList());
    }
    
    /**
     * Get all users
     */
    public List<UserDTO> getAllUsers() {
        List<User> users = userRepository.findAll();
        return users.stream().map(this::convertToDTO).collect(Collectors.toList());
    }
    
    /**
     * Update user
     */
    public UserDTO updateUser(Long userId, UserDTO userDTO) {
        Optional<User> userOptional = userRepository.findById(userId);
        if (userOptional.isEmpty()) {
            throw new RuntimeException("User not found");
        }
        
        User user = userOptional.get();
        if (userDTO.getName() != null) {
            user.setName(userDTO.getName());
        }
        if (userDTO.getPhone() != null) {
            user.setPhone(userDTO.getPhone());
        }
        
        User updatedUser = userRepository.save(user);
        return convertToDTO(updatedUser);
    }
    
    /**
     * Delete user
     */
    public void deleteUser(Long userId) {
        userRepository.deleteById(userId);
    }
    
    /**
     * Get total users count
     */
    public long getTotalUsersCount() {
        return userRepository.count();
    }
    
    /**
     * Get count of users by role
     */
    public long getUserCountByRole(String role) {
        return userRepository.findByRole(User.Role.valueOf(role.toUpperCase())).size();
    }
    
    /**
     * Convert User entity to UserDTO
     */
    private UserDTO convertToDTO(User user) {
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setName(user.getName());
        dto.setEmail(user.getEmail());
        dto.setPhone(user.getPhone());
        dto.setRole(user.getRole().toString());
        dto.setIsBlocked(user.getIsBlocked());
        dto.setIsVerified(user.getIsVerified());
        return dto;
    }
}
