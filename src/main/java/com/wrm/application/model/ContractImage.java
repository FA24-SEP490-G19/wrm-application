package com.wrm.application.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "contract_images")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ContractImage extends BaseModel {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "contract_id", nullable = false)
    private Contract contract;

    @Column(name = "contract_img_link", nullable = false)
    private String contractImgLink;
}
