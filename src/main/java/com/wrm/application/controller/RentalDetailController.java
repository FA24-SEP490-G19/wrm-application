package com.wrm.application.controller;

import com.wrm.application.dto.RentalDetailDTO;
import com.wrm.application.response.rental.RentalDetailListResponse;
import com.wrm.application.response.rental.RentalDetailResponse;
import com.wrm.application.service.impl.RentalDetailService;
import jakarta.servlet.http.HttpServletRequest;
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
@RequestMapping("/rental_details")
public class RentalDetailController {
    private final RentalDetailService rentalDetailService;

    @GetMapping("/warehouse")
    @PreAuthorize("hasRole('ROLE_MANAGER')")
    public ResponseEntity<RentalDetailListResponse> getByWarehouseId(
            @RequestParam(value = "page") int page,
            @RequestParam(value = "limit") int limit,
            HttpServletRequest req) throws Exception {
        PageRequest pageRequest = PageRequest.of(
                page, limit,
                Sort.by("createdDate").descending());
        Page<RentalDetailResponse> rentalDetailPage = rentalDetailService.getByWarehouseId(req.getRemoteUser(), pageRequest);

        int totalPage = rentalDetailPage.getTotalPages();

        List<RentalDetailResponse> rentalDetails = rentalDetailPage.getContent();
        return ResponseEntity.ok(RentalDetailListResponse.builder()
                .rentalDetails(rentalDetails)
                .totalPages(totalPage)
                .build());
    }

    @GetMapping("/customer")
    @PreAuthorize("hasRole('ROLE_USER')")
    public ResponseEntity<RentalDetailListResponse> getByCustomerId(
            @RequestParam(value = "page") int page,
            @RequestParam(value = "limit") int limit,
            HttpServletRequest req) throws Exception {
        PageRequest pageRequest = PageRequest.of(
                page, limit,
                Sort.by("createdDate").descending());
        Page<RentalDetailResponse> rentalDetailPage = rentalDetailService.getByCustomerId(req.getRemoteUser(), pageRequest);

        int totalPage = rentalDetailPage.getTotalPages();

        List<RentalDetailResponse> rentalDetails = rentalDetailPage.getContent();
        return ResponseEntity.ok(RentalDetailListResponse.builder()
                .rentalDetails(rentalDetails)
                .totalPages(totalPage)
                .build());
    }


    @GetMapping("/rental/{id}")
    @PreAuthorize("hasRole('ROLE_SALES') or hasRole('ROLE_ADMIN')")
    public ResponseEntity<RentalDetailListResponse> getByRentalId(@PathVariable Long id) throws Exception {
        List<RentalDetailResponse> rentalDetails = rentalDetailService.getByRentalId(id);
        return ResponseEntity.ok(RentalDetailListResponse.builder()
                .rentalDetails(rentalDetails)
                .build());
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_MANAGER')")
    public ResponseEntity<?> updateRentalDetailStatus(@PathVariable Long id, @RequestBody RentalDetailDTO rentalDetailDTO, BindingResult result) throws Exception {
        try {
            if (result.hasErrors()) {
                List<String> errorMessage = result.getFieldErrors()
                        .stream()
                        .map(FieldError::getDefaultMessage)
                        .toList();
                return ResponseEntity.badRequest().body(errorMessage);
            }
            RentalDetailResponse rentalDetailResponse = rentalDetailService.updateRentalDetailStatus(id, rentalDetailDTO);
            return ResponseEntity.ok(rentalDetailResponse);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/history")
    @PreAuthorize("hasRole('ROLE_USER')")
    public ResponseEntity<RentalDetailListResponse> getHistoryByCustomerId(
            @RequestParam(value = "page") int page,
            @RequestParam(value = "limit") int limit,
            HttpServletRequest req) throws Exception {
        PageRequest pageRequest = PageRequest.of(
                page, limit,
                Sort.by("createdDate").descending());
        Page<RentalDetailResponse> rentalDetailPage = rentalDetailService.getHistoryByCustomerId(req.getRemoteUser(), pageRequest);

        int totalPage = rentalDetailPage.getTotalPages();

        List<RentalDetailResponse> rentalDetails = rentalDetailPage.getContent();
        return ResponseEntity.ok(RentalDetailListResponse.builder()
                .rentalDetails(rentalDetails)
                .totalPages(totalPage)
                .build());
    }
}
