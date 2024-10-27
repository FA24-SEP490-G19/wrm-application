package com.wrm.application.service;

import com.wrm.application.dto.ContractDTO;
import com.wrm.application.exception.DataNotFoundException;
import com.wrm.application.model.Contract;

import java.util.List;

public interface IContractService {

    List<Contract> getAllContracts();

    Contract getContractById(long id) throws DataNotFoundException;

}

