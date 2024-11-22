package com.wrm.application.service.impl;

import com.wrm.application.dto.contract.ContractDTO;
import com.wrm.application.dto.contract.ContractUpdateDTO;
import com.wrm.application.exception.DataNotFoundException;
import com.wrm.application.exception.PermissionDenyException;
import com.wrm.application.model.*;
import com.wrm.application.repository.*;
import com.wrm.application.response.contract.ContractDetailResponse;
import com.wrm.application.response.contract.CreateContractResponse;
import com.wrm.application.response.contract.UpdateContractResponse;
import com.wrm.application.service.IContractService;
import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.*;
import java.util.stream.Collectors;


@Service
@RequiredArgsConstructor
public class ContractService implements IContractService {
    private final ContractRepository contractRepository;
    private final RentalDetailRepository rentalDetailRepository;
    private final ContractImageRepository contractImageRepository;
    private final UserRepository userRepository;



    @Override
    public ContractDetailResponse getContractDetailsByContractId(Long contractId, String remoteUser) throws Exception {
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

        List<ContractImage> contractImages = new ArrayList<>();
        if (contractDTO.getImages() != null) {
            for (String base64Image : contractDTO.getImages()) {
                byte[] imageBytes = Base64.getDecoder().decode(base64Image);
                String fileName = saveImageContractToFileSystem(imageBytes);

                ContractImage contractImage = ContractImage.builder()
                        .contract(newContract)
                        .contractImgLink(fileName)
                        .build();
                contractImages.add(contractImage);
            }
            contractImageRepository.saveAll(contractImages);
        }

        return CreateContractResponse.builder()
                .id(newContract.getId())
                .signedDate(newContract.getSignedDate())
                .expiryDate(newContract.getExpiryDate())
                .build();
    }

    private String saveImageContractToFileSystem(byte[] imageBytes) throws IOException {
        if (imageBytes == null || imageBytes.length == 0) {
            throw new IllegalArgumentException("Image bytes cannot be null or empty");
        }

        if (imageBytes.length > 10 * 1024 * 1024) {
            throw new IllegalArgumentException("Image size exceeds the maximum limit of 10MB.");
        }

        String fileName = UUID.randomUUID().toString() + ".png";
        Path path = Paths.get("uploads/images/contract/" + fileName);
        Files.createDirectories(path.getParent());
        Files.write(path, imageBytes);
        return path.toString();
    }

    @Override
    public UpdateContractResponse updateContract(Long contractId, ContractUpdateDTO contractUpdateDTO) throws Exception {
        Contract contract = contractRepository.findContractById(contractId)
                .orElseThrow(() -> new DataNotFoundException("Contract not found with ID: " + contractId));
        if (contractUpdateDTO.getSignedDate() != null) {
            contract.setSignedDate(contractUpdateDTO.getSignedDate());
        }
        if (contractUpdateDTO.getExpiryDate() != null) {
            contract.setExpiryDate(contractUpdateDTO.getExpiryDate());
        }
        if (contractUpdateDTO.getImages() != null && !contractUpdateDTO.getImages().isEmpty()) {
            List<ContractImage> existingImages = contractImageRepository.findAllByContractId(contractId);
            for (ContractImage img : existingImages) {
                deleteImageFile(img.getContractImgLink());
            }
            contractImageRepository.deleteAllByContractId(contractId);

            List<ContractImage> updatedImages = new ArrayList<>();
            for (String base64Image : contractUpdateDTO.getImages()) {
                byte[] imageBytes = Base64.getDecoder().decode(base64Image);
                String fileName = saveImageContractToFileSystem(imageBytes);

                ContractImage contractImage = ContractImage.builder()
                        .contract(contract)
                        .contractImgLink(fileName)
                        .build();
                updatedImages.add(contractImage);
            }
            contractImageRepository.saveAll(updatedImages);
        }

        contractRepository.save(contract);

        return UpdateContractResponse.builder()
                .id(contract.getId())
                .signedDate(contract.getSignedDate())
                .expiryDate(contract.getExpiryDate())
                .build();
    }


    private void deleteImageFile(String filePath) throws IOException {
        Path path = Paths.get(filePath);
        Files.deleteIfExists(path);
    }

    @Override
    public void deleteContract(Long contractId) throws Exception {
        Contract contract = contractRepository.findById(contractId)
                .orElseThrow(() -> new DataNotFoundException("Contract not found with ID: " + contractId));
       
        List<ContractImage> contractImages = contractImageRepository.findAllByContractId(contractId);
        for (ContractImage img : contractImages) {
            deleteImageFile(img.getContractImgLink());
        }
        contractImageRepository.deleteAll(contractImages);

        contractRepository.delete(contract);
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




   


