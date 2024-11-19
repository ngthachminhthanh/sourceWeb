import { Routes, Route } from "react-router-dom";
import Home from "./components/pages/Home/Home";
import Login from "./components/pages/Login/Login";
import Register from "./components/pages/Register/Register";
import Cart from "./components/pages/Cart/Cart";
import Order from "./components/pages/Order/Order";
import MyOrders from "./components/pages/MyOrders/MyOrders";
import Checkout from "./components/pages/Checkout/Checkout";
import Customers from "./components/admin/Customers/Customers";
import Dashboard from "./components/admin/Dashboard/Dashboard";
import Orders from "./components/admin/Orders/Orders";
import Products from "./components/admin/Products/Products";
import ProtectedRoute from "./components/auth/ProtectedRoute";

function App() {
	return (
		<Routes>
			<Route path="/" element={<Home />} />
			<Route path="/login" element={<Login />} />
			<Route path="/register" element={<Register />} />
			<Route path="/cart" element={<Cart />} />
			<Route path="/order" element={<Order />} />
			<Route path="/myorders" element={<MyOrders />} />
			<Route path="/checkout" element={<Checkout />} />
			
			<Route
				path="/admin/*"
				element={
				<ProtectedRoute>
					<Routes>
						<Route path="dashboard" element={<Dashboard />} />
						<Route path="orders" element={<Orders />} />
						<Route path="products" element={<Products />} />
						<Route path="customers" element={<Customers />} />
					</Routes>
				</ProtectedRoute>
				}
			/>
		</Routes>
	);
}

export default App;
