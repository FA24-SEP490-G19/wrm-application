package com.wrm.application.controller;

import com.wrm.application.dto.RentalDTO;
import com.wrm.application.dto.UserDTO;
import com.wrm.application.model.Payment;
import com.wrm.application.response.payment.PaymentResponse;
import com.wrm.application.service.impl.VNPAYService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/payment")
@RequiredArgsConstructor
public class VnpayController {

    private final VNPAYService vnpayService;

    @GetMapping("/vnpay-payment-return")
    public ResponseEntity<PaymentResponse> paymentCompleted(HttpServletRequest request, HttpServletResponse response) throws IOException {
        PaymentResponse re = vnpayService.processPaymentReturn(request,response);
        return ResponseEntity.ok(re);
    }

    //Hàm get ra tất cả các đơn thanh toán
    @GetMapping("/payment-requests")
    public ResponseEntity<List<PaymentResponse>> getAllPayments() {
        List<PaymentResponse> payments = vnpayService.getAllPayments();
        return ResponseEntity.ok(payments);
    }


    @GetMapping("/payment-requests/sales")
    @PreAuthorize("hasRole('ROLE_SALES')")
    public ResponseEntity<List<PaymentResponse>> getAllPaymentsBySale(HttpServletRequest req) {
        List<PaymentResponse> payments = vnpayService.getAllPaymentsBySale(req.getRemoteUser());
        return ResponseEntity.ok(payments);
    }

    //Hàm get ra tất cả các đơn thanh toán theo user
    @GetMapping("/payment-requests/confirm/user")
    @PreAuthorize("hasRole('ROLE_USER')")
    public ResponseEntity<?> getAllPaymentsByUser(HttpServletRequest req) {
        try {
            String email = req.getRemoteUser();
            if (email == null) {
                return ResponseEntity.badRequest().body("User not authenticated");
            }
            List<Payment> payments = vnpayService.getAllPaymentsByUser(email);
            return ResponseEntity.ok(payments);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error fetching payments: " + e.getMessage());
        }
    }

    @PutMapping("/payment-requests/{id}/confirm")
    public void paymentCompleted(@PathVariable Long id) {
        vnpayService.confirm(id);
    }


    //Sale tạo đơn thanh toán
    @PostMapping("/submitOrder")
    public ResponseEntity<String> submitOrder(
            @RequestParam("amount") int orderTotal,
            @RequestParam("orderInfo") String orderInfo,
            @RequestParam("id") Long id,
            @RequestParam("rentalId") Long rentalId,
            HttpServletRequest request) {
        String paymentUrl = vnpayService.createPayment(orderTotal, orderInfo, request, id, rentalId);
        return ResponseEntity.ok(paymentUrl);
    }

    @PostMapping("/auto-create-payment")
    public ResponseEntity<String> autoCreatePayment(@RequestParam int amount, @RequestParam String orderInfo, @RequestParam Long id, @RequestParam Long rentalId) {
        HttpServletRequest request = ((ServletRequestAttributes) RequestContextHolder.getRequestAttributes()).getRequest();
        String paymentUrl = vnpayService.createPayment(amount, orderInfo, request, id, rentalId);
        return ResponseEntity.ok(paymentUrl);
    }


    //Khách hàng click thanh toán sẽ tạo ra link
    @PostMapping("/create-payment")
    public String createPayment(HttpServletRequest request, int amount, String orderInfor) {
        String baseUrl = request.getScheme() + "://" + request.getServerName() + ":" + request.getServerPort() +"/payment";
        return vnpayService.createOrder(request, amount, orderInfor, baseUrl);
    }

    @PutMapping("/update/{id}")
    public void updatePayment(@PathVariable Long id,@RequestParam("amount") int amount) {
         vnpayService.updatePayment(id,amount);
    }

    @GetMapping("/customers")
    @PreAuthorize("hasRole('ROLE_SALES') or hasRole('ROLE_ADMIN')")
    public ResponseEntity<?> getAllCustomers(HttpServletRequest request) {
        try {
            List<RentalDTO> customers = vnpayService.getAllCustomers(request.getRemoteUser());
            return ResponseEntity.ok(customers);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

}