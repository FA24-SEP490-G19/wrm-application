package com.wrm.application.controller;

import com.wrm.application.dto.ContractDTO;
import com.wrm.application.dto.ContractImageDTO;
import com.wrm.application.exception.DataNotFoundException;
import com.wrm.application.response.contract.ContractDetailResponse;
import com.wrm.application.response.contract.ContractImagesResponse;
import com.wrm.application.response.contract.CreateContractResponse;
import com.wrm.application.service.IContractService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import org.springframework.validation.FieldError;


import java.util.List;
import java.util.stream.Collectors;


@RestController
@RequestMapping("/contracts")
@RequiredArgsConstructor
public class ContractController {
    private final IContractService contractService;

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_ADMIN') or hasRole('ROLE_SALES') or hasRole('ROLE_USER')")
    public ResponseEntity<?> getContractDetailsById(@PathVariable Long id) {
        try {
            String remoteUser = SecurityContextHolder.getContext().getAuthentication().getName();
            ContractDetailResponse contractResponse = contractService.getContractDetailsByContractId(id, remoteUser);
            return new ResponseEntity<>(contractResponse, HttpStatus.OK);
        } catch (DataNotFoundException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping("/create")
    @PreAuthorize("hasRole('ROLE_SALES')")
    public ResponseEntity<?> createContract(
            @Valid @RequestBody ContractDTO contractDTO,
            BindingResult result) {

        if (result.hasErrors()) {
            List<String> errorMessages = result.getFieldErrors().stream()
                    .map(fieldError -> fieldError.getDefaultMessage())
                    .collect(Collectors.toList());
            return ResponseEntity.badRequest().body(errorMessages);
        }

        try {
            CreateContractResponse response = contractService.createContract(contractDTO);
            return new ResponseEntity<>(response, HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping("/{contractId}/add-images")
    @PreAuthorize("hasRole('ROLE_SALES')")
    public ResponseEntity<?> addImagesByContractId(
            @PathVariable Long contractId,
            @RequestBody ContractImageDTO contractImageDTO) {

        if (contractImageDTO.getContractImageLinks() == null || contractImageDTO.getContractImageLinks().isEmpty()) {
            return ResponseEntity.badRequest().body("Image list cannot be empty");
        }

        try {
            ContractImagesResponse response = contractService.addImagesByContractId(contractId, contractImageDTO);
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping("/{contractId}/update")
    @PreAuthorize("hasRole('ROLE_SALES') or hasRole('ROLE_ADMIN')")
    public ResponseEntity<?> updateContract(
            @PathVariable Long contractId,
            @Valid @RequestBody ContractDTO contractDTO) {

        try {
            CreateContractResponse response = contractService.updateContract(contractId, contractDTO);
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (DataNotFoundException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

}

