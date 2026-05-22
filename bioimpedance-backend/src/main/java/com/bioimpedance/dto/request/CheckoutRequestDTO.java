package com.bioimpedance.dto.request;

import com.bioimpedance.constants.Plan;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CheckoutRequestDTO {

    @NotNull
    private Plan plan;

    @Email
    private String email;
}
