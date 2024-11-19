import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { User, LogOut, Home, ShoppingBag, Package, Users, Download, ChevronDown } from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import axios from 'axios';

const Dashboard = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [exportType, setExportType] = useState('');
    const [dataType, setDataType] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

    const handleExport = async () => {
        if (!exportType || !dataType) {
            setError('Vui lòng chọn cả định dạng File và dữ liệu muốn kết xuất');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const response = await axios.get(`http://localhost:5000/api/admin/export/${dataType}`, {
                params: { format: exportType },
                responseType: 'blob',
            });

            const blob = new Blob([response.data], { 
                type: exportType === 'csv' ? 'text/csv' : 'application/json' 
            });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = `${dataType}_export.${exportType}`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error(err);
            setError('An error occurred while exporting data. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const menuItems = [
        { name: 'Trang chủ', icon: Home, route: '/admin/dashboard' },
        { name: 'Đơn hàng', icon: ShoppingBag, route: '/admin/orders' },
        { name: 'Sản phẩm', icon: Package, route: '/admin/products' },
        { name: 'Khách hàng', icon: Users, route: '/admin/customers' },
    ];

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <div className="w-64 bg-indigo-700 text-white">
                <div className="flex items-center justify-center h-16 bg-indigo-700">
                    <Link to="/admin/dashboard" className="text-2xl font-bold hover:text-indigo-200 transition duration-300">
                        MERN Shop
                    </Link>
                </div>
                <nav className="mt-8">
                    {menuItems.map((item) => (
                        <Link
                            key={item.name}
                            to={item.route}
                            className={`flex items-center px-6 py-3 text-indigo-100 hover:bg-indigo-600 transition-colors duration-200 ${
                                location.pathname === item.route ? 'bg-indigo-800' : ''
                            }`}
                        >
                            <item.icon className="h-5 w-5 mr-3" />
                            {item.name}
                        </Link>    
                    ))}
                </nav>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <header className="flex justify-between items-center p-4 bg-white shadow">
                    <h1 className="text-2xl font-semibold text-gray-800">Kết xuất File theo định dạng CSV / JSON</h1>
                    <div className="relative">
                        <button 
                            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                            className="flex items-center text-gray-700 hover:text-gray-900 focus:outline-none"
                        >
                            <User className="h-6 w-6 text-gray-400 mr-2" />
                            Admin
                            <ChevronDown className="w-4 h-4 ml-1" />
                        </button>
                        {isUserMenuOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                                <button
                                    onClick={handleLogout}
                                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                                >
                                    <LogOut className="inline w-4 h-4 mr-2" />
                                    Đăng xuất
                                </button>
                            </div>
                        )}
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
                    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-2xl font-semibold mb-4 text-gray-800">Kết xuất dữ liệu</h2>
                        <div className="space-y-4">
                            <div className="flex space-x-4">
                                <select
                                    value={exportType}
                                    onChange={(e) => setExportType(e.target.value)}
                                    className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                                >
                                    <option value="">Chọn định dạng File</option>
                                    <option value="csv">CSV</option>
                                    <option value="json">JSON</option>
                                </select>
                                <select
                                    value={dataType}
                                    onChange={(e) => setDataType(e.target.value)}
                                    className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                                >
                                    <option value="">Chọn bảng dữ liệu</option>
                                    <option value="customers">Customers</option>
                                    <option value="products">Products</option>
                                </select>
                                <button
                                    onClick={handleExport}
                                    disabled={isLoading}
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                                >
                                    {isLoading ? 'Đang xuất...' : 'Xuất'}
                                    <Download className="ml-2 -mr-1 h-5 w-5" />
                                </button>
                            </div>
                            {error && (
                                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                                    <span className="block sm:inline">{error}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Dashboard;