import React, { useContext, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { StoreContext } from "../context/StoreContext";
import { X, Star, Clock, MapPin, Plus, Minus, Heart, ShieldAlert, MessageSquare } from "lucide-react";

const FoodDetailsModal = ({ item, onClose }) => {
  const { cartItems, addToCart, removeFromCart, favorites, toggleFavorite, url, token, user, formatPrice, showAlert } = useContext(StoreContext);
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  if (!item) return null;

  const qty = cartItems[item._id] || 0;
  const isFav = favorites?.includes(item._id) || false;

  // Fetch reviews when modal opens
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await fetch(`${url}/api/review/food/${item._id}`);
        const data = await response.json();
        if (data.success) {
          setReviews(data.reviews);
          setAverageRating(data.averageRating);
          setTotalReviews(data.totalReviews);
        }
      } catch (error) {
        console.error("Error fetching reviews:", error);
      }
    };

    fetchReviews();
  }, [item._id, url]);

  // Disable body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // Handle review submission
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      showAlert("Please login to submit a review", "warning", "Authentication Required");
      return;
    }

    setIsSubmittingReview(true);
    try {
      const response = await fetch(`${url}/api/review/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          token
        },
        body: JSON.stringify({
          foodId: item._id,
          userId: user._id,
          rating: reviewForm.rating,
          comment: reviewForm.comment
        })
      });

      const data = await response.json();
      if (data.success) {
        // Refresh reviews
        const reviewsResponse = await fetch(`${url}/api/review/food/${item._id}`);
        const reviewsData = await reviewsResponse.json();
        if (reviewsData.success) {
          setReviews(reviewsData.reviews);
          setAverageRating(reviewsData.averageRating);
          setTotalReviews(reviewsData.totalReviews);
        }
        setShowReviewForm(false);
        setReviewForm({ rating: 5, comment: "" });
      } else {
        showAlert(data.message || "Failed to submit review", "error", "Review Failed");
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      showAlert("Failed to submit review", "error", "Review Error");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 pointer-events-auto" role="dialog" aria-modal="true" aria-label={`Details for ${item.name}`}>
      <div 
        className="fixed inset-0 bg-brand-charcoal/60 backdrop-blur-sm pointer-events-auto"
        onClick={onClose}
      />

      <div className="relative bg-brand-cream border border-brand-charcoal/10 w-full max-w-[95%] md:max-w-3xl lg:max-w-4xl rounded-2xl overflow-hidden shadow-2xl z-10 max-h-[85vh] sm:max-h-[90vh] flex flex-col animate-scale-in pointer-events-auto">
        
        {/* Close Button Trigger */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 sm:top-6 sm:right-6 bg-white/80 backdrop-blur-md border border-brand-charcoal/10 p-2 rounded-full text-gray-700 hover:text-black hover:scale-105 active:scale-95 transition-all z-20"
          aria-label="Close details"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Scrollable Core Body */}
        <div className="overflow-y-auto p-4 sm:p-8 flex-grow overscroll-contain">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Column: Image, Tags, Metadata */}
            <div className="lg:col-span-5 space-y-5">
              <div className="relative h-48 sm:h-64 lg:h-80 rounded-xl sm:rounded-2xl overflow-hidden bg-gray-100 border border-brand-charcoal/5">
                <img 
                  src={item.image} 
                  alt={item.name} 
                  className="w-full h-full object-cover object-center"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=800";
                  }}
                />
                
                {/* Category Pill Tag */}
                <span className="absolute top-4 left-4 bg-brand-charcoal/85 backdrop-blur-md text-brand-cream text-[10px] font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full border border-white/10">
                  {item.category}
                </span>

                {/* Favorite Heart Trigger */}
                <button 
                  onClick={() => toggleFavorite(item._id)}
                  className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-md border border-brand-charcoal/10 p-2.5 rounded-xl shadow-lg hover:scale-110 active:scale-95 transition-all"
                  aria-label="Bookmark dish"
                >
                  <Heart size={16} className={isFav ? "fill-red-500 text-red-500" : "text-gray-400"} />
                </button>
              </div>

              {/* Sourcing & Prep Coordinates */}
              <div className="bg-white rounded-2xl border border-[#e4e1db]/80 p-5 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-brand-gold/10 flex items-center justify-center text-brand-gold">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <span className="text-[9px] uppercase tracking-widest text-gray-400 font-bold block">Sourced from</span>
                    <span className="text-xs font-semibold text-gray-800">{item.sourcing || "Local Bamenda suppliers"}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-brand-gold/10 flex items-center justify-center text-brand-gold">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <span className="text-[9px] uppercase tracking-widest text-gray-400 font-bold block">Preparation Time</span>
                    <span className="text-xs font-semibold text-gray-800">{item.prepTime || "12 mins"} (Crafted Fresh)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Dish Bio, Ingredients & Nutritional Facts */}
            <div className="lg:col-span-7 flex flex-col justify-between text-left space-y-6">
              <div className="space-y-4">
                {/* Title & Reviews */}
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex text-brand-gold">
                      {[...Array(5)].map((_, i) => <Star key={i} size={11} fill="#d4af37" stroke="none" />)}
                    </div>
                    <span className="text-[10px] font-bold tracking-wider text-gray-400 uppercase">
                      {totalReviews > 0 ? `${averageRating} (${totalReviews} reviews)` : "No reviews yet"}
                    </span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-serif font-bold text-gray-900 leading-tight">
                    {item.name}
                  </h2>
                </div>

                {/* Sourcing ingredients */}
                <p className="text-xs leading-relaxed text-gray-600 font-light">
                  {item.description}
                </p>

                {/* Sourced Ingredients bullet strings */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-brand-gold block">Selected Ingredients</span>
                  <p className="text-xs text-gray-500 font-medium">
                    {item.ingredients || "Fresh local ingredients"}
                  </p>
                </div>
              </div>

              {/* Reviews Section */}
              <div className="pt-6 border-t border-brand-charcoal/5">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-lg font-bold font-serif text-brand-charcoal">Customer Reviews</h4>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={16}
                          className={star <= Math.round(averageRating) ? "fill-[#d4af37] text-brand-gold" : "text-gray-300"}
                        />
                      ))}
                    </div>
                    <span className="text-sm font-bold text-brand-charcoal">{averageRating}</span>
                    <span className="text-xs text-brand-charcoal/50">({totalReviews} reviews)</span>
                  </div>
                </div>

                {/* Add Review Button */}
                {!showReviewForm && (
                  <button
                    onClick={() => setShowReviewForm(true)}
                    className="mb-4 px-4 py-2 bg-brand-gold/10 hover:bg-brand-gold/20 text-brand-gold rounded-xl text-xs font-bold transition-all flex items-center gap-2"
                  >
                    <MessageSquare size={14} /> Write a Review
                  </button>
                )}

                {/* Review Form */}
                {showReviewForm && (
                  <form onSubmit={handleReviewSubmit} className="mb-6 p-4 bg-brand-charcoal/5 rounded-xl">
                    <div className="mb-3">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-brand-charcoal/50 block mb-2">Your Rating</label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                            className="p-1 hover:scale-110 transition-transform"
                          >
                            <Star
                              size={24}
                              className={star <= reviewForm.rating ? "fill-[#d4af37] text-brand-gold" : "text-gray-300"}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="mb-3">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-brand-charcoal/50 block mb-2">Your Review</label>
                      <textarea
                        value={reviewForm.comment}
                        onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                        placeholder="Share your experience with this dish..."
                        rows={3}
                        className="w-full px-3 py-2 rounded-lg border border-brand-charcoal/10 focus:border-brand-gold outline-none text-xs resize-none"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        disabled={isSubmittingReview}
                        className="px-4 py-2 bg-brand-gold hover:bg-brand-gold-dark text-brand-charcoal rounded-lg text-xs font-bold transition-all"
                      >
                        {isSubmittingReview ? "Submitting..." : "Submit Review"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowReviewForm(false)}
                        className="px-4 py-2 border border-brand-charcoal/10 text-brand-charcoal rounded-lg text-xs font-bold transition-all hover:bg-brand-charcoal/5"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}

                {/* Reviews List */}
                <div className="space-y-3 max-h-48 overflow-y-auto">
                  {reviews.length === 0 ? (
                    <p className="text-xs text-brand-charcoal/50 text-center py-4">No reviews yet. Be the first to review!</p>
                  ) : (
                    reviews.map((review) => (
                      <div key={review._id} className="p-3 bg-white rounded-xl border border-brand-charcoal/5">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="text-xs font-bold text-brand-charcoal">{review.userName}</p>
                            <div className="flex items-center gap-1 mt-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  size={12}
                                  className={star <= review.rating ? "fill-[#d4af37] text-brand-gold" : "text-gray-300"}
                                />
                              ))}
                            </div>
                          </div>
                          <span className="text-[10px] text-brand-charcoal/40">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        {review.comment && (
                          <p className="text-xs text-brand-charcoal/70 leading-relaxed">{review.comment}</p>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Footer pricing & bag stepper */}
              <div className="sticky bottom-0 bg-brand-cream pt-4 pb-2 sm:static sm:pt-5 border-t border-brand-charcoal/5 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 sm:gap-4">
                <div className="text-left w-full sm:w-auto">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-brand-charcoal/40 block">Price</span>
                  <span className="text-2xl font-bold font-serif text-brand-charcoal">{formatPrice(item.price)}</span>
                </div>

                <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-start">
                  {qty === 0 ? (
                    <button 
                      onClick={() => addToCart(item._id)}
                      className="flex-grow sm:flex-grow-0 px-8 py-3.5 bg-brand-charcoal hover:bg-brand-gold text-white hover:text-black rounded-full font-bold text-xs uppercase tracking-wider transition-all duration-300 transform active:scale-95 shadow-md flex items-center justify-center gap-2"
                    >
                      <Plus className="w-4 h-4" /> Add To Bag
                    </button>
                  ) : (
                    <div className="flex items-center gap-4 bg-white border border-brand-gold px-4 py-2.5 rounded-full shadow-lg transition-all duration-300">
                      <button 
                        onClick={() => removeFromCart(item._id)}
                        className="w-8 h-8 rounded-full hover:bg-gray-100 text-brand-charcoal hover:text-brand-gold flex items-center justify-center transition-all active:scale-90"
                        title="Remove 1 item"
                      >
                        <Minus size={15} strokeWidth={2.5} />
                      </button>
                      <span className="text-sm font-extrabold text-brand-charcoal min-w-[20px] text-center">
                        {qty} in Bag
                      </span>
                      <button 
                        onClick={() => addToCart(item._id)}
                        className="w-8 h-8 rounded-full hover:bg-gray-100 text-brand-charcoal hover:text-brand-gold flex items-center justify-center transition-all active:scale-90"
                        title="Add 1 item"
                      >
                        <Plus size={15} strokeWidth={2.5} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>,
    document.body
  );
};

export default FoodDetailsModal;
