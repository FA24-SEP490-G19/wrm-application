package com.wrm.application.controller;

import com.wrm.application.dto.LotDTO;
import com.wrm.application.exception.DataNotFoundException;
import com.wrm.application.exception.PermissionDenyException;
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
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;


import java.util.List;

@RestController
@RequestMapping("/lots")
@RequiredArgsConstructor
public class LotController {
    private final ILotService lotService;

    @GetMapping("/{id}")
    public ResponseEntity<List<LotResponse>> getAvailableLots(
            @PathVariable Long id) {
        return ResponseEntity.ok(lotService.getAvailableLotsByWarehouseId(id));
    }


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

    @GetMapping("/warehouses/{id}")
    public ResponseEntity<LotResponse> getLotByWarehouseId(@PathVariable Long id) throws Exception {
        return ResponseEntity.ok(lotService.getLotByWarehouseID(id));
    }

    @PutMapping("/update/{id}")
    @PreAuthorize("hasRole('ROLE_ADMIN') or hasRole('ROLE_MANAGER')")
    public ResponseEntity<?> updateLot(@PathVariable Long id, @Valid @RequestBody LotDTO lotDTO, BindingResult result) {
        try {

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
            return ResponseEntity.ok("Xóa lô hàng thành công");
        } catch (DataNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/updateStatus/{lotId}")
    @PreAuthorize("hasRole('ROLE_MANAGER') or hasRole('ROLE_ADMIN')")
    public ResponseEntity<LotResponse> updateLotStatus(
            @PathVariable Long lotId,
            @RequestBody LotDTO lotDTO,
            @AuthenticationPrincipal UserDetails remoteUser) {

        try {
            LotResponse updatedLot = lotService.updateLotStatus(lotId, lotDTO, remoteUser.getUsername());
            return ResponseEntity.ok(updatedLot);
        } catch (DataNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        } catch (PermissionDenyException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(null);
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(null);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

}





