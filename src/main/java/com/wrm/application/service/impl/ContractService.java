package com.wrm.application.service.impl;

import com.wrm.application.dto.ContractDTO;
import com.wrm.application.exception.DataNotFoundException;
import com.wrm.application.model.*;
import com.wrm.application.repository.*;
import com.wrm.application.response.contract.ContractResponse;
import com.wrm.application.service.IContractService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;


@Service
@RequiredArgsConstructor
public class ContractService implements IContractService {
    private final ContractRepository contractRepository;
    private final WarehouseRepository warehouseRepository;
    private final RentalRepository rentalRepository;
    private final RentalDetailsRepository rentalDetailsRepository;
    private final UserRepository userRepository;
    private final LotRepository lotRepository;
    private final ContractImageRepository contractImageRepository;

    @Override
    public Page<ContractResponse> getAllContracts(PageRequest pageRequest) {
        return contractRepository.findAll(pageRequest).map(contract -> {
            return ContractResponse.builder()
                    .id(contract.getId())
                    .signedDate(contract.getSignedDate())
                    .expiryDate(contract.getExpiryDate())
                    .build();
        });
    }

    @Override
    public ContractResponse getContractDetailsByRentalId(long id) throws DataNotFoundException {
            Contract contract = contractRepository.findContractById(id)
                    .orElseThrow(() -> new DataNotFoundException("Contract not found with id: " + id));
            Rental rental = rentalRepository.findRentalById(contract.getRentalId())
                    .orElseThrow(() -> new DataNotFoundException("Rental not found with id: " + contract.getRentalId()));
            User customer = userRepository.findById(rental.getCustomerId())
                    .orElseThrow(() -> new DataNotFoundException("Customer not found"));
            User sale = userRepository.findById(rental.getSaleId())
                    .orElseThrow(() -> new DataNotFoundException("Sale not found"));
            Warehouse warehouse = warehouseRepository.findById(rental.getWarehouseId())
                    .orElseThrow(() -> new DataNotFoundException("Warehouse not found"));
            RentalDetails rentalDetails = rentalDetailsRepository.findByRentalId(rental.getId())
                    .orElseThrow(() -> new DataNotFoundException("Rental details not found"));
            Lot lot = lotRepository.findLotById(rentalDetails.getLot().getId())
                    .orElseThrow(() -> new DataNotFoundException("Lot not found"));
            List<ContractImage> contractImages = contractImageRepository.findAllByContractId(contract.getId());
            List<String> contractImageLinks = contractImages.stream()
                    .map(ContractImage::getContractImgLink)
                    .collect(Collectors.toList());

        return ContractResponse.builder()
                    .id(contract.getId())
                    .rentalId(contract.getRentalId())
                    .signedDate(contract.getSignedDate())
                    .expiryDate(contract.getExpiryDate())
                    .customerFullName(customer.getFullName())
                    .customerGender(customer.getGender().name())
                    .customerPhoneNumber(customer.getPhoneNumber())
                    .customerAddress(customer.getAddress())
                    .saleFullName(sale.getFullName())
                    .warehouseName(warehouse.getName())
                    .warehouseAddress(warehouse.getAddress())
                    .contractImageLinks(contractImageLinks)
                    .lotDescription(lot.getDescription())
//                    .rentalStartDate(rentalDetails.getStartDate())
//                    .rentalEndDate(rentalDetails.getEndDate())
                    .additionalService(rentalDetails.getAdditionalService())
                    .build();
        }

    @Override
    public ContractResponse CreateContractByRentalId(long rentalId, ContractDTO contractDTO) {
        return null;
    }

    @Override
    public Page<ContractResponse> getContractByNameCustomer(String keyword, PageRequest pageRequest) {
        return null;
    }

}




   


