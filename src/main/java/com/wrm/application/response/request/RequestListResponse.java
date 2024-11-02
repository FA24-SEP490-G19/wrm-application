package com.wrm.application.response.request;

import jakarta.persistence.MappedSuperclass;
import lombok.*;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@MappedSuperclass
@Builder
public class RequestListResponse {
    private List<RequestResponse> requests;
    private int totalPages;
}
