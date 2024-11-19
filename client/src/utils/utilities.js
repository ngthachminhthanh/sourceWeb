const getCategoryName = (category) => {
	switch (category) {
		case 'AoNu':
		    return 'Áo nữ';
		case 'AoNam':
			return 'Áo nam';
		case 'QuanVayNu':
			return 'Quần / Váy nữ';
		case 'QuanNam':
			return 'Quần nam';
		case 'PhuKien':
			return 'Phụ kiện';
		default:
			return category;
	}
};

const getStatusName = (status) => {
	switch (status) {
		case 'waiting for confirmation':
		    return 'Đang chờ xác nhận';
		case 'shipping':
			return 'Đang vận chuyển';
		case 'delivered':
			return 'Đã giao';
		case 'cancelled':
			return 'Đã hủy';
		default:
			return status;
	}
};

export { getCategoryName, getStatusName };