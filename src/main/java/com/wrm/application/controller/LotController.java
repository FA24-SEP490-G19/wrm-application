package com.wrm.application.controller;

import com.wrm.application.model.Lot;
import com.wrm.application.service.LotService;
import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequiredArgsConstructor
@RequestMapping("${api.prefix}/lots")
public class LotController {

    private final LotService lotService;

    // API để lấy tất cả các Lot có trong một warehouse
    @GetMapping("/warehouse/{warehouseId}")
    public ResponseEntity<List<Lot>> getLotsByWarehouseId(@PathVariable Long warehouseId) {
        List<Lot> lots = lotService.getLotsByWarehouseId(warehouseId);
        if (lots.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
        return ResponseEntity.ok(lots);
    }

    // API để lấy chi tiết của một Lot cụ thể trong một warehouse
    @GetMapping("/warehouse/{warehouseId}/lot/{lotId}")
    public ResponseEntity<?> getLotDetail(@PathVariable Long warehouseId, @PathVariable Long lotId) {
        Optional<Lot> lot = lotService.getLotDetail(warehouseId, lotId);
        return lot.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }
}
