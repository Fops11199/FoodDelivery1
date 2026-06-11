const Order = require('../models/Order');
const User = require('../models/User');
const Food = require('../models/Food');
const { readDB, writeDB } = require('../config/db');
const { sendOrderConfirmation } = require('../utils/emailService');

// Place Order
const placeOrder = async (req, res) => {
  try {
    const { userId, items, amount, address, couponCode, deliveryZoneId, deliveryTimeSlotId, deliveryDate } = req.body;

    if (!userId || !items || !amount || !address) {
      return res.json({ success: false, message: "Please complete your delivery details and try again." });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.json({ success: false, message: "Your account was not found. Please sign in again." });
    }

    // Validate stock availability for all items
    for (const item of items) {
      const food = await Food.findById(item._id);
      if (!food) {
        return res.json({ success: false, message: `Food item ${item.name} not found` });
      }
      if (food.stock !== undefined && food.stock < item.quantity) {
        return res.json({ 
          success: false, 
          message: `Insufficient stock for ${item.name}. Available: ${food.stock}, Requested: ${item.quantity}` 
        });
      }
    }

    const db = readDB();

    // Calculate delivery fee if zone is provided
    let deliveryFee = 3000; // Default delivery fee (3000 FCFA)
    let selectedZone = null;

    if (deliveryZoneId && db.deliveryZones) {
      const zone = db.deliveryZones.find(z => z._id === deliveryZoneId);
      if (zone) {
        deliveryFee = zone.baseFee;
        // Add distance-based pricing (100 FCFA per km beyond base distance)
        deliveryFee += Math.max(0, zone.distanceKm) * 100;
        selectedZone = zone.name;

        // Free delivery for orders above threshold
        const freeDeliveryThreshold = 50000;
        if (amount >= freeDeliveryThreshold) {
          deliveryFee = 0;
        }
      }
    }

    // Get delivery time slot if provided
    let selectedTimeSlot = null;
    if (deliveryTimeSlotId && db.deliveryTimeSlots) {
      const slot = db.deliveryTimeSlots.find(s => s._id === deliveryTimeSlotId);
      if (slot) {
        selectedTimeSlot = {
          id: slot._id,
          name: slot.name,
          startTime: slot.startTime,
          endTime: slot.endTime
        };
      }
    }

    // Calculate discount if coupon code is provided
    let discountAmount = 0;
    let appliedCoupon = null;

    if (couponCode) {
      if (!db.coupons) {
        return res.json({ success: false, message: "Coupon not found" });
      }

      const coupon = db.coupons.find(c => c.code.toLowerCase() === couponCode.toLowerCase());

      if (!coupon) {
        return res.json({ success: false, message: "Invalid coupon code" });
      }

      // Check if coupon is active
      if (!coupon.isActive) {
        return res.json({ success: false, message: "This coupon is not active" });
      }

      // Check if coupon has expired
      if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) {
        return res.json({ success: false, message: "This coupon has expired" });
      }

      // Check if usage limit has been reached
      if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
        return res.json({ success: false, message: "This coupon has reached its usage limit" });
      }

      // Check minimum order amount
      if (coupon.minOrderAmount && amount < coupon.minOrderAmount) {
        return res.json({ 
          success: false, 
          message: `Minimum order amount of ${coupon.minOrderAmount} FCFA required` 
        });
      }

      // Calculate discount
      if (coupon.discountType === "percentage") {
        discountAmount = (amount * coupon.discountValue) / 100;
        // Apply max discount limit if set
        if (coupon.maxDiscountAmount && discountAmount > coupon.maxDiscountAmount) {
          discountAmount = coupon.maxDiscountAmount;
        }
      } else {
        discountAmount = coupon.discountValue;
      }

      appliedCoupon = {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discountAmount: discountAmount
      };

      // Increment coupon usage in db.json configuration file
      const couponIndex = db.coupons.findIndex(c => c._id === coupon._id);
      if (couponIndex !== -1) {
        db.coupons[couponIndex].usageCount = (db.coupons[couponIndex].usageCount || 0) + 1;
        writeDB(db);
      }
    }

    const finalAmount = amount - discountAmount + deliveryFee;

    // Calculate tax if tax is configured
    let taxAmount = 0;
    let taxRate = 0;
    let taxName = "No Tax";

    if (db.taxConfig && db.taxConfig.isActive) {
      let taxableAmount = 0;
      if (db.taxConfig.appliesToFood) {
        taxableAmount += amount - discountAmount;
      }
      if (db.taxConfig.appliesToDelivery) {
        taxableAmount += deliveryFee;
      }
      taxAmount = taxableAmount * db.taxConfig.taxRate;
      taxRate = db.taxConfig.taxRate;
      taxName = db.taxConfig.taxName;
    }

    const finalAmountWithTax = finalAmount + taxAmount;

    // Generate order ID
    const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create order object in MongoDB
    await Order.create({
      _id: orderId,
      userId,
      items,
      amount: finalAmountWithTax,
      originalAmount: amount,
      discountAmount,
      coupon: appliedCoupon,
      deliveryFee,
      deliveryZone: selectedZone,
      deliveryTimeSlot: selectedTimeSlot,
      deliveryDate: deliveryDate || new Date().toISOString().split('T')[0],
      taxAmount: Math.round(taxAmount),
      taxRate,
      taxName,
      address,
      status: "Food Processing",
      date: new Date(),
      payment: false,
      paymentMethod: "Mobile Money Transfer",
      paymentStatus: "Pending Verification",
      adminNote: "Customer confirmed transfer. Please verify payment to 237673184599 (AMOH JOEL)"
    });

    // Deduct stock for each ordered item in MongoDB
    for (const item of items) {
      await Food.findByIdAndUpdate(item._id, { $inc: { stock: -item.quantity } });
    }

    // Clear user's cart in MongoDB
    user.cartData = new Map();
    user.markModified('cartData');
    await user.save();

    // Send order confirmation email
    sendOrderConfirmation(user.email, {
      orderId,
      amount: finalAmountWithTax,
      address,
      deliveryFee,
      deliveryZone: selectedZone,
      deliveryTimeSlot: selectedTimeSlot,
      deliveryDate,
      taxAmount: Math.round(taxAmount),
      taxName
    }).catch(emailError => {
      console.error('Failed to send order confirmation email:', emailError);
    });

    res.json({
      success: true,
      message: "Order placed. Proceed to payment verification.",
      orderId,
      discountAmount,
      deliveryFee,
      taxAmount: Math.round(taxAmount),
      finalAmount: finalAmountWithTax
    });

  } catch (error) {
    console.error("Place Order Error:", error);
    res.json({ success: false, message: "Failed to place order" });
  }
};

// Verify Payment / Order (Manual Mobile Money Transfer)
const verifyOrder = async (req, res) => {
  try {
    const { orderId, success } = req.body;
    if (!orderId) {
      return res.json({ success: false, message: "Missing Order ID for verification" });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.json({ success: false, message: "Order not found" });
    }

    if (success === "true" || success === true) {
      // For manual payment, mark as pending verification by admin
      order.payment = true;
      order.paymentMethod = "Mobile Money Transfer";
      order.paymentStatus = "Pending Verification";
      order.adminNote = "Customer confirmed transfer. Please verify payment to 237673184599 (AMOH JOEL)";
      await order.save();
      res.json({ success: true, message: "Order placed successfully. Payment verification pending." });
    } else {
      // If payment failed/cancelled, delete the order
      await Order.findByIdAndDelete(orderId);
      res.json({ success: false, message: "Order cancelled" });
    }

  } catch (error) {
    console.error("Verify Order Error:", error);
    res.json({ success: false, message: "Internal error during payment verification" });
  }
};

// Cancel Order (User)
const cancelOrder = async (req, res) => {
  try {
    const { orderId, userId } = req.body;

    if (!orderId || !userId) {
      return res.json({ success: false, message: "Missing order ID or user ID" });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.json({ success: false, message: "Order not found" });
    }

    // Check if order belongs to user
    if (order.userId !== userId) {
      return res.json({ success: false, message: "Unauthorized to cancel this order" });
    }

    // Check if order can be cancelled (only if status is "Food Processing")
    if (order.status !== "Food Processing") {
      return res.json({ success: false, message: "Order cannot be cancelled at this stage" });
    }

    // Restore stock for cancelled order in MongoDB
    for (const item of order.items) {
      await Food.findByIdAndUpdate(item._id, { $inc: { stock: item.quantity } });
    }

    // Delete the order
    await Order.findByIdAndDelete(orderId);

    res.json({ success: true, message: "Order cancelled successfully" });
  } catch (error) {
    console.error("Cancel Order Error:", error);
    res.json({ success: false, message: "Internal server error" });
  }
};

// Update Order Status (Admin)
const updateOrderStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;

    if (!orderId || !status) {
      return res.json({ success: false, message: "Missing order ID or status" });
    }

    const validStatuses = ["Food Processing", "Out for Delivery", "Delivered", "Cancelled"];
    if (!validStatuses.includes(status)) {
      return res.json({ success: false, message: "Invalid status" });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.json({ success: false, message: "Order not found" });
    }

    // Update order status
    order.status = status;
    await order.save();

    res.json({ success: true, message: "Order status updated successfully" });
  } catch (error) {
    console.error("Update Order Status Error:", error);
    res.json({ success: false, message: "Internal server error" });
  }
};

// Fetch Current User's Orders
const userOrders = async (req, res) => {
  try {
    const { userId } = req.body;
    const orders = await Order.find({ userId }).sort({ date: -1 });
    res.json({ success: true, data: orders });
  } catch (error) {
    console.error("User Orders Error:", error);
    res.json({ success: false, message: "Failed to load order history" });
  }
};

// Fetch All Orders (Admin Dashboard)
const listOrders = async (req, res) => {
  try {
    const orders = await Order.find({}).sort({ date: -1 });
    res.json({ success: true, data: orders });
  } catch (error) {
    console.error("List Orders Error:", error);
    res.json({ success: false, message: "Failed to load admin orders" });
  }
};

// Update Order Delivery Status (Admin Dashboard)
const updateStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;
    if (!orderId || !status) {
      return res.json({ success: false, message: "Missing Order ID or Status" });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.json({ success: false, message: "Order not found" });
    }

    order.status = status;
    await order.save();

    res.json({ success: true, message: "Fulfillment status updated successfully" });
  } catch (error) {
    console.error("Update Status Error:", error);
    res.json({ success: false, message: "Failed to update delivery status" });
  }
};

// Fetch Real-time Dashboard Analytics Stats
const getDashboardStats = async (req, res) => {
  try {
    const usersCount = await User.countDocuments({});
    const catalogCount = await Food.countDocuments({});
    
    let totalRevenue = 0;
    let activeOrdersCount = 0;
    
    const paidOrders = await Order.find({ payment: true });
    
    paidOrders.forEach(o => {
      totalRevenue += Number(o.amount) || 0;
      if (o.status !== "Delivered") {
        activeOrdersCount++;
      }
    });

    // Sales by Category
    const categorySalesMap = {};
    const foods = await Food.find({});
    
    const activeCategories = [...new Set(foods.map(f => f.category))];
    activeCategories.forEach(cat => {
      categorySalesMap[cat] = 0;
    });

    paidOrders.forEach(o => {
      if (o.items && Array.isArray(o.items)) {
        o.items.forEach(item => {
          let category = item.category;
          if (!category) {
            const resolvedFood = foods.find(f => f._id === item._id);
            category = resolvedFood ? resolvedFood.category : "Signature Bowls";
          }
          if (category) {
            categorySalesMap[category] = (categorySalesMap[category] || 0) + (item.quantity || 1);
          }
        });
      }
    });

    const salesByCategory = Object.keys(categorySalesMap).map(name => ({
      name,
      value: categorySalesMap[name]
    })).sort((a, b) => b.value - a.value);

    // Sales Trend (Past 7 Days - Dynamic Calendar days)
    const salesTrendMap = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit' });
      salesTrendMap[dateStr] = 0;
    }

    paidOrders.forEach(o => {
      if (o.date) {
        const orderDateStr = new Date(o.date).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit' });
        if (salesTrendMap[orderDateStr] !== undefined) {
          salesTrendMap[orderDateStr] += Number(o.amount) || 0;
        }
      }
    });

    const salesTrend = Object.keys(salesTrendMap).map(date => ({
      date,
      amount: Number(salesTrendMap[date].toFixed(2))
    }));

    // Real Activity Logs Feed
    const activities = [];
    
    // 1. Log actual orders placed in the system
    const allOrders = await Order.find({});
    const allUsers = await User.find({});
    
    allOrders.forEach(o => {
      const orderUser = allUsers.find(u => u._id === o.userId);
      const userName = orderUser ? orderUser.name : (o.address?.firstName ? `${o.address.firstName} ${o.address.lastName}` : "Guest");
      const cleanTime = new Date(o.date);
      
      // Determine activity status label
      let statusLabel = o.status;
      if (!o.payment) statusLabel = "Awaiting Payment";
      
      activities.push({
        type: "order",
        message: `Order #${o._id.substring(o._id.length - 6).toUpperCase()} placed by ${userName} (FCFA ${Number(o.amount).toLocaleString()})`,
        detail: `Status: ${statusLabel}`,
        timestamp: cleanTime.getTime(),
        timeLabel: cleanTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        dateLabel: cleanTime.toLocaleDateString([], { month: 'short', day: 'numeric' })
      });
    });

    // 2. Log actual registered users
    allUsers.forEach(u => {
      const cleanTime = new Date(u.createdAt || Date.now());
      activities.push({
        type: "user",
        message: `New Gastronomer profile registered: ${u.email}`,
        detail: `Name: ${u.name}`,
        timestamp: cleanTime.getTime(),
        timeLabel: cleanTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        dateLabel: cleanTime.toLocaleDateString([], { month: 'short', day: 'numeric' })
      });
    });

    // 3. Log actual dishes in the catalog
    foods.forEach((f, idx) => {
      const cleanTime = new Date(f.createdAt || Date.now());
      activities.push({
        type: "catalog",
        message: `Signature dish added: "${f.name}"`,
        detail: `Category: ${f.category} • Price: FCFA ${Number(f.price).toLocaleString()}`,
        timestamp: cleanTime.getTime(),
        timeLabel: cleanTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        dateLabel: cleanTime.toLocaleDateString([], { month: 'short', day: 'numeric' })
      });
    });

    // Sort chronologically (newest first) and take top 8 activities
    const timeline = activities
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 8);

    res.json({
      success: true,
      data: {
        kpi: {
          totalRevenue: Number(totalRevenue.toFixed(2)),
          activeOrdersCount,
          catalogCount,
          usersCount
        },
        charts: {
          salesByCategory,
          salesTrend
        },
        timeline
      }
    });

  } catch (error) {
    console.error("Dashboard Stats Error:", error);
    res.json({ success: false, message: "Failed to load dashboard metrics" });
  }
};

module.exports = {
  placeOrder,
  verifyOrder,
  userOrders,
  listOrders,
  updateStatus,
  cancelOrder,
  updateOrderStatus,
  getDashboardStats
};
