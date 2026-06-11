"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { CartItem } from "@/types/product";

type CartContextValue = {
  items: CartItem[];
  itemCount: number;
  addItem: (item: CartItem) => void;
  updateQuantity: (lineKey: string, quantity: number) => void;
  removeItem: (lineKey: string) => void;
  clearCart: () => void;
};

const STORAGE_KEY = "slowbike-cart-v2";
const CartContext = createContext<CartContextValue | null>(null);

export function getCartLineKey(item: CartItem) {
  return [
    item.productId,
    item.variantId,
    item.color,
    [...item.accessoryIds].sort().join(","),
  ].join("|");
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) setItems(JSON.parse(saved) as CartItem[]);
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    if (ready) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, ready]);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      itemCount: items.reduce((total, item) => total + item.quantity, 0),
      addItem: (nextItem) => {
        setItems((current) => {
          const existing = current.find(
            (item) => getCartLineKey(item) === getCartLineKey(nextItem),
          );
          if (!existing) return [...current, nextItem];
          return current.map((item) =>
            getCartLineKey(item) === getCartLineKey(nextItem)
              ? { ...item, quantity: item.quantity + nextItem.quantity }
              : item,
          );
        });
      },
      updateQuantity: (lineKey, quantity) => {
        if (quantity < 1) return;
        setItems((current) =>
          current.map((item) =>
            getCartLineKey(item) === lineKey ? { ...item, quantity } : item,
          ),
        );
      },
      removeItem: (lineKey) => {
        setItems((current) => current.filter((item) => getCartLineKey(item) !== lineKey));
      },
      clearCart: () => setItems([]),
    }),
    [items],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
}
