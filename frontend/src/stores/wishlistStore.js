import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { wishlistApi } from '../api/wishlist';
import toast from 'react-hot-toast';

export const useWishlistStore = create(
  persist(
    (set, get) => ({
      ids: [],

      fetchIds: async () => {
        try {
          const res = await wishlistApi.ids();
          set({ ids: res.data.data });
        } catch {}
      },

      toggle: async (productId) => {
        try {
          const res = await wishlistApi.toggle(productId);
          const { wishlisted } = res.data;
          const ids = wishlisted
            ? [...get().ids, productId]
            : get().ids.filter((id) => id !== productId);
          set({ ids });
          toast.success(wishlisted ? 'Added to wishlist' : 'Removed from wishlist');
        } catch {
          toast.error('Please login to use wishlist');
        }
      },

      isWishlisted: (productId) => get().ids.includes(productId),
    }),
    { name: 'wishlist', partialize: (s) => ({ ids: s.ids }) }
  )
);
