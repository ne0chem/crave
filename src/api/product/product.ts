import { apiClient } from "../client";
import {
  CreateProductData,
  UpdateProductData,
  WriteoffData,
  ProductFilters,
} from "../../types/product.types";

console.log("📁 Products API модуль загружен");

export const productsApi = {
  getProducts: async (filters?: ProductFilters) => {
    console.log("📦 Запрос списка активных товаров с фильтрами:", filters);

    try {
      const response = await apiClient.get("/inventory_tools/list", {
        params: filters,
      });
      console.log("✅ Активные товары получены:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("❌ Ошибка получения товаров:", error);
      throw error;
    }
  },

  createProduct: async (productData: CreateProductData) => {
    console.log("➕ Создание товара:", productData);

    try {
      const payload = {
        name: productData.name,
        inventory_tools_type: productData.inventory_tools_type,
        description: productData.description || null,
        price: productData.price,
        inv_number: productData.inv_number,
        room_id: productData.roomInfo?.id,
        building: productData.building,
        floor_number: productData.floor_number,
        section: productData.section,
        rfid: productData.rfid || null,
        attributes: productData.attributes || null,
      };

      const response = await apiClient.post("/inventory_tool", payload);
      console.log("✅ Товар создан:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("❌ Ошибка создания товара:", error);
      throw error;
    }
  },

  updateProduct: async ({ id, ...data }: UpdateProductData) => {
    console.log(`✏️ Обновление товара ${id}:`, data);

    try {
      const payload = {
        name: data.name,
        inventory_tools_type: data.inventory_tools_type,
        description: data.description,
        price: data.price,
        inv_number: data.inv_number,
        room_id: data.room_id,
        building: data.building,
        floor_number: data.floor_number,
        section: data.section,
      };

      console.log("📤 Отправляем payload:", payload);

      const response = await apiClient.put(`/inventory_tool/${id}`, payload);
      console.log(`✅ Товар обновлен:`, response.data);
      return response.data;
    } catch (error: any) {
      console.error(`❌ Ошибка обновления товара:`, error);
      throw error;
    }
  },

  writeoffProduct: async (data: WriteoffData) => {
    console.log(`📝 Списание товара ${data.productId}:`, data);

    try {
      const response = await apiClient.delete(
        `/inventory_tools/${data.productId}`,
        {
          data: {
            description: data.reason,
            written_off_by: data.person,
          },
        },
      );

      console.log(`✅ Товар ID ${data.productId} списан`);

      return {
        success: true,
        productId: data.productId,
        message: "Товар успешно списан",
      };
    } catch (error: any) {
      console.error(`❌ Ошибка списания товара ${data.productId}:`, error);
      throw error;
    }
  },

  getWrittenOffProducts: async (
    building?: string,
    filters?: ProductFilters,
  ) => {
    console.log(`📦 Запрос списанных товаров для здания: ${building}`, filters);

    try {
      let url = "/inventory_tools/removed";
      const params: any = { ...filters };

      if (building) {
        params.building = building;
      }

      const response = await apiClient.get(url, {
        params: params,
      });

      let data = response.data;

      console.log("📦 Ответ от API списанных товаров:", data);

      if (data && data.inventory_tools && Array.isArray(data.inventory_tools)) {
        data = data.inventory_tools;
        console.log("🔄 Извлечен массив inventory_tools, размер:", data.length);
      } else if (
        Array.isArray(data) &&
        data.length === 1 &&
        Array.isArray(data[0])
      ) {
        data = data[0];
      } else if (!Array.isArray(data)) {
        console.warn("⚠️ Неожиданный формат данных:", data);
        data = [];
      }

      console.log(
        `✅ Списанные товары для ${building || "всех зданий"} получены:`,
        data?.length || 0,
        "шт.",
      );
      return data || [];
    } catch (error: any) {
      console.error("❌ Ошибка получения списанных товаров:", error);
      throw error;
    }
  },

  getAllWrittenOffProducts: async (filters?: ProductFilters) => {
    console.log("📦 Запрос списанных товаров для всех зданий");

    try {
      const buildings = ["theatre", "warehouse1", "warehouse2"];
      const results = await Promise.all(
        buildings.map((building) =>
          productsApi.getWrittenOffProducts(building, filters),
        ),
      );

      const allProducts = results.flat();
      console.log(
        `✅ Все списанные товары получены: ${allProducts.length} шт.`,
      );
      return allProducts;
    } catch (error: any) {
      console.error("❌ Ошибка получения всех списанных товаров:", error);
      throw error;
    }
  },
};
