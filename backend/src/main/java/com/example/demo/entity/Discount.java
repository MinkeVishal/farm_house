package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "discounts")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Discount {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    /**
     * Farmhouse category this discount applies to.
     * Values: ZEN_RETREAT, POOL_PARTY, ADVENTURE_WOODS, HERITAGE_PALACE, ALL
     */
    @Column(name = "farmhouse_type", nullable = false, length = 50)
    @Enumerated(EnumType.STRING)
    private FarmhouseType farmhouseType;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "farmhouse_id", nullable = true)
    private FarmHouse farmhouse;

    @Column(name = "discount_percent", nullable = false)
    private Double discountPercent;

    @Column(name = "special_offer", columnDefinition = "TEXT")
    private String specialOffer;

    @Column(name = "valid_from")
    private LocalDate validFrom;

    @Column(name = "valid_to")
    private LocalDate validTo;

    @Column(name = "is_active", columnDefinition = "boolean default true")
    private Boolean isActive = true;

    @ManyToOne
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public enum FarmhouseType {
        ZEN_RETREAT,
        POOL_PARTY,
        ADVENTURE_WOODS,
        HERITAGE_PALACE,
        ALL
    }
}
