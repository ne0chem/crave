// api/inventory.api.ts

import { apiClient } from "../client";
import {
  InventoryReport,
  InventoryFilters,
  InventoryActionData,
} from "../../types/inventory.types";

console.log("📁 Inventory API модуль загружен");

export const inventoryApi = {
  // Получение всех отчетов
  getReports: async (filters?: InventoryFilters) => {
    console.log("📊 Запрос списка отчетов инвентаризации");

    try {
      const response = await apiClient.get("/report__inventory");
      let data = response.data;

      console.log("📦 Полученные данные:", data);

      // Шаг 1: Проверяем, есть ли ключ report__inventory
      if (data && data.report__inventory) {
        console.log("✅ Нашли report__inventory");
        data = data.report__inventory;
      }

      // Шаг 2: Проверяем, что data - массив
      if (!Array.isArray(data)) {
        console.error("❌ Данные не являются массивом:", data);
        return [];
      }

      // Шаг 3: Извлекаем отчеты из неправильной структуры
      let reports: any[] = [];

      data.forEach((item: any) => {
        if (item.report_id) {
          // Это сам отчет
          reports.push(item);
        }

        // Проверяем, есть ли вложенные отчеты в wrong-room-item
        if (item["wrong-room-item"] && Array.isArray(item["wrong-room-item"])) {
          // Фильтруем только те, у которых есть report_id (это отчеты, а не товары)
          const nestedReports = item["wrong-room-item"].filter(
            (nested: any) => nested.report_id,
          );
          if (nestedReports.length > 0) {
            console.log(`📋 Нашли ${nestedReports.length} вложенных отчетов`);
            reports = [...reports, ...nestedReports];
          }
        }
      });

      // Шаг 4: Убираем дубликаты по report_id
      const uniqueReports = reports.filter(
        (report, index, self) =>
          index === self.findIndex((r) => r.report_id === report.report_id),
      );

      console.log(`✅ Итоговое количество отчетов: ${uniqueReports.length}`);

      // Применяем фильтры, если они есть
      let filteredReports = uniqueReports;
      if (filters) {
        if (filters.startDate) {
          filteredReports = filteredReports.filter(
            (r) => r.date >= filters.startDate!,
          );
        }
        if (filters.endDate) {
          filteredReports = filteredReports.filter(
            (r) => r.date <= filters.endDate!,
          );
        }
      }

      return filteredReports as InventoryReport[];
    } catch (error: any) {
      console.error("❌ Ошибка получения отчетов:", error);
      throw error;
    }
  },

  // Получение конкретного отчета по ID
  getReportById: async (reportId: string) => {
    console.log(`📊 Запрос отчета ${reportId}`);

    try {
      const reports = await inventoryApi.getReports();
      const report = reports.find((r) => r.report_id === reportId);

      if (!report) {
        throw new Error(`Отчет с ID ${reportId} не найден`);
      }

      console.log(`✅ Отчет ${reportId} получен:`, report);
      return report;
    } catch (error: any) {
      console.error(`❌ Ошибка получения отчета ${reportId}:`, error);
      throw error;
    }
  },

  // ============= ДЕЙСТВИЯ С ТОВАРАМИ В ИНВЕНТАРИЗАЦИИ =============

  // Подтверждение правильного товара
  confirmCorrectItem: async (data: InventoryActionData) => {
    console.log(`✅ Подтверждение товара ${data.itemId}:`, data);

    try {
      // Здесь будет ваш API эндпоинт для подтверждения
      // const response = await apiClient.post(`/inventory/confirm`, data);

      // Пока просто имитируем успешный ответ
      return {
        success: true,
        message: "Товар подтвержден",
        data,
      };
    } catch (error: any) {
      console.error(`❌ Ошибка подтверждения:`, error);
      throw error;
    }
  },

  // Оформление пропажи товара
  reportMissingItem: async (data: InventoryActionData) => {
    console.log(`⚠️ Оформление пропажи товара ${data.itemId}:`, data);

    try {
      // Здесь будет ваш API эндпоинт для оформления пропажи
      // const response = await apiClient.post(`/inventory/missing`, data);

      return {
        success: true,
        message: "Пропажа оформлена",
        data,
      };
    } catch (error: any) {
      console.error(`❌ Ошибка оформления пропажи:`, error);
      throw error;
    }
  },

  // Перемещение товара в правильную комнату
  moveItemToCorrectRoom: async (data: InventoryActionData) => {
    console.log(`↺ Перемещение товара ${data.itemId}:`, data);

    try {
      // Здесь будет ваш API эндпоинт для перемещения
      // const response = await apiClient.post(`/inventory/move`, data);

      return {
        success: true,
        message: "Товар перемещен",
        data,
      };
    } catch (error: any) {
      console.error(`❌ Ошибка перемещения:`, error);
      throw error;
    }
  },

  // ============= ЭКСПОРТ ОТЧЕТОВ =============

  // Экспорт отчета в PDF/Excel
  exportReport: async (reportId: string, format: "pdf" | "excel" = "pdf") => {
    console.log(`📥 Экспорт отчета ${reportId} в ${format}`);

    try {
      // Здесь будет ваш API эндпоинт для экспорта
      // const response = await apiClient.get(`/report__inventory/export/${reportId}`, {
      //   params: { format },
      //   responseType: 'blob'
      // });

      return {
        success: true,
        message: `Отчет экспортирован в ${format}`,
        // data: response.data
      };
    } catch (error: any) {
      console.error(`❌ Ошибка экспорта:`, error);
      throw error;
    }
  },
};
