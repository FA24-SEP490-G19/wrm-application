package com.wrm.application.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "request_types")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class RequestType extends BaseModel{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String content;

    @ManyToOne
    @JoinColumn(name = "role_id", nullable = false)
    private Role role;
}
