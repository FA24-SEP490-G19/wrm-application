package com.wrm.application.service.impl;

import com.wrm.application.model.Payment;
import com.wrm.application.model.QrRequest;
import com.wrm.application.model.User;
import com.wrm.application.repository.PaymentRepository;
import com.wrm.application.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import vn.payos.PayOS;
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
        PayOS payOS = new PayOS("a6b09b90-c859-4703-89ae-cb1e974e7726","08d931fa-c25f-4237-b48e-78f3207890ea","04703adf1b81501b742e06b8a8897a838d23012f1a6aacb0d44d97dd2319a3f3") ;

        PaymentData paymentData = PaymentData.builder()
                .orderCode(qrRequest.getOrderCode())
                .amount(qrRequest.getAmount())
                .description(qrRequest.getDescription())
                .returnUrl(qrRequest.getReturnUrl())
                .cancelUrl(qrRequest.getCancelUrl())
                .build();

        Payment payment = new Payment();

        payment.setUrl(payOS.createPaymentLink(paymentData).getCheckoutUrl());
        paymentRepository.save(payment);


    }
    public List<Payment> getAllPayments() {
        return paymentRepository.findAll();
    }

    public List<Payment> getAllPaymentsByUser(String email)  {

        User user =  userRepository.findByEmail(email).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        return null ;


    }

    public Payment updatePayment(Long id, Payment paymentDetails) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Payment not found with id: " + id));



        return paymentRepository.save(payment);
    }

    public void deletePayment(Long id) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Payment not found with id: " + id));

        paymentRepository.delete(payment);
    }

}