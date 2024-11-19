const express = require("express");
const router = express.Router();
const apiController = require('./api.controller');
const prefixProducts = '/products';
const prefixAdmin = '/admin';

// Endpoint API router for User
router.get(prefixProducts, apiController.getAllProducts);
router.get(`${prefixProducts}/:category`, apiController.getProductsBaseOnCategory);
router.post('/order', apiController.handleOrder);
router.get('/myorders/:email', apiController.getMyOrders);

// Endpoint API router for Admin
router.get(`${prefixAdmin}/export/:dataType`, apiController.exportFile);
router.get(`${prefixAdmin}/orders`, apiController.getAllOrders);
router.patch(`${prefixAdmin}/orders/:id`, apiController.updateOrderStatus);
router.get(`${prefixAdmin}/products`, apiController.getProductsBaseOnCurrentPage);
router.post(`${prefixAdmin}/products`, apiController.addNewProduct);
router.put(`${prefixAdmin}/products/:id`, apiController.updateProduct);
router.delete(`${prefixAdmin}/products/:id`, apiController.deleteProduct);
router.get(`${prefixAdmin}/customers`, apiController.getCustomers);

module.exports = router;