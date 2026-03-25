import { apiClient } from "../client";
import {
  InventoryReport,
  InventoryFilters,
  InventoryActionData,
} from "../../types/inventory.types";

export const inventoryApi = {
  getReports: async (filters?: InventoryFilters) => {
    console.log("📊 Запрос списка отчетов инвентаризации", filters);
    try {
      const response = await apiClient.get("/inventory/report", {
        params: filters,
      });
      console.log("📦 Полученные данные:", response.data);
      return response.data as InventoryReport[];
    } catch (error: any) {
      console.error("❌ Ошибка получения отчетов:", error);
      throw error;
    }
  },

  getReportById: async (reportId: string) => {
    console.log(`📊 Запрос отчета ${reportId}`);
    try {
      const response = await apiClient.get(`/inventory/report/${reportId}`);
      console.log("✅ Ответ от сервера:", response);
      console.log("✅ Данные отчета:", response.data);
      return response.data as InventoryReport;
    } catch (error: any) {
      console.error(`❌ Ошибка получения отчета ${reportId}:`, error);
      if (error.response) {
        console.error("Статус:", error.response.status);
        console.error("Данные ошибки:", error.response.data);
      }
      throw error;
    }
  },

  confirmCorrectItem: async (data: InventoryActionData) => {
    console.log("✅ Подтверждение товара:", data);
    try {
      const response = await apiClient.post("/inventory/confirm", data);
      return response.data;
    } catch (error: any) {
      console.error("❌ Ошибка подтверждения товара:", error);
      throw error;
    }
  },

  reportMissingItem: async (data: InventoryActionData) => {
    console.log("❌ Сообщение о пропаже:", data);
    try {
      const response = await apiClient.post("/inventory/missing", data);
      return response.data;
    } catch (error: any) {
      console.error("❌ Ошибка сообщения о пропаже:", error);
      throw error;
    }
  },

  moveItemToCorrectRoom: async (data: InventoryActionData) => {
    console.log("↺ Перемещение товара:", data);
    try {
      const response = await apiClient.post("/inventory/move", data);
      return response.data;
    } catch (error: any) {
      console.error("❌ Ошибка перемещения товара:", error);
      throw error;
    }
  },

  exportReport: async (reportId: string, format: "pdf" | "excel" = "pdf") => {
    console.log(`📄 Экспорт отчета ${reportId} в ${format}`);
    try {
      const response = await apiClient.get(
        `/inventory/report/${reportId}/export`,
        {
          params: { format },
          responseType: "blob",
        },
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `inventory_report_${reportId}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      return response.data;
    } catch (error: any) {
      console.error("❌ Ошибка экспорта отчета:", error);
      throw error;
    }
  },
};
