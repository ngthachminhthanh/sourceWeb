import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { User, LogOut, Home, ShoppingBag, Package, Users, ChevronDown } from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';

const Categories = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

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
                    <h1 className="text-2xl font-semibold text-gray-800">Quản lý danh mục</h1>
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
                    <h1>Đây là nội dung của Categories.jsx</h1>
                </main>
            </div>
        </div>
    );
};

export default Categories;