package com.wrm.application.controller;

import com.wrm.application.component.enums.LotStatus;
import com.wrm.application.dto.LotDTO;
import com.wrm.application.exception.DataNotFoundException;
import com.wrm.application.service.IUserService;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.validation.FieldError;

import com.wrm.application.model.Lot;
import com.wrm.application.service.ILotService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/lots")
@RequiredArgsConstructor
public class LotController {
    private final ILotService lotService;

    @GetMapping("")
    public List<Lot> getAllLots() {
        return lotService.getAllLots();
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getLotById(@PathVariable Long id) throws DataNotFoundException {
        return ResponseEntity.ok(lotService.getLotById(id));
    }

    @PutMapping("/updateStatus/{lotId}")
    @PreAuthorize("hasRole('ROLE_MANAGER')")
    public ResponseEntity<?> updateLotStatus(@PathVariable Long lotId, @Valid @RequestBody LotDTO lotDTO, BindingResult result) {
        if (result.hasErrors()) {
            List<String> errorMessage = result.getFieldErrors()
                    .stream()
                    .map(FieldError::getDefaultMessage)
                    .collect(Collectors.toList());
            return ResponseEntity.badRequest().body("Invalid data: " + errorMessage);
        }
        try {
            Lot updatedLot = lotService.updateLotStatus(lotId, lotDTO);
            return ResponseEntity.ok(updatedLot);
        } catch (DataNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

}





