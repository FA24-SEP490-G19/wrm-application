package com.wrm.application.controller;

import com.wrm.application.exception.DataNotFoundException;
import com.wrm.application.response.contract.ContractResponse;
import com.wrm.application.service.IContractService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/contracts")
@RequiredArgsConstructor
public class ContractController {
    private final IContractService contractService;

    @GetMapping("")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_SALE')")
    public ResponseEntity<ContraclResponse> getAllContracts(
            @RequestParam("page") int page,
            @RequestParam("limit") int limit,
            @RequestParam(value = "keyword", required = false) String keyword) {

        PageRequest pageRequest = PageRequest.of(page, limit, Sort.by("createdDate").descending());

        Page<ContractResponse> contractPage;
        if (keyword != null && !keyword.isEmpty()) {
            contractPage = contractService.getContractByNameCustomer(keyword, pageRequest);
        } else {
            contractPage = contractService.getAllContracts(pageRequest);
        }

        int totalPages = contractPage.getTotalPages();
        long totalElements = contractPage.getTotalElements();
        int currentPage = contractPage.getNumber();
        List<ContractResponse> contracts = contractPage.getContent();

        ContractResponse response = ContractResponse.builder()
                .contracts(contracts)
                .totalPages(totalPages)
                .totalElements(totalElements)
                .currentPage(currentPage)
                .build();
        return ResponseEntity.ok(response);
    }


    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_SALE')")
    public ResponseEntity<ContractResponse> getContractDetailsById(@PathVariable Long id) {
        try {
            ContractResponse contractResponse = contractService.getContractDetailsByRentalId(id);
            return new ResponseEntity<>(contractResponse, HttpStatus.OK);
        } catch (DataNotFoundException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
}

