"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Product } from "@/types/product";

type ProductSelectionContextValue = {
  color: string;
  setColor: (color: string) => void;
};

const ProductSelectionContext = createContext<ProductSelectionContextValue | null>(null);

export function ProductSelectionProvider({
  product,
  children,
}: {
  product: Product;
  children: ReactNode;
}) {
  const [color, setColor] = useState(product.colors[0]?.name ?? "");
  const value = useMemo(() => ({ color, setColor }), [color]);

  return (
    <ProductSelectionContext.Provider value={value}>
      {children}
    </ProductSelectionContext.Provider>
  );
}

export function useProductSelection() {
  const context = useContext(ProductSelectionContext);
  if (!context) {
    throw new Error("useProductSelection must be used within ProductSelectionProvider");
  }
  return context;
}
