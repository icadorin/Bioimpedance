package com.bioimpedance.dto.response;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MethodDetailItem {
    private String label;
    private String value;
    private String description;
}