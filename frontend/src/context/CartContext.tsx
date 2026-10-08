import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, Product } from '../types';
import { api } from '../services/api';
import { useAuth } from './AuthContext';
import { trackEvent } from '../services/analytics';

interface CartContextType {
  items: CartItem[];
  cartCount: number;
  totalAmount: number;
  isLoading: boolean;
  addToCart: (product: Product, quantity?: number) => Promise<void>;
  updateQuantity: (itemId: number, quantity: number) => Promise<void>;
  removeFromCart: (itemId: number, productId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const refreshCart = async () => {
    if (user) {
      setIsLoading(true);
      try {
        const cart = await api.getCart();
        setItems(cart.items || []);
      } catch (err) {
        console.error('Failed to load DB cart:', err);
      } finally {
        setIsLoading(false);
      }
    } else {
      // Local storage fallback for anonymous
      const local = localStorage.getItem('guest_cart');
      if (local) {
        try {
          setItems(JSON.parse(local));
        } catch {
          setItems([]);
        }
      } else {
        setItems([]);
      }
    }
  };

  useEffect(() => {
    refreshCart();
  }, [user]);

  const addToCart = async (product: Product, quantity = 1) => {
    trackEvent('add_to_cart', window.location.pathname, product.id, {
      product_name: product.name,
      price: product.price,
      quantity,
    });

    if (user) {
      try {
        const cart = await api.addToCart(product.id, quantity);
        setItems(cart.items || []);
      } catch (err) {
        console.error('Add to cart failed:', err);
      }
    } else {
      setItems((prev) => {
        const existingIdx = prev.findIndex((i) => i.product_id === product.id);
        let updated: CartItem[];
        if (existingIdx > -1) {
          updated = [...prev];
          updated[existingIdx].quantity += quantity;
        } else {
          updated = [
            ...prev,
            {
              id: Date.now(),
              product_id: product.id,
              quantity,
              product,
            },
          ];
        }
        localStorage.setItem('guest_cart', JSON.stringify(updated));
        return updated;
      });
    }
  };

  const updateQuantity = async (itemId: number, quantity: number) => {
    if (user) {
      try {
        const cart = await api.updateCartItem(itemId, quantity);
        setItems(cart.items || []);
      } catch (err) {
        console.error('Update quantity failed:', err);
      }
    } else {
      setItems((prev) => {
        let updated: CartItem[];
        if (quantity <= 0) {
          updated = prev.filter((i) => i.id !== itemId);
        } else {
          updated = prev.map((i) => (i.id === itemId ? { ...i, quantity } : i));
        }
        localStorage.setItem('guest_cart', JSON.stringify(updated));
        return updated;
      });
    }
  };

  const removeFromCart = async (itemId: number, productId: number) => {
    trackEvent('remove_from_cart', window.location.pathname, productId, { item_id: itemId });

    if (user) {
      try {
        const cart = await api.removeCartItem(itemId);
        setItems(cart.items || []);
      } catch (err) {
        console.error('Remove from cart failed:', err);
      }
    } else {
      setItems((prev) => {
        const updated = prev.filter((i) => i.id !== itemId);
        localStorage.setItem('guest_cart', JSON.stringify(updated));
        return updated;
      });
    }
  };

  const clearCart = async () => {
    if (user) {
      try {
        await api.clearCart();
        setItems([]);
      } catch (err) {
        console.error('Clear cart failed:', err);
      }
    } else {
      localStorage.removeItem('guest_cart');
      setItems([]);
    }
  };

  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = items.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        cartCount,
        totalAmount: Math.round(totalAmount * 100) / 100,
        isLoading,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};
