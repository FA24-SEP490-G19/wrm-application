package com.wrm.application.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "roles")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Role extends BaseModel {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "role", nullable = false)
    private String roleName;

//    public static String ADMIN = "ADMIN";
//    public static String USER = "USER";
//    public static String MANAGER = "MANAGER";
//    public static String SALES = "SALES";
}
