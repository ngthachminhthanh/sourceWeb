import { Navigate } from "react-router-dom";
import PropTypes from 'prop-types';

const ProtectedRoute = ({ children }) => {
	// Kiểm tra xem localStorage có chứa key "user" hay không
	const user = JSON.parse(localStorage.getItem("user"));

	// Nếu không có user hoặc user không phải là admin, điều hướng đến trang đăng nhập
	if (!user || !user.isAdmin) {
		return <Navigate to="/login" replace />;
	}

	// Nếu user là admin, render children (component bên trong route)
	return children;
};

ProtectedRoute.propTypes = {
  	children: PropTypes.node.isRequired,
};

export default ProtectedRoute;
