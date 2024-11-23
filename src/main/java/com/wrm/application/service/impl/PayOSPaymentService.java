package com.wrm.application.service.impl;

import com.wrm.application.model.QrRequest;
import org.springframework.stereotype.Service;
import vn.payos.PayOS;
import vn.payos.type.CheckoutResponseData;
import vn.payos.type.PaymentData;
@Service
public class PayOSPaymentService {
    public CheckoutResponseData createPaymentRequest(QrRequest qrRequest) throws Exception {
        PayOS payOS = new PayOS("f6ae0e42-d744-4e40-a33b-d95056a4dad4","984264ca-be6d-46b6-af3b-672d4f2c05b3","fc8bf4998b3096978f0b62350460d1809e46f46cf0a027cd8505a3d246ee66bd") ;
        PaymentData paymentData = PaymentData.builder()
                .orderCode(qrRequest.getOrderCode())
                .amount(qrRequest.getAmount())
                .description(qrRequest.getDescription())
                .cancelUrl(qrRequest.getCancelUrl())
                .returnUrl(qrRequest.getCancelUrl())
                .expiredAt(qrRequest.getExpiredAt())
                .build();

        return payOS.createPaymentLink(paymentData) ;
    }
}