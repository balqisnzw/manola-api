const express = require("express");
const cors = require("cors");
require("dotenv").config();

const productRoutes = require("./modules/products/product.routes");
const authRoutes = require("./modules/auth/auth.routes");
const supplierRoutes = require("./modules/suppliers/supplier.routes");
const orderRoutes = require("./modules/orders/order.routes");
const paymentRoutes = require("./modules/payments/payment.routes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/products", productRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/suppliers", supplierRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payments", paymentRoutes);

module.exports = app;