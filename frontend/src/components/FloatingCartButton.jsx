import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { StoreContext } from "../context/StoreContext";
import { ShoppingCart } from "lucide-react";

const FloatingCartButton = () => {
  const { cartItems } = useContext(StoreContext);
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();

  const totalItems = Object.values(cartItems).reduce((sum, qty) => sum + qty, 0);

  const scrollToCart = () => {
    const cartSection = document.getElementById("cart-section");
    if (cartSection) {
      cartSection.scrollIntoView({ behavior: "smooth" });
    } else {
      navigate("/cart");
    }
  };

  return (
    <div className="fixed bottom-5 right-4 sm:bottom-6 sm:right-6 z-40 safe-bottom">
      {isExpanded && totalItems > 0 && (
        <div className="absolute bottom-16 right-0 bg-brand-charcoal text-brand-cream px-4 py-2 rounded-lg shadow-card mb-2 animate-fade-in text-sm font-medium">
          {totalItems} item{totalItems !== 1 ? "s" : ""} in cart
        </div>
      )}

      <button
        onClick={scrollToCart}
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
        className="relative w-14 h-14 bg-brand-gold hover:bg-brand-gold-dark text-brand-charcoal rounded-full shadow-card flex items-center justify-center transition-colors"
        aria-label="View cart"
      >
        <ShoppingCart size={22} strokeWidth={2} />

        {totalItems > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-brand-charcoal text-brand-cream text-[10px] font-bold rounded-full flex items-center justify-center">
            {totalItems > 9 ? "9+" : totalItems}
          </span>
        )}
      </button>
    </div>
  );
};

export default FloatingCartButton;
