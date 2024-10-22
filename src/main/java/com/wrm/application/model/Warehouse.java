package com.wrm.application.model;

import com.wrm.application.component.enums.WarehouseStatus;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "warehouses")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Warehouse extends BaseModel{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "address", nullable = false)
    private String address;

    @Column(name = "size")
    private float size;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private WarehouseStatus status;

    @Column(name = "description")
    private String description;

    @Column(name = "warehouse_manager_id")
    private Long warehouseManagerId;
}
