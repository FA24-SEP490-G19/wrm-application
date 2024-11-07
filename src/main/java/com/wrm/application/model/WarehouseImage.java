package com.wrm.application.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "warehouse_images")
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class WarehouseImage extends BaseModel {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "image_url", nullable = false)
    private String imageUrl;

    @ManyToOne
    @JoinColumn(name = "warehouse_id", nullable = false)
    private Warehouse warehouse;
}
