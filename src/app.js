const express = require("express");
const path = require("path");
const cors = require("cors");
require("dotenv").config();

const productRoutes = require("./modules/products/product.routes");
const authRoutes = require("./modules/auth/auth.routes");
const supplierRoutes = require("./modules/suppliers/supplier.routes");
const orderRoutes = require("./modules/orders/order.routes");
const paymentRoutes = require("./modules/payments/payment.routes");
const restockRoutes = require("./modules/restocks/restock.routes");
const employeeRoutes = require("./modules/employees/employee.routes");
const reviewRoutes = require("./modules/reviews/review.routes");
const wishlistRoutes = require("./modules/wishlists/wishlist.routes");

const app = express();

app.use(cors());
app.use(express.json());

// Serve uploaded files statically
app.use("/uploads", express.static(path.join(__dirname, "../public/uploads")));

app.use("/api/products", productRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/suppliers", supplierRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/restocks", restockRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/wishlists", wishlistRoutes);

module.exports = app;