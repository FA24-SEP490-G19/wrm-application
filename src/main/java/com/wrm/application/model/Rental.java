package com.wrm.application.model;

import com.wrm.application.constant.enums.RentalStatus;
import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Entity
@Table(name = "rentals")
public class Rental extends BaseModel {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "customer_id", nullable = false)
    private Long customerId;

    @Column(name = "sale_id", nullable = false)
    private Long saleId;

    @Column(name = "warehouse_id", nullable = false)
    private Long warehouseId;

    @Column(name = "contract_id", nullable = false)
    private Long contractId;

    @OneToOne(mappedBy = "rental")
    private Contract contract;

    @Column(name = "note")
    private String note;

}
