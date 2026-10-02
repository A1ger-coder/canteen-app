'use client';

// ============================================================
// Cart Context — global cart state management
// ============================================================

import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { CartItem, CartState, MenuItem } from '@/types';

type CartAction =
  | { type: 'ADD_ITEM'; payload: { menuItem: MenuItem; quantity?: number; specialInstructions?: string } }
  | { type: 'REMOVE_ITEM'; payload: { menuItemId: string } }
  | { type: 'UPDATE_QUANTITY'; payload: { menuItemId: string; quantity: number } }
  | { type: 'UPDATE_INSTRUCTIONS'; payload: { menuItemId: string; specialInstructions: string } }
  | { type: 'SET_TABLE'; payload: { tableNumber: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'LOAD_CART'; payload: CartState };

interface CartContextType {
  state: CartState;
  addItem: (menuItem: MenuItem, quantity?: number, specialInstructions?: string) => void;
  removeItem: (menuItemId: string) => void;
  updateQuantity: (menuItemId: string, quantity: number) => void;
  updateInstructions: (menuItemId: string, specialInstructions: string) => void;
  setTable: (tableNumber: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const initialState: CartState = {
  items: [],
  tableNumber: null,
};

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingIndex = state.items.findIndex(
        (item) => item.menuItem.id === action.payload.menuItem.id
      );
      if (existingIndex > -1) {
        const newItems = [...state.items];
        newItems[existingIndex] = {
          ...newItems[existingIndex],
          quantity: newItems[existingIndex].quantity + (action.payload.quantity || 1),
        };
        return { ...state, items: newItems };
      }
      return {
        ...state,
        items: [
          ...state.items,
          {
            menuItem: action.payload.menuItem,
            quantity: action.payload.quantity || 1,
            specialInstructions: action.payload.specialInstructions || '',
          },
        ],
      };
    }
    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter((item) => item.menuItem.id !== action.payload.menuItemId),
      };
    case 'UPDATE_QUANTITY': {
      if (action.payload.quantity <= 0) {
        return {
          ...state,
          items: state.items.filter((item) => item.menuItem.id !== action.payload.menuItemId),
        };
      }
      return {
        ...state,
        items: state.items.map((item) =>
          item.menuItem.id === action.payload.menuItemId
            ? { ...item, quantity: action.payload.quantity }
            : item
        ),
      };
    }
    case 'UPDATE_INSTRUCTIONS':
      return {
        ...state,
        items: state.items.map((item) =>
          item.menuItem.id === action.payload.menuItemId
            ? { ...item, specialInstructions: action.payload.specialInstructions }
            : item
        ),
      };
    case 'SET_TABLE':
      return { ...state, tableNumber: action.payload.tableNumber };
    case 'CLEAR_CART':
      return { ...initialState, tableNumber: state.tableNumber };
    case 'LOAD_CART':
      return action.payload;
    default:
      return state;
  }
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Load cart from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('canteen-cart');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        dispatch({ type: 'LOAD_CART', payload: parsed });
      } catch {
        // ignore parse errors
      }
    }
  }, []);

  // Persist cart to localStorage on changes
  useEffect(() => {
    localStorage.setItem('canteen-cart', JSON.stringify(state));
  }, [state]);

  const addItem = (menuItem: MenuItem, quantity?: number, specialInstructions?: string) => {
    dispatch({ type: 'ADD_ITEM', payload: { menuItem, quantity, specialInstructions } });
  };

  const removeItem = (menuItemId: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: { menuItemId } });
  };

  const updateQuantity = (menuItemId: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { menuItemId, quantity } });
  };

  const updateInstructions = (menuItemId: string, specialInstructions: string) => {
    dispatch({ type: 'UPDATE_INSTRUCTIONS', payload: { menuItemId, specialInstructions } });
  };

  const setTable = (tableNumber: number) => {
    dispatch({ type: 'SET_TABLE', payload: { tableNumber } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const totalItems = state.items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = state.items.reduce(
    (sum, item) => sum + item.menuItem.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        state,
        addItem,
        removeItem,
        updateQuantity,
        updateInstructions,
        setTable,
        clearCart,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
