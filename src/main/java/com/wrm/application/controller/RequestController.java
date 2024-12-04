package com.wrm.application.controller;

import com.wrm.application.dto.request.RequestDTO;
import com.wrm.application.dto.request.AdminReplyDTO;
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
    public ResponseEntity<?> getAllRequests(
            @RequestParam("page") int page,
            @RequestParam("limit") int limit) {
        if (page < 0) {
            return ResponseEntity.badRequest().body("Số trang không thể là số âm");
        }
        if (limit <= 0) {
            return ResponseEntity.badRequest().body("Giới hạn trang phải lớn hơn không");
        }
        PageRequest pageRequest = PageRequest.of(
                page, limit,
                Sort.by("createdDate").descending());
        Page<AdminRequestResponse> requestPage = requestService.getAllRequests(pageRequest);

        int totalPage = requestPage.getTotalPages();

        List<AdminRequestResponse> requests = requestPage.getContent();
        return ResponseEntity.ok(AdminRequestListResponse.builder()
                .requests(requests)
                .totalPages(totalPage)
                .build());
    }

    @GetMapping("my-request")
    @PreAuthorize("hasRole('ROLE_SALES') OR hasRole('ROLE_USER') OR hasRole('ROLE_MANAGER')")
    public ResponseEntity<?> getMyRequests(
            @RequestParam("page") int page,
            @RequestParam("limit") int limit,
            HttpServletRequest req) throws Exception {
        if (page < 0) {
            return ResponseEntity.badRequest().body("Số trang không thể là số âm");
        }
        if (limit <= 0) {
            return ResponseEntity.badRequest().body("Giới hạn trang phải lớn hơn không");
        }
        PageRequest pageRequest = PageRequest.of(
                page, limit,
                Sort.by("createdDate").descending());
        Page<RequestResponse> requestPage = requestService.getAllMyRequests(req.getRemoteUser(), pageRequest);

        int totalPage = requestPage.getTotalPages();

        List<RequestResponse> requests = requestPage.getContent();
        return ResponseEntity.ok(RequestListResponse.builder()
                .requests(requests)
                .totalPages(totalPage)
                .build());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_SALES') OR hasRole('ROLE_USER') OR hasRole('ROLE_MANAGER')")
    public ResponseEntity<RequestResponse> getRequestById(@PathVariable Long id) throws Exception {
        return ResponseEntity.ok(requestService.getRequestById(id));
    }

    @PostMapping("/create")
    @PreAuthorize("hasRole('ROLE_SALES') OR hasRole('ROLE_USER') OR hasRole('ROLE_MANAGER')")
    public ResponseEntity<?> createAppointment(@Valid @RequestBody RequestDTO requestDTO, BindingResult result, HttpServletRequest req) {
        try {
            if (result.hasErrors()) {
                List<String> errorMessage = result.getFieldErrors()
                        .stream()
                        .map(FieldError::getDefaultMessage)
                        .toList();
                return ResponseEntity.badRequest().body("Thông tin không hợp lệ");
            }
            RequestResponse request = requestService.createRequest(requestDTO, req.getRemoteUser());
            return ResponseEntity.ok(request);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }


    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<?> updateRequest(@PathVariable Long id, @Valid @RequestBody AdminReplyDTO adminReplyDTO, BindingResult result) throws Exception {
        try {
            if (result.hasErrors()) {
                List<String> errorMessage = result.getFieldErrors()
                        .stream()
                        .map(FieldError::getDefaultMessage)
                        .toList();
                return ResponseEntity.badRequest().body("Thông tin không hợp lệ");
            }
            AdminRequestResponse request = requestService.updateRequest(id, adminReplyDTO);
            return ResponseEntity.ok(request);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_SALES') OR hasRole('ROLE_USER') OR hasRole('ROLE_MANAGER')")
    public ResponseEntity<?> deleteRequest(@PathVariable Long id) throws Exception {
        try {
            requestService.deleteRequest(id);
            return ResponseEntity.ok("Xóa yêu cầu thành công");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

}
