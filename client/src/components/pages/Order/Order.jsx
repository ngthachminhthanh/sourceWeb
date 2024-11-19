import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom'
import { Package } from 'lucide-react';
import { ShoppingCart, UserCircle } from 'lucide-react';
import { IoIosLogOut } from "react-icons/io";
import { useAuth } from '../../auth/AuthContext';
import "../../../assets/customCSS/LoadingEffect.css";
import axios from 'axios';

const Order = () => {
	const [provinces, setProvinces] = useState([]);
	const [districts, setDistricts] = useState([]);
	const [wards, setWards] = useState([]);
	const [selectedProvince, setSelectedProvince] = useState('');
	const [selectedDistrict, setSelectedDistrict] = useState('');
	const [selectedWard, setSelectedWard] = useState('');
	const [selectedProvinceName, setSelectedProvinceName] = useState('');
	const [selectedDistrictName, setSelectedDistrictName] = useState('');
	const [selectedWardName, setSelectedWardName] = useState('');
	const SHIPPING_FEE = 30000;  // Phí vận chuyển cố định
  	const TAX_RATE = 0.1;      // Thuế 10%
	const navigate = useNavigate();
	const { user, logout, isLoading } = useAuth();
	const [cartItems, setCartItems] = useState([]);
	const [formData, setFormData] = useState({
		email: '',
		fullName: '',
		phone: '',
		address: '',
		province: '',
		district: '',
		ward: '',
		note: ''
	});
	const [submitLoading, setIsSubmitLoading] = useState(false);

	const productsQuantityInCart = localStorage.getItem('cart') ? JSON.parse(localStorage.getItem('cart')).length : null;

	useEffect(() => {
		if (!isLoading && user) {
			setFormData(prevData => ({
				...prevData,
				email: user.email,
				fullName: user.username,
				phone: user.phone
			}));
		}
	}, [isLoading, user]);

	// Update địa chỉ hành chính trong formData khi người dùng chọn
	useEffect(() => {
		setFormData(prevData => ({
			...prevData,
			province: selectedProvinceName,
			district: selectedDistrictName,
			ward: selectedWardName
		}));
	}, [selectedProvinceName, selectedDistrictName, selectedWardName]);

	useEffect(() => {
		// Lấy sản phẩm từ localStorage
		const cart = JSON.parse(localStorage.getItem('cart')) || [];
		setCartItems(cart);

		// Fetch provinces data
		const fetchProvinces = async () => {
		try {
			const response = await axios.get('https://provinces.open-api.vn/api/p/');
			setProvinces(response.data);
		} catch (error) {
			console.error('Error fetching provinces:', error);
		}
		};

		fetchProvinces();
	}, []);

	const handleProvinceChange = async (e) => {
		const provinceCode = e.target.value;
		setSelectedProvince(provinceCode);
		setSelectedDistrict('');
		setSelectedWard('');

		// Reset tên district và ward
		setSelectedDistrictName('');
		setSelectedWardName('');
		
		if (provinceCode) {
			try {
				const response = await axios.get(`https://provinces.open-api.vn/api/p/${provinceCode}?depth=2`);
				setSelectedProvinceName(response.data.name);
				setDistricts(response.data.districts);
			} catch (error) {
				console.error('Error fetching districts:', error);
			}
		} else {
			setDistricts([]);
			setSelectedProvinceName('');
		}
	};

	const handleDistrictChange = async (e) => {
		const districtCode = e.target.value;
		setSelectedDistrict(districtCode);
		setSelectedWard('');
		
		// Reset tên ward
		setSelectedWardName('');

		if (districtCode) {
			try {
				const response = await axios.get(`https://provinces.open-api.vn/api/d/${districtCode}?depth=2`);
				setSelectedDistrictName(response.data.name);
				setWards(response.data.wards);
			} catch (error) {
				console.error('Error fetching wards:', error);
			}
		} else {
			setWards([]);
			setSelectedDistrictName('');
		}
	};

	const handleWardChange = (e) => {
		const wardCode = e.target.value;
		setSelectedWard(wardCode);
		
		if (wardCode) {
			const selectedWardObj = wards.find(ward => ward.code.toString() === wardCode);
			setSelectedWardName(selectedWardObj ? selectedWardObj.name : '');
		} else {
			setSelectedWardName('');
		}
	};

	const handleInputChange = (e) => {
		setFormData(prevData => ({
			...prevData,
			[e.target.name]: e.target.value
		}));
	};

	// Tính giá trị đơn hàng (tổng giá trị sản phẩm)
	const calculateSubTotal = () => {
		return cartItems.reduce((sum, item) => sum + item.product_price * item.quantity, 0);
	};

	// Tính thuế
	const calculateTax = (subtotal) => {
		return subtotal * TAX_RATE;
	};

	// Tính tổng thanh toán
	const calculateTotal = () => {
		const subtotal = calculateSubTotal();
		const tax = calculateTax(subtotal);
		return subtotal + SHIPPING_FEE + tax;
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		const order = {
			email: formData.email,
			fullName: formData.fullName,
			phone: formData.phone,
			address: formData.address,
			province: formData.province,
			district: formData.district,
			ward: formData.ward,
			note: formData.note,
			items: cartItems,
			total_price: calculateTotal(),
			date: new Date()
		};

		try {
    		setIsSubmitLoading(true);
			await axios.post('http://localhost:5000/api/order', order);
			navigate('/checkout', { state: { order } });
		} catch (error) {
			console.error(error);
		} finally {
			setIsSubmitLoading(false);
		}
	};

	const handleLogout = () => {
		logout();
		localStorage.removeItem('cart');
		navigate('/');
	};

	return (
		<>
			<header className="bg-white shadow-md fixed top-0 left-0 right-0">
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

			{ !submitLoading && !isLoading && user ? (
				<div className="max-w-6xl mx-auto px-4 py-8 mt-10">
					<h1 className="text-3xl font-bold text-center mb-8">Đặt hàng</h1>

					<form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
						{/* Form thông tin giao hàng */}
						<div className="bg-white p-6 rounded-lg shadow-md">
							<h2 className="text-xl font-semibold mb-6">Thông tin giao hàng</h2>
							<div className="space-y-4">
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
									<input
									type="email"
									name="email"
									value={formData.email}
									placeholder='VD: example999@gmail.com'
									onChange={handleInputChange}
									className="w-full px-3 py-2 border border-gray-300 bg-gray-200 text-gray-500 cursor-not-allowed rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
									disabled
									/>
								</div>
							
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">Họ tên</label>
									<input
									type="text"
									name="fullName"
									value={formData.fullName}
									placeholder='VD: Nguyễn Văn A'
									onChange={handleInputChange}
									className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
									required
									/>
								</div>

								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
									<input
									type="tel"
									name="phone"
									value={formData.phone}
									placeholder='VD: 0969999666'
									onChange={handleInputChange}
									className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
									required
									/>
								</div>

								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ</label>
									<input
									type="text"
									name="address"
									value={formData.address}
									placeholder='VD: Số 123 đường abc, ngõ xyz,...'
									onChange={handleInputChange}
									className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
									required
									/>
								</div>

								<div className="grid grid-cols-3 gap-4">
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-1">Tỉnh thành</label>
										<select
											value={selectedProvince}
											onChange={handleProvinceChange}
											className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
											required
										>
											<option value="">Chọn tỉnh thành</option>
											{provinces.map(province => (
											<option key={province.code} value={province.code}>
												{province.name}
											</option>
											))}
										</select>
									</div>

									<div>
										<label className="block text-sm font-medium text-gray-700 mb-1">Quận huyện</label>
										<select
											value={selectedDistrict}
											onChange={handleDistrictChange}
											className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
											required
										>
											<option value="">Chọn quận huyện</option>
											{districts.map(district => (
											<option key={district.code} value={district.code}>
												{district.name}
											</option>
											))}
										</select>
									</div>

									<div>
										<label className="block text-sm font-medium text-gray-700 mb-1">Phường xã</label>
										<select
											value={selectedWard}
											onChange={handleWardChange}
											className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
											required
										>
											<option value="">Chọn phường xã</option>
											{wards.map(ward => (
												<option key={ward.code} value={ward.code}>
													{ward.name}
												</option>
											))}
										</select>
									</div>
								</div>

								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú (không bắt buộc)</label>
									<textarea
										name="note"
										value={formData.note}
										onChange={handleInputChange}
										className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
										rows="3"
									/>
								</div>

								<div className="mt-4">
									<label className="block text-sm font-medium text-gray-700 mb-1">Phương thức thanh toán</label>
									<input
										type="radio"
										name="payment"
										value="cod"
										className="form-radio text-purple-600 ml-3"
										checked
										readOnly
									/>
									<span className="ml-2">Thanh toán khi nhận hàng</span>
								</div>
							</div>
						</div>

						{/* Thông tin đơn hàng */}
						<div className="bg-white p-6 rounded-lg shadow-md">
							<h2 className="text-xl font-semibold mb-6">Sản phẩm ({cartItems.length})</h2>
							<div className="space-y-4">
							{cartItems.map((item) => (
								<div key={item.product_id} className="flex items-center space-x-4">
								<div className="flex-shrink-0 w-20 h-20">
									<img
									src={item.product_image_link}
									alt={item.product_name}
									className="w-full h-full object-cover rounded-md"
									/>
								</div>
								<div className="flex-1">
									<h3 className="text-sm font-medium">{item.product_name}</h3>
									<p className="text-sm text-gray-500">Số lượng: {item.quantity}</p>
								</div>
								<div className="text-sm font-medium">
									{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.product_price)}
								</div>
								</div>
							))}

							<div className="border-t pt-4 mt-4">
								<div className="flex justify-between mb-2">
									<span className="text-gray-600">Giá trị đơn hàng</span>
									<span className="font-medium">
										{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(calculateSubTotal())}
									</span>
								</div>
								<div className="flex justify-between mb-2">
									<span className="text-gray-600">Phí vận chuyển</span>
									<span className="font-medium">
										{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(SHIPPING_FEE)}
									</span>
								</div>
								<div className="flex justify-between mb-2">
									<span className="text-gray-600">Thuế (10%)</span>
									<span className="font-medium">
										{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(calculateTax(calculateSubTotal()))}
									</span>
								</div>
								<div className="flex justify-between border-t pt-2 text-lg font-bold">
									<span>Tổng thanh toán</span>
									<span>
										{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(calculateTotal())}
									</span>
								</div>
							</div>

							<button
								type="submit"
								className="w-full bg-purple-600 text-white py-3 px-4 rounded-md hover:bg-purple-700 transition duration-300 flex items-center justify-center space-x-2"
							>
								<Package size={20} />
								<span>Đặt hàng</span>
							</button>
							</div>
						</div>
					</form>
				</div>) : (
					<div className="flex justify-center items-center h-full">
						<div className="loader mt-72"></div>
					</div>
				)
			}
		</>
	);
};

export default Order;