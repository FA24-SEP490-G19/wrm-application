package com.wrm.application.service.impl;

import com.wrm.application.dto.CreatePaymentLinkDTO;
import com.wrm.application.model.Invoices;
import com.wrm.application.model.Rental;
import com.wrm.application.model.User;
import com.wrm.application.repository.InvoicesRepository;
import com.wrm.application.service.IPaymentService;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import vn.payos.PayOS;
import vn.payos.type.*;

import java.time.LocalDateTime;

@Service
@AllArgsConstructor
public class PaymentService implements IPaymentService {

    private final InvoicesRepository invoicesRepository;
    private final PayOS payOS;

    public CheckoutResponseData createPaymentLink(CreatePaymentLinkDTO dto) throws Exception {
        // Lưu invoice vào DB
        Invoices invoice = Invoices.builder()
                .rental(new Rental(dto.getRentalId()))
                .user(new User(dto.getInvoiceId()))
                .totalAmount(dto.getTotalAmount())
                .issuedDate(LocalDateTime.now())
                .build();
        invoicesRepository.save(invoice);

        // Tạo liên kết thanh toán với PayOS SDK
        ItemData item = ItemData.builder()
                .name(dto.getProductName())
                .price(dto.getTotalAmount())
                .quantity(1)
                .build();

        PaymentData paymentData = PaymentData.builder()
                .orderCode("ORDER_" + invoice.getId())
                .amount(dto.getTotalAmount())
                .description(dto.getDescription())
                .returnUrl(dto.getReturnUrl())
                .cancelUrl(dto.getCancelUrl())
                .item(item)
                .build();

        return payOS.createPaymentLink(paymentData);
    }

    public void handleWebhook(Webhook webhook) throws Exception {
        WebhookData data = payOS.verifyPaymentWebhookData(webhook);

        if ("SUCCESS".equals(data.getStatus())) {
            // Cập nhật trạng thái invoice trong DB
            Invoices invoice = invoicesRepository.findById(Long.valueOf(data.getOrderCode().replace("ORDER_", "")))
                    .orElseThrow(() -> new RuntimeException("Invoice not found"));
            System.out.println("Payment success for Invoice ID: " + invoice.getId());
        } else {
            throw new RuntimeException("Payment failed");
        }
    }

}
