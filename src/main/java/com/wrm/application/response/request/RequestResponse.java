package com.wrm.application.response.request;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.wrm.application.constant.enums.RequestStatus;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.MappedSuperclass;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@MappedSuperclass
@Builder
public class RequestResponse {
    private Long id;

    private String type;

    private String description;

    @Enumerated(EnumType.STRING)
    private RequestStatus status;

    @JsonProperty("admin_response")
    private String adminResponse;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd hh:mm a")
    @JsonProperty("admin_response_date")
    private LocalDateTime adminResponseDate;
}
