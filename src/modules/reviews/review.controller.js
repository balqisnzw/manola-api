const reviewService = require("./review.service");

exports.createReview = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, orderId, rating, komentar } = req.body;

    if (!productId || !orderId || !rating || !komentar) {
      return res.status(400).json({
        status: "Failed",
        message: "Product ID, Order ID, Rating, And Comment Are Required",
      });
    }

    const review = await reviewService.createReview({
      userId,
      productId: parseInt(productId),
      orderId: parseInt(orderId),
      rating: parseInt(rating),
      komentar,
    });

    res.status(201).json({
      status: "OK",
      message: "Success Create Review",
      data: review,
    });
  } catch (error) {
    res.status(400).json({
      status: "Failed",
      message: error.message || "Failed To Create Review",
    });
  }
};

exports.getProductReviews = async (req, res) => {
  try {
    const productId = parseInt(req.params.productId);

    const reviews = await reviewService.getReviewsByProduct(productId);

    res.status(200).json({
      status: "OK",
      message: "Success Get Product Reviews",
      data: reviews,
    });
  } catch (error) {
    res.status(500).json({
      status: "Failed",
      message: "Failed To Get Product Reviews",
    });
  }
};