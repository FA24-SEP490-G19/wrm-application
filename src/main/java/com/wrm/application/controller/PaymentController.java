package com.wrm.application.controller;

import com.wrm.application.model.QrRequest;
import com.wrm.application.service.impl.PayOSPaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import vn.payos.type.CheckoutResponseData;

@RestController
@RequestMapping("/warehouses")  // This is the correct way
public class PaymentController {
    private final PayOSPaymentService payOSPaymentService;

    @Autowired
    public PaymentController(PayOSPaymentService payOSPaymentService) {
        this.payOSPaymentService = payOSPaymentService;
    }

    @PostMapping("/payment-requests")
    public CheckoutResponseData initiatePayment(@RequestBody QrRequest qrRequest) throws Exception {
        return payOSPaymentService.createPaymentRequest(qrRequest) ;
    }
}