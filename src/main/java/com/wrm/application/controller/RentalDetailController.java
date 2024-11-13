package com.wrm.application.controller;

import com.wrm.application.dto.RentalDetailDTO;
import com.wrm.application.model.RentalDetail;
import com.wrm.application.response.ResponseObject;
import com.wrm.application.response.rental.RentalDetailListResponse;
import com.wrm.application.response.rental.RentalDetailResponse;
import com.wrm.application.response.rental.RentalListResponse;
import com.wrm.application.response.rental.RentalResponse;
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
    public ResponseEntity<ResponseObject> getByWarehouseId(
            @RequestParam(value = "page") int page,
            @RequestParam(value = "limit") int limit,
            HttpServletRequest req) throws Exception {
        PageRequest pageRequest = PageRequest.of(
                page, limit,
                Sort.by("createdDate").descending());
        Page<RentalDetailResponse> rentalDetailPage = rentalDetailService.getByWarehouseId(req.getRemoteUser(), pageRequest);

        int totalPage = rentalDetailPage.getTotalPages();

        List<RentalDetailResponse> rentalDetails = rentalDetailPage.getContent();
        RentalDetailListResponse.builder()
                .rentalDetails(rentalDetails)
                .totalPages(totalPage)
                .build();
        return ResponseEntity.ok().body(ResponseObject.builder()
                .message("Get rental details by warehouse successfully")
                .status(HttpStatus.OK)
                .data(rentalDetails)
                .build());
    }

    @GetMapping("/customer")
    @PreAuthorize("hasRole('ROLE_USER')")
    public ResponseEntity<ResponseObject> getByCustomerId(
            @RequestParam(value = "page") int page,
            @RequestParam(value = "limit") int limit,
            HttpServletRequest req) throws Exception {
        PageRequest pageRequest = PageRequest.of(
                page, limit,
                Sort.by("createdDate").descending());
        Page<RentalDetailResponse> rentalDetailPage = rentalDetailService.getByCustomerId(req.getRemoteUser(), pageRequest);

        int totalPage = rentalDetailPage.getTotalPages();

        List<RentalDetailResponse> rentalDetails = rentalDetailPage.getContent();
        RentalDetailListResponse.builder()
                .rentalDetails(rentalDetails)
                .totalPages(totalPage)
                .build();
        return ResponseEntity.ok().body(ResponseObject.builder()
                .message("Get rental details by customer successfully")
                .status(HttpStatus.OK)
                .data(rentalDetails)
                .build());
    }

    @GetMapping("/rental/{id}")
    @PreAuthorize("hasRole('ROLE_SALES') or hasRole('ROLE_ADMIN')")
    public ResponseEntity<ResponseObject> getByRentalId(@PathVariable Long id) throws Exception {
        List<RentalDetailResponse> rentalDetails = rentalDetailService.getByRentalId(id);
        RentalDetailListResponse.builder()
                .rentalDetails(rentalDetails)
                .build();
        return ResponseEntity.ok().body(ResponseObject.builder()
                .message("Get rental details by rental successfully")
                .status(HttpStatus.OK)
                .data(rentalDetails)
                .build());
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_MANAGER')")
    public ResponseEntity<ResponseObject> updateRentalDetailStatus(@PathVariable Long id, @RequestBody RentalDetailDTO rentalDetailDTO, BindingResult result) throws Exception {
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
            RentalDetailResponse rentalDetailResponse = rentalDetailService.updateRentalDetailStatus(id, rentalDetailDTO);
            return ResponseEntity.ok(ResponseObject.builder()
                    .message("Update rental detail status successfully")
                    .status(HttpStatus.OK)
                    .data(rentalDetailResponse)
                    .build());
    }
}
