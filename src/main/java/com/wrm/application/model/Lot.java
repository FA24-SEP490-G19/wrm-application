package com.wrm.application.model;
import com.wrm.application.constant.enums.LotStatus;
import jakarta.persistence.*;
import lombok.*;
import java.util.List;


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
    private float size;

    @Column(name = "status")
    @Enumerated(EnumType.STRING)
    private LotStatus status;

    @Column(name = "price")
    private String price;

    @ManyToOne
    @JoinColumn(name = "warehouse_id")
    private Warehouse warehouse;

    @OneToMany(mappedBy = "lot", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Rental> rentals;

}

