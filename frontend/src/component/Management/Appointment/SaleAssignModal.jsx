// components/SaleAssignModal.jsx
import React, { useState, useEffect } from 'react';
import { X, Loader } from 'lucide-react';
import {getAllItems} from "../../../service/WareHouse.js";
import {getAllSales} from "../../../service/Authenticate.js";

const SaleAssignModal = ({ isOpen, onClose, appointmentId, onAssign }) => {
    const [sales, setSales] = useState([]);
    const [selectedSaleId, setSelectedSaleId] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (isOpen) {
            fetchSales();
        }
    }, [isOpen]);

    const fetchSales = async () => {
        setLoading(true);
        try {
            const response = await getAllSales();
            setSales(response.data || []);
        } catch (error) {
            console.error('Error fetching sales:', error);
            setError('Không thể tải danh sách nhân viên sale');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (selectedSaleId) {
            onAssign(appointmentId, selectedSaleId);
        }
    };

    if (!isOpen) return null;

    return (
        <>
            <div
                className="fixed inset-0 bg-black bg-opacity-25 backdrop-blur-sm transition-opacity z-40"
                onClick={onClose}
            />
            <div className="fixed inset-0 z-50 overflow-y-auto">
                <div className="flex min-h-screen items-center justify-center p-4">
                    <div className="bg-white rounded-xl w-full max-w-md shadow-xl transform transition-all">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold">Phân công nhân viên sale</h2>
                                <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                                    <X className="w-6 h-6"/>
                                </button>
                            </div>

                            {loading ? (
                                <div className="flex justify-center py-4">
                                    <Loader className="w-8 h-8 text-indigo-600 animate-spin"/>
                                </div>
                            ) : error ? (
                                <div className="text-red-600 text-center py-4">{error}</div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Chọn nhân viên sale
                                        </label>
                                        <select
                                            value={selectedSaleId}
                                            onChange={(e) => setSelectedSaleId(e.target.value)}
                                            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            required
                                        >
                                            <option value="">Chọn nhân viên</option>
                                            {sales.map(sale => (
                                                <option key={sale.id} value={sale.id}>
                                                    {sale.fullname} - {sale.email}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="flex justify-end space-x-3 pt-4">
                                        <button
                                            type="button"
                                            onClick={onClose}
                                            className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                                        >
                                            Hủy
                                        </button>
                                        <button
                                            type="submit"
                                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                                            disabled={!selectedSaleId}
                                        >
                                            Phân công
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default SaleAssignModal;