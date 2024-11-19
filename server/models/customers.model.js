const mongoose = require('mongoose');

const CustomerSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    orders: [{
        orderId: { 
            type: String,
            required: true,
            default: () => new mongoose.Types.ObjectId().toString()
        },
        total_price: {
            type: Number,
            required: true
        },
        date_order: {
            type: Date,
            required: true
        },
        address: {
            type: String,
            required: true
        },
        products: [{
            name: {
                type: String,
                required: true
            },
            price: {
                type: Number,
                required: true
            },
            quantity: {
                type: Number,
                required: true
            }
        }],
        payment: {
            date_payment: {
                type: Date,
            },
            method: {
                type: String,
                default: "Cash on Delivery"
            }
        },
        status: {
            type: String,
            default: "waiting for confirmation"
        },
        note: {
            type: String,
            default: ""
        }
    }]
});

module.exports = mongoose.model('CustomerEntity', CustomerSchema, 'customers');
