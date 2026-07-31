package com.example.demo.service;

import com.example.demo.dto.FarmHouseDTO;
import com.example.demo.entity.FarmHouse;
import com.example.demo.entity.User;
import com.example.demo.repository.FarmHouseRepository;
import com.example.demo.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class FarmHouseServiceTest {

    @Mock
    private FarmHouseRepository farmHouseRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private FarmHouseService farmHouseService;

    @Test
    void addFarmHouse_shouldBePendingApprovalByDefault() {
        ReflectionTestUtils.setField(farmHouseService, "farmHouseRepository", farmHouseRepository);
        ReflectionTestUtils.setField(farmHouseService, "userRepository", userRepository);

        User owner = new User();
        owner.setId(1L);
        owner.setRole(User.Role.OWNER);

        FarmHouseDTO dto = new FarmHouseDTO();
        dto.setName("Test Estate");
        dto.setLocation("Goa");
        dto.setDescription("A test farmhouse");
        dto.setPricePerDay(2500.0);
        dto.setMaxGuests(8);
        dto.setBedrooms(3);
        dto.setBathrooms(2);
        dto.setAmenities("WiFi,Pool");
        dto.setImageUrl("https://example.com/estate.jpg");

        when(userRepository.findById(1L)).thenReturn(Optional.of(owner));
        when(farmHouseRepository.save(any(FarmHouse.class))).thenAnswer(invocation -> invocation.getArgument(0));

        farmHouseService.addFarmHouse(dto, 1L);

        ArgumentCaptor<FarmHouse> captor = ArgumentCaptor.forClass(FarmHouse.class);
        verify(farmHouseRepository).save(captor.capture());

        assertFalse(captor.getValue().getIsApproved());
    }
}
