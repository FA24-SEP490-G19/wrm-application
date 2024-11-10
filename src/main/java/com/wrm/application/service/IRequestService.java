package com.wrm.application.service;

import com.wrm.application.dto.RequestDTO;
import com.wrm.application.dto.AdminReplyDTO;
import com.wrm.application.response.request.AdminRequestResponse;
import com.wrm.application.response.request.RequestResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;

public interface IRequestService {

    Page<AdminRequestResponse> getAllRequests(PageRequest pageRequest);

    Page<RequestResponse> getAllMyRequests(String remoteUser, PageRequest pageRequest) throws Exception;

    RequestResponse getRequestById(Long id) throws Exception;

    RequestResponse createRequest(RequestDTO requestDTO, String remoteUser) throws Exception;

    AdminRequestResponse updateRequest(Long id, AdminReplyDTO adminReplyDTO) throws Exception;

    void deleteRequest(Long id) throws Exception;

}
