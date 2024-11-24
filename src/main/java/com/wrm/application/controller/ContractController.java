package com.wrm.application.controller;

import com.wrm.application.dto.contract.ContractDTO;
import com.wrm.application.dto.contract.ContractUpdateDTO;
import com.wrm.application.exception.DataNotFoundException;
import com.wrm.application.response.contract.ContractDetailResponse;
import com.wrm.application.response.contract.CreateContractResponse;
import com.wrm.application.response.contract.UpdateContractResponse;
import com.wrm.application.service.IContractService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/contracts")
@RequiredArgsConstructor
public class ContractController {
    private final IContractService contractService;

    @GetMapping
    @PreAuthorize("hasRole('ROLE_ADMIN') or hasRole('ROLE_SALES')")
    public ResponseEntity<?> getAllContracts() {
        try {
            String remoteUser = SecurityContextHolder.getContext().getAuthentication().getName();
            List<ContractDetailResponse> contracts = contractService.getAllContractDetails(remoteUser);
            return ResponseEntity.ok(contracts);
        } catch (DataNotFoundException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    @GetMapping("/sales")
    @PreAuthorize("hasRole('ROLE_SALES')")
    public ResponseEntity<?> getAllContractsBySale() {
        try {
            String remoteUser = SecurityContextHolder.getContext().getAuthentication().getName();
            List<ContractDetailResponse> contracts = contractService.getAllContractDetails(remoteUser);
            return ResponseEntity.ok(contracts);
        } catch (DataNotFoundException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }



    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_ADMIN') or hasRole('ROLE_SALES') or hasRole('ROLE_USER') or hasRole('ROLE_MANAGER')")
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
    public ResponseEntity<?> createContract(@RequestBody ContractDTO contractDTO) {
        try {
            CreateContractResponse response = contractService.createContract(contractDTO);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to create contract");
        }
    }

    @PutMapping("/{contractId}/update")
    @PreAuthorize("hasRole('ROLE_SALES') or hasRole('ROLE_ADMIN')")
    public ResponseEntity<UpdateContractResponse> updateContract(
            @PathVariable Long contractId,
            @Valid @RequestBody ContractUpdateDTO contractUpdateDTO) {
        try {
            UpdateContractResponse response = contractService.updateContract(contractId, contractUpdateDTO);
            return ResponseEntity.ok(response);
        } catch (DataNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @DeleteMapping("/{contractId}")
    @PreAuthorize("hasRole('ROLE_SALES') or hasRole('ROLE_ADMIN')")
    public ResponseEntity<String> deleteContract(@PathVariable Long contractId) {
        try {
            contractService.deleteContract(contractId);
            return ResponseEntity.ok("Contract deleted successfully");
        } catch (DataNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to delete contract");
        }
    }

}

