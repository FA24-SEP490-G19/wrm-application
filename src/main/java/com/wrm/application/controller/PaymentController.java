package com.wrm.application.controller;

import com.wrm.application.dto.CreatePaymentLinkDTO;
import com.wrm.application.service.impl.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import vn.payos.type.Webhook;

@RestController
@RequestMapping("/payment")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/create")
    public ResponseEntity<?> createPaymentLink(@RequestBody @Valid CreatePaymentLinkDTO dto) {
        try {
            String checkoutUrl = String.valueOf(paymentService.createPaymentLink(dto));
            return ResponseEntity.ok(new ResponseDTO(0, "success", checkoutUrl));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ResponseDTO(1, e.getMessage(), null));
        }
    }

    @PostMapping("/webhook")
    public ResponseEntity<?> handleWebhook(@RequestBody Webhook webhook) {
        try {
            paymentService.handleWebhook(webhook);
            return ResponseEntity.ok(new ResponseDTO(0, "Webhook processed successfully", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ResponseDTO(1, e.getMessage(), null));
        }
    }
}
