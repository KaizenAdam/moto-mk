"use client";

import { createContext, useContext, useMemo, useState } from "react";

type Currency = "EUR" | "MKD";

const EUR_TO_MKD = 61.5;

interface CurrencyContextValue {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  format: (eur: number) => string;
}

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrency] = useState<Currency>("EUR");

  const value = useMemo<CurrencyContextValue>(() => {
    const format = (eur: number) => {
      if (currency === "MKD") {
        const mkd = Math.round(eur * EUR_TO_MKD);
        return `${mkd.toLocaleString("en-US")} ден`;
      }
      return `€${eur.toLocaleString("en-US")}`;
    };
    return { currency, setCurrency, format };
  }, [currency]);

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency must be used within CurrencyProvider");
  return ctx;
}
