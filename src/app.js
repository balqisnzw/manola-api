const express = require("express");
const cors = require("cors");
require("dotenv").config();

const productRoutes = require("./modules/products/product.routes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/products", productRoutes);

module.exports = app;