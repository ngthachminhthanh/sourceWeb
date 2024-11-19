import { createContext, useState, useEffect, useContext } from 'react';
import PropTypes from 'prop-types';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
	const [user, setUser] = useState(null);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const token = localStorage.getItem('token');
		const storedUser = localStorage.getItem('user');
		if (token && storedUser) {
			try {
				const parsedUser = JSON.parse(storedUser);
				setUser(parsedUser);
			} catch (error) {
				console.error('Failed to parse user data from localStorage:', error);

				localStorage.removeItem('token');
				localStorage.removeItem('user');
			}
		}
		setIsLoading(false);
	}, []);

	const login = (userData, token) => {
		setUser(userData);
		localStorage.setItem('token', token);
		localStorage.setItem('user', JSON.stringify(userData));
	};

	const logout = () => {
		setUser(null);
		localStorage.removeItem('token');
		localStorage.removeItem('user');
	};

	return (
		<AuthContext.Provider value={{ user, login, logout }}>
			{children}
		</AuthContext.Provider>
	);
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useAuth = () => useContext(AuthContext);