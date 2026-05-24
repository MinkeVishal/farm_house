package com.example.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserRegistrationDTO {
    private String name;
    private String email;
    private String password;
    private String phone;
    private String role; // OWNER or CUSTOMER
}
