package com.wrm.application.dto;

import lombok.*;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ContractImageDTO {
    private Long id;
    private String contractImgLink;
    private Long contractId;
}
