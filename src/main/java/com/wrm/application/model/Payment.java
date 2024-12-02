package com.wrm.application.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Payment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name ="transaction_no" )
    private String transactionNo; // vnp_TransactionNo
    @Column(name ="transaction_ref" )
    private String transactionRef; // vnp_TxnRef
    private Double amount;
    @Column(name ="order_info" )
    private String orderInfo;
    @Column(name ="payment_time" )
    private String paymentTime;
    @Column(name ="bank_code" )
    private String bankCode;
    @Column(name ="card_type" )
    private String cardType;
    @Column(name ="payment_status" ,length = 1000)
    private String paymentStatus; // SUCCESS, FAILED, PENDING
    private String url;
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user ;


    @Column(name = "created_date", nullable = false, updatable = false)
    private LocalDateTime createdDate;

    @PrePersist
    protected void onCreate() {
        createdDate = LocalDateTime.now();
    }
}