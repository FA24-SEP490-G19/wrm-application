package com.wrm.application.service;

import com.wrm.application.dto.ContractDTO;
import com.wrm.application.dto.ContractImageDTO;
import com.wrm.application.exception.DataNotFoundException;
import com.wrm.application.exception.PermissionDenyException;
import com.wrm.application.response.contract.ContractDetailResponse;
import com.wrm.application.response.contract.ContractImagesResponse;
import com.wrm.application.response.contract.CreateContractResponse;

import java.util.List;

public interface IContractService {

    ContractDetailResponse getContractDetailsByContractId(Long contractId, String remoteUser)
            throws DataNotFoundException, PermissionDenyException;

    CreateContractResponse createContract(ContractDTO contractDTO) throws Exception;

    ContractImagesResponse addImagesByContractId(Long contractId, ContractImageDTO contractImageDTO) throws Exception;

    CreateContractResponse updateContract(Long contractId, ContractDTO contractDTO) throws Exception;

}

