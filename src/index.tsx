import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";

import { DummyAuthProvider } from "./contexts/DummyAuthContext";
import { ProductsProvider } from "./contexts/ProductsContext";
import { InventoryProvider } from "./contexts/InventoryContext";
import { RoomsProvider } from "./contexts/RoomsContext";
import App from "./App";
import "./index.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <DummyAuthProvider>
          <ProductsProvider>
            <InventoryProvider>
              <RoomsProvider>
                <App />
              </RoomsProvider>{" "}
              {/* 👈 Добавляем провайдер инвентаризации */}
            </InventoryProvider>
          </ProductsProvider>
        </DummyAuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>,
);
