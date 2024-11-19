import { Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';

const CartNotification = ({ message, isVisible, onClose }) => {
    useEffect(() => {
        if (isVisible) {
            const timer = setTimeout(() => {
                onClose();
            }, 1000);

            return () => clearTimeout(timer);
        }
    }, [isVisible, onClose]);

    return (
        <AnimatePresence>
        {isVisible && (
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 20 }}
                exit={{ opacity: 0, y: 0 }}
                className="fixed top-12 right-4 bg-green-200 text-gray-800 px-4 py-2 rounded-md shadow-lg z-50 flex items-center space-x-2"
            >
                <div className="bg-green-500 text-white rounded-full p-1">
                    <Check className="w-5 h-5" />
                </div>
                <div>
                    <h3 className="text-lg font-medium">Thông báo</h3>
                    <p>{message}</p>
                </div>
                <button
                    onClick={onClose}
                    className="ml-4 hover:text-gray-600 transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>
            </motion.div>
        )}
        </AnimatePresence>
    );
};

export default CartNotification;