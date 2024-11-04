package com.wrm.application.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Entity
@Table(name = "contracts")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Contract extends BaseModel {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "signed_date", columnDefinition = "DATETIME DEFAULT CURRENT_TIMESTAMP")
    private LocalDateTime signedDate;

    @Column(name = "expiry_date")
    private LocalDateTime expiryDate;


}

