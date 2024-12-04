package com.wrm.application.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.wrm.application.constant.enums.RequestStatus;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class RequestDTO {
    @JsonProperty("type_id")
    @NotNull(message = "Vui lòng chọn loại yêu cầu")
    private Long typeId;

    @NotBlank(message = "Vui lòng nhập mô tả")
    private String description;

    @JsonProperty("user_id")
    private Long userId;

    @Enumerated(EnumType.STRING)
    private RequestStatus status;
}
