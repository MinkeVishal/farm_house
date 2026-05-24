package com.example.demo.service;

import com.example.demo.dto.PaymentDTO;
import com.example.demo.entity.Booking;
import com.example.demo.entity.Payment;
import com.example.demo.repository.BookingRepository;
import com.example.demo.repository.PaymentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.UUID;

@Service
public class PaymentService {
    
    @Autowired
    private PaymentRepository paymentRepository;
    
    @Autowired
    private BookingRepository bookingRepository;
    
    @Autowired
    private BookingService bookingService;
    
    /**
     * Create payment for booking
     */
    public PaymentDTO createPayment(Long bookingId, String paymentMethod) {
        Optional<Booking> bookingOptional = bookingRepository.findById(bookingId);
        if (bookingOptional.isEmpty()) {
            throw new RuntimeException("Booking not found");
        }
        
        Booking booking = bookingOptional.get();
        
        // Check if payment already exists
        Optional<Payment> existingPayment = paymentRepository.findByBooking(booking);
        if (existingPayment.isPresent()) {
            Payment payment = existingPayment.get();
            if (payment.getPaymentStatus() == Payment.PaymentStatus.SUCCESS) {
                throw new RuntimeException("Payment already completed for this booking");
            }
        }
        
        // Create new payment
        Payment payment = new Payment();
        payment.setBooking(booking);
        payment.setAmount(booking.getTotalPrice());
        payment.setPaymentMethod(paymentMethod);
        payment.setPaymentStatus(Payment.PaymentStatus.PENDING);
        payment.setTransactionId(generateTransactionId());
        
        Payment savedPayment = paymentRepository.save(payment);
        return convertToDTO(savedPayment);
    }
    
    /**
     * Process payment (simulate payment gateway)
     */
    public PaymentDTO processPayment(Long paymentId) {
        Optional<Payment> paymentOptional = paymentRepository.findById(paymentId);
        if (paymentOptional.isEmpty()) {
            throw new RuntimeException("Payment not found");
        }
        
        Payment payment = paymentOptional.get();
        
        // Simulate payment processing
        // In real application, integrate with Razorpay/Stripe
        payment.setPaymentStatus(Payment.PaymentStatus.SUCCESS);
        Payment processedPayment = paymentRepository.save(payment);
        
        // Confirm booking after successful payment
        bookingService.confirmBooking(payment.getBooking().getId());
        
        return convertToDTO(processedPayment);
    }
    
    /**
     * Get payment by ID
     */
    public PaymentDTO getPaymentById(Long paymentId) {
        Optional<Payment> payment = paymentRepository.findById(paymentId);
        if (payment.isEmpty()) {
            throw new RuntimeException("Payment not found");
        }
        return convertToDTO(payment.get());
    }
    
    /**
     * Get payment by booking
     */
    public PaymentDTO getPaymentByBooking(Long bookingId) {
        Optional<Booking> booking = bookingRepository.findById(bookingId);
        if (booking.isEmpty()) {
            throw new RuntimeException("Booking not found");
        }
        
        Optional<Payment> payment = paymentRepository.findByBooking(booking.get());
        if (payment.isEmpty()) {
            throw new RuntimeException("Payment not found for this booking");
        }
        return convertToDTO(payment.get());
    }
    
    /**
     * Get all payments
     */
    public List<PaymentDTO> getAllPayments() {
        List<Payment> payments = paymentRepository.findAll();
        return payments.stream().map(this::convertToDTO).collect(Collectors.toList());
    }
    
    /**
     * Get payments by status
     */
    public List<PaymentDTO> getPaymentsByStatus(String status) {
        List<Payment> payments = paymentRepository.findByPaymentStatus(
            Payment.PaymentStatus.valueOf(status.toUpperCase())
        );
        return payments.stream().map(this::convertToDTO).collect(Collectors.toList());
    }
    
    /**
     * Refund payment
     */
    public PaymentDTO refundPayment(Long paymentId) {
        Optional<Payment> paymentOptional = paymentRepository.findById(paymentId);
        if (paymentOptional.isEmpty()) {
            throw new RuntimeException("Payment not found");
        }
        
        Payment payment = paymentOptional.get();
        if (payment.getPaymentStatus() != Payment.PaymentStatus.SUCCESS) {
            throw new RuntimeException("Only successful payments can be refunded");
        }
        
        payment.setPaymentStatus(Payment.PaymentStatus.REFUNDED);
        Payment refundedPayment = paymentRepository.save(payment);
        
        // Cancel associated booking
        bookingService.cancelBooking(payment.getBooking().getId());
        
        return convertToDTO(refundedPayment);
    }
    
    /**
     * Generate transaction ID
     */
    private String generateTransactionId() {
        return "TXN_" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }
    
    /**
     * Convert Payment entity to DTO
     */
    private PaymentDTO convertToDTO(Payment payment) {
        PaymentDTO dto = new PaymentDTO();
        dto.setId(payment.getId());
        dto.setBookingId(payment.getBooking().getId());
        dto.setAmount(payment.getAmount());
        dto.setPaymentStatus(payment.getPaymentStatus().toString());
        dto.setTransactionId(payment.getTransactionId());
        dto.setPaymentMethod(payment.getPaymentMethod());
        return dto;
    }
}
