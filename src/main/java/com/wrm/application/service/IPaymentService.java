package com.wrm.application.service;

import com.wrm.application.dto.CreatePaymentLinkDTO;
import vn.payos.type.CheckoutResponseData;
import vn.payos.type.Webhook;

public interface IPaymentService {
//    CheckoutResponseData createPaymentLink(String productName, int price, String returnUrl, String cancelUrl);

    CheckoutResponseData createPaymentLink(CreatePaymentLinkDTO dto) throws Exception;
    void handleWebhook(Webhook webhook) throws Exception;
}
