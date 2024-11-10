package com.wrm.application.controller;

import com.wrm.application.dto.LotDTO;
import com.wrm.application.exception.DataNotFoundException;
import com.wrm.application.response.lot.LotListResponse;
import com.wrm.application.response.lot.LotResponse;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import com.wrm.application.service.ILotService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import org.springframework.validation.FieldError;


import java.util.List;

@RestController
@RequestMapping("/lots")
@RequiredArgsConstructor
public class LotController {
    private final ILotService lotService;

    @GetMapping("")
    public ResponseEntity<LotListResponse> getAllLots(
            @RequestParam("page") int page,
            @RequestParam("limit") int limit) {
        PageRequest pageRequest = PageRequest.of
                (page,limit, Sort.by("createdDate").descending());
        Page<LotResponse> lotsPage;
        lotsPage = lotService.getAllLots(pageRequest);
        int totalPages = lotsPage.getTotalPages();
        List<LotResponse> lots = lotsPage.getContent();
        return ResponseEntity.ok(LotListResponse.builder()
                .lots(lots)
                .totalPages(totalPages)
                .build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<LotResponse> getLotById(@PathVariable Long id) throws Exception {
        return ResponseEntity.ok(lotService.getLotById(id));
    }

    @PostMapping("/create")
    @PreAuthorize("hasRole('ROLE_ADMIN') or hasRole('ROLE_WAREHOUSE_MANAGER')")
    public ResponseEntity<?> createLot(@Valid @RequestBody LotDTO lotDTO, BindingResult result) {
        try {
            if (result.hasErrors()) {
                List<String> errorMessage = result.getFieldErrors().stream()
                        .map(FieldError::getDefaultMessage)
                        .toList();
                return ResponseEntity.badRequest().body(errorMessage);
            }
            LotResponse lotResponse = lotService.createLot(lotDTO);
            return ResponseEntity.ok(lotResponse);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/update/{id}")
    @PreAuthorize("hasRole('ROLE_ADMIN') or hasRole('ROLE_WAREHOUSE_MANAGER')")
    public ResponseEntity<?> updateLot(@PathVariable Long id, @Valid @RequestBody LotDTO lotDTO, BindingResult result) {
        try {
            if (result.hasErrors()) {
                List<String> errorMessage = result.getFieldErrors().stream()
                        .map(FieldError::getDefaultMessage)
                        .toList();
                return ResponseEntity.badRequest().body(errorMessage);
            }
            LotResponse updatedLot = lotService.updateLot(id, lotDTO);
            return ResponseEntity.ok(updatedLot);
        } catch (DataNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/delete/{id}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<?> deleteLot(@PathVariable Long id) {
        try {
            lotService.deleteLot(id);
            return ResponseEntity.ok("Lot deleted successfully");
        } catch (DataNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }


//    @PutMapping("/updateStatus/{lotId}")
//    @PreAuthorize("hasRole('ROLE_MANAGER')")
//    public ResponseEntity<LotResponse> updateLotStatus(@PathVariable Long lotId, @Valid @RequestBody LotDTO lotDTO, BindingResult result, HttpServletRequest req) {
//        if (result.hasErrors()) {
//            List<String> errorMessage = result.getFieldErrors()
//                    .stream()
//                    .map(FieldError::getDefaultMessage)
//                    .collect(Collectors.toList());
//            return ResponseEntity.badRequest().body("Invalid data: " + errorMessage);
//        }
//        try {
//            Lot updatedLot = lotService.updateLotStatus(lotId, lotDTO, req.getRemoteUser());
//            return ResponseEntity.ok(updatedLot);
//        } catch (DataNotFoundException e) {
//            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
//        } catch (PermissionDenyException e) {
//            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
//        } catch (Exception e) {
//            return ResponseEntity.badRequest().body(e.getMessage());
//        }
//    }


}





