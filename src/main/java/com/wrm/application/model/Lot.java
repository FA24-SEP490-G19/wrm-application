package com.wrm.application.model;

import com.wrm.application.component.enums.LotStatus;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "lots")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Lot extends BaseModel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "description", nullable = false)
    private String description;

    @Column(name = "size", nullable = false)
    private Float size;

    @Column(name = "status")
    @Enumerated(EnumType.STRING)
    private LotStatus status;

    @ManyToOne
    @JoinColumn(name = "warehouse_id")
    private Warehouse warehouse;
}

