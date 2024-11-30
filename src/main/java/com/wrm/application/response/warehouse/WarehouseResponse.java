package com.wrm.application.response.warehouse;
import com.wrm.application.constant.enums.WarehouseStatus;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.*;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class WarehouseResponse {
    private Long id;

    private String name;

    private String address;

    private float size;

    @Enumerated(EnumType.STRING)
    private WarehouseStatus status;

    private String thumbnail;
}
