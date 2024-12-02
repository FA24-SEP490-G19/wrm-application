package com.wrm.application.controller;

import com.wrm.application.model.Payment;
import com.wrm.application.model.QrRequest;
import com.wrm.application.service.impl.PayOSPaymentService;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import vn.payos.type.CheckoutResponseData;

import java.util.List;

@RestController
@RequestMapping("/warehouses")  // This is the correct way
public class PaymentController {
    private final PayOSPaymentService payOSPaymentService;

    @Autowired
    public PaymentController(PayOSPaymentService payOSPaymentService) {
        this.payOSPaymentService = payOSPaymentService;
    }

    @PostMapping("/payment-sdsd")
    public void initiatePayment(@RequestBody QrRequest qrRequest) throws Exception {

         payOSPaymentService.createPaymentRequest(qrRequest) ;
    }

    @GetMapping("/payment-sds")
    public ResponseEntity<List<Payment>> getAllPayments() {
        List<Payment> payments = payOSPaymentService.getAllPayments();
        return ResponseEntity.ok(payments);
    }


    @GetMapping("/payment-requests/user")
    public  List<Payment> getAllPaymentsByUser(HttpServletRequest req) throws Exception{
        return payOSPaymentService.getAllPaymentsByUser(req.getRemoteUser());
    }

    @PutMapping("/payment-requests/{id}")
    public ResponseEntity<Payment> updatePayment(@PathVariable Long id, @RequestBody Payment payment) {
        Payment updatedPayment = payOSPaymentService.updatePayment(id, payment);
        return ResponseEntity.ok(updatedPayment);
    }

    @DeleteMapping("/payment-requests/{id}")
    public ResponseEntity<Void> deletePayment(@PathVariable Long id) {
        payOSPaymentService.deletePayment(id);
        return ResponseEntity.noContent().build();
    }
}