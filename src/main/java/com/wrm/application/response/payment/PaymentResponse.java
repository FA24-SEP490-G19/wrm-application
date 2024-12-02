package com.wrm.application.response.payment;

import com.wrm.application.model.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentResponse {
    private String orderInfo;
    private String paymentTime;
    private String transactionId;
    private String amount;
    private String status;
    private String url;
    private User user ;
}