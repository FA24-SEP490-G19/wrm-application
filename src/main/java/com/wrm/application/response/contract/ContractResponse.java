package com.wrm.application.response.contract;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ContractResponse {
    private Long id;

    @JsonProperty("rental_id")
    private Long rentalId;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime signedDate;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime expiryDate;

//    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
//    private LocalDateTime createdDate;
//
//    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
//    private LocalDateTime lastModifiedDate;

    @JsonProperty("contract_images")
    private List<String> contractImageLinks;

    private String warehouseName;
    private String warehouseAddress;

    private String lotDescription;
//
//    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
//    private LocalDateTime rentalStartDate;
//
//    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
//    private LocalDateTime rentalEndDate;

    private String additionalService;

    private String customerFullName;
    private String customerGender;
    private String customerPhoneNumber;
    private String customerAddress;

    private String saleFullName;
    private String saleGender;
    private String salePhoneNumber;
    private String saleAddress;
}
