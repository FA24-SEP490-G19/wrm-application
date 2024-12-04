package com.wrm.application.controller;

import com.wrm.application.exception.DataNotFoundException;
import com.wrm.application.model.User;
import com.wrm.application.repository.UserRepository;
import com.wrm.application.response.payment.PaymentResponse;
import com.wrm.application.service.impl.PaymentService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/warehouses")
@RequiredArgsConstructor
public class VnpayController {
    private final PaymentService paymentService;
    private final UserRepository userRepository;

    @GetMapping("/vnpay-payment-return")
    public ResponseEntity<PaymentResponse> paymentCompleted(HttpServletRequest request) {
        PaymentResponse response = paymentService.processPaymentReturn(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/payment-requests")
    public ResponseEntity<List<PaymentResponse>> getAllPayments() {

        List<PaymentResponse> payments = paymentService.getAllPayments();
        return ResponseEntity.ok(payments);
    }

    @GetMapping("/payment-requests/users")
    public ResponseEntity<List<PaymentResponse>> getCustomerPayments() throws DataNotFoundException {

            User user = userRepository.findByEmail("sale@gmail.com")
                    .orElseThrow(() -> new DataNotFoundException("Không tìm thấy người dùng"));
            List<PaymentResponse> payments = paymentService.getPaymentsByCustomer(user.getEmail());
            return ResponseEntity.ok(payments);

    }


    @PostMapping("/submitOrder")
    public ResponseEntity<String> submitOrder(
            @RequestParam("amount") int orderTotal,
            @RequestParam("orderInfo") String orderInfo,
            @RequestParam("id") Long id,
            HttpServletRequest request) {
        String paymentUrl = paymentService.createPayment(orderTotal, orderInfo, request,id);
        return ResponseEntity.ok(paymentUrl);
    }



}