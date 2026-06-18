const cartService = require("./cart.service");

exports.getCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const cartItems = await cartService.getCartByUser(userId);

    res.status(200).json({
      status: "OK",
      message: "Success Get Cart",
      data: cartItems,
    });
  } catch (error) {
    res.status(500).json({
      status: "Failed",
      message: error.message || "Failed To Get Cart",
    });
  }
};

exports.addToCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { variantId, quantity } = req.body;

    if (!variantId || !quantity) {
      return res.status(400).json({
        status: "Failed",
        message: "Variant ID and Quantity are Required",
      });
    }

    const cartItems = await cartService.addToCart(
      userId,
      parseInt(variantId),
      parseInt(quantity)
    );

    res.status(201).json({
      status: "OK",
      message: "Success Add Item To Cart",
      data: cartItems,
    });
  } catch (error) {
    res.status(400).json({
      status: "Failed",
      message: error.message || "Failed To Add Item To Cart",
    });
  }
};

exports.updateCartItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const variantId = req.params.id;
    const { quantity } = req.body;

    if (!quantity) {
      return res.status(400).json({
        status: "Failed",
        message: "Quantity is Required",
      });
    }

    const cartItems = await cartService.updateCartItem(
      userId,
      parseInt(variantId),
      parseInt(quantity)
    );

    res.status(200).json({
      status: "OK",
      message: "Success Update Cart Item Quantity",
      data: cartItems,
    });
  } catch (error) {
    res.status(400).json({
      status: "Failed",
      message: error.message || "Failed To Update Cart Item Quantity",
    });
  }
};

exports.removeFromCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const variantId = req.params.id;

    const cartItems = await cartService.removeFromCart(userId, variantId);

    res.status(200).json({
      status: "OK",
      message: "Success Remove Item From Cart",
      data: cartItems,
    });
  } catch (error) {
    res.status(400).json({
      status: "Failed",
      message: error.message || "Failed To Remove Item From Cart",
    });
  }
};

exports.clearCart = async (req, res) => {
  try {
    const userId = req.user.id;

    const cartItems = await cartService.clearCart(userId);

    res.status(200).json({
      status: "OK",
      message: "Success Clear Cart",
      data: cartItems,
    });
  } catch (error) {
    res.status(500).json({
      status: "Failed",
      message: error.message || "Failed To Clear Cart",
    });
  }
};
