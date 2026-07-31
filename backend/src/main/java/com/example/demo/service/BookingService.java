package com.example.demo.service;

import com.example.demo.dto.BookingDTO;
import com.example.demo.entity.Booking;
import com.example.demo.entity.FarmHouse;
import com.example.demo.entity.User;
import com.example.demo.repository.BookingRepository;
import com.example.demo.repository.FarmHouseRepository;
import com.example.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import com.example.demo.service.EmailService;

@Service
public class BookingService {
    
    @Autowired
    private BookingRepository bookingRepository;
    
    @Autowired
    private FarmHouseRepository farmHouseRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private EmailService emailService;
    
    /**
     * Create a new booking
     */
    public BookingDTO createBooking(BookingDTO dto, Long userId) {
        // Validate user
        Optional<User> userOptional = userRepository.findById(userId);
        if (userOptional.isEmpty()) {
            throw new RuntimeException("User not found");
        }
        
        // Validate farm house
        Optional<FarmHouse> farmHouseOptional = farmHouseRepository.findById(dto.getFarmHouseId());
        if (farmHouseOptional.isEmpty()) {
            throw new RuntimeException("Farm house not found");
        }
        
        FarmHouse farmHouse = farmHouseOptional.get();
        
        // Check availability
        if (!farmHouse.getAvailable()) {
            throw new RuntimeException("Farm house is not available");
        }
        
        // Check approval status
        if (farmHouse.getIsApproved() == null || !farmHouse.getIsApproved()) {
            throw new RuntimeException("Farm house is not approved by admin");
        }
        
        // Check date conflicts
        List<Booking> conflicts = bookingRepository.findConflictingBookings(
            dto.getFarmHouseId(),
            dto.getStartDate(),
            dto.getEndDate()
        );
        
        if (!conflicts.isEmpty()) {
            throw new RuntimeException("Farm house is already booked for these dates");
        }
        
        // Validate dates
        if (dto.getStartDate().isBefore(LocalDate.now())) {
            throw new RuntimeException("Start date cannot be in the past");
        }
        
        if (dto.getEndDate().isBefore(dto.getStartDate())) {
            throw new RuntimeException("End date must be after start date");
        }
        
        // Calculate total price
        long numberOfDays = ChronoUnit.DAYS.between(dto.getStartDate(), dto.getEndDate());
        double totalPrice = numberOfDays * farmHouse.getPricePerDay();
        
        // Create booking
        Booking booking = new Booking();
        booking.setUser(userOptional.get());
        booking.setFarmHouse(farmHouse);
        booking.setStartDate(dto.getStartDate());
        booking.setEndDate(dto.getEndDate());
        booking.setTotalPrice(totalPrice);
        booking.setNumberOfGuests(dto.getNumberOfGuests());
        booking.setSpecialRequirements(dto.getSpecialRequirements());
        booking.setStatus(Booking.BookingStatus.PENDING);
        
        Booking savedBooking = bookingRepository.save(booking);
        try {
            emailService.sendBookingConfirmationEmail(userOptional.get(), savedBooking);
        } catch (Exception e) {
            System.err.println("Failed to send booking confirmation email: " + e.getMessage());
        }
        return convertToDTO(savedBooking);
    }
    
    /**
     * Get booking by ID
     */
    public BookingDTO getBookingById(Long bookingId) {
        Optional<Booking> booking = bookingRepository.findById(bookingId);
        if (booking.isEmpty()) {
            throw new RuntimeException("Booking not found");
        }
        return convertToDTO(booking.get());
    }
    
    /**
     * Get bookings by user
     */
    public List<BookingDTO> getBookingsByUser(Long userId) {
        Optional<User> user = userRepository.findById(userId);
        if (user.isEmpty()) {
            throw new RuntimeException("User not found");
        }
        
        List<Booking> bookings = bookingRepository.findByUser(user.get());
        return bookings.stream().map(this::convertToDTO).collect(Collectors.toList());
    }
    
    /**
     * Get bookings by farm house
     */
    public List<BookingDTO> getBookingsByFarmHouse(Long farmHouseId) {
        Optional<FarmHouse> farmHouse = farmHouseRepository.findById(farmHouseId);
        if (farmHouse.isEmpty()) {
            throw new RuntimeException("Farm house not found");
        }
        
        List<Booking> bookings = bookingRepository.findByFarmHouse(farmHouse.get());
        return bookings.stream().map(this::convertToDTO).collect(Collectors.toList());
    }
    
    /**
     * Get all bookings
     */
    public List<BookingDTO> getAllBookings() {
        List<Booking> bookings = bookingRepository.findAll();
        return bookings.stream().map(this::convertToDTO).collect(Collectors.toList());
    }
    
    /**
     * Confirm booking (after payment)
     */
    public BookingDTO confirmBooking(Long bookingId) {
        Optional<Booking> bookingOptional = bookingRepository.findById(bookingId);
        if (bookingOptional.isEmpty()) {
            throw new RuntimeException("Booking not found");
        }
        
        Booking booking = bookingOptional.get();
        booking.setStatus(Booking.BookingStatus.CONFIRMED);
        Booking updatedBooking = bookingRepository.save(booking);
        return convertToDTO(updatedBooking);
    }
    
    /**
     * Cancel booking
     */
    public BookingDTO cancelBooking(Long bookingId) {
        Optional<Booking> bookingOptional = bookingRepository.findById(bookingId);
        if (bookingOptional.isEmpty()) {
            throw new RuntimeException("Booking not found");
        }
        
        Booking booking = bookingOptional.get();
        if (booking.getStatus() == Booking.BookingStatus.CANCELLED) {
            throw new RuntimeException("Booking is already cancelled");
        }
        
        booking.setStatus(Booking.BookingStatus.CANCELLED);
        Booking cancelledBooking = bookingRepository.save(booking);
        return convertToDTO(cancelledBooking);
    }
    
    /**
     * Check availability for date range
     */
    public boolean isAvailable(Long farmHouseId, LocalDate startDate, LocalDate endDate) {
        List<Booking> conflicts = bookingRepository.findConflictingBookings(
            farmHouseId, startDate, endDate
        );
        return conflicts.isEmpty();
    }
    
    /**
     * Convert Booking entity to DTO
     */
    private BookingDTO convertToDTO(Booking booking) {
        BookingDTO dto = new BookingDTO();
        dto.setId(booking.getId());
        dto.setUserId(booking.getUser().getId());
        dto.setUserName(booking.getUser().getName());
        dto.setFarmHouseId(booking.getFarmHouse().getId());
        dto.setFarmHouseName(booking.getFarmHouse().getName());
        dto.setStartDate(booking.getStartDate());
        dto.setEndDate(booking.getEndDate());
        dto.setTotalPrice(booking.getTotalPrice());
        dto.setNumberOfGuests(booking.getNumberOfGuests());
        dto.setSpecialRequirements(booking.getSpecialRequirements());
        dto.setStatus(booking.getStatus().toString());
        return dto;
    }
}
