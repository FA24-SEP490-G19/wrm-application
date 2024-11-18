package com.wrm.application.service.impl;

import com.wrm.application.constant.enums.RequestStatus;
import com.wrm.application.dto.request.RequestDTO;
import com.wrm.application.dto.request.AdminReplyDTO;
import com.wrm.application.exception.DataNotFoundException;
import com.wrm.application.model.Request;
import com.wrm.application.model.RequestType;
import com.wrm.application.model.User;
import com.wrm.application.repository.RequestRepository;
import com.wrm.application.repository.RequestTypeRepository;
import com.wrm.application.repository.UserRepository;
import com.wrm.application.response.request.AdminRequestResponse;
import com.wrm.application.response.request.RequestResponse;
import com.wrm.application.service.IMailService;
import com.wrm.application.service.IRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class RequestService implements IRequestService {
    private final RequestRepository requestRepository;
    private final UserRepository userRepository;
    private final RequestTypeRepository requestTypeRepository;
    private final IMailService mailService;

    @Override
    public Page<AdminRequestResponse> getAllRequests(PageRequest pageRequest) {
        return requestRepository.findAll(pageRequest).map(request ->
                AdminRequestResponse.builder()
                        .id(request.getId())
                        .userId(request.getUser().getId())
                        .type(request.getType().getContent())
                        .description(request.getDescription())
                        .status(request.getStatus())
                        .build());
    }

    @Override
    public Page<RequestResponse> getAllMyRequests(String remoteUser, PageRequest pageRequest) throws Exception {
        User user = userRepository.findByEmail(remoteUser)
                .orElseThrow(() -> new DataNotFoundException("User not found"));
        return requestRepository.findAllByUserId(user.getId(), pageRequest).map(request -> {
            return RequestResponse.builder()
                    .id(request.getId())
                    .type(request.getType().getContent())
                    .description(request.getDescription())
                    .adminResponse(request.getAdminResponse())
                    .status(request.getStatus())
                    .build();
        });
    }

    @Override
    public RequestResponse getRequestById(Long id) throws Exception {
        Request request = requestRepository.findById(id)
                .orElseThrow(() -> new DataNotFoundException("Request not found"));
        return RequestResponse.builder()
                .id(request.getId())
                .type(request.getType().getContent())
                .description(request.getDescription())
                .status(request.getStatus())
                .adminResponse(request.getAdminResponse())
                .adminResponseDate(request.getAdminResponseDate())
                .build();
    }

    @Override
    public RequestResponse createRequest(RequestDTO requestDTO, String remoteUser) throws Exception {
        if (requestDTO.getDescription() == null || requestDTO.getDescription().isEmpty()) {
            throw new IllegalArgumentException("Request description cannot be empty");
        }

        Request request = Request.builder()
                .description(requestDTO.getDescription())
                .status(RequestStatus.PENDING)
                .build();
        User user = userRepository.findByEmail(remoteUser)
                .orElseThrow(() -> new DataNotFoundException("User not found"));
        request.setUser(user);

        RequestType requestType = requestTypeRepository.findByIdAndRoleId(requestDTO.getTypeId(), user.getRole().getId())
                .orElseThrow(() -> new DataNotFoundException("Request type not found"));
        request.setType(requestType);

        requestRepository.save(request);

        User admin = userRepository.findByRoleId(2L)
                .orElseThrow(() -> new DataNotFoundException("Admin not found"));
        String adminEmail = admin.getEmail();
        mailService.sendRequestCreationNotification(adminEmail, request);

        return RequestResponse.builder()
                .id(request.getId())
                .type(request.getType().getContent())
                .description(request.getDescription())
                .status(request.getStatus())
                .build();
    }

    @Override
    public AdminRequestResponse updateRequest(Long id, AdminReplyDTO adminReplyDTO) throws Exception {
        if (adminReplyDTO.getAdminResponse() == null || adminReplyDTO.getAdminResponse().isEmpty()) {
            throw new IllegalArgumentException("Admin response cannot be empty");
        }
        if (adminReplyDTO.getStatus() == null) {
            throw new IllegalArgumentException("Request status cannot be null");
        }

        Request request = requestRepository.findById(id)
                .orElseThrow(() -> new DataNotFoundException("Request not found"));
        request.setAdminResponse(adminReplyDTO.getAdminResponse());
        request.setAdminResponseDate(LocalDateTime.now());
        request.setStatus(adminReplyDTO.getStatus());

        requestRepository.save(request);

        String userEmail = request.getUser().getEmail();
        mailService.sendRequestUpdateNotification(userEmail, request);

        return AdminRequestResponse.builder()
                .id(request.getId())
                .type(request.getType().getContent())
                .description(request.getDescription())
                .status(request.getStatus())
                .userId(request.getUser().getId())
                .adminResponse(request.getAdminResponse())
                .adminResponseDate(request.getAdminResponseDate())
                .build();
    }


    @Override
    public void deleteRequest(Long id) throws Exception {
        Request request = requestRepository.findById(id)
                .orElseThrow(() -> new DataNotFoundException("Request not found"));

        request.setDeleted(true);
        request.setStatus(RequestStatus.CANCELLED);

        requestRepository.save(request);
    }

}
