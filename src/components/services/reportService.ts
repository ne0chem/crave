import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import {
  InventoryItem,
  isDisposal,
  ReportOptions,
} from "../../types/product.types";

class ReportService {
  generateReport(items: InventoryItem[], options: ReportOptions, filters: any) {
    switch (options.format) {
      case "excel":
        this.generateExcel(items, options, filters);
        break;
      case "word":
        this.generateWord(items, options, filters);
        break;
      default:
        console.warn("Формат не поддерживается");
    }
  }

  private generateExcel(
    items: InventoryItem[],
    options: ReportOptions,
    filters: any,
  ) {
    const data = items.map((item) => ({
      Наименование: item.name,
      Категория: item.inventory_tools_type,
      "Инв. номер": item.inv_number,
      Цена: item.price,
      Этаж: item.floor_number,
      Помещение: item.room_name || "Не указано",
      Статус: isDisposal(item) ? "Списано" : "Активен",
      "Дата создания": new Date(item.created_at).toLocaleDateString("ru-RU"),
      ...(isDisposal(item)
        ? {
            "Дата списания": new Date(item.deleted_at!).toLocaleDateString(
              "ru-RU",
            ),
            Причина: item.reason || "",
            "Кто списал": item.written_off_by || "",
          }
        : {}),
    }));

    const ws = XLSX.utils.json_to_sheet(data);

    if (options.showFilters) {
      const filterInfo = [
        ["Фильтры:"],
        ["Поиск:", filters.searchQuery || "Не задан"],
        ["Секция:", filters.selectedSection || "Все"],
        ["Цена от:", filters.priceFrom || "Не задано"],
        ["Цена до:", filters.priceTo || "Не задано"],
        ["Категория:", filters.selectedFilters?.category || "Все"],
        ["Помещение:", filters.selectedFilters?.room || "Все"],
        [],
        ["Итого:", `${items.length} товаров`],
        [
          "Общая сумма:",
          `${items.reduce((sum, item) => sum + item.price, 0)} ₽`,
        ],
      ];

      XLSX.utils.sheet_add_aoa(ws, filterInfo, { origin: -1 });
    }

    if (options.showDate) {
      XLSX.utils.sheet_add_aoa(
        ws,
        [[], [`Отчет сформирован: ${new Date().toLocaleString("ru-RU")}`]],
        { origin: -1 },
      );
    }

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Товары");

    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const dataBlob = new Blob([excelBuffer], {
      type: "application/octet-stream",
    });

    const fileName = `отчет_${options.type === "active" ? "активные" : "списанные"}_${new Date().toISOString().slice(0, 10)}.xlsx`;
    saveAs(dataBlob, fileName);
  }

  generateWordHTML(
    items: InventoryItem[],
    options: ReportOptions,
    filters: any,
  ): string {
    let htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>${options.title || "Отчет по товарам"}</title>
        <style>
          body { font-family: 'Times New Roman', serif; margin: 30px; }
          h1 { color: #333; border-bottom: 2px solid #0066cc; padding-bottom: 10px; }
          table { border-collapse: collapse; width: 100%; margin-top: 20px; }
          th { background-color: #f2f2f2; font-weight: bold; text-align: left; padding: 10px; border: 1px solid #ddd; }
          td { padding: 8px; border: 1px solid #ddd; }
          tr:hover { background-color: #f9f9f9; }
          .written-off { background-color: #fff0f0; }
          .summary { margin-top: 20px; font-size: 16px; }
          .filter-info { background: #f8f9fa; padding: 15px; border-left: 4px solid #0066cc; margin-bottom: 20px; }
        </style>
      </head>
      <body>
        <h1>${options.title || "Отчет по товарам"}</h1>
        
        ${options.showDate ? `<p>Дата формирования: ${new Date().toLocaleString("ru-RU")}</p>` : ""}
    `;

    if (options.showFilters) {
      htmlContent += `
        <div class="filter-info">
          <h3>Примененные фильтры:</h3>
          <p><strong>Поиск:</strong> ${filters.searchQuery || "Не задан"}</p>
          <p><strong>Секция:</strong> ${filters.selectedSection || "Все"}</p>
          <p><strong>Цена:</strong> от ${filters.priceFrom || "не указано"} до ${filters.priceTo || "не указано"}</p>
          <p><strong>Категория:</strong> ${filters.selectedFilters?.category || "Все"}</p>
          <p><strong>Помещение:</strong> ${filters.selectedFilters?.room || "Все"}</p>
        </div>
      `;
    }

    htmlContent += `
      <table>
        <thead>
          <tr>
            <th>№</th>
            <th>Наименование</th>
            <th>Категория</th>
            <th>Инв. номер</th>
            <th>Цена</th>
            <th>Помещение</th>
            <th>Статус</th>
            ${items.some((item) => isDisposal(item)) ? "<th>Дата списания</th><th>Причина</th>" : ""}
          </tr>
        </thead>
        <tbody>
    `;

    items.forEach((item, index) => {
      const isDisposed = isDisposal(item);
      htmlContent += `
        <tr class="${isDisposed ? "written-off" : ""}">
          <td>${index + 1}</td>
          <td>${item.name}</td>
          <td>${item.inventory_tools_type}</td>
          <td>${item.inv_number}</td>
          <td>${item.price} ₽</td>
          <td>${item.room_name || "Не указано"}</td>
          <td>${isDisposed ? "Списано" : "Активен"}</td>
          ${
            isDisposed
              ? `<td>${new Date(item.deleted_at!).toLocaleDateString("ru-RU")}</td>
          <td>${item.reason || ""}</td>`
              : ""
          }
        </tr>
      `;
    });

    const totalSum = items.reduce((sum, item) => sum + item.price, 0);
    htmlContent += `
        </tbody>
      </table>
      <div class="summary">
        <p><strong>Всего товаров:</strong> ${items.length}</p>
        <p><strong>Общая сумма:</strong> ${totalSum.toLocaleString()} ₽</p>
      </div>
      </body>
      </html>
    `;

    return htmlContent;
  }

  downloadWordFromHTML(htmlContent: string, options: ReportOptions) {
    const blob = new Blob([htmlContent], { type: "application/msword" });
    const fileName = `отчет_${options.type === "active" ? "активные" : "списанные"}_${new Date().toISOString().slice(0, 10)}.doc`;
    saveAs(blob, fileName);
  }

  private generateWord(
    items: InventoryItem[],
    options: ReportOptions,
    filters: any,
  ) {
    const htmlContent = this.generateWordHTML(items, options, filters);
    this.downloadWordFromHTML(htmlContent, options);
  }
}

export const reportService = new ReportService();
