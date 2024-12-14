package com.wrm.application.controller;

import com.wrm.application.dto.RentalDTO;
import com.wrm.application.response.rental.RentalListResponse;
import com.wrm.application.response.rental.RentalResponse;
import com.wrm.application.service.IRentalService;
import com.wrm.application.service.impl.RentalService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
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
    private final IRentalService rentalService;

    @GetMapping("")
    @PreAuthorize("hasRole('ROLE_ADMIN') or hasRole('ROLE_SALES')")
    public ResponseEntity<RentalListResponse> getAllRentals(
            @RequestParam("page") int page,
            @RequestParam("limit") int limit,
            @RequestParam(value = "warehouse_id", required = false) Long warehouseId,
            @RequestParam(value = "customer_id", required = false) Long customerId) throws Exception {
        PageRequest pageRequest = PageRequest.of(
                page, limit,
                Sort.by("createdDate").descending());
        Page<RentalResponse> rentalPage;

            rentalPage = rentalService.getAllRentals(pageRequest);

        int totalPage = rentalPage.getTotalPages();

        List<RentalResponse> rentals = rentalPage.getContent();
        return ResponseEntity.ok(RentalListResponse.builder()
                .rentals(rentals)
                .totalPages(totalPage)
                .build());
    }


    @GetMapping("/user")
    @PreAuthorize("hasRole('ROLE_USER')")
    public ResponseEntity<RentalListResponse> getAllByCustomer(
            @RequestParam("page") int page,
            @RequestParam("limit") int limit,
            HttpServletRequest req) throws Exception {
        PageRequest pageRequest = PageRequest.of(
                page, limit,
                Sort.by("createdDate").descending());
        Page<RentalResponse> rentalPage;

            rentalPage = rentalService.getByCustomerId(req.getRemoteUser(), pageRequest);

        int totalPage = rentalPage.getTotalPages();

        List<RentalResponse> rentals = rentalPage.getContent();
        return ResponseEntity.ok(RentalListResponse.builder()
                .rentals(rentals)
                .totalPages(totalPage)
                .build());
    }

    @GetMapping("/sales")
    @PreAuthorize("hasRole('ROLE_SALES') or hasRole('ROLE_USER')")
    public ResponseEntity<RentalListResponse> getAllBySalesId(
            @RequestParam("page") int page,
            @RequestParam("limit") int limit,
            HttpServletRequest req) {
        PageRequest pageRequest = PageRequest.of(
                page, limit,
                Sort.by("createdDate").descending());
        Page<RentalResponse> rentalPage = rentalService.getBySalesId(req.getRemoteUser(), pageRequest);

        int totalPage = rentalPage.getTotalPages();

        List<RentalResponse> rentals = rentalPage.getContent();
        return ResponseEntity.ok(RentalListResponse.builder()
                .rentals(rentals)
                .totalPages(totalPage)
                .build());
    }

    @PostMapping("/create")
    @PreAuthorize("hasRole('ROLE_SALES')")
    public ResponseEntity<?> createRental(@Valid @RequestBody RentalDTO rentalDTO, BindingResult result, HttpServletRequest req) {
        try {
            if (result.hasErrors()) {
                List<String> errorMessage = result.getFieldErrors()
                        .stream()
                        .map(FieldError::getDefaultMessage)
                        .toList();
                return ResponseEntity.badRequest().body(errorMessage);
            }
            RentalResponse rental = rentalService.createRental(rentalDTO, req.getRemoteUser());
            return ResponseEntity.ok(rental);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/update/{id}")
    @PreAuthorize("hasRole('ROLE_ADMIN') or hasRole('ROLE_SALES') or hasRole('ROLE_MANAGER')")
    public ResponseEntity<?> updateRentalStatus(@PathVariable Long id, @Valid @RequestBody RentalDTO rentalDTO, BindingResult result) {
        try {
            if (result.hasErrors()) {
                List<String> errorMessage = result.getFieldErrors()
                        .stream()
                        .map(FieldError::getDefaultMessage)
                        .toList();
                return ResponseEntity.badRequest().body(errorMessage);
            }
            RentalResponse rental = rentalService.updateRentalStatus(id, rentalDTO);
            return ResponseEntity.ok(rental);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/delete/{id}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<?> deleteRental(@PathVariable Long id) {
        try {
            rentalService.deleteRental(id);
            return ResponseEntity.ok("Delete rental successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/warehouse")
    @PreAuthorize("hasRole('ROLE_MANAGER')")
    public ResponseEntity<RentalListResponse> getByWarehouseId(
            @RequestParam(value = "page") int page,
            @RequestParam(value = "limit") int limit,
            HttpServletRequest req) throws Exception {
        PageRequest pageRequest = PageRequest.of(
                page, limit,
                Sort.by("createdDate").descending());
        Page<RentalResponse> rentalPage = rentalService.getByWarehouseId(req.getRemoteUser(), pageRequest);

        int totalPage = rentalPage.getTotalPages();

        List<RentalResponse> rentals = rentalPage.getContent();
        return ResponseEntity.ok(RentalListResponse.builder()
                .rentals(rentals)
                .totalPages(totalPage)
                .build());
    }

    @GetMapping("/customer")
    @PreAuthorize("hasRole('ROLE_USER')")
    public ResponseEntity<RentalListResponse> getByCustomerId(
            @RequestParam(value = "page") int page,
            @RequestParam(value = "limit") int limit,
            HttpServletRequest req) throws Exception {
        PageRequest pageRequest = PageRequest.of(
                page, limit,
                Sort.by("createdDate").descending());
        Page<RentalResponse> rentalPage = rentalService.getByCustomerId(req.getRemoteUser(), pageRequest);

        int totalPage = rentalPage.getTotalPages();

        List<RentalResponse> rentals = rentalPage.getContent();
        return ResponseEntity.ok(RentalListResponse.builder()
                .rentals(rentals)
                .totalPages(totalPage)
                .build());
    }

    @GetMapping("/history")
    @PreAuthorize("hasRole('ROLE_USER')")
    public ResponseEntity<RentalListResponse> getHistoryByCustomerId(
            @RequestParam(value = "page") int page,
            @RequestParam(value = "limit") int limit,
            HttpServletRequest req) throws Exception {
        PageRequest pageRequest = PageRequest.of(
                page, limit,
                Sort.by("createdDate").descending());
        Page<RentalResponse> rentalPage = rentalService.getHistoryByCustomerId(req.getRemoteUser(), pageRequest);

        int totalPage = rentalPage.getTotalPages();

        List<RentalResponse> rentals = rentalPage.getContent();
        return ResponseEntity.ok(RentalListResponse.builder()
                .rentals(rentals)
                .totalPages(totalPage)
                .build());
    }

    @GetMapping("/expiring")
    @PreAuthorize("hasRole('ROLE_ADMIN') or hasRole('ROLE_SALES')")
    public ResponseEntity<RentalListResponse> getAllExpiringRentals(
            @RequestParam("page") int page,
            @RequestParam("limit") int limit) throws Exception {
        PageRequest pageRequest = PageRequest.of(
                page, limit,
                Sort.by("createdDate").descending());
        Page<RentalResponse> rentalPage;

        rentalPage = rentalService.getAllExpiringRentals(pageRequest);

        int totalPage = rentalPage.getTotalPages();

        List<RentalResponse> rentals = rentalPage.getContent();
        return ResponseEntity.ok(RentalListResponse.builder()
                .rentals(rentals)
                .totalPages(totalPage)
                .build());
    }
}



