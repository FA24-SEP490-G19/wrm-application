package com.wrm.application.service.impl;

import com.wrm.application.model.Payment;
import com.wrm.application.model.User;
import com.wrm.application.repository.PaymentRepository;
import com.wrm.application.repository.UserRepository;
import com.wrm.application.response.payment.PaymentResponse;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PaymentService {
    private final PaymentRepository paymentRepository;
    private final VNPAYService vnPayService;
    private final UserRepository userRepository;

    public String createPayment(int amount, String orderInfo, HttpServletRequest request,Long id) {
        // Create initial payment record with PENDING status
        String baseUrl = request.getScheme() + "://" + request.getServerName() + ":" + request.getServerPort();
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Payment payment = Payment.builder()
                .amount((double) amount)
                .orderInfo(orderInfo)
                .paymentStatus("PENDING")
                .user(user)
                .url(vnPayService.createOrder(request, amount, orderInfo, baseUrl))
                .build();
        paymentRepository.save(payment);

        return null ;
    }

    public PaymentResponse processPaymentReturn(HttpServletRequest request) {
        int paymentStatus = vnPayService.orderReturn(request);
        String transactionRef = request.getParameter("vnp_TxnRef");

        // Find and update payment record
        Payment payment = paymentRepository.findByTransactionRef(transactionRef)
                .orElseThrow(() -> new RuntimeException("Payment not found"));

        payment.setTransactionNo(request.getParameter("vnp_TransactionNo"));
        payment.setBankCode(request.getParameter("vnp_BankCode"));
        payment.setCardType(request.getParameter("vnp_CardType"));
        payment.setPaymentTime(request.getParameter("vnp_PayDate"));
        payment.setPaymentStatus(paymentStatus == 1 ? "SUCCESS" : "FAILED");

        payment = paymentRepository.save(payment);

        return PaymentResponse.builder()
                .orderInfo(payment.getOrderInfo())
                .paymentTime(payment.getPaymentTime())
                .transactionId(payment.getTransactionNo())
                .amount(payment.getAmount().toString())
                .status(payment.getPaymentStatus())
                .build();
    }


    public List<PaymentResponse> getAllPayments() {
        List<Payment> payments = paymentRepository.findAllByOrderByCreatedDateDesc();
        return payments.stream()
                .map(this::mapToPaymentResponse)
                .collect(Collectors.toList());
    }

    public List<PaymentResponse> getPaymentsByCustomer(String email) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        List<Payment> payments = paymentRepository.findByUserId(user.getId());
        return payments.stream()
                .map(this::mapToPaymentResponse)
                .collect(Collectors.toList());
    }

    private PaymentResponse mapToPaymentResponse(Payment payment) {
        return PaymentResponse.builder()
                .transactionId(payment.getTransactionRef())
                .amount(String.valueOf(payment.getAmount()))
                .url(payment.getUrl())
                .orderInfo(payment.getOrderInfo())
                .paymentTime(payment.getPaymentTime())
                .status(payment.getPaymentStatus())
                .user(payment.getUser())
                .build();
    }
}