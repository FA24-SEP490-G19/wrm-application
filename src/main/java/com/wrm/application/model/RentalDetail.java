package com.wrm.application.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.wrm.application.constant.enums.RentalDetailStatus;
import com.wrm.application.constant.enums.RentalStatus;
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

    @Column(name = "lot_id", nullable = false)
    private Long lotId;

    @ManyToOne
    @JoinColumn(name = "additional_service")
    private AdditionalService additionalService;

    @Column(name = "status")
    @Enumerated(EnumType.STRING)
    private RentalDetailStatus status;

    @Column(name = "start_date")
    private LocalDateTime startDate;

    @Column(name = "end_date")
    private LocalDateTime endDate;
}
