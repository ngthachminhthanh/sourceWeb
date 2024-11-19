const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const CustomerEntity = require('../../models/customers.model');

exports.register = async (req, res) => {
    try {
        const { username, email, phone, password } = req.body;

        // Kiểm tra xem email đã tồn tại chưa
        let customer = await CustomerEntity.findOne({ email });
        if (customer) {
            return res.status(400).json({ msg: 'Email đã được sử dụng, vui lòng thử email khác' });
        }

        // Tạo customer mới
        customer = new CustomerEntity({
            username,
            email,
            phone,
            password
        });

        // Mã hóa mật khẩu
        const salt = await bcrypt.genSalt(10);
        customer.password = await bcrypt.hash(password, salt);

        // Lưu customer vào database
        await customer.save();

        // Tạo JWT token
        const payload = {
            customer: {
                id: customer.id
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '1h' },
            (err, token) => {
                if (err) throw err;
                res.json({ token });
            }
        );
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Lỗi server');
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Kiểm tra xem email có tồn tại không
        let customer = await CustomerEntity.findOne({ email });
        if (!customer) {
            return res.status(400).json({ msg: 'Thông tin Email chưa đúng hoặc không tồn tại' });
        }

        // Kiểm tra mật khẩu
        const isMatch = await bcrypt.compare(password, customer.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Sai mật khẩu, vui lòng thử lại!' });
        }

        // Kiểm tra xem có phải là admin không
        const isAdmin = email === 'admin@gmail.com' && password === 'admin';

        // Tạo JWT token
        const payload = {
            customer: {
                id: customer.id,
                isAdmin: isAdmin
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '1h' },
            (err, token) => {
                if (err) throw err;
                res.json({
                    token,
                    user: {
                        username: customer.username,
                        email: customer.email,
                        phone: customer.phone,
                        isAdmin: isAdmin
                    }
                });
            }
        );
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Lỗi server');
    }
};