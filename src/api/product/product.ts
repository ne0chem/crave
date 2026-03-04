import { apiClient } from "../client";
import {
  Product,
  ProductFilters,
  CreateProductData,
  UpdateProductData,
  WriteoffData,
} from "../../types/product.types";

console.log("📁 Products API модуль загружен");

export const productsApi = {
  // ============= ТОВАРЫ =============

  // Получение списка товаров
  getProducts: async (filters?: ProductFilters) => {
    console.log("📦 Запрос списка товаров");

    try {
      const response = await apiClient.get("/inventory_tools_type", {
        params: filters,
      });

      console.log("✅ Товары получены:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("❌ Ошибка:", error);
      throw error;
    }
  },

  // Создание товара
  createProduct: async (productData: CreateProductData) => {
    console.log("➕ Создание товара:", productData);

    try {
      const response = await apiClient.post(
        "/inventory_tools_type",
        productData,
      );
      console.log("✅ Товар создан:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("❌ Ошибка:", error);
      throw error;
    }
  },

  // Обновление товара
  updateProduct: async ({ id, ...data }: UpdateProductData) => {
    console.log(`✏️ Обновление товара ${id}:`, data);

    try {
      const response = await apiClient.put(`/inventory_tools_type/${id}`, data);
      console.log(`✅ Товар обновлен:`, response.data);
      return response.data;
    } catch (error: any) {
      console.error(`❌ Ошибка:`, error);
      throw error;
    }
  },

  // ============= СПИСАНИЕ =============

  // Списание товара (отдельный запрос)
  // 1. Функция списания товара
  writeoffProduct: async (data: WriteoffData) => {
    console.log(`📝 Списание товара ${data.productId}:`, data);

    try {
      // Ищем товар в inventory_tools_type
      const productResponse = await apiClient.get(
        `/inventory_tools_type/${data.productId}`,
      );
      const product = productResponse.data;

      // Создаем запись о списании
      const writeoffData = {
        ...product,
        written_off_by: data.person,
        reason: data.reason,
        deleted_at: data.date || new Date().toISOString(),
        // Убираем roomInfo при списании
        roomInfo: undefined,
      };

      // Отправляем в written_off_inventory
      const response = await apiClient.post(
        `/written_off_inventory`,
        writeoffData,
      );

      // Удаляем из активного инвентаря (опционально)
      // await apiClient.del(`/inventory_tools_type/${data.productId}`);

      console.log(`✅ Товар списан:`, response.data);
      return response.data;
    } catch (error: any) {
      console.error(`❌ Ошибка списания:`, error);
      throw error;
    }
  },

  // 2. Получение списанных товаров
  getWrittenOffProducts: async (filters?: any) => {
    console.log("📦 Запрос списанных товаров");

    try {
      const response = await apiClient.get("/written_off_inventory", {
        params: filters,
      });

      // Если данные приходят как массив в массиве, распрямляем
      let data = response.data;
      if (Array.isArray(data) && data.length === 1 && Array.isArray(data[0])) {
        data = data[0]; // Берем внутренний массив
      }

      console.log("✅ Списанные товары получены:", data);
      return data;
    } catch (error: any) {
      console.error("❌ Ошибка:", error);
      throw error;
    }
  },

  // 3. Восстановление товара (отмена списания)
  restoreProduct: async (productId: string) => {
    console.log(`🔄 Восстановление товара ${productId}`);

    try {
      // Ищем в списанных
      const writtenOff = await apiClient.get(
        `/written_off_inventory/${productId}`,
      );

      // Возвращаем в активный инвентарь (убираем поля списания)
      const restoreData = { ...writtenOff.data };
      delete restoreData.written_off_by;
      delete restoreData.reason;
      delete restoreData.deleted_at;

      await apiClient.post(`/inventory_tools_type`, restoreData);

      // Удаляем из списанных
      await apiClient.delete(`/written_off_inventory/${productId}`);

      console.log(`✅ Товар восстановлен`);
      return { success: true };
    } catch (error: any) {
      console.error(`❌ Ошибка восстановления:`, error);
      throw error;
    }
  },

  // ============= РЕДАКТИРОВАНИЕ И ДОБАВЛЕНИЕ (второй запрос) =============

  // Универсальный метод для создания/обновления
  saveProduct: async (data: CreateProductData | UpdateProductData) => {
    // Если есть id - это обновление, если нет - создание
    if ("id" in data && data.id) {
      console.log(`✏️ Сохранение (обновление) товара ${data.id}:`, data);
      return await productsApi.updateProduct(data as UpdateProductData);
    } else {
      console.log("➕ Сохранение (создание) товара:", data);
      return await productsApi.createProduct(data as CreateProductData);
    }
  },
};
