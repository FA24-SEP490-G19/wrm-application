package com.wrm.application.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CreatePaymentLinkDTO {

    @JsonProperty("invoice_id")
    @NotNull(message = "Invoice ID cannot be null")
    private Long invoiceId;

    @JsonProperty("rental_id")
    @NotNull(message = "Rental ID cannot be null")
    private Long rentalId;

    @JsonProperty("product_name")
    @NotBlank(message = "Product name cannot be blank")
    private String productName;

    @JsonProperty("description")
    private String description;

    @JsonProperty("return_url")
    @NotBlank(message = "Return URL cannot be blank")
    private String returnUrl;

    @JsonProperty("cancel_url")
    @NotBlank(message = "Cancel URL cannot be blank")
    private String cancelUrl;

    @JsonProperty("total_amount")
    @Positive(message = "Total amount must be greater than 0")
    private Double totalAmount;

    @JsonProperty("issued_date")
    private LocalDateTime issuedDate;
}
