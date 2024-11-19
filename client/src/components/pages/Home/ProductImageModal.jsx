import { X } from 'lucide-react';

const ProductImageModal = ({ isOpen, onClose, imageUrl, productName }) => {
	if (!isOpen) return null;

	return (
		<div 
			className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 p-4"
			onClick={onClose}
		>
			<div 
				className="relative bg-white rounded-lg shadow-2xl max-w-4xl max-h-[90vh] flex flex-col"
				onClick={(e) => e.stopPropagation()}
			>
				<button 
					onClick={onClose} 
					className="absolute top-4 right-4 z-60 bg-gray-100 hover:bg-gray-200 rounded-full p-2 transition duration-300"
				>
					<X className="text-gray-700" size={24} />
				</button>

				<div className="flex items-center justify-center w-full h-full p-8">
					<img 
						src={imageUrl} 
						alt={productName} 
						className="max-w-full max-h-[80vh] object-contain rounded-lg"
					/>
				</div>
			</div>
		</div>
	);
};

export default ProductImageModal;