package com.wrm.application.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "status_type")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class StatusType extends BaseModel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    // @Column(name = "status_typeid")
    private Long id;

    @Column(name = "content", nullable = false)
    private String content;

}
