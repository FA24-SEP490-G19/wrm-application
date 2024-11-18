package com.wrm.application.service;

import com.wrm.application.dto.contract.ContractDTO;
import com.wrm.application.dto.contract.ContractUpdateDTO;
import com.wrm.application.exception.DataNotFoundException;
import com.wrm.application.exception.PermissionDenyException;
import com.wrm.application.response.contract.ContractDetailResponse;
import com.wrm.application.response.contract.CreateContractResponse;
import com.wrm.application.response.contract.UpdateContractResponse;

public interface IContractService {

    ContractDetailResponse getContractDetailsByContractId(Long contractId, String remoteUser) throws Exception;

    CreateContractResponse createContract(ContractDTO contractDTO) throws Exception;

    UpdateContractResponse updateContract(Long contractId, ContractUpdateDTO contractUpdateDTO) throws Exception;

    void deleteContract(Long contractId) throws Exception;



    List<ContractDetailResponse> getAllContractDetails(String remoteUser) throws DataNotFoundException, PermissionDenyException;
}

