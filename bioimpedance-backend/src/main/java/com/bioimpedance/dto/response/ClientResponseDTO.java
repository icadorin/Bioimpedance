package com.bioimpedance.dto.response;

import com.bioimpedance.constants.ClientStatus;
import com.bioimpedance.constants.Gender;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClientResponseDTO {
    private String id;
    private String name;
    private String email;
    private String phone;
    private Gender gender;
    private LocalDate birthDate;
    private String goal;
    private String notes;
    private ClientStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}