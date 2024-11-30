package com.wrm.application.service.impl;

import com.wrm.application.exception.DataNotFoundException;
import com.wrm.application.model.Payment;
import com.wrm.application.model.QrRequest;
import com.wrm.application.model.User;
import com.wrm.application.repository.PaymentRepository;
import com.wrm.application.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import vn.payos.PayOS;
import vn.payos.type.CheckoutResponseData;
import vn.payos.type.PaymentData;

import java.util.List;

@Service
public class PayOSPaymentService {
    private final PaymentRepository paymentRepository;
    private final UserRepository userRepository;

    public PayOSPaymentService(PaymentRepository paymentRepository, UserRepository userRepository) {
        this.paymentRepository = paymentRepository;
        this.userRepository = userRepository;
    }

    public void createPaymentRequest(QrRequest qrRequest) throws Exception {
        PayOS payOS = new PayOS("f6ae0e42-d744-4e40-a33b-d95056a4dad4","984264ca-be6d-46b6-af3b-672d4f2c05b3","fc8bf4998b3096978f0b62350460d1809e46f46cf0a027cd8505a3d246ee66bd") ;

        PaymentData paymentData = PaymentData.builder()
                .orderCode(qrRequest.getOrderCode())
                .amount(qrRequest.getAmount())
                .description(qrRequest.getDescription())
                .returnUrl(qrRequest.getReturnUrl())
                .cancelUrl(qrRequest.getCancelUrl())
                .build();

        Payment payment = new Payment();
        payment.setAmount(qrRequest.getAmount());
        payment.setDescription(qrRequest.getDescription());
        payment.setUser_id(qrRequest.getUser_id());
        payment.setUrl(payOS.createPaymentLink(paymentData).getCheckoutUrl());
        paymentRepository.save(payment);


    }
    public List<Payment> getAllPayments() {
        return paymentRepository.findAll();
    }

    public List<Payment> getAllPaymentsByUser(String email)  {

        User user =  userRepository.findByEmail(email).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        return paymentRepository.findByUser_id(Math.toIntExact(user.getId()));


    }

    public Payment updatePayment(Long id, Payment paymentDetails) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Payment not found with id: " + id));

        payment.set_payment(paymentDetails.is_payment());

        return paymentRepository.save(payment);
    }

    public void deletePayment(Long id) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Payment not found with id: " + id));

        paymentRepository.delete(payment);
    }

}