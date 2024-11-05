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

    @JsonProperty("contract_img_link")
    private List<String> contractImageLinks;

    @JsonProperty("contract_id")
    private Long contractId;

}
