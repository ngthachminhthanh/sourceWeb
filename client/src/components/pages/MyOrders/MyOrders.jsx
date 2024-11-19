import { useState, useEffect } from 'react';
import { Package2, Truck, CheckCircle2, XCircle, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { IoIosLogOut } from "react-icons/io";
import { ShoppingCart, UserCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { getStatusName } from "../../../utils/utilities";
import axios from 'axios';

const MyOrders = () => {
	const [orders, setOrders] = useState([]);
	const [expandedOrders, setExpandedOrders] = useState({});
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const { user, logout } = useAuth();
	const navigate = useNavigate();

	const productsQuantityInCart = localStorage.getItem('cart') ? JSON.parse(localStorage.getItem('cart')).length : null;

	const toggleOrderExpand = (orderId) => {
		setExpandedOrders(prev => ({
			...prev,
			[orderId]: !prev[orderId]
		}));
	};

	useEffect(() => {
		const fetchOrders = async () => {
			try {
				const { data } = await axios.get(`http://localhost:5000/api/myorders/${user.email}`);
				setOrders(data);
				setLoading(true);
			} catch (error) {
				const errorMessage = error.response?.data?.message || 'Không thể tải dữ liệu đơn hàng';
				setError(errorMessage);
			} finally {
				setLoading(false);
			}
		};

		if (user?.email) {
			fetchOrders();
		}
	}, [user?.email]);

	if (loading) return <div className="text-center py-8">Đang tải...</div>;
	if (error) return <div className="text-red-500 text-center py-8">{error}</div>;
	if (orders.length === 0) return <div className="text-center py-8">Chưa có đơn hàng nào</div>;

	const getStatusIcon = (status) => {
		switch (status) {
			case 'waiting for confirmation':
				return <Clock className="w-5 h-5 text-yellow-500" />;
			case 'shipping':
				return <Truck className="w-5 h-5 text-blue-500" />;
			case 'delivered':
				return <CheckCircle2 className="w-5 h-5 text-green-500" />;
			case 'cancelled':
				return <XCircle className="w-5 h-5 text-red-500" />;
			default:
				return <Package2 className="w-5 h-5 text-gray-500" />;
		}
	};

	const handleLogout = () => {
		logout();
		localStorage.removeItem('cart');
		navigate('/');
	};

	return (
		<>
		<header className="bg-white shadow-md">
			<div className="container mx-auto px-4 py-2 flex justify-between items-center">
				<Link to="/" className="text-2xl font-bold hover:text-pink-700 transition duration-300">
					MERN Shop
				</Link>
				<div className="flex items-center space-x-4">
					{user ? (
						<>
							<span className="text-gray-600 ml-2 flex">
								<UserCircle className='mr-2' />
								{user.username}
							</span>
							<button className="px-4 py-2 text-gray-600 hover:text-blue-700 flex items-center">
								<Link to="/myorders">ĐƠN HÀNG CỦA TÔI</Link>
							</button>
							<button className="px-4 py-2 text-gray-600 hover:text-blue-700 flex items-center">
								<Link to="/cart">GIỎ HÀNG</Link>
								<div className='relative'>
									<ShoppingCart className="ml-2 text-gray-600" />
									{ productsQuantityInCart > 0 && (
										<span className="absolute top-[-8px] right-[-8px] bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 w-4 h-4 flex items-center justify-center">
											{JSON.parse(localStorage.getItem('cart')).length}
										</span>
									)}
								</div>
							</button>
							<button onClick={handleLogout} className="px-4 py-2 text-gray-600 hover:text-blue-700 flex items-center">
								ĐĂNG XUẤT
								<IoIosLogOut className="text-xl ml-2 text-gray-600"  />
							</button>
						</>
					) : (
						<>
							<button className="px-4 py-2 text-gray-600 hover:text-blue-700 flex items-center">
								<Link to="/cart">GIỎ HÀNG</Link>
								<div className='relative'>
									<ShoppingCart className="ml-2 text-gray-600" />
									{ productsQuantityInCart > 0 && (
										<span className="absolute top-[-8px] right-[-8px] bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 w-4 h-4 flex items-center justify-center">
											{JSON.parse(localStorage.getItem('cart')).length}
										</span>
									)}
								</div>
							</button>
							<button className="px-4 py-2 text-gray-600 hover:text-blue-700">
								<Link to="/login">ĐĂNG NHẬP</Link>
							</button>
						</>
					)}
				</div>
			</div>
		</header>
		<div className="max-w-4xl mx-auto p-4">
			<h2 className="text-2xl font-bold mb-6">Đơn hàng của tôi</h2>
			<div className="space-y-4">
				{orders.map((order) => (
				<div key={order.orderId} className="border rounded-lg shadow-sm">
					<div 
						className="flex items-center justify-between p-4 cursor-pointer"
						onClick={() => toggleOrderExpand(order.orderId)}
					>
						<div className="flex items-center space-x-4">
							{getStatusIcon(order.status)}
							<div>
								<p className="font-medium">Đơn hàng #{order.orderId.slice(-6)}</p>
								<p className="text-sm text-gray-500">
									{new Date(order.date_order).toLocaleDateString('vi-VN')}
								</p>
							</div>
						</div>
						<div className="flex items-center space-x-4">
							<span className="font-medium">
							{order.total_price.toLocaleString('vi-VN')}đ
							</span>
							{expandedOrders[order.orderId] ? 
							<ChevronUp className="w-5 h-5" /> : 
							<ChevronDown className="w-5 h-5" />
							}
						</div>
					</div>

					{expandedOrders[order.orderId] && (
					<div className="border-t p-4">
						<div className="space-y-4">
						<div className="flex justify-between text-sm">
							<span className="font-medium">Trạng thái:</span>
							<span className="flex items-center gap-2">
							{getStatusIcon(order.status)}
							{getStatusName(order.status)}
							</span>
						</div>
						<div className="flex justify-between text-sm">
							<span className="font-medium">Địa chỉ:</span>
							<span>{order.address}</span>
						</div>
						<div className="flex justify-between text-sm">
							<span className="font-medium">Phương thức thanh toán:</span>
							<span>{order.payment.method === "Cash on Delivery" ? "Thanh toán khi nhận hàng" : order.payment.method}</span>
						</div>
						{order.note && (
							<div className="flex justify-between text-sm">
								<span className="font-medium">Ghi chú:</span>
								<span>{order.note}</span>
							</div>
						)}
						
						<div className="mt-4">
							<h4 className="font-medium mb-2">Sản phẩm:</h4>
							<div className="space-y-2">
							{order.products.map((product, index) => (
								<div key={index} className="flex justify-between text-sm">
									<span>{product.name} x{product.quantity}</span>
									<span>{(product.price * product.quantity).toLocaleString('vi-VN')}đ</span>
								</div>
							))}
							</div>
						</div>
						</div>
					</div>
					)}
				</div>
				))}
			</div>
		</div>
		</>
	);
};

export default MyOrders;