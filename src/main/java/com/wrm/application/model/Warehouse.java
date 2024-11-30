package com.wrm.application.model;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.wrm.application.constant.enums.WarehouseStatus;
import jakarta.persistence.*;
import lombok.*;

import java.util.List;

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

    @OneToOne
    @JoinColumn(name = "warehouse_manager_id")
    private User warehouseManager;

    @Column(name = "thumbnail")
    private String thumbnail;

    @OneToMany(mappedBy = "warehouse", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonManagedReference
    private List<Lot> lots;
}
