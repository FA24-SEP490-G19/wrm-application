package com.wrm.application.controller;

import com.wrm.application.exception.DataNotFoundException;
import com.wrm.application.model.User;
import com.wrm.application.repository.UserRepository;
import com.wrm.application.response.payment.PaymentResponse;
import com.wrm.application.service.impl.PaymentService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.io.IOException;
import java.util.List;


@RestController
@RequestMapping("/warehouses")
@RequiredArgsConstructor
public class VnpayController {
    private final PaymentService paymentService;
    private final UserRepository userRepository;

    @GetMapping("/vnpay-payment-return")
    public ResponseEntity<PaymentResponse> paymentCompleted(HttpServletRequest request, HttpServletResponse response) throws IOException {
        PaymentResponse re = paymentService.processPaymentReturn(request,response);
        return ResponseEntity.ok(re);
    }

    @GetMapping("/payment-requests")
    public ResponseEntity<List<PaymentResponse>> getAllPayments() {

        List<PaymentResponse> payments = paymentService.getAllPayments();
        return ResponseEntity.ok(payments);
    }

    @GetMapping("/payment-requests/users")
    @PreAuthorize("hasRole('ROLE_USER')")
    public ResponseEntity<List<PaymentResponse>> getCustomerPayments(HttpServletRequest req) throws DataNotFoundException {

            User user = userRepository.findByEmail(req.getRemoteUser())
                    .orElseThrow(() -> new DataNotFoundException("User not found"));
            List<PaymentResponse> payments = paymentService.getPaymentsByCustomer(user.getEmail());
            return ResponseEntity.ok(payments);

    }
    @PutMapping("/payment-requests/{id}/confirm")
    public void paymentCompleted(@PathVariable Long id) {
       paymentService.confirm(id);

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

    @PostMapping("/auto-create-payment")
    public ResponseEntity<Void> autoCreatePayment(@RequestParam int amount, @RequestParam String orderInfo, @RequestParam Long id) {
        HttpServletRequest request = ((ServletRequestAttributes) RequestContextHolder.getRequestAttributes()).getRequest();
        paymentService.createPayment(amount, orderInfo, request, id);
        return ResponseEntity.ok().build();
    }

}