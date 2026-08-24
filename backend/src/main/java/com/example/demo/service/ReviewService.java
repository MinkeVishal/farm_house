package com.example.demo.service;

import com.example.demo.dto.CreateReviewDTO;
import com.example.demo.dto.ReviewDTO;
import com.example.demo.entity.FarmHouse;
import com.example.demo.entity.Review;
import com.example.demo.entity.User;
import com.example.demo.repository.FarmHouseRepository;
import com.example.demo.repository.ReviewRepository;
import com.example.demo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;
    private final FarmHouseRepository farmHouseRepository;

    public List<ReviewDTO> getReviewsForFarmHouse(Long farmHouseId) {
        return reviewRepository.findByFarmHouseIdOrderByCreatedAtDesc(farmHouseId)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public ReviewDTO createReview(Long userId, CreateReviewDTO createReviewDTO) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
                
        FarmHouse farmHouse = farmHouseRepository.findById(createReviewDTO.getFarmHouseId())
                .orElseThrow(() -> new RuntimeException("FarmHouse not found"));
                
        Review review = new Review();
        review.setUser(user);
        review.setFarmHouse(farmHouse);
        review.setRating(createReviewDTO.getRating());
        review.setComment(createReviewDTO.getComment());
        
        Review savedReview = reviewRepository.save(review);
        return mapToDTO(savedReview);
    }
    
    private ReviewDTO mapToDTO(Review review) {
        ReviewDTO dto = new ReviewDTO();
        dto.setId(review.getId());
        dto.setUserName(review.getUser().getName());
        dto.setUserRole(review.getUser().getRole().name());
        dto.setRating(review.getRating());
        dto.setComment(review.getComment());
        dto.setCreatedAt(review.getCreatedAt());
        return dto;
    }
}
