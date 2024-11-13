package com.wrm.application.controller;

import com.wrm.application.dto.request.RequestDTO;
import com.wrm.application.dto.request.AdminReplyDTO;
import com.wrm.application.response.ResponseObject;
import com.wrm.application.response.request.AdminRequestListResponse;
import com.wrm.application.response.request.AdminRequestResponse;
import com.wrm.application.response.request.RequestListResponse;
import com.wrm.application.response.request.RequestResponse;
import com.wrm.application.service.impl.RequestService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/requests")
public class RequestController {
    private final RequestService requestService;

    @GetMapping("")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<ResponseObject> getAllRequests(
            @RequestParam("page") int page,
            @RequestParam("limit") int limit) {
        if (page < 0) {
            return ResponseEntity.badRequest().body(ResponseObject.builder()
                    .message("Page number cannot be negative")
                    .status(HttpStatus.BAD_REQUEST)
                    .data(null)
                    .build());
        }
        if (limit <= 0) {
            return ResponseEntity.badRequest().body(ResponseObject.builder()
                    .message("Limit must be greater than zero")
                    .status(HttpStatus.BAD_REQUEST)
                    .data(null)
                    .build());
        }
        PageRequest pageRequest = PageRequest.of(
                page, limit,
                Sort.by("createdDate").descending());
        Page<AdminRequestResponse> requestPage = requestService.getAllRequests(pageRequest);

        int totalPage = requestPage.getTotalPages();

        List<AdminRequestResponse> requests = requestPage.getContent();
        AdminRequestListResponse.builder()
                .requests(requests)
                .totalPages(totalPage)
                .build();
        return ResponseEntity.ok().body(ResponseObject.builder()
                .message("Get all requests successfully")
                .status(HttpStatus.OK)
                .data(requests)
                .build());
    }

    @GetMapping("my-request")
    @PreAuthorize("hasRole('ROLE_SALES') OR hasRole('ROLE_USER') OR hasRole('ROLE_MANAGER')")
    public ResponseEntity<ResponseObject> getMyRequests(
            @RequestParam("page") int page,
            @RequestParam("limit") int limit,
            HttpServletRequest req) throws Exception {
        if (page < 0) {
            return ResponseEntity.badRequest().body(ResponseObject.builder()
                    .message("Page number cannot be negative")
                    .status(HttpStatus.BAD_REQUEST)
                    .data(null)
                    .build());
        }
        if (limit <= 0) {
            return ResponseEntity.badRequest().body(ResponseObject.builder()
                    .message("Limit must be greater than zero")
                    .status(HttpStatus.BAD_REQUEST)
                    .data(null)
                    .build());
        }
        PageRequest pageRequest = PageRequest.of(
                page, limit,
                Sort.by("createdDate").descending());
        Page<RequestResponse> requestPage = requestService.getAllMyRequests(req.getRemoteUser(), pageRequest);

        int totalPage = requestPage.getTotalPages();

        List<RequestResponse> requests = requestPage.getContent();
        RequestListResponse.builder()
                .requests(requests)
                .totalPages(totalPage)
                .build();
        return ResponseEntity.ok().body(ResponseObject.builder()
                .message("Get all my requests successfully")
                .status(HttpStatus.OK)
                .data(requests)
                .build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ResponseObject> getRequestById(@PathVariable Long id) throws Exception {
        RequestResponse request = requestService.getRequestById(id);
        return ResponseEntity.ok().body(ResponseObject.builder()
                .message("Get request information successfully")
                .status(HttpStatus.OK)
                .data(request)
                .build());
    }

    @PostMapping("/create")
    @PreAuthorize("hasRole('ROLE_SALES') OR hasRole('ROLE_USER') OR hasRole('ROLE_MANAGER')")
    public ResponseEntity<ResponseObject> createAppointment(@Valid @RequestBody RequestDTO requestDTO, BindingResult result, HttpServletRequest req) throws Exception {
            if (result.hasErrors()) {
                List<String> errorMessage = result.getFieldErrors()
                        .stream()
                        .map(FieldError::getDefaultMessage)
                        .toList();
                return ResponseEntity.badRequest().body(ResponseObject.builder()
                        .message(errorMessage.toString())
                        .status(HttpStatus.BAD_REQUEST)
                        .data(null)
                        .build());
            }
            RequestResponse request = requestService.createRequest(requestDTO, req.getRemoteUser());
            return ResponseEntity.ok(ResponseObject.builder()
                    .message("Create request successfully")
                    .status(HttpStatus.OK)
                    .data(request)
                    .build());
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<ResponseObject> updateRequest(@PathVariable Long id, @Valid @RequestBody AdminReplyDTO adminReplyDTO, BindingResult result) throws Exception {
            if (result.hasErrors()) {
                List<String> errorMessage = result.getFieldErrors()
                        .stream()
                        .map(FieldError::getDefaultMessage)
                        .toList();
                return ResponseEntity.badRequest().body(ResponseObject.builder()
                        .message(errorMessage.toString())
                        .status(HttpStatus.BAD_REQUEST)
                        .data(null)
                        .build());
            }
            AdminRequestResponse request = requestService.updateRequest(id, adminReplyDTO);
            return ResponseEntity.ok(ResponseObject.builder()
                    .message("Update request successfully")
                    .status(HttpStatus.OK)
                    .data(request)
                    .build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_SALES') OR hasRole('ROLE_USER') OR hasRole('ROLE_MANAGER')")
    public ResponseEntity<ResponseObject> deleteRequest(@PathVariable Long id) {
        try {
            requestService.deleteRequest(id);
            return ResponseEntity.ok(ResponseObject.builder()
                    .message("Delete request successfully")
                    .status(HttpStatus.OK)
                    .build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ResponseObject.builder()
                    .message(e.getMessage())
                    .status(HttpStatus.BAD_REQUEST)
                    .data(null)
                    .build());
        }
    }

}
