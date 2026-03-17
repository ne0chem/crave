// src/utils/excelGenerator.ts

import * as XLSX from "xlsx";
import { formatPrice, getReportStats } from "./reportUtils";
import { InventoryReport, InventoryRoom } from "../types/inventory.types";

// Функция для применения стилей к ячейкам
const applyCellStyles = (ws: XLSX.WorkSheet) => {
  const range = XLSX.utils.decode_range(ws["!ref"] || "A1:A1");

  for (let R = range.s.r; R <= range.e.r; ++R) {
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cellRef = XLSX.utils.encode_cell({ r: R, c: C });
      if (!ws[cellRef]) continue;

      // Стили по умолчанию
      ws[cellRef].s = {
        font: { name: "Arial", sz: 11 },
        alignment: { vertical: "center", horizontal: "left" },
        border: {
          top: { style: "thin", color: { rgb: "E0E0E0" } },
          bottom: { style: "thin", color: { rgb: "E0E0E0" } },
          left: { style: "thin", color: { rgb: "E0E0E0" } },
          right: { style: "thin", color: { rgb: "E0E0E0" } },
        },
      };

      // Заголовки секций (жирный, серый фон)
      if (
        ws[cellRef].v &&
        typeof ws[cellRef].v === "string" &&
        (ws[cellRef].v.includes("ОТЧЕТ") ||
          ws[cellRef].v.includes("СВОДКА") ||
          ws[cellRef].v.includes("ПОМЕЩЕНИЕ"))
      ) {
        ws[cellRef].s = {
          ...ws[cellRef].s,
          font: { ...ws[cellRef].s?.font, bold: true, sz: 12 },
          fill: { fgColor: { rgb: "B6B4B4" } },
        };
      }

      // Заголовки таблиц (жирный)
      if (R === 5 && C < 7) {
        // Строка с заголовками сводки
        ws[cellRef].s = {
          ...ws[cellRef].s,
          font: { ...ws[cellRef].s?.font, bold: true },
          fill: { fgColor: { rgb: "FAFAFA" } },
        };
      }

      // Числовые значения (цены)
      if (
        typeof ws[cellRef].v === "number" ||
        (typeof ws[cellRef].v === "string" && ws[cellRef].v.includes("₽"))
      ) {
        ws[cellRef].s = {
          ...ws[cellRef].s,
          font: { ...ws[cellRef].s?.font, color: { rgb: "999EA3" } },
          alignment: { ...ws[cellRef].s?.alignment, horizontal: "right" },
        };
      }

      // Статусы (цветные)
      if (ws[cellRef].v === "Найдено" || ws[cellRef].v === "НАЙДЕННЫЕ МЦ") {
        ws[cellRef].s = {
          ...ws[cellRef].s,
          font: {
            ...ws[cellRef].s?.font,
            color: { rgb: "4CAF50" },
            bold: true,
          },
        };
      }
      if (
        ws[cellRef].v === "Отсутствует" ||
        ws[cellRef].v === "ОТСУТСТВУЮЩИЕ МЦ"
      ) {
        ws[cellRef].s = {
          ...ws[cellRef].s,
          font: {
            ...ws[cellRef].s?.font,
            color: { rgb: "F44336" },
            bold: true,
          },
        };
      }
      if (
        ws[cellRef].v === "Не на месте" ||
        ws[cellRef].v === "МЦ НЕ НА МЕСТЕ"
      ) {
        ws[cellRef].s = {
          ...ws[cellRef].s,
          font: {
            ...ws[cellRef].s?.font,
            color: { rgb: "FF9800" },
            bold: true,
          },
        };
      }

      // Инвентарные номера (моноширинный)
      if (
        ws[cellRef].v &&
        typeof ws[cellRef].v === "string" &&
        ws[cellRef].v.length > 5 &&
        ws[cellRef].v.match(/^[0-9-]+$/)
      ) {
        ws[cellRef].s = {
          ...ws[cellRef].s,
          font: { ...ws[cellRef].s?.font, name: "Courier New" },
        };
      }
    }
  }
};

export const generateExcel = (report: InventoryReport) => {
  const worksheetData: any[] = [];
  const stats = getReportStats(report);

  // Заголовок
  worksheetData.push(["ОТЧЕТ ИНВЕНТАРИЗАЦИИ"]);
  worksheetData.push(["Дата:", new Date(report.date).toLocaleString("ru-RU")]);
  worksheetData.push([]);

  // Итоги
  worksheetData.push(["СВОДКА"]);
  worksheetData.push(["Статус", "Количество", "Сумма"]);
  worksheetData.push([
    "Найдено",
    stats.totalCorrect,
    formatPrice(stats.totalCorrectPrice),
  ]);
  worksheetData.push([
    "Отсутствует",
    stats.totalMissing,
    formatPrice(stats.totalMissingPrice),
  ]);
  worksheetData.push([
    "Не на месте",
    stats.totalWrong,
    formatPrice(stats.totalWrongPrice),
  ]);
  worksheetData.push([
    "ВСЕГО",
    stats.totalCorrect + stats.totalMissing + stats.totalWrong,
    formatPrice(
      stats.totalCorrectPrice + stats.totalMissingPrice + stats.totalWrongPrice,
    ),
  ]);
  worksheetData.push([]);
  worksheetData.push([]);

  // Детальный отчет по комнатам
  report.rooms?.forEach((room: InventoryRoom) => {
    const roomTitle = room.room_name
      ? `${room.room_name} (ком. ${room.room_number})`
      : `Комната ${room.room_number}`;

    worksheetData.push([`ПОМЕЩЕНИЕ: ${roomTitle}`]);
    if (room.section) {
      worksheetData.push(["Секция:", room.section]);
    }
    worksheetData.push([]);

    // Найденные МЦ
    if (room["correct-item"]?.length > 0) {
      worksheetData.push(["НАЙДЕННЫЕ МЦ"]);
      worksheetData.push([
        "Наименование",
        "Помещение",
        "Секция",
        "Инв. номер",
        "Категория",
        "Стоимость",
      ]);

      room["correct-item"].forEach((item: any) => {
        worksheetData.push([
          item.name,
          `${room.room_name} (${room.room_number})`,
          room.section || "—",
          item.inv_number || "—",
          item.inventory_tools_type || "Без категории",
          item.price || 0,
        ]);
      });

      // Итог по найденным
      const totalCorrectPrice = room["correct-item"].reduce(
        (sum, item) => sum + (item.price || 0),
        0,
      );
      worksheetData.push(["ИТОГО:", "", "", "", "", totalCorrectPrice]);
      worksheetData.push([]);
    }

    // Отсутствующие МЦ
    if (room["missing-item"]?.length > 0) {
      worksheetData.push(["ОТСУТСТВУЮЩИЕ МЦ"]);
      worksheetData.push([
        "Наименование",
        "Помещение",
        "Секция",
        "Инв. номер",
        "Категория",
        "Стоимость",
        "Ожидался в",
      ]);

      room["missing-item"].forEach((item: any) => {
        worksheetData.push([
          item.name,
          `${room.room_name} (${room.room_number})`,
          room.section || "—",
          item.inv_number || "—",
          item.inventory_tools_type || "Без категории",
          item.price || 0,
          item.expected_room || "—",
        ]);
      });

      // Итог по отсутствующим
      const totalMissingPrice = room["missing-item"].reduce(
        (sum, item) => sum + (item.price || 0),
        0,
      );
      worksheetData.push(["ИТОГО:", "", "", "", "", totalMissingPrice, ""]);
      worksheetData.push([]);
    }

    // МЦ не на месте
    if (room["wrong-room-item"]?.length > 0) {
      worksheetData.push(["МЦ НЕ НА МЕСТЕ"]);
      worksheetData.push([
        "Наименование",
        "Текущее помещение",
        "Секция",
        "Инв. номер",
        "Категория",
        "Стоимость",
        "Должен быть в",
      ]);

      room["wrong-room-item"].forEach((item: any) => {
        worksheetData.push([
          item.name,
          `${room.room_name} (${room.room_number})`,
          room.section || "—",
          item.inv_number || "—",
          item.inventory_tools_type || "Без категории",
          item.price || 0,
          item.expectedRoom || item.room_name || "другая комната",
        ]);
      });

      // Итог по не на месте
      const totalWrongPrice = room["wrong-room-item"].reduce(
        (sum, item) => sum + (item.price || 0),
        0,
      );
      worksheetData.push(["ИТОГО:", "", "", "", "", totalWrongPrice, ""]);
      worksheetData.push([]);
    }

    worksheetData.push([]);
  });

  // Создаем лист
  const ws = XLSX.utils.aoa_to_sheet(worksheetData);

  // Настройка ширины колонок
  ws["!cols"] = [
    { wch: 40 }, // Наименование
    { wch: 25 }, // Помещение
    { wch: 15 }, // Секция
    { wch: 18 }, // Инв. номер
    { wch: 20 }, // Категория
    { wch: 15 }, // Стоимость
    { wch: 25 }, // Доп. поле
  ];

  // Применяем стили
  applyCellStyles(ws);

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Инвентаризация");

  const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  return new Blob([excelBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
};
