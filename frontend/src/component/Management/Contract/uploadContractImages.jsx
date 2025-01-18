// pages/ContractPage.jsx
import React, { useState, useEffect } from 'react';
import { Search, Plus, Loader2, Edit2, Eye } from 'lucide-react';
import CRMLayout from "../Crm.jsx";
import { useToast } from "../../../context/ToastProvider.jsx";
import ContractModal from "./ContractModal.jsx";
import {
    createContract,
    getAllContract,
    updateContract
} from '../../../service/Contract.js';

// Add this to your Contract.js service file
const uploadContractImages = async (contractId, imageLinks) => {
    try {
        const response = await fetch(`https://api.g42.biz/contracts/${contractId}/add-images`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contract_img_link: imageLinks
            })
        });

        if (!response.ok) {
            throw new Error('Failed to upload images');
        }

        return await response.json();
    } catch (error) {
        console.error('Error uploading images:', error);
        throw error;
    }
};

const ContractList = () => {
    // ... (keep existing state and other functions)

    const handleModalSubmit = async (contractData) => {
        try {
            let response;
            if (modalMode === 'create') {
                response = await createContract(contractData);
                if (contractData.contract_img_link?.length > 0) {
                    await uploadContractImages(response.data.id, contractData.contract_img_link);
                }
                showToast('Thêm mới hợp đồng thành công', 'success');
            } else {
                response = await updateContract(selectedContract.id, contractData);
                if (contractData.contract_img_link?.length > 0) {
                    await uploadContractImages(selectedContract.id, contractData.contract_img_link);
                }
                showToast('Cập nhật hợp đồng thành công', 'success');
            }
            setIsModalOpen(false);
            fetchContracts();
        } catch (error) {
            showToast(`Thao tác thất bại: ${error.message}`, 'error');
        }
    };

    // ... (rest of the component remains the same)
};

// ... (rest of the file remains the same)