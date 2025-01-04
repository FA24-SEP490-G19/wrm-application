package com.wrm.application.response.payment;

import com.wrm.application.model.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentResponse {
    private Long id;

    private LocalDateTime createdDate;

    private String orderInfo;

    private LocalDateTime paymentTime;

    private String transactionId;

    private String amount;

    private String status;

    private User user ;
}