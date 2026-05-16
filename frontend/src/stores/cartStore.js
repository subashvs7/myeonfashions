import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { cartApi } from '../api/cart';
import toast from 'react-hot-toast';

export const useCartStore = create(
  persist(
    (set, get) => ({
      items:      [],
      subtotal:   0,
      total:      0,
      itemCount:  0,
      coupon:     null,
      discount:   0,
      isOpen:     false,

      fetching: false,

      setCart: (data) => set((state) => ({
        items:     Array.isArray(data?.items) ? data.items : state.items,
        subtotal:  data?.subtotal   ?? state.subtotal,
        total:     data?.total      ?? state.total,
        itemCount: data?.item_count ?? state.itemCount,
      })),

      fetchCart: async () => {
        if (get().fetching) return;
        set({ fetching: true });
        try {
          const res = await cartApi.get();
          get().setCart(res.data.data);
        } catch {}
        finally { set({ fetching: false }); }
      },

      addItem: async (productId, variantId, quantity = 1) => {
        try {
          const res = await cartApi.add({ product_id: productId, variant_id: variantId, quantity });
          get().setCart(res.data.data);
          toast.success('Added to cart!');
          set({ isOpen: true });
        } catch (e) {
          toast.error(e.response?.data?.message || 'Failed to add');
        }
      },

      updateItem: async (itemId, qty) => {
        try {
          const res = await cartApi.update(itemId, qty);
          get().setCart(res.data.data);
        } catch (e) {
          if (e.response?.status === 404) await get().fetchCart();
        }
      },

      removeItem: async (itemId) => {
        try {
          const res = await cartApi.remove(itemId);
          get().setCart(res.data.data);
          toast.success('Item removed');
        } catch (e) {
          if (e.response?.status === 404) await get().fetchCart();
          else toast.error('Failed to remove item');
        }
      },

      clearCart: async () => {
        try {
          await cartApi.clear();
          set({ items: [], subtotal: 0, total: 0, itemCount: 0 });
        } catch {}
      },

      applyCoupon: (coupon, discount) => set({ coupon, discount }),
      removeCoupon: () => set({ coupon: null, discount: 0 }),

      openCart:  () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
    }),
    { name: 'cart', partialize: (s) => ({ itemCount: s.itemCount }) }
  )
);
