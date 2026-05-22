package com.bioimpedance.dto.request;

import com.bioimpedance.constants.Gender;
import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClientRequestDTO {

    @NotBlank(message = "Nome é obrigatório")
    @Size(min = 3, max = 100)
    private String name;

    @NotBlank(message = "Email é obrigatório")
    @Email(message = "Email inválido")
    private String email;

    private String phone;

    @NotNull(message = "Sexo é obrigatório")
    private Gender gender;

    @NotNull(message = "Data de nascimento é obrigatória")
    private LocalDate birthDate;

    private String goal;
    private String notes;
}