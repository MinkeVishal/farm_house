package com.example.demo.repository;

import com.example.demo.entity.Booking;
import com.example.demo.entity.User;
import com.example.demo.entity.FarmHouse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByUser(User user);
    List<Booking> findByFarmHouse(FarmHouse farmHouse);
    
    @Query("SELECT b FROM Booking b WHERE b.farmHouse.id = :farmHouseId " +
           "AND b.status != 'CANCELLED' " +
           "AND ((b.startDate = b.endDate AND b.startDate >= :startDate AND b.startDate <= :endDate) " +
           "OR (b.startDate < b.endDate AND NOT (b.endDate <= :startDate OR b.startDate >= :endDate)) " +
           "OR (:startDate = :endDate AND b.startDate <= :startDate AND b.endDate > :startDate)) " +
           "AND (b.timeSlot IS NULL OR b.timeSlot = :timeSlot)")
    List<Booking> findConflictingBookings(
        @Param("farmHouseId") Long farmHouseId,
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate,
        @Param("timeSlot") Booking.TimeSlot timeSlot
    );
    
    List<Booking> findByStatus(Booking.BookingStatus status);
}
