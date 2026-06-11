const User = require('../models/User');
const Food = require('../models/Food');

// Add Item to Cart
const addToCart = async (req, res) => {
  try {
    const { userId, itemId } = req.body;
    if (!userId || !itemId) {
      return res.json({ success: false, message: "Missing user ID or item ID" });
    }

    // Check if food exists and has stock
    const food = await Food.findById(itemId);
    if (!food) {
      return res.json({ success: false, message: "Food item not found" });
    }

    // Check stock availability
    if (food.stock !== undefined && food.stock <= 0) {
      return res.json({ success: false, message: "This item is currently out of stock" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    // Initialize cartData if it doesn't exist
    if (!user.cartData) {
      user.cartData = new Map();
    }

    const currentQty = user.cartData.get(itemId) || 0;

    // Check if adding would exceed available stock
    if (food.stock !== undefined && currentQty >= food.stock) {
      return res.json({ success: false, message: "Maximum stock reached for this item" });
    }

    // Increment quantity
    user.cartData.set(itemId, currentQty + 1);
    
    // Mark modified so mongoose saves the map correctly
    user.markModified('cartData');
    await user.save();

    res.json({ success: true, message: "Item added to cart" });
  } catch (error) {
    console.error("Add to Cart Error:", error);
    res.json({ success: false, message: "Failed to add item to cart" });
  }
};

// Remove Item from Cart (Decrement / Delete)
const removeFromCart = async (req, res) => {
  try {
    const { userId, itemId } = req.body;
    if (!itemId) {
      return res.json({ success: false, message: "Missing item ID" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    if (user.cartData) {
      const currentQty = user.cartData.get(itemId) || 0;
      if (currentQty > 0) {
        if (currentQty <= 1) {
          user.cartData.delete(itemId);
        } else {
          user.cartData.set(itemId, currentQty - 1);
        }
        user.markModified('cartData');
        await user.save();
      }
    }

    const cartObj = user.cartData ? Object.fromEntries(user.cartData) : {};
    res.json({ success: true, message: "Removed from cart successfully", cartData: cartObj });
  } catch (error) {
    console.error("Remove from Cart Error:", error);
    res.json({ success: false, message: "Failed to update cart" });
  }
};

// Get User Cart
const getCart = async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await User.findById(userId);

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    const cartObj = user.cartData ? Object.fromEntries(user.cartData) : {};
    res.json({ success: true, cartData: cartObj });
  } catch (error) {
    console.error("Get Cart Error:", error);
    res.json({ success: false, message: "Failed to load cart state" });
  }
};

module.exports = {
  addToCart,
  removeFromCart,
  getCart
};
