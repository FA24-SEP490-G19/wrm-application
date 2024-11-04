package com.wrm.application.model;

import com.wrm.application.constant.enums.RentalDetailStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "rental_details")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class RentalDetail extends BaseModel{

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "rental_id", nullable = false)
    private Rental rental;

    @ManyToOne
    @JoinColumn (name = "lot_id", nullable = false)
    private Lot lot;

    @ManyToOne
    @JoinColumn(name = "additional_service")
    private AdditionalService additionalService;

    @OneToOne
    @JoinColumn(name = "contract_id", nullable = false)  // Liên kết với Contract
    private Contract contract;

    @Column(name = "status")
    @Enumerated(EnumType.STRING)
    private RentalDetailStatus status;

    @Column(name = "start_date")
    private LocalDateTime startDate;

    @Column(name = "end_date")
    private LocalDateTime endDate;

}
