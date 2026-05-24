package com.example.demo.repository;

import com.example.demo.entity.FarmHouse;
import com.example.demo.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

@Repository
public interface FarmHouseRepository extends JpaRepository<FarmHouse, Long> {
    List<FarmHouse> findByOwner(User owner);
    List<FarmHouse> findByIsApprovedTrue();
    Page<FarmHouse> findByIsApprovedTrue(Pageable pageable);
    
    @Query("SELECT f FROM FarmHouse f WHERE f.isApproved = true " +
           "AND (LOWER(f.location) LIKE LOWER(CONCAT('%', :location, '%')) " +
           "OR LOWER(f.name) LIKE LOWER(CONCAT('%', :location, '%')))")
    Page<FarmHouse> searchByLocation(@Param("location") String location, Pageable pageable);
    
    @Query("SELECT f FROM FarmHouse f WHERE f.isApproved = true " +
           "AND f.pricePerDay BETWEEN :minPrice AND :maxPrice")
    Page<FarmHouse> searchByPriceRange(@Param("minPrice") Double minPrice, 
                                       @Param("maxPrice") Double maxPrice, Pageable pageable);
}
