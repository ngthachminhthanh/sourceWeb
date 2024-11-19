import { useLocation, Link, useNavigate } from 'react-router-dom';
import { 
	UserCircle,
	CheckCircle, 
	MapPin, 
	Phone, 
	Mail, 
	FileText, 
	ShoppingCart, 
	Home,
	CalendarDays
} from 'lucide-react';
import { IoIosLogOut } from "react-icons/io";
import { useAuth } from '../../auth/AuthContext';

const Checkout = () => {
	// Đặt hàng thành công => xóa những sản phẩm đã đặt trong giỏ hàng
	localStorage.removeItem('cart');
	
	const location = useLocation();
	const navigate = useNavigate();
	const { user, logout } = useAuth();
	const { order } = location.state || {};

	const handleLogout = () => {
		logout();
		localStorage.removeItem('cart');
		navigate('/');
	};

	if (!order) {
		return (
		<div className="container mx-auto px-4 py-8 text-center">
			<p className="text-red-500">Không tìm thấy thông tin đơn hàng</p>
		</div>
		);
	}

	const formattedDate = new Date(order.date).toLocaleDateString('vi-VN', {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit'
	});

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
									<ShoppingCart className="ml-2 text-gray-600" />
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
									<ShoppingCart className="ml-2 text-gray-600" />
								</button>
								<button className="px-4 py-2 text-gray-600 hover:text-blue-700">
									<Link to="/login">ĐĂNG NHẬP</Link>
								</button>
							</>
						)}
					</div>
				</div>
			</header>

			<div className="container mx-auto px-4 py-8 flex flex-col items-center">
				<div className="max-w-2xl mx-auto bg-white shadow-lg rounded-lg p-6">
					<div className="flex flex-col items-center justify-center mb-6">
						<div className="flex items-center">
							<CheckCircle className="text-green-500 mr-2" size={32} />
							<h1 className="text-2xl font-bold text-gray-800">
							Xác Nhận Đơn Hàng
							</h1>
						</div>
						<p className="text-gray-600 mt-2 text-center">
							Cảm ơn bạn đã tin tưởng và mua hàng tại cửa hàng chúng tôi!
						</p>
					</div>

					<div className="mb-6 border-b pb-4">
						<h2 className="text-xl font-semibold mb-4 text-gray-700">
							Thông Tin Khách Hàng
						</h2>
						<div className="grid grid-cols-2 gap-4">
							<div className="flex items-center">
								<Mail className="mr-2 text-blue-500" size={20} />
								<span>{order.email}</span>
							</div>
							<div className="flex items-center">
								<Phone className="mr-2 text-green-500" size={20} />
								<span>{order.phone}</span>
							</div>
							<div className="flex items-center col-span-2">
								<MapPin className="mr-2 text-red-500" size={20} />
								<span>
									{order.address}, {order.ward}, {order.district}, {order.province}
								</span>
							</div>
							<div className="flex items-center col-span-2">
								<CalendarDays className="mr-2 text-purple-500" size={20} />
								<span>
									Ngày đặt hàng: {formattedDate}
								</span>
							</div>
							{order.note && (
							<div className="flex items-center col-span-2">
								<FileText className="mr-2 text-gray-500" size={20} />
								<span>{order.note}</span>
							</div>
							)}
						</div>
					</div>

					<div className="mb-6 border-b pb-4">
						<h2 className="text-xl font-semibold mb-4 text-gray-700">
							Sản Phẩm Đặt Hàng
						</h2>
						<div className="space-y-3">
							{order.items.map((item, index) => (
							<div 
								key={index} 
								className="flex justify-between items-center bg-gray-50 p-3 rounded-md"
							>
								<div className="flex items-center">
									<ShoppingCart className="mr-2 text-purple-500" size={20} />
									<span className="font-medium">{item.product_name}</span>
								</div>
								<div className="flex items-center">
									<span className="mx-3">
										Số lượng: {item.quantity}
									</span>
									<span>
										{(item.product_price * item.quantity).toLocaleString()}đ
									</span>
								</div>
							</div>
							))}
						</div>
					</div>

					<div className="flex flex-col items-center space-y-4">
						<div className="flex items-center">
							<span className="text-xl font-bold text-red-600">
								Tổng Thanh Toán: {order.total_price.toLocaleString()}đ
							</span>
						</div>
					</div>
				</div>

				<button 
					onClick={() => navigate('/')}
					className="flex items-center justify-center w-80 px-6 py-3 mt-8 bg-blue-500 text-white rounded-lg transition duration-300 ease-in-out hover:bg-blue-600 hover:scale-105 hover:shadow-lg"
				>
					<Home className="mr-2" size={20} />
					Trở về trang chủ
				</button>
			</div>
		</>
	);
};

export default Checkout;