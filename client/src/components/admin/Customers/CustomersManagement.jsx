import { useState, useEffect, useCallback, useMemo } from 'react';
import { Search, ChevronLeft, ChevronRight, AlertCircle, UserX } from 'lucide-react';
import axios from 'axios';
import "../../../assets/customCSS/LoadingEffect.css"

const CustomersManagement = () => {
    const [customers, setCustomers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [isSearching, setIsSearching] = useState(false);
    const [error, setError] = useState(null);

    const fetchCustomers = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const { data } = await axios.get(
                `http://localhost:5000/api/admin/customers?page=${currentPage}&search=${debouncedSearchTerm}`
            );
            
            setCustomers(data.customers);
            setTotalPages(data.totalPages);
        } catch (error) {
            console.error('Error fetching customers:', error);
            setError('Không thể kết nối với cơ sở dữ liệu. Vui lòng thử lại sau.');
            setCustomers([]);
            setTotalPages(1);
        } finally {
            setIsLoading(false);
            setIsSearching(false);
        }
    }, [currentPage, debouncedSearchTerm]);

    useEffect(() => {
        fetchCustomers();
    }, [fetchCustomers]);

    useEffect(() => {
        setIsSearching(true);
        const timerId = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
            setCurrentPage(1);
        }, 500);

        return () => {
            clearTimeout(timerId);
        };
    }, [searchTerm]);

    const renderContent = useMemo(() => {
        if (isLoading || isSearching) {
            return (
                <div className="flex justify-center items-center h-full">
                    <div className="loader mt-32"></div>
                </div>
            );
        }

        if (error) {
            return (
                <div className="flex flex-col items-center justify-center h-full text-red-500">
                    <div className='mt-36'>
                        <AlertCircle size={48} className="mb-4" />
                        <p className="text-lg font-semibold">{error}</p>
                        <button
                            onClick={fetchCustomers}
                            className="mt-4 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                        >
                            Thử lại
                        </button>
                    </div>
                </div>
            );
        }

        if (customers.length === 0) {
            return (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                    <div className='mt-36'>
                        <UserX size={48} className="mb-4" />
                        <p className="text-lg font-semibold">Không tìm thấy khách hàng nào.</p>
                        {debouncedSearchTerm && (
                            <p className="mt-2">
                                Không có kết quả cho tìm kiếm &ldquo;{debouncedSearchTerm}&ldquo;. Vui lòng thử lại với từ khóa khác.
                            </p>
                        )}
                    </div>
                </div>
            );
        }

        return (
            <table className="min-w-full bg-white">
                <thead>
                    <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                        <th className="py-3 px-6 text-left">ID</th>
                        <th className="py-3 px-6 text-left">Tên khách hàng</th>
                        <th className="py-3 px-6 text-left">Email</th>
                        <th className="py-3 px-6 text-center">Đơn hàng đã đặt</th>
                        <th className="py-3 px-6 text-center">Tổng tiền</th>
                    </tr>
                </thead>
                <tbody className="text-gray-600 text-sm">
                    {customers.map((customer, index) => (
                        <tr key={customer._id} className="border-b border-gray-200 hover:bg-gray-100">
                            <td className="py-3 px-6 text-left whitespace-nowrap">
                                {(currentPage - 1) * 5 + index + 1}
                            </td>
                            <td className="py-3 px-6 text-left">{customer.username}</td>
                            <td className="py-3 px-6 text-left">{customer.email}</td>
                            <td className="py-3 px-6 text-center">{customer.orders.length}</td>
                            <td className="py-3 px-6 text-center">
                                {customer.orders.reduce((sum, order) => sum + order.total_price, 0).toLocaleString()} đ
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        );
    }, [isLoading, isSearching, error, customers, currentPage, debouncedSearchTerm, fetchCustomers]);

    return (
        <div className="container mx-auto p-4">
            <div className="mb-8 relative">
                <input
                    type="text"
                    placeholder="Tìm kiếm theo tên hoặc email"
                    className="w-1/4 p-2 pl-10 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
            </div>

            {renderContent}

            {!isLoading && !isSearching && !error && customers.length > 0 && (
                <div className="flex justify-between items-center mt-8">
                    <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="flex items-center px-4 py-2 bg-gray-300 text-gray-700 rounded-lg disabled:opacity-50"
                    >
                        <ChevronLeft size={20} className="mr-2" /> Trước
                    </button>

                    <span>Trang {currentPage} / {totalPages}</span>

                    <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="flex items-center px-4 py-2 bg-gray-300 text-gray-700 rounded-lg disabled:opacity-50"
                    >
                        Sau <ChevronRight size={20} className="ml-2" />
                    </button>
                </div>
            )}
        </div>
    );
};

export default CustomersManagement;