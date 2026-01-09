import { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem("hetave_cart");
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        // Validate and clean cart items - be more lenient with validation
        const cleanedCart = parsedCart
          .filter((item) => {
            // Only filter out items that are completely invalid
            return item && (item.id || item._id) && item.name && (item.price !== undefined && item.price !== null);
          })
          .map((item) => ({
            id: item.id || item._id,
            name: item.name,
            price: Number(item.price) || 0,
            image: item.image || "",
            category: item.category || "",
            quantity: Number(item.quantity) || 1,
          }));
        setCart(cleanedCart);
      } catch (error) {
        console.error("Error parsing cart:", error);
        setCart([]);
      }
    }
    setIsInitialized(true);
  }, []);

  // Save cart to localStorage whenever it changes (but only after initial load)
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem("hetave_cart", JSON.stringify(cart));
    }
  }, [cart, isInitialized]);

  const addToCart = (product, quantity = 1) => {
    setCart((prevCart) => {
      // Ensure product has all required fields
      const cartProduct = {
        id: product.id || product._id,
        name: product.name,
        price: product.price,
        image: product.image,
        category: product.category,
        quantity: quantity,
      };
      
      const existingItem = prevCart.find((item) => item.id === cartProduct.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === cartProduct.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prevCart, cartProduct];
    });
  };

  const removeFromCart = (productId) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const getCartItemCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const hasBulkOrder = () => {
    return cart.some((item) => item.quantity >= 10);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getCartItemCount,
        hasBulkOrder,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}

