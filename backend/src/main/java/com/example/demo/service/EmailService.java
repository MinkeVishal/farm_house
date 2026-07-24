package com.example.demo.service;

import com.example.demo.entity.Booking;
import com.example.demo.entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    public void sendBookingConfirmationEmail(User user, Booking booking) {
        if (user.getEmail() == null || user.getEmail().isBlank()) {
            return;
        }

        SimpleMailMessage mailMessage = new SimpleMailMessage();
        mailMessage.setTo(user.getEmail());
        mailMessage.setSubject("FarmHouse Booking Confirmation");
        mailMessage.setText(buildBookingMessage(user, booking));

        mailSender.send(mailMessage);
    }

    private String buildBookingMessage(User user, Booking booking) {
        return String.format(
                "Hello %s,\n\n" +
                "Thank you for booking with FarmHouse. Your booking has been created and is currently pending confirmation.\n\n" +
                "Booking details:\n" +
                "FarmHouse: %s\n" +
                "Check-in: %s\n" +
                "Check-out: %s\n" +
                "Guests: %s\n" +
                "Total price: ₹%.2f\n\n" +
                "If you need to change or cancel your booking, please log in to your account.\n\n" +
                "Warm regards,\n" +
                "FarmHouse Booking Team",
                user.getName(),
                booking.getFarmHouse().getName(),
                booking.getStartDate(),
                booking.getEndDate(),
                booking.getNumberOfGuests() == null ? "N/A" : booking.getNumberOfGuests(),
                booking.getTotalPrice()
        );
    }
}
