const reviewService = require("./review.service");

exports.createReview = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, orderId, rating, komentar } = req.body;

    const review = await reviewService.createReview({
      userId,
      productId: parseInt(productId),
      orderId: parseInt(orderId),
      rating: parseInt(rating),
      komentar,
    });

    res.status(201).json(review);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getProductReviews = async (req, res) => {
  try {
    const productId = parseInt(req.params.productId);
    const reviews = await reviewService.getReviewsByProduct(productId);
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
