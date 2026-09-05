// src/features/cart/cartSlice.js
import { createSlice } from '@reduxjs/toolkit';

const loadCartFromStorage = () => {
  try {
    const data = localStorage.getItem('cart');
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

const saveCartToStorage = (items) => {
  localStorage.setItem('cart', JSON.stringify(items));
};

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: loadCartFromStorage(), // { bookId, title, author, price, coverImage, qty }
  },
  reducers: {
    addItem: (state, action) => {
      const newItem = action.payload;
      const existing = state.items.find((i) => i.bookId === newItem.bookId);

      if (existing) {
        existing.qty += newItem.qty || 1;
      } else {
        state.items.push({ ...newItem, qty: newItem.qty || 1 });
      }
      saveCartToStorage(state.items);
    },

    incrementQty: (state, action) => {
      const item = state.items.find((i) => i.bookId === action.payload);
      if (item) item.qty += 1;
      saveCartToStorage(state.items);
    },

    decrementQty: (state, action) => {
      const item = state.items.find((i) => i.bookId === action.payload);
      if (item && item.qty > 1) item.qty -= 1;
      saveCartToStorage(state.items);
    },

    removeItem: (state, action) => {
      state.items = state.items.filter((i) => i.bookId !== action.payload);
      saveCartToStorage(state.items);
    },

    clearCart: (state) => {
      state.items = [];
      saveCartToStorage(state.items);
    },
  },
});

export const { addItem, incrementQty, decrementQty, removeItem, clearCart } = cartSlice.actions;
export default cartSlice.reducer;