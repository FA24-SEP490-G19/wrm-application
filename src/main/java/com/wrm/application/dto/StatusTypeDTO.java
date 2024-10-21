package com.wrm.application.dto;

import lombok.Builder;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

import lombok.*;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class StatusTypeDTO {
    private Long id;
    private String content;
}
