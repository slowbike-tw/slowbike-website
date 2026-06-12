"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { seedLogisticsOrders } from "@/data/logistics-orders";
import { generateOrderNumber, normalizeLogisticsOrder, STORE_KEY } from "@/lib/logistics";
import type { LogisticsOrder, LogisticsOrderInput } from "@/types/logistics";

type LogisticsContextValue = {
  orders: LogisticsOrder[];
  ready: boolean;
  addOrder: (input: LogisticsOrderInput) => LogisticsOrder;
  updateOrder: (id: string, input: LogisticsOrderInput) => void;
  getOrder: (id: string) => LogisticsOrder | undefined;
  resetDemoData: () => void;
};

const LogisticsContext = createContext<LogisticsContextValue | null>(null);

export function LogisticsProvider({ children }: { children: React.ReactNode }) {
  const [orders, setOrders] = useState<LogisticsOrder[]>(seedLogisticsOrders);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORE_KEY);
    if (stored) {
      try {
        const normalized = (JSON.parse(stored) as LogisticsOrder[]).map(normalizeLogisticsOrder);
        const storedIds = new Set(normalized.map((order) => order.id));
        const missingSeedOrders = seedLogisticsOrders.filter((order) => !storedIds.has(order.id));
        setOrders([...normalized, ...missingSeedOrders]);
      } catch {
        window.localStorage.removeItem(STORE_KEY);
      }
    } else {
      setOrders(seedLogisticsOrders.map(normalizeLogisticsOrder));
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) window.localStorage.setItem(STORE_KEY, JSON.stringify(orders));
  }, [orders, ready]);

  const addOrder = useCallback(
    (input: LogisticsOrderInput) => {
      const timestamp = new Date().toISOString();
      const order: LogisticsOrder = {
        ...input,
        id: crypto.randomUUID(),
        orderNumber: generateOrderNumber(orders),
        createdAt: timestamp,
        updatedAt: timestamp,
        progress: [],
      };
      setOrders((current) => [order, ...current]);
      return order;
    },
    [orders],
  );

  const updateOrder = useCallback((id: string, input: LogisticsOrderInput) => {
    setOrders((current) =>
      current.map((order) =>
        order.id === id ? { ...order, ...input, updatedAt: new Date().toISOString() } : order,
      ),
    );
  }, []);

  const getOrder = useCallback((id: string) => orders.find((order) => order.id === id), [orders]);
  const resetDemoData = useCallback(
    () => setOrders(seedLogisticsOrders.map(normalizeLogisticsOrder)),
    [],
  );

  const value = useMemo(
    () => ({ orders, ready, addOrder, updateOrder, getOrder, resetDemoData }),
    [orders, ready, addOrder, updateOrder, getOrder, resetDemoData],
  );

  return <LogisticsContext.Provider value={value}>{children}</LogisticsContext.Provider>;
}

export function useLogistics() {
  const context = useContext(LogisticsContext);
  if (!context) throw new Error("useLogistics must be used inside LogisticsProvider");
  return context;
}
