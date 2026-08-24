package com.example.demo.dto;

import lombok.Data;

@Data
public class CreateReviewDTO {
    private Long farmHouseId;
    private Integer rating;
    private String comment;
}
