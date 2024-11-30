package com.wrm.application.model;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "payment")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Payment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "amount", nullable = false)
    private Integer amount;

    @Column(name = "description", nullable = false)
    private String description;
    @Column(name = "user_id", nullable = false)
    private Long user_id;

    @Column(name = "is_payment", nullable = true)
    private boolean is_payment;

    @Column(name = "url", nullable = false)
    private String url;






}



