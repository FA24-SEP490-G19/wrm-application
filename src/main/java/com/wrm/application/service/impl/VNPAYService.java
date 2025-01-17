package com.wrm.application.service.impl;

import com.wrm.application.configuration.VNPAYConfig;
import com.wrm.application.constant.enums.LotStatus;
import com.wrm.application.constant.enums.RentalStatus;
import com.wrm.application.dto.RentalDTO;
import com.wrm.application.dto.UserDTO;
import com.wrm.application.model.Payment;
import com.wrm.application.model.Rental;
import com.wrm.application.model.User;
import com.wrm.application.repository.LotRepository;
import com.wrm.application.repository.PaymentRepository;
import com.wrm.application.repository.RentalRepository;
import com.wrm.application.repository.UserRepository;
import com.wrm.application.response.payment.PaymentResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class VNPAYService {
    private final PaymentRepository paymentRepository;
    private final UserRepository userRepository;
    private final RentalRepository rentalRepository;
    private final LotRepository lotRepository;

    public VNPAYService(PaymentRepository paymentRepository, UserRepository userRepository, RentalRepository rentalRepository, LotRepository lotRepository) {
        this.paymentRepository = paymentRepository;
        this.userRepository = userRepository;
        this.rentalRepository = rentalRepository;
        this.lotRepository = lotRepository;
    }

    public String createOrder(HttpServletRequest request, int amount, String orderInfor, String urlReturn){
        String vnp_Version = "2.1.0";
        String vnp_Command = "pay";
        String vnp_IpAddr = VNPAYConfig.getIpAddress(request);
        String vnp_TmnCode = VNPAYConfig.vnp_TmnCode;
        String orderType = "order-type";
        String vnp_TxnRef = VNPAYConfig.getRandomNumber(8) ;
        Payment payment = paymentRepository.findByOrderInfo(orderInfor) ;
        payment.setTransactionRef(vnp_TxnRef);
        paymentRepository.save(payment);
        Map<String, String> vnp_Params = new HashMap<>();
        vnp_Params.put("vnp_Version", vnp_Version);
        vnp_Params.put("vnp_Command", vnp_Command);
        vnp_Params.put("vnp_TmnCode", vnp_TmnCode);
        vnp_Params.put("vnp_Amount", String.valueOf(amount*100));
        vnp_Params.put("vnp_CurrCode", "VND");

        vnp_Params.put("vnp_TxnRef", vnp_TxnRef);
        vnp_Params.put("vnp_OrderInfo", orderInfor);
        vnp_Params.put("vnp_OrderType", orderType);

        String locate = "vn";
        vnp_Params.put("vnp_Locale", locate);

        urlReturn += VNPAYConfig.vnp_Returnurl;
        vnp_Params.put("vnp_ReturnUrl", urlReturn);
        vnp_Params.put("vnp_IpAddr", vnp_IpAddr);

        Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Etc/GMT+7"));
        SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
        String vnp_CreateDate = formatter.format(cld.getTime());
        vnp_Params.put("vnp_CreateDate", vnp_CreateDate);

        cld.add(Calendar.MINUTE, 15);
        String vnp_ExpireDate = formatter.format(cld.getTime());
        vnp_Params.put("vnp_ExpireDate", vnp_ExpireDate);

        List fieldNames = new ArrayList(vnp_Params.keySet());
        Collections.sort(fieldNames);
        StringBuilder hashData = new StringBuilder();
        StringBuilder query = new StringBuilder();
        Iterator itr = fieldNames.iterator();
        while (itr.hasNext()) {
            String fieldName = (String) itr.next();
            String fieldValue = (String) vnp_Params.get(fieldName);
            if ((fieldValue != null) && (fieldValue.length() > 0)) {
                //Build hash data
                hashData.append(fieldName);
                hashData.append('=');
                try {
                    hashData.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII.toString()));
                    //Build query
                    query.append(URLEncoder.encode(fieldName, StandardCharsets.US_ASCII.toString()));
                    query.append('=');
                    query.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII.toString()));
                } catch (UnsupportedEncodingException e) {
                    e.printStackTrace();
                }
                if (itr.hasNext()) {
                    query.append('&');
                    hashData.append('&');
                }
            }
        }
        String queryUrl = query.toString();
        String salt = VNPAYConfig.vnp_HashSecret;
        String vnp_SecureHash = VNPAYConfig.hmacSHA512(salt, hashData.toString());
        queryUrl += "&vnp_SecureHash=" + vnp_SecureHash;
        String paymentUrl = VNPAYConfig.vnp_PayUrl + "?" + queryUrl;
        return paymentUrl;
    }

    public int orderReturn(HttpServletRequest request){
        Map fields = new HashMap();
        for (Enumeration params = request.getParameterNames(); params.hasMoreElements();) {
            String fieldName = null;
            String fieldValue = null;
            try {
                fieldName = URLEncoder.encode((String) params.nextElement(), StandardCharsets.US_ASCII.toString());
                fieldValue = URLEncoder.encode(request.getParameter(fieldName), StandardCharsets.US_ASCII.toString());
            } catch (UnsupportedEncodingException e) {
                e.printStackTrace();
            }
            if ((fieldValue != null) && (fieldValue.length() > 0)) {
                fields.put(fieldName, fieldValue);
            }
        }

        String vnp_SecureHash = request.getParameter("vnp_SecureHash");
        if (fields.containsKey("vnp_SecureHashType")) {
            fields.remove("vnp_SecureHashType");
        }
        if (fields.containsKey("vnp_SecureHash")) {
            fields.remove("vnp_SecureHash");
        }
        String signValue = VNPAYConfig.hashAllFields(fields);
        if (signValue.equals(vnp_SecureHash)) {
            if ("00".equals(request.getParameter("vnp_TransactionStatus"))) {
                return 1;
            } else {
                return 0;
            }
        } else {
            return -1;
        }
    }

    public String createPayment(int amount, String orderInfo, HttpServletRequest request,Long id,Long rentalId) {
        // Create initial payment record with PENDING status
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Rental rental = rentalRepository.findById(rentalId).orElseThrow(() -> new RuntimeException("rental not found")) ;
        Payment payment = Payment.builder()
                .transactionRef(null)
                .amount((double) amount)
                .orderInfo(orderInfo)
                .rental(rental)
                .paymentStatus("Chưa thanh toán")
                .user(user)
                .build();
        paymentRepository.save(payment);

        return null ;
    }

    public PaymentResponse processPaymentReturn(HttpServletRequest request, HttpServletResponse response) throws IOException {
        int paymentStatus = orderReturn(request);
        String transactionRef = request.getParameter("vnp_TxnRef");

        // Find and update payment record
        Payment payment = paymentRepository.findByTransactionRef(transactionRef)
                .orElseThrow(() -> new RuntimeException("Payment not found"));
        payment.setTransactionNo(request.getParameter("vnp_TransactionNo"));
        payment.setBankCode(request.getParameter("vnp_BankCode"));
        payment.setCardType(request.getParameter("vnp_CardType"));
        payment.setPaymentStatus(paymentStatus == 1 ? "SUCCESS" : "FAILED");
        if(paymentStatus == 1){
            payment.setPaymentTime(LocalDateTime.now());
           // payment.getRental().getLot().setStatus(LotStatus.OCCUPIED);
            //lotRepository.save(payment.getRental().getLot()); // Explicitly save the lot
            Rental rental = payment.getRental();
            if (rental.getStatus() == RentalStatus.OVERDUE) {
                LocalDate now = LocalDate.now();
                LocalDate endDate = rental.getEndDate().toLocalDate();

                if (now.isBefore(endDate)) {
                    rental.setStatus(RentalStatus.ACTIVE);
                } else {
                    rental.setStatus(RentalStatus.EXPIRED);
                }

                rentalRepository.save(rental);
            }
        }
        payment = paymentRepository.save(payment);

        response.sendRedirect("http://localhost:5173/payment-return" );

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

    public List<PaymentResponse> getAllPaymentsBySale(String email) {
        User user = userRepository.findByEmail(email).orElseThrow();
        List<Payment> payments = paymentRepository.findAllBySales(user.getId());
        return payments.stream()
                .map(this::mapToPaymentResponse)
                .collect(Collectors.toList());
    }

    public void confirm(Long id){
        Payment payment = paymentRepository.findById(id).orElseThrow() ;
        payment.setPaymentStatus("Đã thanh toán");
        paymentRepository.save(payment);
    }


    private PaymentResponse mapToPaymentResponse(Payment payment) {
        return PaymentResponse.builder()
                .id(payment.getId())
                .createdDate(payment.getCreatedDate())
                .transactionId(payment.getTransactionRef())
                .amount(String.valueOf(payment.getAmount()))
                .orderInfo(payment.getOrderInfo())
                .paymentTime(payment.getPaymentTime())
                .status(payment.getPaymentStatus())
                .user(payment.getUser())
                .build();
    }

    public List<Payment> getAllPaymentsByUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));

        return paymentRepository.findByUserId(user.getId());
    }

    public List<RentalDTO> getAllCustomers(String email) {
        User user1 = userRepository.findByEmail(email).orElseThrow() ;
        return rentalRepository.findAllRentalsWithCustomerDetails(user1.getId()).stream()
                .map(user -> RentalDTO.builder()
                        .rentalId(user.getId())
                        .customerName(user.getCustomer().getFullName())
                        .customerId(user.getCustomer().getId())
                        .contractId(user.getContract().getId())
                        .startDate(user.getStartDate())
                        .endDate(user.getEndDate())
                        .build())

                .collect(Collectors.toList());
    }

    public void updatePayment(Long id, int amount) {
        Payment payment = paymentRepository.findById(id).orElseThrow() ;
        payment.setAmount((double) amount);
        payment.setCreatedDate(LocalDateTime.now());
        paymentRepository.save(payment);
    }


}