package com.wrm.application.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.wrm.application.constant.enums.RequestStatus;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AdminReplyDTO {
    @JsonProperty("admin_response")
    private String adminResponse;

    @Enumerated(EnumType.STRING)
    private RequestStatus status;

}
