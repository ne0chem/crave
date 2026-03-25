// api/products/products.ts
import { apiClient } from "../client";
import {
  CreateProductData,
  UpdateProductData,
  WriteoffData,
  ProductFilters,
} from "../../types/product.types";

export const productsApi = {
  getProducts: async (filters?: ProductFilters) => {
    try {
      const response = await apiClient.get("/inventory_tools/list", {
        params: filters,
      });
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new Error("Не авторизован");
      }
      throw error;
    }
  },

  createProduct: async (productData: CreateProductData) => {
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
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new Error("Не авторизован");
      }
      throw error;
    }
  },

  updateProduct: async ({ id, ...data }: UpdateProductData) => {
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

      const response = await apiClient.put(`/inventory_tool/${id}`, payload);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new Error("Не авторизован");
      }
      throw error;
    }
  },

  writeoffProduct: async (data: WriteoffData) => {
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

      return {
        success: true,
        productId: data.productId,
        message: "Товар успешно списан",
      };
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new Error("Не авторизован");
      }
      throw error;
    }
  },

  getWrittenOffProducts: async (
    building?: string,
    filters?: ProductFilters,
  ) => {
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

      if (data && data.inventory_tools && Array.isArray(data.inventory_tools)) {
        data = data.inventory_tools;
      } else if (
        Array.isArray(data) &&
        data.length === 1 &&
        Array.isArray(data[0])
      ) {
        data = data[0];
      } else if (!Array.isArray(data)) {
        data = [];
      }

      return data || [];
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new Error("Не авторизован");
      }
      throw error;
    }
  },

  getAllWrittenOffProducts: async (filters?: ProductFilters) => {
    try {
      const buildings = ["theatre", "warehouse1", "warehouse2"];
      const results = await Promise.all(
        buildings.map((building) =>
          productsApi.getWrittenOffProducts(building, filters),
        ),
      );

      return results.flat();
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new Error("Не авторизован");
      }
      throw error;
    }
  },
};
