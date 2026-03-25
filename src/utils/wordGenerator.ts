import {
  formatPrice,
  calculateTotalPrice,
  getReportStats,
} from "./reportUtils";
import {
  InventoryReport,
  InventoryRoom,
  InventoryItem,
} from "../types/inventory.types";

export const wordStyles = `
  .report {
    max-width: 1400px;
    margin: 0 auto;
    font-family: Arial, sans-serif;
  }
  
  .header {
    background: #f5f5f5;
    padding: 20px;
    border-radius: 8px;
    margin-bottom: 20px;
    border: 1px solid #e0e0e0;
  }
  
  .header p {
    margin: 5px 0;
    color: #333;
    font-size: 14px;
  }
  
  .stats {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 15px;
    margin-bottom: 25px;
  }
  
  .stat-card {
    background: #f5f5f5;
    padding: 15px;
    border-radius: 8px;
    text-align: center;
    border: 1px solid #e0e0e0;
  }
  
  .stat-card .label {
    color: #666;
    font-size: 12px;
    margin-bottom: 8px;
  }
  
  .stat-card .value {
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 5px;
    color: #333;
  }
  
  .stat-card .price {
    color: #999;
    font-size: 12px;
    font-weight: 600;
  }
  
  .room {
    background: #fff;
    margin-bottom: 20px;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    overflow: hidden;
  }
  
  .room-header {
    padding: 15px 20px;
    background: #fafafa;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #e0e0e0;
  }
  
  .room-header h3 {
    margin: 0;
    color: #333;
    font-size: 16px;
  }
  
  .room-section-badge {
    background: #e3f2fd;
    color: #1976d2;
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 500;
  }
  
  .room-section {
    padding: 15px;
    background: #fff;
  }
  
  .table-container {
    border: 1px solid #e0e0e0;
    border-radius: 6px;
    margin-bottom: 15px;
    overflow: hidden;
    background: #fff;
  }
  
  .table-title {
    padding: 10px 15px;
    background: #f5f5f5;
    font-size: 14px;
    font-weight: 600;
    border-bottom: 1px solid #e0e0e0;
  }
  
  .report-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 12px;
  }
  
  .report-table th {
    text-align: left;
    padding: 10px 8px;
    background: #f5f5f5;
    font-weight: 600;
    border-bottom: 1px solid #e0e0e0;
  }
  
  .report-table td {
    padding: 8px;
    border-bottom: 1px solid #e0e0e0;
    vertical-align: top;
    color: #333;
  }
  
  .price-cell {
    font-weight: 600;
    white-space: nowrap;
  }
  
  .inv-number {
    font-family: monospace;
    font-size: 11px;
    color: #666;
  }
  
  .report-table tfoot tr {
    background: #f5f5f5;
    border-top: 1px solid #e0e0e0;
  }
  
  .report-table tfoot td {
    padding: 10px 8px;
    font-weight: 600;
  }
  
  .total-label {
    text-align: right;
  }
  
  .total-price {
    font-weight: 600;
    white-space: nowrap;
  }
  
  .room-info-cell {
    font-size: 11px;
    color: #666;
    white-space: nowrap;
  }
  
  .section-badge {
    display: inline-block;
    background: #e8eaf6;
    color: #3f51b5;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 10px;
    font-weight: 500;
  }
`;

const getRoomSection = (room: InventoryRoom | undefined): string => {
  if (!room) return "";
  return (room as any).room_section || room.section || "";
};

export const generateReportHtml = (report: InventoryReport) => {
  const stats = getReportStats(report);

  const renderItemsTable = (
    items: InventoryItem[] | undefined,
    title: string,
    room?: InventoryRoom,
  ) => {
    if (!items || items.length === 0) return "";

    const totalPrice = calculateTotalPrice(items);

    return `
      <div class="table-container">
        <div class="table-title">${title}</div>
        <table class="report-table">
          <thead>
            <tr>
              <th>Наименование</th>
              <th>Помещение</th>
              <th>Секция</th>
              <th>Инв. номер</th>
              <th>Категория</th>
              <th>Стоимость</th>
            </tr>
          </thead>
          <tbody>
            ${items
              .map((item: InventoryItem) => {
                const section = getRoomSection(room) || item.section || "";

                return `
                  <tr>
                    <td>${item.name}</td>
                    <td class="room-info-cell">
                      ${room?.room_name || item.room_name || ""} 
                      ${room?.room_number || item.room_number ? `(${room?.room_number || item.room_number})` : ""}
                    </td>
                    <td>
                      ${section ? `<span class="section-badge">${section}</span>` : "—"}
                    </td>
                    <td class="inv-number">${item.inv_number || "—"}</td>
                    <td>${item.inventory_tools_type || "Без категории"}</td>
                    <td class="price-cell">${formatPrice(item.price || 0)}</td>
                  </tr>
                `;
              })
              .join("")}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="5" class="total-label">Итого:</td>
              <td class="total-price">${formatPrice(totalPrice)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    `;
  };

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Отчет инвентаризации</title>
      <style>${wordStyles}</style>
    </head>
    <body>
      <div class="report">
        <div class="header">
          <p><strong>Дата:</strong> ${new Date(report.date).toLocaleString("ru-RU")}</p>
        </div>

        <div class="stats">
          <div class="stat-card">
            <div class="label">Найдено</div>
            <div class="value">${stats.totalCorrect} шт.</div>
            <div class="price">${formatPrice(stats.totalCorrectPrice)}</div>
          </div>
          <div class="stat-card">
            <div class="label">Отсутствует</div>
            <div class="value">${stats.totalMissing} шт.</div>
            <div class="price">${formatPrice(stats.totalMissingPrice)}</div>
          </div>
          <div class="stat-card">
            <div class="label">Не на месте</div>
            <div class="value">${stats.totalWrong} шт.</div>
            <div class="price">${formatPrice(stats.totalWrongPrice)}</div>
          </div>
        </div>

        ${report.rooms
          ?.map((room: InventoryRoom) => {
            const roomSection = getRoomSection(room);
            return `
              <div class="room">
                <div class="room-header">
                  <h3>Комната ${room.room_number}</h3>
                  ${roomSection ? `<span class="room-section-badge">${roomSection}</span>` : ""}
                </div>
                <div class="room-section">
                  ${renderItemsTable(room["correct-item"], "Найденные МЦ", room)}
                  ${renderItemsTable(room["missing-item"], "Отсутствующие МЦ", room)}
                  ${renderItemsTable(room["wrong-room-item"], "МЦ не из этой комнаты", room)}
                </div>
              </div>
            `;
          })
          .join("")}
      </div>
    </body>
    </html>
  `;
};
