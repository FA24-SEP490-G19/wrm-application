package com.wrm.application.controller;

import com.wrm.application.dto.AppointmentDTO;
import com.wrm.application.dto.RentalDTO;
import com.wrm.application.response.ResponseObject;
import com.wrm.application.response.appointment.AppointmentListResponse;
import com.wrm.application.response.appointment.AppointmentResponse;
import com.wrm.application.response.rental.RentalListResponse;
import com.wrm.application.response.rental.RentalResponse;
import com.wrm.application.service.impl.RentalService;
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
@RequestMapping("/rentals")
public class RentalController {
    private final RentalService rentalService;

    @GetMapping("")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<ResponseObject> getAllRentals(
            @RequestParam("page") int page,
            @RequestParam("limit") int limit,
            @RequestParam(value = "warehouse_id", required = false) Long warehouseId,
            @RequestParam(value = "customer_id", required = false) Long customerId) throws Exception {
        PageRequest pageRequest = PageRequest.of(
                page, limit,
                Sort.by("createdDate").descending());
        Page<RentalResponse> rentalPage;
        if (warehouseId != null) {
            rentalPage = rentalService.getByWarehouseId(warehouseId, pageRequest);
        } else if (customerId != null) {
            rentalPage = rentalService.getByCustomerId(customerId, pageRequest);
        } else {
            rentalPage = rentalService.getAllRentals(pageRequest);
        }
        int totalPage = rentalPage.getTotalPages();

        List<RentalResponse> rentals = rentalPage.getContent();
        RentalListResponse.builder()
                .rentals(rentals)
                .totalPages(totalPage)
                .build();
        return ResponseEntity.ok().body(ResponseObject.builder()
                .message("Get all rentals successfully")
                .status(HttpStatus.OK)
                .data(rentals)
                .build());
    }

    @GetMapping("/sales")
    @PreAuthorize("hasRole('ROLE_SALES')")
    public ResponseEntity<ResponseObject> getAllBySalesId(
            @RequestParam("page") int page,
            @RequestParam("limit") int limit,
            HttpServletRequest req) {
        PageRequest pageRequest = PageRequest.of(
                page, limit,
                Sort.by("createdDate").descending());
        Page<RentalResponse> rentalPage = rentalService.getBySalesId(req.getRemoteUser(), pageRequest);

        int totalPage = rentalPage.getTotalPages();

        List<RentalResponse> rentals = rentalPage.getContent();
        RentalListResponse.builder()
                .rentals(rentals)
                .totalPages(totalPage)
                .build();
        return ResponseEntity.ok().body(ResponseObject.builder()
                .message("Get all rentals successfully")
                .status(HttpStatus.OK)
                .data(rentals)
                .build());
    }

    @PostMapping("/create")
    @PreAuthorize("hasRole('ROLE_SALES')")
    public ResponseEntity<ResponseObject> createRental(@Valid @RequestBody RentalDTO rentalDTO, BindingResult result, HttpServletRequest req) throws Exception {
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
            RentalResponse rental = rentalService.createRental(rentalDTO, req.getRemoteUser());
            return ResponseEntity.ok(ResponseObject.builder()
                    .message("Create rental successfully")
                    .status(HttpStatus.OK)
                    .data(rental)
                    .build());
    }

    @PutMapping("/update/{id}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<ResponseObject> updateRentalStatus(@PathVariable Long id, @Valid @RequestBody RentalDTO rentalDTO, BindingResult result) throws Exception {
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
            RentalResponse rental = rentalService.updateRentalStatus(id, rentalDTO);
            return ResponseEntity.ok(ResponseObject.builder()
                    .message("Update rental status successfully")
                    .status(HttpStatus.OK)
                    .data(rental)
                    .build());
    }

    @DeleteMapping("/delete/{id}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<ResponseObject> deleteRental(@PathVariable Long id) {
        try {
            rentalService.deleteRental(id);
            return ResponseEntity.ok(ResponseObject.builder()
                    .message("Delete rental successfully")
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



