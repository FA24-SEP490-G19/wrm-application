package com.wrm.application.service;

import com.wrm.application.dto.ContractImageDTO;
import com.wrm.application.dto.contract.ContractDTO;
import com.wrm.application.dto.contract.ContractUpdateDTO;
import com.wrm.application.exception.DataNotFoundException;
import com.wrm.application.exception.PermissionDenyException;
import com.wrm.application.response.contract.ContractDetailResponse;
import com.wrm.application.response.contract.CreateContractResponse;
import com.wrm.application.response.contract.UpdateContractResponse;

import java.io.IOException;
import java.util.List;

public interface IContractService {

    ContractDetailResponse getContractDetailsByContractId(Long contractId, String remoteUser) throws Exception;

    CreateContractResponse createContract(ContractDTO contractDTO) throws Exception;

    UpdateContractResponse updateContract(Long contractId, ContractUpdateDTO contractUpdateDTO) throws Exception;

    void deleteContract(Long contractId) throws Exception;

    List<ContractDetailResponse> getAllContractDetails(String remoteUser) throws DataNotFoundException, PermissionDenyException;

    List<ContractDetailResponse> getAvailableContracts();


    byte[] getContractImage(String imageId) throws DataNotFoundException;

    List<String> getContractImageIds(Long contractId) throws DataNotFoundException;

    void deleteContractImage(Long contractId, String imageId) throws DataNotFoundException, IOException;

    List<String> updateContractImages(Long contractId, List<String> base64Images) throws DataNotFoundException, IOException;

    List<String> addContractImages(Long contractId, List<String> base64Images) throws DataNotFoundException, IOException;
}

