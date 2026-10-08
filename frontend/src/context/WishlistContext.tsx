import React, { createContext, useContext, useState, useEffect } from 'react';
import { WishlistItem, Product } from '../types';
import { api } from '../services/api';
import { useAuth } from './AuthContext';
import { trackEvent } from '../services/analytics';

interface WishlistContextType {
  wishlist: WishlistItem[];
  wishlistCount: number;
  isLoading: boolean;
  isWishlisted: (productId: number) => boolean;
  toggleWishlist: (product: Product) => Promise<boolean>;
  refreshWishlist: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const refreshWishlist = async () => {
    if (user) {
      setIsLoading(true);
      try {
        const data = await api.getWishlist();
        setWishlist(data || []);
      } catch (err) {
        console.error('Failed to load wishlist:', err);
      } finally {
        setIsLoading(false);
      }
    } else {
      const local = localStorage.getItem('guest_wishlist');
      if (local) {
        try {
          setWishlist(JSON.parse(local));
        } catch {
          setWishlist([]);
        }
      } else {
        setWishlist([]);
      }
    }
  };

  useEffect(() => {
    refreshWishlist();
  }, [user]);

  const isWishlisted = (productId: number) => {
    return wishlist.some((item) => item.product_id === productId);
  };

  const toggleWishlist = async (product: Product): Promise<boolean> => {
    const currentlyIn = isWishlisted(product.id);
    trackEvent('wishlist', window.location.pathname, product.id, {
      product_name: product.name,
      action: currentlyIn ? 'removed' : 'added',
    });

    if (user) {
      try {
        const res = await api.toggleWishlist(product.id);
        await refreshWishlist();
        return res.in_wishlist;
      } catch (err) {
        console.error('Wishlist toggle error:', err);
        return false;
      }
    } else {
      let updated: WishlistItem[];
      let added = false;
      if (currentlyIn) {
        updated = wishlist.filter((item) => item.product_id !== product.id);
      } else {
        updated = [
          ...wishlist,
          {
            id: Date.now(),
            product_id: product.id,
            created_at: new Date().toISOString(),
            product,
          },
        ];
        added = true;
      }
      setWishlist(updated);
      localStorage.setItem('guest_wishlist', JSON.stringify(updated));
      return added;
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        wishlistCount: wishlist.length,
        isLoading,
        isWishlisted,
        toggleWishlist,
        refreshWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) throw new Error('useWishlist must be used within a WishlistProvider');
  return context;
};
