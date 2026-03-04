import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
// import { AuthProvider } from "./contexts/AuthContext";
import { ProductsProvider } from "./contexts/ProductsContext";
import App from "./App";
import "./index.css";
import { DummyAuthProvider } from "./contexts/DummyAuthContext";

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
        {/* <AuthProvider> */}
        <DummyAuthProvider>
          {" "}
          {/* 👈 Оборачиваем, а не самозакрываем */}
          <ProductsProvider>
            <App />
          </ProductsProvider>
        </DummyAuthProvider>
        {/* </AuthProvider> */}
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>,
);
