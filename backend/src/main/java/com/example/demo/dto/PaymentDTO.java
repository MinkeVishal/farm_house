package com.example.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentDTO {
    private Long id;
    private Long bookingId;
    private Double amount;
    private String paymentStatus;
    private String transactionId;
    private String paymentMethod;
}
