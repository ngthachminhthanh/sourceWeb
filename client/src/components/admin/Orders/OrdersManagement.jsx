import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Search, ChevronLeft, ChevronRight, PackageX } from 'lucide-react';
import { getStatusName } from "../../../utils/utilities";
import "../../../assets/customCSS/LoadingEffect.css"

const OrderManagement = () => {
	const [orders, setOrders] = useState([]);
	const [filteredOrders, setFilteredOrders] = useState([]);
	const [currentPage, setCurrentPage] = useState(1);
	const [searchTerm, setSearchTerm] = useState('');
	const [statusFilter, setStatusFilter] = useState('all');
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);
	const ordersPerPage = 3;

	const fetchOrders = async () => {
		setIsLoading(true);
		setError(null);
		try {
			const response = await axios.get('http://localhost:5000/api/admin/orders');
			const fetchedOrders = Array.isArray(response.data) ? response.data : [];
			setOrders(fetchedOrders);
		} catch (error) {
			console.error('Error fetching orders:', error);
			setError('Không thể tải danh sách đơn hàng. Vui lòng thử lại sau.');
		} finally {
			setIsLoading(false);
		}
	};

	const filterOrders = useCallback(() => {
		const filtered = orders.filter((order) => {
			const matchesTerm =
				order.username.toLowerCase().includes(searchTerm) ||
				order.address.toLowerCase().includes(searchTerm) ||
				order.phone.toLowerCase().includes(searchTerm);
			const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
			return matchesTerm && matchesStatus;
		});
		setFilteredOrders(filtered);
	}, [orders, searchTerm, statusFilter]);

	useEffect(() => {
		fetchOrders();
	}, []);

	useEffect(() => {
		filterOrders();
	}, [filterOrders]);

	const handleSearch = (e) => {
		setSearchTerm(e.target.value.toLowerCase());
	};

	const handleStatusFilter = (status) => {
		setStatusFilter(status);
		setCurrentPage(1);
	};

	const handleStatusChange = async (orderId, newStatus) => {
		try {
			const response = await axios.patch(`http://localhost:5000/api/admin/orders/${orderId}`, { status: newStatus });
			if (response.status === 200) {
				setOrders(prevOrders => 
					prevOrders.map(order => 
						order._id === orderId ? { ...order, status: newStatus } : order
					)
				);
			}
		} catch (error) {
			console.error('Error updating order status:', error);
			setError('Không thể cập nhật trạng thái đơn hàng. Vui lòng thử lại sau.');
		}
	};

	const indexOfLastOrder = currentPage * ordersPerPage;
	const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
	const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);

	const paginate = (pageNumber) => setCurrentPage(pageNumber);

	if (isLoading) {
		return (
			<div className="flex items-center justify-center h-full">
				<div className="loader"></div>
			</div>
		);
	}

	if (error) {
		return <div className="text-center py-4 text-red-500">{error}</div>;
	}

	return (
		<div className="container mx-auto px-4 py-8">			
			<div className="mb-4 flex items-center">
				<div className="relative">
				<input
					type="text"
					placeholder="Tìm kiếm theo tên, địa chỉ, số điện thoại"
					className="w-96 pl-10 pr-4 py-2 mb-4 border rounded-lg"
					value={searchTerm}
					onChange={handleSearch}
				/>
				<Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
				</div>
			</div>

			<div className="mb-6 flex space-x-2">
				{['all', 'waiting for confirmation', 'shipping', 'delivered', 'cancelled'].map((status) => (
				<button
					key={status}
					className={`px-4 py-2 rounded-lg ${
					statusFilter === status
						? 'bg-blue-500 text-white'
						: 'bg-gray-200 text-gray-700'
					}`}
					onClick={() => handleStatusFilter(status)}
				>
					{status === 'all' ? 'Tất cả' : getStatusName(status)}
				</button>
				))}
			</div>

			{currentOrders.length === 0 ? (
				<div className="flex flex-col items-center justify-center h-full text-gray-500">
					<div className='mt-[120px] mb-24'>
						<PackageX size={48} className="mb-4" />
						<p className="text-lg font-semibold">Không có đơn hàng nào.</p>
					</div>
				</div>
			) : (
				<table className="w-full border-collapse border border-gray-300">
					<thead>
						<tr className="bg-gray-100">
							<th className="border p-2">ID</th>
							<th className="border p-2">Thông tin vận chuyển</th>
							<th className="border p-2">Chi tiết đơn hàng</th>
							<th className="border p-2">Tổng thanh toán</th>
							<th className="border p-2">Trạng thái đơn hàng</th>
						</tr>
					</thead>
					<tbody>
						{currentOrders.map((order, index) => (
						<tr key={order._id}>
							<td className="border p-2 text-center">{indexOfFirstOrder + index + 1}</td>
							<td className="border p-2">
								<p>{order.username}</p>
								<p>{order.address}</p>
								<p>{order.phone}</p>
							</td>
							<td className="border p-2">
							{order.products.map((product) => (
								<p key={product._id}>
								{product.name} - {product.quantity}
								</p>
							))}
							</td>
							<td className="border p-2 text-center">{order.total_price.toLocaleString()} ₫</td>
							<td className="border p-2 text-center">
								<select
									value={order.status}
									onChange={(e) => handleStatusChange(order._id, e.target.value)}
									className="p-2 border rounded text-center"
								>
									<option value="waiting for confirmation">Đang chờ xác nhận</option>
									<option value="shipping">Đang vận chuyển</option>
									<option value="delivered">Đã giao</option>
									<option value="cancelled">Đã hủy</option>
								</select>
							</td>
						</tr>
						))}
					</tbody>
				</table>
			)}

			<div className="flex justify-between items-center mt-8">
				<button
					onClick={() => paginate(currentPage - 1)}
					disabled={currentPage === 1 || orders.length === 0 || filteredOrders.length === 0}
					className="flex items-center px-4 py-2 bg-gray-300 text-gray-700 rounded-lg disabled:opacity-50"
				>
					<ChevronLeft size={20} className="mr-2" /> Trước
				</button>

				<span>Trang {currentPage} / {Math.ceil(filteredOrders.length / ordersPerPage)}</span>

				<button
					onClick={() => paginate(currentPage + 1)}
					disabled={currentPage === Math.ceil(filteredOrders.length / ordersPerPage) || orders.length === 0 || filteredOrders.length === 0}
					className="flex items-center px-4 py-2 bg-gray-300 text-gray-700 rounded-lg disabled:opacity-50"
				>
					Sau <ChevronRight size={20} className="ml-2" />
				</button>
			</div>
		</div>
	);
};

export default OrderManagement;