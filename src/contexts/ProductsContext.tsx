import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
} from "react";
import { productsApi } from "../api/product/product";
import {
  Product,
  Disposal,
  ProductFilters,
  CreateProductData,
  UpdateProductData,
  WriteoffData,
} from "../types/product.types";
import { useAuth } from "./DummyAuthContext";
import { useEffect } from "react";
import { transformFloorsToProducts } from "../utils/transformProducts";

console.log("📁 ProductsContext модуль загружен");

interface ProductsContextType {
  products: Product[];
  writtenOffProducts: Disposal[];
  selectedProduct: Product | null;
  totalProducts: number;
  currentPage: number;
  totalPages: number;
  isLoading: boolean;
  error: string | null;
  filters: ProductFilters;
  selectedBuilding: string;

  fetchProducts: (filters?: ProductFilters) => Promise<void>;
  fetchWrittenOffProducts: (
    building?: string,
    filters?: ProductFilters,
  ) => Promise<void>;
  createProduct: (data: CreateProductData) => Promise<Product>;
  updateProduct: (data: UpdateProductData) => Promise<Product>;
  writeoffProduct: (data: WriteoffData) => Promise<any>;
  setFilters: (filters: ProductFilters) => void;
  setSelectedBuilding: (building: string) => void;
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

  const [products, setProducts] = useState<Product[]>([]);
  const [writtenOffProducts, setWrittenOffProducts] = useState<Disposal[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [totalProducts, setTotalProducts] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ProductFilters>({});
  const [selectedBuilding, setSelectedBuilding] = useState<string>("theatre");

  const isMounted = useRef(true);

  console.log("📊 ProductsContext состояние:", {
    productsCount: products.length,
    writtenOffCount: writtenOffProducts.length,
    isLoading,
    hasError: !!error,
    currentPage,
    totalPages,
    isAdmin,
    selectedBuilding,
  });

  const fetchProducts = useCallback(
    async (newFilters?: ProductFilters) => {
      const currentFilters = newFilters || filters;

      setIsLoading(true);
      setError(null);

      try {
        const response = await productsApi.getProducts(currentFilters);

        let activeProducts: Product[] = [];

        if (response && response.floors) {
          console.log("🔄 Трансформируем данные из формата floors");
          activeProducts = transformFloorsToProducts(response.floors);
        } else if (Array.isArray(response)) {
          activeProducts = response;
        } else {
          activeProducts = [];
        }

        activeProducts = activeProducts.filter((p: any) => !p.deleted_at);

        console.log("✅ Активные товары загружены:", activeProducts.length);
        setProducts(activeProducts);
        setTotalProducts(activeProducts.length);
      } catch (error: any) {
        console.error("❌ Ошибка загрузки товаров:", error);
        setError(error.message || "Ошибка загрузки товаров");
        setProducts([]);
        setTotalProducts(0);
      } finally {
        setIsLoading(false);
      }
    },
    [filters],
  );

  const fetchWrittenOffProducts = useCallback(
    async (building?: string, newFilters?: ProductFilters) => {
      const currentFilters = newFilters || filters;
      const currentBuilding = building || selectedBuilding;

      console.log(`📦 Запрос списанных товаров для здания: ${currentBuilding}`);

      setIsLoading(true);
      setError(null);

      try {
        const response = await productsApi.getWrittenOffProducts(
          currentBuilding,
          currentFilters,
        );

        let disposals: Disposal[] = [];

        if (Array.isArray(response)) {
          disposals = response.map((item: any) => ({
            id: item.id,
            name: item.name,
            inventory_tools_type: item.inventory_tools_type,
            description: item.description,
            inv_number: item.inv_number,
            price: item.price,
            floor_number: item.floor_number,
            rfid: item.rfid,
            attributes: item.attributes,
            created_at: item.created_at,
            updated_at: item.updated_at,
            room_id: item.room_id,
            room_number: item.room_number,
            room_name: item.room_name,
            building: item.building,
            section: item.section,
            deleted_at:
              item.deleted_at || item.removed_at || new Date().toISOString(),
            written_off_by: item.written_off_by,
            reason: item.reason,
          }));
        }

        console.log(
          `✅ Списанные товары для ${currentBuilding} загружены:`,
          disposals.length,
        );
        setWrittenOffProducts(disposals);
      } catch (error: any) {
        console.error("❌ Ошибка загрузки списанных товаров:", error);
        setError(error.message || "Ошибка загрузки списанных товаров");
        setWrittenOffProducts([]);
      } finally {
        setIsLoading(false);
      }
    },
    [filters, selectedBuilding],
  );

  useEffect(() => {
    console.log("🔄 ProductsProvider: загружаем товары");
    Promise.all([fetchProducts(), fetchWrittenOffProducts()]).catch((error) => {
      console.error("❌ Ошибка при начальной загрузке:", error);
    });
  }, []);

  useEffect(() => {
    if (selectedBuilding && isMounted.current) {
      console.log(
        `🔄 Здание изменено на: ${selectedBuilding}, обновляем списанные товары`,
      );
      fetchWrittenOffProducts(selectedBuilding);
    }
  }, [selectedBuilding, fetchWrittenOffProducts]);

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

        await fetchProducts();
        await fetchWrittenOffProducts();

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
        const result = await productsApi.writeoffProduct(data);
        console.log(`✅ Товар ID ${data.productId} списан`);

        await Promise.all([fetchProducts(), fetchWrittenOffProducts()]);

        return result;
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

  const clearSelectedProduct = useCallback(() => {
    setSelectedProduct(null);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return (
    <ProductsContext.Provider
      value={{
        products,
        writtenOffProducts,
        selectedProduct,
        totalProducts,
        currentPage,
        totalPages,
        isLoading,
        error,
        filters,
        selectedBuilding,

        fetchProducts,
        fetchWrittenOffProducts,
        createProduct,
        updateProduct,
        writeoffProduct,
        setFilters,
        setSelectedBuilding,
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
