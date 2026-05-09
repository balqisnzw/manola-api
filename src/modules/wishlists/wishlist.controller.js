const wishlistService = require("./wishlist.service");

exports.addToWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.body;

    const wishlist = await wishlistService.addToWishlist(userId, parseInt(productId));
    res.status(201).json(wishlist);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const wishlists = await wishlistService.getWishlistByUser(userId);
    res.json(wishlists);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.removeFromWishlist = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const userId = req.user.id;

    await wishlistService.removeFromWishlist(id, userId);
    res.json({ message: "Produk berhasil dihapus dari wishlist" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
