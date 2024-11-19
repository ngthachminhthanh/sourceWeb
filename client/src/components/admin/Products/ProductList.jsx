import { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { Search, Plus, Edit2, X, AlertCircle, PackageX, Trash2 } from 'lucide-react';
import "../../../assets/customCSS/LoadingEffect.css"

const ProductList = () => {
	const [products, setProducts] = useState([]);
	const [currentPage, setCurrentPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [searchTerm, setSearchTerm] = useState('');
	const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
	const [selectedProduct, setSelectedProduct] = useState(null);
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
	const [newProduct, setNewProduct] = useState({
		name: '',
		image: '',
		price: 1,
		quantity: 0,
		category: '',
		description: ''
	});
	const [isLoading, setIsLoading] = useState(true);
	const [isSearching, setIsSearching] = useState(false);
	const [error, setError] = useState(null);

	const fetchProducts = useCallback(async () => {
		setIsLoading(true);
		setError(null);
		try {
			const response = await axios.get(`http://localhost:5000/api/admin/products?page=${currentPage}&search=${debouncedSearchTerm}`);
			setProducts(response.data.products);
			setTotalPages(response.data.totalPages);
		} catch (error) {
			console.error('Error fetching products:', error);
			setError('Không thể kết nối với cơ sở dữ liệu. Vui lòng thử lại sau.');
		} finally {
			setIsLoading(false);
			setIsSearching(false);
		}
	}, [currentPage, debouncedSearchTerm]);

	useEffect(() => {
		fetchProducts();
	}, [fetchProducts]);

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

	const handleAddProduct = async () => {
		try {
			await axios.post('http://localhost:5000/api/admin/products', newProduct);
			setIsAddProductModalOpen(false);
			fetchProducts();
			setNewProduct({
				name: '',
				image: '',
				price: 1,
				quantity: 0,
				category: '',
				description: ''
			});
		} catch (error) {
			console.error('Error adding product:', error);
			setError('Không thể thêm sản phẩm. Vui lòng thử lại sau.');
		}
	};

	const handleProductUpdate = async (updatedProduct) => {
		try {
			await axios.put(`http://localhost:5000/api/admin/products/${updatedProduct._id}`, updatedProduct);
			setIsDialogOpen(false);
			fetchProducts();
		} catch (error) {
			console.error('Error updating product:', error);
			setError('Không thể cập nhật sản phẩm. Vui lòng thử lại sau.');
		}
	};

	const handleProductDelete = async () => {
		try {
			await axios.delete(`http://localhost:5000/api/admin/products/${selectedProduct._id}`);
			setIsDeleteDialogOpen(false);
			setIsDialogOpen(false);
			fetchProducts();
		} catch (error) {
			console.error('Error deleting product:', error);
			setError('Không thể xóa sản phẩm. Vui lòng thử lại sau.');
		}
	};

	const handleSearch = (e) => {
		setSearchTerm(e.target.value);
	};

	const handleProductClick = (product) => {
		setSelectedProduct(product);
		setIsDialogOpen(true);
	};

	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setSelectedProduct({ ...selectedProduct, [name]: value });
	};

	const handleQuantityChange = (e) => {
		const value = Math.max(0, parseInt(e.target.value) || 0);
		setSelectedProduct({ ...selectedProduct, quantity: value });
	};

	const handlePriceChange = (e) => {
		const value = Math.max(1, parseFloat(e.target.value) || 1);
		setSelectedProduct({ ...selectedProduct, price: value });
	};

	const handleNewProductInputChange = (e) => {
		const { name, value } = e.target;
		setNewProduct({ ...newProduct, [name]: value });
	};

	const handleNewProductQuantityChange = (e) => {
		const value = Math.max(0, parseInt(e.target.value) || 0);
		setNewProduct({ ...newProduct, quantity: value });
	};

	const handleNewProductPriceChange = (e) => {
		const value = Math.max(1, parseFloat(e.target.value) || 1);
		setNewProduct({ ...newProduct, price: value });
	};

	const renderContent = useMemo(() => {
		if (isLoading || isSearching) {
			return (
				<div className="flex justify-center items-center h-full">
					<div className="loader mt-48"></div>
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
							onClick={fetchProducts}
							className="mt-4 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
						>
							Thử lại
						</button>
					</div>
				</div>
			);
		}

		if (products.length === 0) {
			return (
				<div className="flex flex-col items-center justify-center h-full text-gray-500">
					<div className='mt-36'>
						<PackageX size={48} className="mb-4" />
						<p className="text-lg font-semibold">Không tìm thấy sản phẩm nào.</p>
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
			<table className="w-full border-collapse">
				<thead>
					<tr className="bg-gray-100">
						<th className="border p-2 text-center">ID</th>
						<th className="border p-2">Sản phẩm</th>
						<th className="border p-2 text-center">Trạng thái</th>
						<th className="border p-2 text-center">Giá</th>
						<th className="border p-2 text-center">Số lượng</th>
					</tr>
				</thead>
				<tbody>
				{products.map((product, index) => (
					<tr key={product._id}>
						<td className="border p-2 text-center">{(currentPage - 1) * 6 + index + 1}</td>
						<td className="border p-2">
							<div className="flex items-center">
								<img src={product.image} alt={product.name} className="w-12 h-12 object-cover mr-2" />
								<button onClick={() => handleProductClick(product)} className="text-blue-500 hover:underline">
									{product.name}
								</button>
							</div>
						</td>
						<td className="border p-2 text-center">
							{product.quantity > 0 ? (
							<span className="text-green-500">Sẵn sàng</span>
							) : (
							<span className="text-red-500">Hết hàng</span>
							)}
						</td>
						<td className="border p-2 text-center">{product.price.toLocaleString()} đ</td>
						<td className="border p-2 text-center">{product.quantity}</td>
					</tr>
				))}
				</tbody>
			</table>
		);
	}, [isLoading, isSearching, error, products, currentPage, debouncedSearchTerm, fetchProducts]);

	return (
		<div className="container mx-auto p-4">
			<div className="flex justify-between mb-8">
				<div className="relative">
					<input
						type="text"
						placeholder="Tìm kiếm sản phẩm"
						className="w-60 pl-10 pr-4 py-2 border rounded-md"
						value={searchTerm}
						onChange={handleSearch}
					/>
					<Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
				</div>
				<button 
					className="bg-blue-500 text-white px-4 py-2 rounded-md flex items-center hover:bg-blue-600 transition duration-300 ease-in-out"
					onClick={() => setIsAddProductModalOpen(true)}
				>
					<Plus size={20} className="mr-2" /> Thêm sản phẩm
				</button>
			</div>

			{renderContent}

			{!isLoading && !isSearching && !error && products.length > 0 && (
				<div className="mt-4 flex justify-center">
					{Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
						<button
							key={page}
							onClick={() => setCurrentPage(page)}
							className={`mx-1 px-3 py-1 border rounded ${
								currentPage === page ? 'bg-blue-500 text-white' : 'bg-white hover:bg-gray-100'
							} transition-colors`}
						>
							{page}
						</button>
					))}
				</div>
			)}

			{isAddProductModalOpen && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
					<div className="bg-white rounded-lg w-full max-w-md h-[90vh] flex flex-col">
						<div className="sticky top-0 bg-white z-10 px-4 py-3 border-b">
							<div className="flex justify-between items-center">
								<h2 className="text-xl font-bold">Thêm sản phẩm mới</h2>
								<button onClick={() => setIsAddProductModalOpen(false)} className="text-gray-500 hover:text-gray-700">
									<X size={24} />
								</button>
							</div>
						</div>
						<form onSubmit={handleAddProduct} className="flex-1 p-4 overflow-y-auto scrollbar-none space-y-4">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">Tên sản phẩm</label>
								<input
									name="name"
									value={newProduct.name}
									onChange={handleNewProductInputChange}
									className="w-full p-2 border rounded"
									placeholder="Nhập tên sản phẩm"
									required
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">Link ảnh</label>
								<input
									name="image"
									value={newProduct.image}
									onChange={handleNewProductInputChange}
									className="w-full p-2 border rounded"
									placeholder="Nhập link ảnh"
									required
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">Giá</label>
								<input
									name="price"
									value={newProduct.price}
									onChange={handleNewProductPriceChange}
									type="number"
									min="1000"
									step="1000"
									className="w-full p-2 border rounded"
									placeholder="Nhập giá"
									required
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">Số lượng</label>
								<input
									name="quantity"
									value={newProduct.quantity}
									onChange={handleNewProductQuantityChange}
									type="number"
									min="0"
									step="1"
									className="w-full p-2 border rounded"
									placeholder="Nhập số lượng"
									required
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">Danh mục</label>
								<select
									name="category"
									value={newProduct.category}
									onChange={handleNewProductInputChange}
									className="w-full p-2 border rounded"
									required
								>
									<option value="">-- Chọn danh mục sản phẩm --</option>
									<option value="AoNu">Áo nữ</option>
									<option value="AoNam">Áo nam</option>
									<option value="QuanVayNu">Quần / Váy nữ</option>
									<option value="QuanNam">Quần nam</option>
									<option value="PhuKien">Phụ kiện</option>
								</select>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
								<textarea
									name="description"
									value={newProduct.description}
									onChange={handleNewProductInputChange}
									className="w-full p-2 border rounded"
									rows="3"
									placeholder="Nhập mô tả sản phẩm..."
									required
								/>
							</div>
							<div className="sticky bottom-0 bg-white z-10 p-4">
								<button
									type="submit"
									className="bg-blue-500 text-white px-4 py-2 rounded-md flex items-center justify-center w-full  hover:bg-blue-600 transition duration-300 ease-in-out"
								>
									<Plus size={20} className="mr-2" /> Thêm sản phẩm
								</button>
							</div>
						</form>
					</div>
				</div>
			)}

			{isDialogOpen && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
					<div className="bg-white rounded-lg w-full max-w-md h-[90vh] flex flex-col">
						<div className="sticky top-0 bg-white z-10 px-4 py-3 border-b">
							<div className="flex justify-between items-center">
								<h2 className="text-xl font-bold">Chi tiết sản phẩm</h2>
								<button onClick={() => setIsDialogOpen(false)} className="text-gray-500 hover:text-gray-700">
									<X size={24} />
								</button>
							</div>
						</div>
						{selectedProduct && (
							<>
								<div className="flex justify-center my-4">
									<img
										src={selectedProduct.image}
										alt={selectedProduct.name}
										className="w-full max-w-xs h-40 object-cover rounded"
									/>
								</div>
								<div className="flex-1 p-4 overflow-y-auto scrollbar-none space-y-4">
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-1">Tên sản phẩm</label>
										<input
											name="name"
											value={selectedProduct.name}
											onChange={handleInputChange}
											className="w-full p-2 border rounded"
											placeholder="Nhập tên sản phẩm"
										/>
									</div>
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-1">Link ảnh</label>
										<input
											name="image"
											value={selectedProduct.image}
											onChange={handleInputChange}
											className="w-full p-2 border rounded"
											placeholder="Nhập link ảnh"
										/>
									</div>
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-1">Giá</label>
										<input
											name="price"
											value={selectedProduct.price}
											onChange={handlePriceChange}
											type="number"
											min="1000"
											step="1000"
											className="w-full p-2 border rounded"
											placeholder="Nhập giá"
										/>
									</div>
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-1">Số lượng</label>
										<input
											name="quantity"
											value={selectedProduct.quantity}
											onChange={handleQuantityChange}
											type="number"
											min="0"
											step="1"
											className="w-full p-2 border rounded"
											placeholder="Nhập số lượng"
										/>
									</div>
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-1">Danh mục</label>
										<select
											name="category"
											value={selectedProduct.category}
											onChange={handleInputChange}
											className="w-full p-2 border rounded"
										>
											<option value="AoNu">Áo nữ</option>
											<option value="AoNam">Áo nam</option>
											<option value="QuanVayNu">Quần / Váy nữ</option>
											<option value="QuanNam">Quần nam</option>
											<option value="PhuKien">Phụ kiện</option>
										</select>
									</div>
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
										<textarea
											name="description"
											value={selectedProduct.description}
											onChange={handleInputChange}
											className="w-full p-2 border rounded"
											rows="3"
											placeholder="Nhập mô tả"
										/>
									</div>
								</div>
								<div className="sticky bottom-0 bg-white z-10 p-4 space-y-2">
									<button
										onClick={() => handleProductUpdate(selectedProduct)}
										className="bg-blue-500 text-white px-4 py-2 rounded-md flex items-center justify-center w-full hover:bg-blue-600 transition duration-300 ease-in-out"
									>
										<Edit2 size={20} className="mr-2" /> Cập nhật
									</button>
									<button
										onClick={() => setIsDeleteDialogOpen(true)}
										className="bg-red-500 text-white px-4 py-2 rounded-md flex items-center justify-center w-full hover:bg-red-600 transition duration-300 ease-in-out"
									>
										<Trash2 size={20} className="mr-2" /> Xóa sản phẩm
									</button>
								</div>
							</>
						)}
					</div>
				</div>
			)}

			{isDeleteDialogOpen && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
					<div className="bg-white p-4 rounded-lg w-80">
						<h2 className="text-xl font-bold mb-4">Xác nhận xóa</h2>
						<p>Bạn có chắc chắn muốn xóa sản phẩm này?</p>
						<div className="flex justify-end mt-4">
							<button
								onClick={() => setIsDeleteDialogOpen(false)}
								className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md mr-2"
							>
								Hủy
							</button>
							<button
								onClick={handleProductDelete}
								className="bg-red-500 text-white px-4 py-2 rounded-md"
							>
								Xóa
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default ProductList;