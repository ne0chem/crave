import * as XLSX from "xlsx";
import {
  formatPrice,
  getReportStats,
  calculateTotalPrice,
} from "./reportUtils";
import {
  InventoryReport,
  InventoryRoom,
  InventoryItem,
} from "../types/inventory.types";

const getRoomSection = (room: InventoryRoom | undefined): string => {
  if (!room) return "";
  return (room as any).room_section || room.section || "";
};

export const generateExcel = (report: InventoryReport) => {
  const worksheetData: any[] = [];
  const stats = getReportStats(report);

  worksheetData.push(["ОТЧЕТ ИНВЕНТАРИЗАЦИИ"]);
  worksheetData.push(["Дата:", new Date(report.date).toLocaleString("ru-RU")]);
  worksheetData.push([]);

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

  report.rooms?.forEach((room: InventoryRoom) => {
    const roomTitle = room.room_name
      ? `${room.room_name} (ком. ${room.room_number})`
      : `Комната ${room.room_number}`;
    const roomSection = getRoomSection(room);

    worksheetData.push([`ПОМЕЩЕНИЕ: ${roomTitle}`]);
    if (roomSection) {
      worksheetData.push(["Секция:", roomSection]);
    }
    worksheetData.push([]);

    const correctItems = room["correct-item"] || [];
    const missingItems = room["missing-item"] || [];
    const wrongItems = room["wrong-room-item"] || [];

    if (correctItems.length > 0) {
      worksheetData.push(["НАЙДЕННЫЕ МЦ"]);
      worksheetData.push([
        "Наименование",
        "Помещение",
        "Секция",
        "Инв. номер",
        "Категория",
        "Стоимость",
      ]);

      correctItems.forEach((item: InventoryItem) => {
        worksheetData.push([
          item.name,
          `${room.room_name} (${room.room_number})`,
          roomSection || "—",
          item.inv_number || "—",
          item.inventory_tools_type || "Без категории",
          item.price || 0,
        ]);
      });

      const totalCorrectPrice = calculateTotalPrice(correctItems);
      worksheetData.push(["ИТОГО:", "", "", "", "", totalCorrectPrice]);
      worksheetData.push([]);
    }

    if (missingItems.length > 0) {
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

      missingItems.forEach((item: InventoryItem) => {
        worksheetData.push([
          item.name,
          `${room.room_name} (${room.room_number})`,
          roomSection || "—",
          item.inv_number || "—",
          item.inventory_tools_type || "Без категории",
          item.price || 0,
          item.expected_room || "—",
        ]);
      });

      const totalMissingPrice = calculateTotalPrice(missingItems);
      worksheetData.push(["ИТОГО:", "", "", "", "", totalMissingPrice, ""]);
      worksheetData.push([]);
    }

    if (wrongItems.length > 0) {
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

      wrongItems.forEach((item: InventoryItem) => {
        worksheetData.push([
          item.name,
          `${room.room_number}`,
          roomSection || "—",
          item.inv_number || "—",
          item.inventory_tools_type || "Без категории",
          item.price || 0,
          item.expected_room || item.room_name || "другая комната",
        ]);
      });

      const totalWrongPrice = calculateTotalPrice(wrongItems);
      worksheetData.push(["ИТОГО:", "", "", "", "", totalWrongPrice, ""]);
      worksheetData.push([]);
    }

    worksheetData.push([]);
  });

  const ws = XLSX.utils.aoa_to_sheet(worksheetData);

  ws["!cols"] = [
    { wch: 40 },
    { wch: 25 },
    { wch: 15 },
    { wch: 18 },
    { wch: 20 },
    { wch: 15 },
    { wch: 25 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Инвентаризация");

  const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  return new Blob([excelBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
};
