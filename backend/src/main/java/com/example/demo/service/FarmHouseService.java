package com.example.demo.service;

import com.example.demo.dto.FarmHouseDTO;
import com.example.demo.entity.FarmHouse;
import com.example.demo.entity.User;
import com.example.demo.repository.FarmHouseRepository;
import com.example.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class FarmHouseService {
    
    @Autowired
    private FarmHouseRepository farmHouseRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    /**
     * Add new farm house (Owner only)
     */
    public FarmHouseDTO addFarmHouse(FarmHouseDTO dto, Long ownerId) {
        Optional<User> ownerOptional = userRepository.findById(ownerId);
        if (ownerOptional.isEmpty()) {
            throw new RuntimeException("Owner not found");
        }
        
        User owner = ownerOptional.get();
        if (owner.getRole() != User.Role.OWNER && owner.getRole() != User.Role.ADMIN && owner.getRole() != User.Role.SUPERADMIN) {
            throw new RuntimeException("Only owners can add farm houses");
        }
        
        FarmHouse farmHouse = new FarmHouse();
        farmHouse.setName(dto.getName());
        farmHouse.setLocation(dto.getLocation());
        farmHouse.setDescription(dto.getDescription());
        farmHouse.setPricePerDay(dto.getPricePerDay());
        farmHouse.setOwner(owner);
        farmHouse.setMaxGuests(dto.getMaxGuests());
        farmHouse.setBedrooms(dto.getBedrooms());
        farmHouse.setBathrooms(dto.getBathrooms());
        farmHouse.setAmenities(dto.getAmenities());
        farmHouse.setImageUrl(dto.getImageUrl());
        farmHouse.setImageUrls(dto.getImageUrls());
        farmHouse.setAvailable(true);
        farmHouse.setIsApproved(false);
        
        FarmHouse savedFarmHouse = farmHouseRepository.save(farmHouse);
        return convertToDTO(savedFarmHouse);
    }
    
    /**
     * Get farm house by ID
     */
    public FarmHouseDTO getFarmHouseById(Long id) {
        Optional<FarmHouse> farmHouse = farmHouseRepository.findById(id);
        if (farmHouse.isEmpty()) {
            throw new RuntimeException("Farm house not found");
        }
        return convertToDTO(farmHouse.get());
    }
    
    /**
     * Get all approved farm houses - paginated
     */
    public Page<FarmHouseDTO> getAllApprovedFarmHouses(Pageable pageable) {
        Page<FarmHouse> farmHouses = farmHouseRepository.findByIsApprovedTrue(pageable);
        return farmHouses.map(this::convertToDTO);
    }
    
    /**
     * Get all farm houses (both approved and unapproved) - paginated
     */
    public Page<FarmHouseDTO> getAllFarmHouses(Pageable pageable) {
        Page<FarmHouse> farmHouses = farmHouseRepository.findAll(pageable);
        return farmHouses.map(this::convertToDTO);
    }
    
    /**
     * Get farm houses by owner
     */
    public List<FarmHouseDTO> getFarmHousesByOwner(Long ownerId) {
        Optional<User> owner = userRepository.findById(ownerId);
        if (owner.isEmpty()) {
            throw new RuntimeException("Owner not found");
        }
        
        List<FarmHouse> farmHouses = farmHouseRepository.findByOwner(owner.get());
        return farmHouses.stream().map(this::convertToDTO).collect(Collectors.toList());
    }
    
    /**
     * Search farm houses by location
     */
    public Page<FarmHouseDTO> searchByLocation(String location, Pageable pageable) {
        Page<FarmHouse> farmHouses = farmHouseRepository.searchByLocation(location, pageable);
        return farmHouses.map(this::convertToDTO);
    }
    
    /**
     * Search farm houses by price range
     */
    public Page<FarmHouseDTO> searchByPriceRange(Double minPrice, Double maxPrice, Pageable pageable) {
        Page<FarmHouse> farmHouses = farmHouseRepository.searchByPriceRange(minPrice, maxPrice, pageable);
        return farmHouses.map(this::convertToDTO);
    }
    
    /**
     * Update farm house
     */
    public FarmHouseDTO updateFarmHouse(Long id, FarmHouseDTO dto, Long requesterId) {
        Optional<FarmHouse> farmHouseOptional = farmHouseRepository.findById(id);
        if (farmHouseOptional.isEmpty()) {
            throw new RuntimeException("Farm house not found");
        }

        Optional<User> requesterOptional = userRepository.findById(requesterId);
        if (requesterOptional.isEmpty()) {
            throw new RuntimeException("Requester not found");
        }

        User requester = requesterOptional.get();
        FarmHouse farmHouse = farmHouseOptional.get();

        if (requester.getRole() == User.Role.OWNER) {
            if (!farmHouse.getOwner().getId().equals(requesterId)) {
                throw new RuntimeException("Only the farmhouse owner or admin can update this farmhouse");
            }
        } else if (requester.getRole() != User.Role.ADMIN && requester.getRole() != User.Role.SUPERADMIN) {
            throw new RuntimeException("Only owners or admins can update farm houses");
        }

        if (dto.getName() != null) farmHouse.setName(dto.getName());
        if (dto.getLocation() != null) farmHouse.setLocation(dto.getLocation());
        if (dto.getDescription() != null) farmHouse.setDescription(dto.getDescription());
        if (dto.getPricePerDay() != null) farmHouse.setPricePerDay(dto.getPricePerDay());
        if (dto.getMaxGuests() != null) farmHouse.setMaxGuests(dto.getMaxGuests());
        if (dto.getBedrooms() != null) farmHouse.setBedrooms(dto.getBedrooms());
        if (dto.getBathrooms() != null) farmHouse.setBathrooms(dto.getBathrooms());
        if (dto.getAmenities() != null) farmHouse.setAmenities(dto.getAmenities());
        if (dto.getImageUrl() != null) farmHouse.setImageUrl(dto.getImageUrl());
        if (dto.getImageUrls() != null) farmHouse.setImageUrls(dto.getImageUrls());

        FarmHouse updatedFarmHouse = farmHouseRepository.save(farmHouse);
        return convertToDTO(updatedFarmHouse);
    }
    
    /**
     * Delete farm house
     */
    public void deleteFarmHouse(Long id, Long requesterId) {
        Optional<FarmHouse> farmHouseOptional = farmHouseRepository.findById(id);
        if (farmHouseOptional.isEmpty()) {
            throw new RuntimeException("Farm house not found");
        }

        Optional<User> requesterOptional = userRepository.findById(requesterId);
        if (requesterOptional.isEmpty()) {
            throw new RuntimeException("Requester not found");
        }

        User requester = requesterOptional.get();
        FarmHouse farmHouse = farmHouseOptional.get();

        if (requester.getRole() == User.Role.OWNER) {
            if (!farmHouse.getOwner().getId().equals(requesterId)) {
                throw new RuntimeException("Only the farmhouse owner or admin can delete this farmhouse");
            }
        } else if (requester.getRole() != User.Role.ADMIN && requester.getRole() != User.Role.SUPERADMIN) {
            throw new RuntimeException("Only owners or admins can delete farm houses");
        }

        farmHouseRepository.deleteById(id);
    }
    
    /**
     * Approve farm house (Admin only)
     */
    public FarmHouseDTO approveFarmHouse(Long id) {
        Optional<FarmHouse> farmHouseOptional = farmHouseRepository.findById(id);
        if (farmHouseOptional.isEmpty()) {
            throw new RuntimeException("Farm house not found");
        }
        
        FarmHouse farmHouse = farmHouseOptional.get();
        farmHouse.setIsApproved(true);
        FarmHouse updatedFarmHouse = farmHouseRepository.save(farmHouse);
        return convertToDTO(updatedFarmHouse);
    }
    
    /**
     * Convert FarmHouse entity to DTO
     */
    private FarmHouseDTO convertToDTO(FarmHouse farmHouse) {
        FarmHouseDTO dto = new FarmHouseDTO();
        dto.setId(farmHouse.getId());
        dto.setName(farmHouse.getName());
        dto.setLocation(farmHouse.getLocation());
        dto.setDescription(farmHouse.getDescription());
        dto.setPricePerDay(farmHouse.getPricePerDay());
        dto.setOwnerName(farmHouse.getOwner().getName());
        dto.setOwnerId(farmHouse.getOwner().getId());
        dto.setAvailable(farmHouse.getAvailable());
        dto.setIsApproved(farmHouse.getIsApproved());
        dto.setMaxGuests(farmHouse.getMaxGuests());
        dto.setBedrooms(farmHouse.getBedrooms());
        dto.setBathrooms(farmHouse.getBathrooms());
        dto.setAmenities(farmHouse.getAmenities());
        dto.setImageUrl(farmHouse.getImageUrl());
        dto.setImageUrls(farmHouse.getImageUrls());
        return dto;
    }
}
