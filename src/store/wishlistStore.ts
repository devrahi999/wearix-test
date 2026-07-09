import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface WishlistStore {
  productIds: string[];
  addToWishlist: (productId: string) => void;
  removeFromWishlist: (productId: string) => void;
  toggleWishlist: (productId: string) => void;
  isWishlisted: (productId: string) => boolean;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      productIds: [],

      addToWishlist: (productId) =>
        set((state) => ({
          productIds: state.productIds.includes(productId)
            ? state.productIds
            : [...state.productIds, productId],
        })),

      removeFromWishlist: (productId) =>
        set((state) => ({
          productIds: state.productIds.filter((id) => id !== productId),
        })),

      toggleWishlist: (productId) => {
        if (get().isWishlisted(productId)) {
          get().removeFromWishlist(productId);
        } else {
          get().addToWishlist(productId);
        }
      },

      isWishlisted: (productId) => get().productIds.includes(productId),
    }),
    { name: 'wearix-wishlist' }
  )
);
