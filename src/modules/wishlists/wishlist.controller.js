const wishlistService = require("./wishlist.service");

exports.addToWishlist = async (req, res) => {
  try {
    const userId = req.user.id;

    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({
        status: "Failed",
        message: "Product ID Is Required",
      });
    }

    const wishlist = await wishlistService.addToWishlist(
      userId,
      parseInt(productId)
    );

    res.status(201).json({
      status: "OK",
      message: "Success Add Product To Wishlist",
      data: wishlist,
    });
  } catch (error) {
    res.status(400).json({
      status: "Failed",
      message: error.message || "Failed To Add Product To Wishlist",
    });
  }
};

exports.getWishlist = async (req, res) => {
  try {
    const userId = req.user.id;

    const wishlists = await wishlistService.getWishlistByUser(userId);

    res.status(200).json({
      status: "OK",
      message: "Success Get Wishlist",
      data: wishlists,
    });
  } catch (error) {
    res.status(500).json({
      status: "Failed",
      message: "Failed To Get Wishlist",
    });
  }
};

exports.removeFromWishlist = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const userId = req.user.id;

    await wishlistService.removeFromWishlist(id, userId);

    res.status(200).json({
      status: "OK",
      message: "Success Remove Product From Wishlist",
    });
  } catch (error) {
    res.status(400).json({
      status: "Failed",
      message:
        error.message || "Failed To Remove Product From Wishlist",
    });
  }
};