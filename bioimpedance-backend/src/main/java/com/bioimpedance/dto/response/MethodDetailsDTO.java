package com.bioimpedance.dto.response;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MethodDetailsDTO {
    private String title;
    private List<MethodDetailItem> items;
}