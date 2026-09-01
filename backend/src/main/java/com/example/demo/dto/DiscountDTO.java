package com.example.demo.dto;

import com.example.demo.entity.Discount.FarmhouseType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DiscountDTO {
    private Long id;
    private String title;
    private String description;
    private FarmhouseType farmhouseType;
    private Long farmhouseId;
    private String farmhouseName;
    private Double discountPercent;
    private String specialOffer;
    private LocalDate validFrom;
    private LocalDate validTo;
    private Boolean isActive;
    private Long createdById;
    private String createdByName;
    private String createdByRole;
}
