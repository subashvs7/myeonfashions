import { create } from 'zustand';

export const useUiStore = create((set) => ({
  mobileMenuOpen:  false,
  searchOpen:      false,
  activeModal:     null,
  modalData:       null,

  openMobileMenu:  () => set({ mobileMenuOpen: true }),
  closeMobileMenu: () => set({ mobileMenuOpen: false }),
  openSearch:      () => set({ searchOpen: true }),
  closeSearch:     () => set({ searchOpen: false }),
  openModal:       (name, data = null) => set({ activeModal: name, modalData: data }),
  closeModal:      () => set({ activeModal: null, modalData: null }),
}));
