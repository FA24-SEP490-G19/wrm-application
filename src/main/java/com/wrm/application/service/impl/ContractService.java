package com.wrm.application.service.impl;

import com.wrm.application.dto.ContractDTO;
import com.wrm.application.dto.ContractImageDTO;
import com.wrm.application.exception.DataNotFoundException;
import com.wrm.application.exception.PermissionDenyException;
import com.wrm.application.model.*;
import com.wrm.application.repository.*;
import com.wrm.application.response.contract.ContractDetailResponse;
import com.wrm.application.response.contract.ContractImagesResponse;
import com.wrm.application.response.contract.CreateContractResponse;
import com.wrm.application.service.IContractService;
import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;


@Service
@RequiredArgsConstructor
public class ContractService implements IContractService {
    private final ContractRepository contractRepository;
    private final RentalDetailRepository rentalDetailRepository;
    private final ContractImageRepository contractImageRepository;
    private final UserRepository userRepository;



    @Override
    public ContractDetailResponse getContractDetailsByContractId(Long contractId, String remoteUser)
            throws DataNotFoundException, PermissionDenyException {

        User currentUser = userRepository.findByEmail(remoteUser)
                .orElseThrow(() -> new DataNotFoundException("User not found with email: " + remoteUser));

        Contract contract = contractRepository.findContractById(contractId)
                .orElseThrow(() -> new DataNotFoundException("Contract not found with ID: " + contractId));

        RentalDetail rentalDetail = rentalDetailRepository.findByContractId(contractId)
                .orElseThrow(() -> new DataNotFoundException("Rental Detail not found with Contract ID: " + contractId));



        Rental rental = rentalDetail.getRental();
        User customer = rental.getCustomer();
        User sales = rental.getSales();
        Warehouse warehouse = rental.getWarehouse();
        Lot lot = rentalDetail.getLot();

        List<String> contractImageLinks = contractImageRepository.findAllByContractId(contractId)
                .stream()
                .map(ContractImage::getContractImgLink)
                .collect(Collectors.toList());

        ContractDetailResponse.ContractDetailResponseBuilder responseBuilder = ContractDetailResponse.builder()
                .id(contract.getId())
                .signedDate(contract.getSignedDate())
                .expiryDate(contract.getExpiryDate())
                .contractImageLinks(contractImageLinks)
                .warehouseName(warehouse.getName())
                .warehouseAddress(warehouse.getAddress())
                .lotDescription(lot.getDescription())
                .additionalService(rentalDetail.getAdditionalService().getName());

        if ("ADMIN".equals(currentUser.getRole().getRoleName()) || "SALES".equals(currentUser.getRole().getRoleName())) {
            responseBuilder
                    .customerFullName(customer.getFullName())
                    .customerPhoneNumber(customer.getPhoneNumber())
                    .saleFullName(sales.getFullName())
                    .salePhoneNumber(sales.getPhoneNumber());
        } else if (!"USER".equals(currentUser.getRole().getRoleName())) {
            throw new PermissionDenyException("User role is not authorized to view contract details.");
        }

        return responseBuilder.build();
    }

    @Override
    public CreateContractResponse createContract(ContractDTO contractDTO) throws Exception {
        if (contractDTO.getSignedDate() == null) {
            throw new IllegalArgumentException("Contract signing date cannot be null");
        }
        if (contractDTO.getExpiryDate() == null) {
            throw new IllegalArgumentException("Contract expiry date cannot be null");
        }

        Contract newContract = Contract.builder()
                .signedDate(contractDTO.getSignedDate())
                .expiryDate(contractDTO.getExpiryDate())
                .build();

        contractRepository.save(newContract);

        return CreateContractResponse.builder()
                .id(newContract.getId())
                .signedDate(newContract.getSignedDate())
                .expiryDate(newContract.getExpiryDate())
                .build();
    }

    @Override
    public ContractImagesResponse addImagesByContractId(Long contractId, ContractImageDTO contractImageDTO) throws Exception {
        if (contractId == null) {
            throw new IllegalArgumentException("Contract ID cannot be null");
        }
        if (contractImageDTO.getContractImageLinks() == null || contractImageDTO.getContractImageLinks().isEmpty()) {
            throw new IllegalArgumentException("Image list cannot be empty");
        }

        Contract contract = contractRepository.findContractById(contractId)
                .orElseThrow(() -> new DataNotFoundException("Contract not found with ID: " + contractId));

        List<ContractImage> contractImages = contractImageDTO.getContractImageLinks().stream()
                .map(link -> ContractImage.builder()
                        .contract(contract)
                        .contractImgLink(link)
                        .build())
                .collect(Collectors.toList());

        contractImageRepository.saveAll(contractImages);

        return ContractImagesResponse.builder()
                .contractId(contractId)
                .imageLinks(contractImageDTO.getContractImageLinks())
                .build();
    }

    @Override
    public CreateContractResponse updateContract(Long contractId, ContractDTO contractDTO) throws Exception {
        Contract contract = contractRepository.findContractById(contractId)
                .orElseThrow(() -> new DataNotFoundException("Contract not found"));

        contract.setSignedDate(contractDTO.getSignedDate());
        contract.setExpiryDate(contractDTO.getExpiryDate());
        contract.setDeleted(contractDTO.getIsDeleted());

        contractRepository.save(contract);

        return CreateContractResponse.builder()
                .id(contract.getId())
                .signedDate(contract.getSignedDate())
                .expiryDate(contract.getExpiryDate())
                .isDeleted(contract.isDeleted())
                .build();
    }

    @Override
    public List<ContractDetailResponse> getAllContractDetails(String remoteUser) throws DataNotFoundException, PermissionDenyException {
        User currentUser = userRepository.findByEmail(remoteUser)
                .orElseThrow(() -> new DataNotFoundException("User not found with email: " + remoteUser));

        List<Contract> contracts = contractRepository.findAll();

        return contracts.stream()
                .map(contract -> {
                    ContractDetailResponse.ContractDetailResponseBuilder responseBuilder = ContractDetailResponse.builder()
                            .id(contract.getId())
                            .signedDate(contract.getSignedDate())
                            .expiryDate(contract.getExpiryDate());

                    // Get contract images
                    List<String> contractImageLinks = contractImageRepository
                            .findAllByContractId(contract.getId())
                            .stream()
                            .map(ContractImage::getContractImgLink)
                            .collect(Collectors.toList());
                    responseBuilder.contractImageLinks(contractImageLinks);

                    // Try to get rental details if they exist
                    Optional<RentalDetail> optionalRentalDetail = rentalDetailRepository.findByContractId(contract.getId());

                    if (optionalRentalDetail.isPresent()) {
                        RentalDetail rentalDetail = optionalRentalDetail.get();
                        Rental rental = rentalDetail.getRental();
                        User customer = rental.getCustomer();
                        User sales = rental.getSales();
                        Warehouse warehouse = rental.getWarehouse();
                        Lot lot = rentalDetail.getLot();

                        responseBuilder
                                .warehouseName(warehouse.getName())
                                .warehouseAddress(warehouse.getAddress())
                                .lotDescription(lot.getDescription())
                                .additionalService(rentalDetail.getAdditionalService().getName());

                        // Add sensitive information only for ADMIN and SALES roles
                        if ("ADMIN".equals(currentUser.getRole().getRoleName()) ||
                                "SALES".equals(currentUser.getRole().getRoleName())) {
                            responseBuilder
                                    .customerFullName(customer.getFullName())
                                    .customerPhoneNumber(customer.getPhoneNumber())
                                    .customerAddress(customer.getAddress())
                                    .saleFullName(sales.getFullName())
                                    .salePhoneNumber(sales.getPhoneNumber());
                        }
                    } else {
                        // Set default values when RentalDetail is not found
                        responseBuilder
                                .warehouseName("N/A")
                                .warehouseAddress("N/A")
                                .lotDescription("N/A")
                                .additionalService("N/A");

                        if ("ADMIN".equals(currentUser.getRole().getRoleName()) ||
                                "SALES".equals(currentUser.getRole().getRoleName())) {
                            responseBuilder
                                    .customerFullName("N/A")
                                    .customerPhoneNumber("N/A")
                                    .customerAddress("N/A")
                                    .saleFullName("N/A")
                                    .salePhoneNumber("N/A");
                        }
                    }

                    return responseBuilder.build();
                })
                .collect(Collectors.toList());
    }


}




   


