"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { seedLogisticsOrders } from "@/data/logistics-orders";
import {
  deleteLogisticsOrder,
  fetchLogisticsOrders,
  insertLogisticsOrder,
  isSupabaseConfigured,
  updateLogisticsOrder,
} from "@/lib/logistics-repository";
import { generateOrderNumber, normalizeLogisticsOrder, STORE_KEY } from "@/lib/logistics";
import type { LogisticsOrder, LogisticsOrderInput } from "@/types/logistics";

type LogisticsContextValue = {
  orders: LogisticsOrder[];
  ready: boolean;
  addOrder: (input: LogisticsOrderInput) => Promise<LogisticsOrder>;
  updateOrder: (id: string, input: LogisticsOrderInput) => Promise<void>;
  deleteOrder: (id: string) => Promise<void>;
  getOrder: (id: string) => LogisticsOrder | undefined;
  resetDemoData: () => void;
};

const LogisticsContext = createContext<LogisticsContextValue | null>(null);

function getLocalOrders() {
  const stored = window.localStorage.getItem(STORE_KEY);
  if (!stored) return seedLogisticsOrders.map(normalizeLogisticsOrder);

  try {
    const normalized = (JSON.parse(stored) as LogisticsOrder[]).map(normalizeLogisticsOrder);
    const storedIds = new Set(normalized.map((order) => order.id));
    const missingSeedOrders = seedLogisticsOrders.filter((order) => !storedIds.has(order.id));
    return [...normalized, ...missingSeedOrders];
  } catch {
    window.localStorage.removeItem(STORE_KEY);
    return seedLogisticsOrders.map(normalizeLogisticsOrder);
  }
}

export function LogisticsProvider({ children }: { children: React.ReactNode }) {
  const [orders, setOrders] = useState<LogisticsOrder[]>(seedLogisticsOrders);
  const [ready, setReady] = useState(false);

  const refreshCloudOrders = useCallback(async () => {
    if (!isSupabaseConfigured) return false;
    try {
      const cloudOrders = await fetchLogisticsOrders();
      setOrders(cloudOrders);
      return true;
    } catch (error) {
      console.warn("Supabase logistics sync failed; using local cache.", error);
      return false;
    }
  }, []);

  useEffect(() => {
    let active = true;

    async function loadOrders() {
      const localOrders = getLocalOrders();
      if (active) setOrders(localOrders);

      if (isSupabaseConfigured) {
        try {
          const cloudOrders = await fetchLogisticsOrders();
          if (active) setOrders(cloudOrders);
        } catch (error) {
          console.warn("Supabase logistics load failed; using local cache.", error);
        }
      }

      if (active) setReady(true);
    }

    void loadOrders();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (ready) window.localStorage.setItem(STORE_KEY, JSON.stringify(orders));
  }, [orders, ready]);

  useEffect(() => {
    if (!ready || !isSupabaseConfigured) return;

    const timer = window.setInterval(() => {
      void refreshCloudOrders();
    }, 15_000);
    const handleVisibility = () => {
      if (document.visibilityState === "visible") void refreshCloudOrders();
    };

    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [ready, refreshCloudOrders]);

  const addOrder = useCallback(
    async (input: LogisticsOrderInput) => {
      const timestamp = new Date().toISOString();
      const draft: LogisticsOrder = {
        ...input,
        id: crypto.randomUUID(),
        orderNumber: generateOrderNumber(orders),
        createdAt: timestamp,
        updatedAt: timestamp,
        progress: [],
      };

      let savedOrder = draft;
      if (isSupabaseConfigured) {
        try {
          savedOrder = await insertLogisticsOrder(draft);
        } catch (error) {
          console.warn("Supabase insert failed; order saved locally.", error);
        }
      }

      setOrders((current) => [savedOrder, ...current]);
      return savedOrder;
    },
    [orders],
  );

  const updateOrder = useCallback(
    async (id: string, input: LogisticsOrderInput) => {
      const currentOrder = orders.find((order) => order.id === id);
      if (!currentOrder) return;

      const draft: LogisticsOrder = {
        ...currentOrder,
        ...input,
        updatedAt: new Date().toISOString(),
      };

      let savedOrder = draft;
      if (isSupabaseConfigured) {
        try {
          savedOrder = await updateLogisticsOrder(draft);
        } catch (error) {
          console.warn("Supabase update failed; changes saved locally.", error);
        }
      }

      setOrders((current) =>
        current.map((order) => (order.id === id ? savedOrder : order)),
      );
    },
    [orders],
  );

  const getOrder = useCallback(
    (id: string) => orders.find((order) => order.id === id),
    [orders],
  );
  const deleteOrder = useCallback(async (id: string) => {
    if (isSupabaseConfigured) {
      await deleteLogisticsOrder(id);
    }
    setOrders((current) => current.filter((order) => order.id !== id));
  }, []);
  const resetDemoData = useCallback(
    () => setOrders(seedLogisticsOrders.map(normalizeLogisticsOrder)),
    [],
  );

  const value = useMemo(
    () => ({
      orders,
      ready,
      addOrder,
      updateOrder,
      deleteOrder,
      getOrder,
      resetDemoData,
    }),
    [orders, ready, addOrder, updateOrder, deleteOrder, getOrder, resetDemoData],
  );

  return <LogisticsContext.Provider value={value}>{children}</LogisticsContext.Provider>;
}

export function useLogistics() {
  const context = useContext(LogisticsContext);
  if (!context) throw new Error("useLogistics must be used inside LogisticsProvider");
  return context;
}
