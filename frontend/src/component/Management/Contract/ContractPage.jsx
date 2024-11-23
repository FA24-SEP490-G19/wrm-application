// pages/ContractPage.jsx
import React, { useState, useEffect } from 'react';
import { Search, Plus, Loader2, Edit2, Trash2, Eye } from 'lucide-react';
import CRMLayout from "../Crm.jsx";
import { useToast } from "../../../context/ToastProvider.jsx";
import ContractModal from "./ContractModal.jsx";
import {
    createContract,
    getAllContract, updateContract
} from '../../../service/Contract.js';
import axios from "axios";
import {useAuth} from "../../../context/AuthContext.jsx";

const ContractList = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [contracts, setContracts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { showToast } = useToast();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create');
    const [selectedContract, setSelectedContract] = useState(null);
    const { customer } = useAuth();

    useEffect(() => {
        fetchContracts();
    }, []);

    const getAuthConfig = () => ({
        headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
    });


    const uploadContractImages = async (contractId, imageLinks) => {
        try {
            const response = await axios.post(
                `http://localhost:8080/contracts/${contractId}/add-images`,
                {
                    contract_img_link: imageLinks
                },
                getAuthConfig()
            );
            return response.data;
        } catch (error) {
            console.error('Error uploading images:', error);
            throw error;
        }
    };
    const fetchContracts = async () => {
        try {
            setLoading(true);
            const response = await getAllContract();
            if (response && response.data) {
                setContracts(response.data);
            } else {
                setContracts([]);
            }
            setError(null);
        } catch (err) {
            console.error('Error fetching contracts:', err);
            setError('Không thể tải dữ liệu hợp đồng');
            setContracts([]);
            showToast?.('Không thể tải dữ liệu hợp đồng', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleAddContract = () => {
        setModalMode('create');
        setSelectedContract(null);
        setIsModalOpen(true);
    };

    const handleEditContract = (contract) => {
        setModalMode('edit');
        setSelectedContract(contract);
        setIsModalOpen(true);
    };

    const handleViewContract = (contract) => {
        setModalMode('view');
        setSelectedContract(contract);
        setIsModalOpen(true);
    };



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

    // Filter contracts based on search term
    const filteredContracts = contracts?.filter(contract => {
        if (!searchTerm) return true;

        const searchLower = searchTerm.toLowerCase();
        return (
            contract?.customerFullName?.toLowerCase().includes(searchLower) ||
            contract?.warehouseName?.toLowerCase().includes(searchLower) ||
            contract?.saleFullName?.toLowerCase().includes(searchLower)
        );
    }) || [];

    const formatDateTime = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader2 className="w-8 h-8 text-indigo-600 animate-spin"/>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 text-center">
                <p className="text-red-600">{error}</p>
                <button
                    onClick={fetchContracts}
                    className="mt-4 px-4 py-2 text-indigo-600 hover:text-indigo-800"
                >
                    Thử lại
                </button>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Quản lý Hợp đồng</h1>
                    <p className="text-gray-600">Quản lý các hợp đồng trong hệ thống</p>
                </div>
                {customer.role === "ROLE_SALES" ? (
                <div className="flex gap-3">

                    <button
                        onClick={handleAddContract}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4"/>
                        Thêm hợp đồng mới
                    </button>
                </div>
                    ) : "" }
            </div>

            {/* Search */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5"/>
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo tên khách hàng, tên kho..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>
            </div>

            {/* Contracts Table */}
            <div className="bg-white rounded-xl shadow">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                        <tr className="border-b border-gray-200">
                            <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Thời gian ký</th>
                            <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Thời gian hết hạn</th>
                            <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">
                                <div>Kho</div>
                            </th>
                            <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Miêu tả lô cho thuê
                            </th>

                            <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">
                                <div>Khách hàng</div>
                            </th>
                            <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">
                                <div>Mô giới</div>

                            </th>
                            <th className="px-6 py-4 text-right text-sm font-medium text-gray-500">Thao tác</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                        {filteredContracts.map((contract) => (
                            <tr key={contract.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    {formatDateTime(contract.signedDate)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    {formatDateTime(contract.expiryDate)}
                                </td>

                                <td className="px-6 py-4 text-sm">
                                    <div className="font-medium">{contract.warehouseName}</div>
                                    <div className="text-gray-500">{contract.warehouseAddress}</div>
                                    <div className="text-gray-500 truncate max-w-xs">{contract.additionalService}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">{contract.lotDescription}</td>
                                <td className="px-6 py-4 text-sm">
                                    <div className="font-medium">{contract.customerFullName}</div>
                                    <div className="text-gray-500">{contract.customerPhoneNumber}</div>
                                    <div className="text-gray-500 truncate max-w-xs">{contract.customerAddress}</div>
                                </td>
                                <td className="px-6 py-4 text-sm">
                                    <div className="font-medium">{contract.saleFullName}</div>
                                    <div className="text-gray-500">{contract.salePhoneNumber}</div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end space-x-2">
                                        <button
                                            onClick={() => handleViewContract(contract)}
                                            className="p-1 text-gray-600 hover:text-gray-800"
                                            title="Xem chi tiết"
                                        >
                                            <Eye className="w-5 h-5"/>
                                        </button>
                                        {customer.role === "ROLE_SALES" || customer.role === "ROLE_ADMIN" ? (

                                            <button
                                            onClick={() => handleEditContract(contract)}
                                            className="p-1 text-blue-600 hover:text-blue-800"
                                            title="Sửa hợp đồng"
                                        >
                                            <Edit2 className="w-5 h-5"/>
                                        </button>
                                            ) : ""}

                                    </div>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="px-6 py-4 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-500">
                            Hiển thị {filteredContracts.length} hợp đồng
                        </div>
                    </div>
                </div>
            </div>

            {/* Contract Modal */}
            {isModalOpen && (
                <ContractModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    mode={modalMode}
                    contractData={selectedContract}
                    onSubmit={handleModalSubmit}
                />
            )}
        </div>
    );
};

// Wrap with CRMLayout
export const ContractPage = () => (
    <CRMLayout>
        <ContractList/>
    </CRMLayout>
);