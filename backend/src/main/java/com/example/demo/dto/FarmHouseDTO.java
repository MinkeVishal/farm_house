package com.example.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FarmHouseDTO {
    private Long id;
    private String name;
    private String location;
    private String description;
    private Double pricePerDay;
    private String ownerName;
    private Long ownerId;
    private Boolean available;
    private Boolean isApproved;
    private Integer maxGuests;
    private Integer bedrooms;
    private Integer bathrooms;
    private String amenities;
    private String imageUrl;
}
