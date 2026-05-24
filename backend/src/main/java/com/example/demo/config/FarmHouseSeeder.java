package com.example.demo.config;

import com.example.demo.entity.FarmHouse;
import com.example.demo.entity.User;
import com.example.demo.repository.FarmHouseRepository;
import com.example.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import java.time.LocalDateTime;
import java.util.Arrays;

@Configuration
public class FarmHouseSeeder {
    
    @Autowired
    private FarmHouseRepository farmHouseRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Bean
    public ApplicationRunner seedFarmHouses() {
        return args -> {
            try {
                // Check if sample farmhouses already exist
                if (farmHouseRepository.count() == 0) {
                    // Get or create a default owner
                    User owner = userRepository.findByEmail("admin@farmhouse.com")
                            .orElse(null);
                    
                    if (owner != null) {
                        // Create sample farmhouses
                        FarmHouse[] sampleFarmHouses = {
                            createFarmHouse(
                                "Luxury Mountain Villa",
                                "Himachal Pradesh",
                                "Stunning mountain retreat with panoramic views, perfect for family vacations",
                                5000,
                                6,
                                "/farmhouse images/1.jpeg",
                                Arrays.asList("WiFi", "Pool", "Gym", "Kitchen", "Parking"),
                                owner
                            ),
                            createFarmHouse(
                                "Cozy Countryside Cottage",
                                "Goa",
                                "Charming cottage nestled in the countryside, ideal for peaceful getaways",
                                3500,
                                4,
                                "/farmhouse images/2.1.jpeg",
                                Arrays.asList("WiFi", "Garden", "BBQ", "Kitchen", "Bonfire"),
                                owner
                            ),
                            createFarmHouse(
                                "Modern Farm Estate",
                                "Punjab",
                                "Contemporary farmhouse with modern amenities, great for large groups",
                                6000,
                                10,
                                "/farmhouse images/3.jpeg",
                                Arrays.asList("WiFi", "Pool", "Spa", "Kitchen", "Entertainment"),
                                owner
                            ),
                            createFarmHouse(
                                "Riverside Farmhouse",
                                "Uttarakhand",
                                "Beautiful farmhouse by the riverside with adventure activities",
                                4500,
                                8,
                                "/farmhouse images/1.1.jpeg",
                                Arrays.asList("WiFi", "River Access", "Hiking", "Kitchen", "Fire Pit"),
                                owner
                            ),
                            createFarmHouse(
                                "Heritage Farm Resort",
                                "Rajasthan",
                                "Traditional farmhouse preserving local architecture and culture",
                                4000,
                                6,
                                "/farmhouse images/2.2.jpeg",
                                Arrays.asList("WiFi", "Garden", "Traditional Decor", "Kitchen", "Cultural Events"),
                                owner
                            )
                        };
                        
                        for (FarmHouse farmHouse : sampleFarmHouses) {
                            farmHouseRepository.save(farmHouse);
                        }
                        
                        System.out.println("✓ " + sampleFarmHouses.length + " sample farmhouses created!");
                    }
                } else {
                    System.out.println("✓ Farmhouses already exist, skipping seeding");
                }
            } catch (Exception e) {
                System.err.println("✗ Error seeding farmhouses: " + e.getMessage());
            }
        };
    }
    
    private FarmHouse createFarmHouse(String name, String location, String description,
                                     float pricePerDay, int maxGuests, String imageUrl,
                                     java.util.List<String> amenities, User owner) {
        FarmHouse farmHouse = new FarmHouse();
        farmHouse.setName(name);
        farmHouse.setLocation(location);
        farmHouse.setDescription(description);
        farmHouse.setPricePerDay((double) pricePerDay);
        farmHouse.setMaxGuests(maxGuests);
        farmHouse.setImageUrl(imageUrl);
        farmHouse.setBedrooms(maxGuests / 2);
        farmHouse.setBathrooms((maxGuests / 2) + 1);
        farmHouse.setAmenities(String.join(",", amenities));
        farmHouse.setOwner(owner);
        farmHouse.setIsApproved(true); // Auto-approve for display
        farmHouse.setAvailable(true);
        farmHouse.setCreatedAt(LocalDateTime.now());
        farmHouse.setUpdatedAt(LocalDateTime.now());
        return farmHouse;
    }
}
