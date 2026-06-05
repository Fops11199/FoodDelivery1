import { createContext, useEffect, useState } from "react";

export const StoreContext = createContext(null);

const StoreProvider = (props) => {
  const [cartItems, setCartItems] = useState({});
  const [token, setToken] = useState("");
  const [user, setUser] = useState(null);
  const [food_list, setFoodList] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Custom Luxury Additions
  const [toasts, setToasts] = useState([]);
  const [customModal, setCustomModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
    onConfirm: null,
    confirmText: "OK",
    cancelText: "Cancel"
  });
  const [favorites, setFavorites] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("favorites") || "[]");
    } catch {
      return [];
    }
  });
  const [addresses, setAddresses] = useState(() => {
    try {
      const stored = localStorage.getItem("addresses");
      return stored ? JSON.parse(stored) : [
        { id: 1, name: "Home Residence", street: "124 Luxury Terraces", city: "Beverly Hills", state: "CA", zip: "90210", phone: "310-555-0192" },
        { id: 2, name: "Penthouse Office", street: "800 Enterprise Way", city: "Los Angeles", state: "CA", zip: "90017", phone: "213-555-0847" }
      ];
    } catch {
      return [];
    }
  });

  // Core API URL (Proxy makes relative calls direct to Vite, which proxies to Node)
  const url = import.meta.env.VITE_API_URL || ""; 

  // Luxury Toast Helper
  const showToast = (message, type = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Custom Alert Helper
  const showAlert = (message, type = "info", title = "") => {
    setCustomModal({
      isOpen: true,
      title: title || (type === "error" ? "Error" : type === "success" ? "Success" : type === "warning" ? "Warning" : "Information"),
      message,
      type,
      onConfirm: null,
      confirmText: "OK",
      cancelText: "Cancel"
    });
  };

  // Custom Confirm Helper (returns Promise)
  const showConfirm = (message, title = "Confirm Action") => {
    return new Promise((resolve) => {
      setCustomModal({
        isOpen: true,
        title,
        message,
        type: "warning",
        onConfirm: () => resolve(true),
        confirmText: "Confirm",
        cancelText: "Cancel"
      });
    });
  };

  const closeCustomModal = () => {
    setCustomModal((prev) => ({ ...prev, isOpen: false }));
  };

  // Toggle Saved Item Bookmarks
  const toggleFavorite = (itemId) => {
    setFavorites((prev) => {
      let updated;
      const itemInfo = food_list.find((p) => p._id === itemId);
      const name = itemInfo ? itemInfo.name : "Artisan selection";
      
      if (prev.includes(itemId)) {
        updated = prev.filter((id) => id !== itemId);
        showToast(`Removed "${name}" from favorites`, "info");
      } else {
        updated = [...prev, itemId];
        showToast(`Added "${name}" to favorites!`, "success");
      }
      localStorage.setItem("favorites", JSON.stringify(updated));
      return updated;
    });
  };

  // Saved Addresses Handlers
  const saveAddress = (address) => {
    setAddresses((prev) => {
      let updated;
      if (address.id) {
        updated = prev.map((addr) => addr.id === address.id ? address : addr);
        showToast(`Address "${address.name}" updated successfully!`, "success");
      } else {
        const newAddress = { ...address, id: Date.now() };
        updated = [...prev, newAddress];
        showToast(`New address "${address.name}" added successfully!`, "success");
      }
      localStorage.setItem("addresses", JSON.stringify(updated));
      return updated;
    });
  };

  const deleteAddress = (id) => {
    setAddresses((prev) => {
      const addressInfo = prev.find((addr) => addr.id === id);
      const name = addressInfo ? addressInfo.name : "Address";
      const updated = prev.filter((addr) => addr.id !== id);
      localStorage.setItem("addresses", JSON.stringify(updated));
      showToast(`Deleted address: ${name}`, "info");
      return updated;
    });
  };

  // Profile Information Updator
  const updateProfile = (profileData) => {
    if (user) {
      const updatedUser = { ...user, ...profileData };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      showToast("Your changes have been saved beautifully.", "success");
    } else {
      showToast("Please sign in to update details.", "error");
    }
  };

  // Add Item to Cart (Optimistic State Update & Server Sync)
  const addToCart = async (itemId) => {
    setCartItems((prev) => ({
      ...prev,
      [itemId]: (prev[itemId] || 0) + 1,
    }));

    const itemInfo = food_list.find((p) => p._id === itemId);
    const name = itemInfo ? itemInfo.name : "Artisan Selection";
    showToast(`Added ${name} to your shopping bag!`, "success");

    if (token) {
      try {
        const response = await fetch(`${url}/api/cart/add`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            token: token,
          },
          body: JSON.stringify({ itemId }),
        });
        const data = await response.json();
        if (!data.success) {
          console.error("Cart server sync failed:", data.message);
        }
      } catch (error) {
        console.error("Error adding to cart:", error);
      }
    }
  };

  // Remove/Decrement Item in Cart (Optimistic State Update & Server Sync)
  const removeFromCart = async (itemId) => {
    setCartItems((prev) => {
      const updated = { ...prev };
      if (updated[itemId] <= 1) {
        delete updated[itemId];
      } else {
        updated[itemId] -= 1;
      }
      return updated;
    });

    const itemInfo = food_list.find((p) => p._id === itemId);
    const name = itemInfo ? itemInfo.name : "Artisan Selection";
    showToast(`Removed ${name} from your shopping bag.`, "info");

    if (token) {
      try {
        const response = await fetch(`${url}/api/cart/remove`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            token: token,
          },
          body: JSON.stringify({ itemId }),
        });
        const data = await response.json();
        if (!data.success) {
          console.error("Cart server sync failed:", data.message);
        }
      } catch (error) {
        console.error("Error removing from cart:", error);
      }
    }
  };

  // Calculate Subtotal Amount
  const getCartSubtotal = () => {
    let totalAmount = 0;
    for (const item in cartItems) {
      if (cartItems[item] > 0) {
        const itemInfo = food_list.find((product) => product._id === item);
        if (itemInfo) {
          totalAmount += itemInfo.price * cartItems[item];
        }
      }
    }
    return totalAmount;
  };

  // Get total quantity of items in cart
  const getCartQuantity = () => {
    let totalQty = 0;
    for (const item in cartItems) {
      totalQty += cartItems[item];
    }
    return totalQty;
  };

  // Format price with FCFA currency
  const formatPrice = (price) => {
    return `FCFA ${price.toLocaleString()}`;
  };

  // Fetch Food List from API
  const fetchFoodList = async () => {
    try {
      const response = await fetch(`${url}/api/food/list`);
      const data = await response.json();
      if (data.success) {
        setFoodList(data.data);
      } else {
        console.error("Failed to load food list:", data.message);
      }
    } catch (error) {
      console.error("Error loading food list:", error);
    }
  };

  // Fetch Cart State from API for authenticated session
  const fetchCartData = async (authToken) => {
    try {
      const response = await fetch(`${url}/api/cart/get`, {
        method: "GET",
        headers: {
          token: authToken,
        },
      });
      const data = await response.json();
      if (data.success) {
        setCartItems(data.cartData);
      }
    } catch (error) {
      console.error("Error loading cart state:", error);
    }
  };

  // Initialize and check local storage credentials on bootstrap
  const initApp = async () => {
    setLoading(true);
    await fetchFoodList();
    
    const localToken = localStorage.getItem("token");
    const localUser = localStorage.getItem("user");
    
    if (localToken) {
      setToken(localToken);
      if (localUser) {
        try {
          setUser(JSON.parse(localUser));
        } catch (e) {
          console.error("Error parsing stored user data", e);
        }
      }
      await fetchCartData(localToken);
    }
    setLoading(false);
  };

  useEffect(() => {
    initApp();
  }, []);

  // Logout routine
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken("");
    setUser(null);
    setCartItems({});
    showToast("Signed out. We look forward to your next visit.", "info");
  };

  const contextValue = {
    food_list,
    cartItems,
    setCartItems,
    addToCart,
    removeFromCart,
    getCartSubtotal,
    getCartQuantity,
    formatPrice,
    token,
    setToken,
    user,
    setUser,
    url,
    fetchFoodList,
    logout,
    loading,
    
    // Luxury properties
    toasts,
    showToast,
    removeToast,
    favorites,
    toggleFavorite,
    addresses,
    saveAddress,
    deleteAddress,
    updateProfile,
    
    // Custom modal properties
    customModal,
    showAlert,
    showConfirm,
    closeCustomModal
  };

  return (
    <StoreContext.Provider value={contextValue}>
      {props.children}
    </StoreContext.Provider>
  );
};

export default StoreProvider;
