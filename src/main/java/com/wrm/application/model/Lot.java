package com.wrm.application.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "lot")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Lot extends BaseModel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    // @Column(name = "lot_id")
    private Long id;

    @Column(name = "warehouse_id", nullable = false)
    private Long warehouse_id;

    @Column(name = "size", nullable = false)
    private float size;

    @Column(name = "description")
    private String description;

    @Column(name = "status")
    private int status;

    // Nếu cần tham chiếu đến kho hàng theo quan hệ
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "warehouse_id", insertable = false, updatable = false)
    private Warehouse warehouse;
}
