package com.wrm.application.response.contract;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.wrm.application.dto.ContractImageDTO;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ContractDetailResponse {
    private Long id;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime signedDate;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime expiryDate;

    @JsonProperty("contract_images")
    private List<String> contractImageLinks;



    private String warehouseName;
    private String warehouseAddress;
    private String lotDescription;
    private String additionalService;

    private String customerFullName;
    private String customerPhoneNumber;
    private String customerAddress;

    private String saleFullName;
    private String salePhoneNumber;

}
