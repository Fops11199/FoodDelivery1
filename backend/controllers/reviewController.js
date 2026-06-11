const User = require('../models/User');
const Food = require('../models/Food');
const { readDB, writeDB } = require('../config/db');

// Add Review
const addReview = async (req, res) => {
  try {
    const { foodId, userId, rating, comment } = req.body;

    if (!foodId || !userId || !rating) {
      return res.json({ success: false, message: "Missing required fields" });
    }

    if (rating < 1 || rating > 5) {
      return res.json({ success: false, message: "Rating must be between 1 and 5" });
    }

    // Check if food exists in MongoDB
    const food = await Food.findById(foodId);
    if (!food) {
      return res.json({ success: false, message: "Food item not found" });
    }

    // Check if user exists in MongoDB
    const user = await User.findById(userId);
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    const db = readDB();

    // Initialize reviews array if it doesn't exist
    if (!db.reviews) {
      db.reviews = [];
    }

    // Check if user already reviewed this food
    const existingReviewIndex = db.reviews.findIndex(
      r => r.foodId === foodId && r.userId === userId
    );

    if (existingReviewIndex !== -1) {
      // Update existing review
      db.reviews[existingReviewIndex] = {
        ...db.reviews[existingReviewIndex],
        rating,
        comment: comment || "",
        updatedAt: new Date().toISOString()
      };
    } else {
      // Add new review
      const newReview = {
        _id: `review_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        foodId,
        userId,
        userName: user.name,
        rating,
        comment: comment || "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      db.reviews.push(newReview);
    }

    writeDB(db);

    res.json({ success: true, message: "Review added successfully" });
  } catch (error) {
    console.error("Add Review Error:", error);
    res.json({ success: false, message: "Internal server error" });
  }
};

// Get Reviews for a Food Item
const getFoodReviews = async (req, res) => {
  try {
    const { foodId } = req.params;

    if (!foodId) {
      return res.json({ success: false, message: "Missing food ID" });
    }

    const db = readDB();

    if (!db.reviews) {
      return res.json({ success: true, reviews: [], averageRating: 0 });
    }

    const foodReviews = db.reviews.filter(r => r.foodId === foodId);

    // Calculate average rating
    let averageRating = 0;
    if (foodReviews.length > 0) {
      const totalRating = foodReviews.reduce((sum, r) => sum + r.rating, 0);
      averageRating = totalRating / foodReviews.length;
    }

    res.json({
      success: true,
      reviews: foodReviews,
      averageRating: averageRating.toFixed(1),
      totalReviews: foodReviews.length
    });
  } catch (error) {
    console.error("Get Reviews Error:", error);
    res.json({ success: false, message: "Internal server error" });
  }
};

// Get All Reviews (Admin)
const getAllReviews = async (req, res) => {
  try {
    const db = readDB();

    if (!db.reviews) {
      return res.json({ success: true, reviews: [] });
    }

    // Sort by date (newest first)
    const sortedReviews = db.reviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({ success: true, reviews: sortedReviews });
  } catch (error) {
    console.error("Get All Reviews Error:", error);
    res.json({ success: false, message: "Internal server error" });
  }
};

// Delete Review (Admin)
const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;

    if (!reviewId) {
      return res.json({ success: false, message: "Missing review ID" });
    }

    const db = readDB();

    if (!db.reviews) {
      return res.json({ success: false, message: "No reviews found" });
    }

    const reviewIndex = db.reviews.findIndex(r => r._id === reviewId);

    if (reviewIndex === -1) {
      return res.json({ success: false, message: "Review not found" });
    }

    db.reviews.splice(reviewIndex, 1);
    writeDB(db);

    res.json({ success: true, message: "Review deleted successfully" });
  } catch (error) {
    console.error("Delete Review Error:", error);
    res.json({ success: false, message: "Internal server error" });
  }
};

module.exports = {
  addReview,
  getFoodReviews,
  getAllReviews,
  deleteReview
};
