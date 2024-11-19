const ProductEntity = require("../../models/products.model");
const CustomerEntity = require("../../models/customers.model");
const { Parser } = require('json2csv');
const mongoose = require('mongoose');
const uuid = require('uuid');
require('dotenv').config();

// API handler for User
exports.getAllProducts = async (req, res) => {
	try {
		const { search } = req.query;
		let query = {};

		if (search) {
		query = {
			$or: [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { category: { $regex: search, $options: 'i' } }
			]
		};
		}

		const productList = await ProductEntity.find(query);
		res.json(productList);
	} catch (error) {
		console.error('Lỗi khi truy vấn sản phẩm:', error);
		res.status(500).json({ message: 'Đã xảy ra lỗi khi truy vấn sản phẩm' });
	}
};

exports.getProductsBaseOnCategory = async (req, res) => {
	try {
		const category = req.params.category;
		const products = await ProductEntity.find({ category: category });
		res.json(products);
	} catch (error) {
		console.error('Lỗi khi truy vấn sản phẩm:', error);
		res.status(500).json({ message: 'Đã xảy ra lỗi khi truy vấn sản phẩm' });
	}
};

exports.handleOrder = async (req, res) => {
    try {
        const { email, address, province, district, ward, note, items, total_price } = req.body;

        if (!Array.isArray(items)) {
            return res.status(400).json({ message: 'Invalid items data' });
        }

        const newOrder = {
            orderId: new mongoose.Types.ObjectId().toString(),
            total_price,
            date_order: new Date(),
            address: `${address}, ${province}, ${district}, ${ward}`,
            products: items.map(item => ({
                name: item.product_name,
                price: item.product_price,
                quantity: item.quantity
            })),
            payment: {
                date_payment: new Date(),
                method: 'Cash on Delivery'
            },
            status: 'waiting for confirmation',
            note
        };

        let customer = await CustomerEntity.findOne({ email });

        customer.orders.push(newOrder);
        await customer.save();

        res.status(200).send("Order successfully!!");
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error creating order' });
    }
};

exports.getMyOrders = async (req, res) => {
    try {
        const customer = await CustomerEntity.findOne({ email: req.params.email });

        if (!customer) {
            return res.status(404).json({ message: 'Không tìm thấy khách hàng' });
        }

        // Sắp xếp đơn hàng theo ngày đặt hàng mới nhất
        const sortedOrders = customer.orders.sort((a, b) => 
            new Date(b.date_order) - new Date(a.date_order)
        );

        res.json(sortedOrders);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};

// API handler for Admin
exports.exportFile = async (req, res) => {
    try {
        const { dataType } = req.params;
        const { format } = req.query;

        let data;
        let fields;

        // Fetch data based on dataType
        if (dataType === 'customers') {
            data = await CustomerEntity.find({}, '-password');
            fields = ['username', 'email', 'phone'];
        } else if (dataType === 'products') {
            data = await ProductEntity.find({});
            fields = ['name', 'description', 'price', 'quantity', 'category'];
        } else {
            return res.status(400).json({ error: 'Kiểu dữ liệu không hợp lệ' });
        }

        // Format data based on requested format
        if (format === 'json') {
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Content-Disposition', `attachment; filename=${dataType}_export.json`);
            return res.json(data);
        } else if (format === 'csv') {
            const json2csvParser = new Parser({ fields });
            const csv = json2csvParser.parse(data);
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename=${dataType}_export.csv`);
            return res.send(csv);
        } else {
            return res.status(400).json({ error: 'Định dạng tệp không hợp lệ' });
        }
    } catch (error) {
        console.error('Error exporting data:', error);
        res.status(500).json({ error: 'An error occurred while exporting data' });
    }
};

exports.getAllOrders = async (req, res) => {
    try {
        const customers = await CustomerEntity.find();
        const orders = customers.flatMap(customer => 
            customer.orders.map(order => ({
                _id: order.orderId,
                username: customer.username,
                address: order.address,
                phone: customer.phone,
                products: order.products,
                total_price: order.total_price,
                status: order.status || 'waiting for confirmation'
            }))
        );
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const updatedOrder = await CustomerEntity.findOneAndUpdate(
            { "orders.orderId": id },
            { $set: { "orders.$.status": status } }, 
            { new: true } 
        );

        if (!updatedOrder) {
            return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
        }

        res.json(updatedOrder);
    } catch (error) {
        console.error('Error updating order:', error);
        if (error instanceof mongoose.Error.CastError) {
            return res.status(400).json({ message: 'ID đơn hàng không hợp lệ' });
        }
        res.status(500).json({ message: 'Lỗi server' });
    }
};

exports.getProductsBaseOnCurrentPage = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 6;
        const skip = (page - 1) * limit;
        const search = req.query.search || '';

        const query = search ? { name: { $regex: search, $options: 'i' } } : {};

        const totalProducts = await ProductEntity.countDocuments(query);
        const totalPages = Math.ceil(totalProducts / limit);

        const products = await ProductEntity.find(query)
        .skip(skip)
        .limit(limit)
        .sort({ name: 1 });

        res.json({
            products,
            currentPage: page,
            totalPages,
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedProduct = await ProductEntity.findByIdAndUpdate(id, req.body, { new: true });
        if (!updatedProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json(updatedProduct);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedProduct = await ProductEntity.findByIdAndDelete(id);

        if (!deletedProduct) {
            return res.status(404).json({ message: 'Sản phẩm không tồn tại.' });
        }

        return res.status(200).json({ message: 'Xóa sản phẩm thành công.', product: deletedProduct });
    } catch (error) {
        console.error('Lỗi khi xóa sản phẩm:', error);
        return res.status(500).json({ message: 'Lỗi máy chủ. Vui lòng thử lại sau.' });
    }
};

exports.addNewProduct = async (req, res) => {
    try {
        const { name, image, price, quantity, category, description } = req.body;

        // Validate input
        if (!name || !image || !price || !quantity || !category || !description) {
            return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin sản phẩm.' });
        }

        const newProduct = new ProductEntity({
            name,
            image,
            price,
            quantity,
            category,
            description
        });

        const savedProduct = await newProduct.save();
        res.status(201).json(savedProduct);
    } catch (error) {
        console.error('Error adding product:', error);
        res.status(500).json({ message: 'Đã xảy ra lỗi khi thêm sản phẩm.' });
    }
};

exports.getCustomers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 5;
        const search = req.query.search || '';

        const query = {
            $or: [
                { username: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ]
        };

        const [totalCustomers, customers] = await Promise.all([
            CustomerEntity.countDocuments(query),
            CustomerEntity.find(query)
                .skip((page - 1) * limit)
                .limit(limit)
        ]);

        const totalPages = Math.ceil(totalCustomers / limit);

        const formattedCustomers = customers.map(customer => ({
            _id: customer._id,
            username: customer.username,
            email: customer.email,
            orders: customer.orders.map(order => ({
                ...order.toObject(),
                total_price: order.total_price,
                date_order: order.date_order.toISOString(),
                payment: {
                    ...order.payment,
                    date_payment: order.payment.date_payment.toISOString()
                }
            }))
        }));

        res.json({
            customers: formattedCustomers,
            currentPage: page,
            totalPages,
        });
    } catch (error) {
        console.error('Error fetching customers:', error);
        res.status(500).json({ 
            message: 'Không thể kết nối với cơ sở dữ liệu. Vui lòng thử lại sau.',
            error: error.message 
        });
    }
};