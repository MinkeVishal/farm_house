package com.example.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BookingDTO {
    private Long id;
    private Long userId;
    private String userName;
    private Long farmHouseId;
    private String farmHouseName;
    private LocalDate startDate;
    private LocalDate endDate;
    private Double totalPrice;
    private Integer numberOfGuests;
    private String specialRequirements;
    private String status;
}
