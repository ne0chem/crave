import React, { createContext, useContext, useState, useCallback } from "react";
import { productsApi } from "../api/product/product";
import {
  Product,
  Disposal, // 👈 ИМПОРТИРУЕМ Disposal
  ProductFilters,
  CreateProductData,
  UpdateProductData,
  WriteoffData,
  InventoryItem, // 👈 Для объединенного типа
} from "../types/product.types";
import { useAuth } from "./DummyAuthContext";
import { useEffect } from "react";

console.log("📁 ProductsContext модуль загружен");

interface ProductsContextType {
  // Состояние
  products: Product[]; // Только активные
  writtenOffProducts: Disposal[]; // 👈 ИСПРАВЛЕНО: теперь Disposal[], а не Product[]
  selectedProduct: Product | null;
  totalProducts: number;
  currentPage: number;
  totalPages: number;
  isLoading: boolean;
  error: string | null;
  filters: ProductFilters;

  // Методы для работы с товарами
  fetchProducts: (filters?: ProductFilters) => Promise<void>;
  fetchWrittenOffProducts: (filters?: ProductFilters) => Promise<void>;
  createProduct: (data: CreateProductData) => Promise<Product>;
  updateProduct: (data: UpdateProductData) => Promise<Product>;
  writeoffProduct: (data: WriteoffData) => Promise<Disposal>; // 👈 ИСПРАВЛЕНО: возвращает Disposal
  setFilters: (filters: ProductFilters) => void;
  clearSelectedProduct: () => void;
  clearError: () => void;
}

const ProductsContext = createContext<ProductsContextType | undefined>(
  undefined,
);

export const ProductsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  // Состояние
  const [products, setProducts] = useState<Product[]>([]);
  const [writtenOffProducts, setWrittenOffProducts] = useState<Disposal[]>([]); // 👈 ИСПРАВЛЕНО
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [totalProducts, setTotalProducts] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ProductFilters>({});

  console.log("📊 ProductsContext состояние:", {
    productsCount: products.length,
    writtenOffCount: writtenOffProducts.length,
    isLoading,
    hasError: !!error,
    currentPage,
    totalPages,
    isAdmin,
  });

  // Получение списка активных товаров
  const fetchProducts = useCallback(
    async (newFilters?: ProductFilters) => {
      const currentFilters = {
        ...(newFilters || filters),
      };

      setIsLoading(true);
      setError(null);

      try {
        const productsData = await productsApi.getProducts(currentFilters);

        // 👇 ФИЛЬТРУЕМ: оставляем только без deleted_at
        const activeProducts = productsData.filter((p: any) => !p.deleted_at);

        console.log("✅ Активные товары загружены:", activeProducts.length);
        setProducts(activeProducts);
      } catch (error: any) {
        console.error("❌ Ошибка загрузки товаров:", error);
        setError(error.message || "Ошибка загрузки товаров");
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    },
    [filters],
  );

  // Получение списанных товаров
  const fetchWrittenOffProducts = useCallback(
    async (newFilters?: ProductFilters) => {
      const currentFilters = {
        ...(newFilters || filters),
      };

      setIsLoading(true);
      setError(null);

      try {
        const disposalsData =
          await productsApi.getWrittenOffProducts(currentFilters);

        // 👇 Преобразуем в Disposal[] и фильтруем
        const disposals: Disposal[] = disposalsData
          .map((item: any) => ({
            ...item,
            deleted_at: item.deleted_at || new Date().toISOString(), // гарантируем поле
          }))
          .filter((d: any) => d.deleted_at); // только с deleted_at

        console.log("✅ Списанные товары загружены:", disposals.length);
        setWrittenOffProducts(disposals);
      } catch (error: any) {
        console.error("❌ Ошибка загрузки списанных товаров:", error);
        setError(error.message || "Ошибка загрузки списанных товаров");
        setWrittenOffProducts([]);
      } finally {
        setIsLoading(false);
      }
    },
    [filters],
  );

  // Первоначальная загрузка
  useEffect(() => {
    console.log("🔄 ProductsProvider: загружаем товары");
    Promise.all([fetchProducts(), fetchWrittenOffProducts()]).catch((error) => {
      console.error("❌ Ошибка при начальной загрузке:", error);
    });
  }, []);

  // Создание товара (только для админов)
  const createProduct = useCallback(
    async (data: CreateProductData) => {
      console.log("➕ createProduct вызван с данными:", data);

      if (!isAdmin) {
        const error = "Только администраторы могут создавать товары";
        console.error("❌", error);
        setError(error);
        throw new Error(error);
      }

      setIsLoading(true);
      setError(null);

      try {
        const newProduct = await productsApi.createProduct(data);

        console.log("✅ Товар создан:", newProduct);

        // Обновляем список активных товаров
        await fetchProducts();

        return newProduct;
      } catch (error: any) {
        console.error("❌ Ошибка создания товара:", error);
        setError(error.message || "Ошибка создания товара");
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [isAdmin, fetchProducts],
  );

  // Обновление товара (только для админов)
  const updateProduct = useCallback(
    async (data: UpdateProductData) => {
      console.log(`✏️ updateProduct вызван для ID ${data.id}:`, data);

      if (!isAdmin) {
        const error = "Только администраторы могут обновлять товары";
        console.error("❌", error);
        setError(error);
        throw new Error(error);
      }

      setIsLoading(true);
      setError(null);

      try {
        const updatedProduct = await productsApi.updateProduct(data);

        console.log(`✅ Товар ID ${data.id} обновлен:`, updatedProduct);

        // Обновляем списки
        await fetchProducts();
        await fetchWrittenOffProducts();

        // Если это выбранный товар - обновляем его
        if (selectedProduct?.id === data.id) {
          setSelectedProduct(updatedProduct);
        }

        return updatedProduct;
      } catch (error: any) {
        console.error(`❌ Ошибка обновления товара ID ${data.id}:`, error);
        setError(error.message || "Ошибка обновления товара");
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [isAdmin, fetchProducts, fetchWrittenOffProducts, selectedProduct],
  );

  // Списание товара
  const writeoffProduct = useCallback(
    async (data: WriteoffData) => {
      console.log(`📝 writeoffProduct вызван для ID ${data.productId}:`, data);

      if (!isAdmin) {
        const error = "Только администраторы могут списывать товары";
        console.error("❌", error);
        setError(error);
        throw new Error(error);
      }

      setIsLoading(true);
      setError(null);

      try {
        const disposal = await productsApi.writeoffProduct(data);

        console.log(`✅ Товар ID ${data.productId} списан:`, disposal);

        // Обновляем оба списка
        await Promise.all([fetchProducts(), fetchWrittenOffProducts()]);

        return disposal;
      } catch (error: any) {
        console.error(`❌ Ошибка списания товара ID ${data.productId}:`, error);
        setError(error.message || "Ошибка списания товара");
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [isAdmin, fetchProducts, fetchWrittenOffProducts],
  );

  // Очистка выбранного товара
  const clearSelectedProduct = useCallback(() => {
    setSelectedProduct(null);
  }, []);

  // Очистка ошибки
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return (
    <ProductsContext.Provider
      value={{
        // Состояние
        products,
        writtenOffProducts,
        selectedProduct,
        totalProducts,
        currentPage,
        totalPages,
        isLoading,
        error,
        filters,

        // Методы
        fetchProducts,
        fetchWrittenOffProducts,
        createProduct,
        updateProduct,
        writeoffProduct,
        setFilters,
        clearSelectedProduct,
        clearError,
      }}
    >
      {children}
    </ProductsContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductsContext);
  if (!context) {
    throw new Error("useProducts must be used within ProductsProvider");
  }
  return context;
};
