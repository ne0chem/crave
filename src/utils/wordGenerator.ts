// src/utils/wordGenerator.ts

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

// Стили для Word документа
// src/utils/wordStyles.ts

export const wordStyles = `

  
  .report {
    max-width: 1400px;
    margin: 0 auto;
  }
  
  .header {
    background: var(--bg-container, #eeecec);
    padding: 20px;
    border-radius: var(--border-radius, 1.2rem);
    margin-bottom: 20px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    border: 1px solid var(--border-color, #e0e0e0);
  }
  
  .header p {
    margin: 5px 0;
    color: var(--text-primary, #1a1a1a);
    font-size: var(--fz-osnova, 1.5rem);
  }
  
  .stats {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 15px;
    margin-bottom: 25px;
  }
  
  .stat-card {
    background: var(--bg-container, #eeecec);
    padding: 15px;
    border-radius: calc(var(--border-radius, 1.2rem) * 0.8);
    text-align: center;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    border: 1px solid var(--border-color, #e0e0e0);
  }
  
  .stat-card .label {
    color: var(--hover-gray, #7c848a);
    font-size: var(--fz-dop, 1.2rem);
    margin-bottom: 8px;
  }
  
  .stat-card .value {
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 5px;
    color: var(--text-primary, #1a1a1a);
  }
  
  .stat-card .price {
    color: var(--accent-gray, #999ea3);
    font-size: var(--fz-dop, 1.2rem);
    font-weight: 600;
  }
  
  .room {
    background: var(--bg-container, #eeecec);
    margin-bottom: 15px;
    overflow: hidden;
  }
  
  .room-header {
    padding: 15px 20px;
    background: var(--input-bg, #fafafa);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .room-header h3 {
    margin: 0;
    color: var(--text-primary, #1a1a1a);
    font-size: var(--fz-osnova, 1.5rem);
  }
  
  .room-section-badge {
    color: var(--text-primary);
    padding: 4px 12px;
    border-radius: 20px;
    font-size: var(--fz-dop, 1.2rem);
    font-weight: 500;
  }
  
  .room-section {
    padding: 15px;
    background: var(--input-bg, #fafafa);

  }
  
  .table-container {
    border: 1px solid var(--border-color, #e0e0e0);
    border-radius: calc(var(--border-radius, 1.2rem) * 0.6);
    margin-bottom: 15px;
    overflow: hidden;
    background: var(--input-bg, #fafafa);
    
  }
  
  .table-title {
    padding: 10px 15px;
    background: var(--bg-primary, #b6b4b4);
    color: var(--text-primary);
    font-size: var(--fz-osnova, 1.5rem);
    font-weight: 600;
    border-bottom: 1px solid var(--border-color, #e0e0e0);

  }
  
  .report-table {
    width: 100%;
    border-collapse: collapse;
    font-size: var(--fz-dop, 1.2rem);
                        
  }
  
  .report-table th {
    text-align: left;
    padding: 10px 8px;
    background: var(--bg-primary, #b6b4b4);
    color: var(--text-primary);
    font-weight: 600;
    border-bottom: 2px solid var(--border-color, #e0e0e0);
    white-space: nowrap;
    

  }
  
  .report-table td {
    padding: 8px;
    border-bottom: 1px solid var(--border-color, #e0e0e0);
    vertical-align: top;
    color: var(--text-primary);
    

  }
  .price-cell {
    color: var(--text-primary);
    font-weight: 600;
    white-space: nowrap;
  }
  
  .inv-number {
    font-family: monospace;
    font-size: calc(var(--fz-dop, 1.2rem) * 0.9);
    color: var(--text-primary);;
  }
  
  .report-table tfoot tr {
    background: var(--bg-primary, #b6b4b4);
    border-top: 2px solid var(--border-color, #e0e0e0);
    
  }
  
  .report-table tfoot td {
    padding: 10px 8px;
    font-weight: 600;
    color: var(--text-primary);
  }
  
  .total-label {
    text-align: right;
    color: var(--text-primary);
  }
  
  .total-price {
    color: var(--text-primary);
    font-weight: 600;
    white-space: nowrap;
  }
  
  .room-info-cell {
    font-size: calc(var(--fz-dop, 1.2rem) * 0.9);
    color: var(--hover-gray, #7c848a);
    white-space: nowrap;
    
  }
  
  .section-badge {
    display: inline-block;
    color: var(--text-primary);
    padding: 2px 6px;
    border-radius: 4px;
    font-size: calc(var(--fz-dop, 1.2rem) * 0.8);
    font-weight: 500;
  }


`;

// Генератор HTML отчета
export const generateReportHtml = (report: InventoryReport) => {
  const stats = getReportStats(report);

  const renderItemsTable = (
    items: any[],
    title: string,
    room?: InventoryRoom,
  ) => {
    if (!items?.length) return "";

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
              .map(
                (item: any) => `
                
              <tr>
              <td>${item.name}</td>
                <td class="room-info-cell">
                  ${room?.room_name || item.room_name || ""} 
                  ${room?.room_number || item.room_number ? `(${room?.room_number || item.room_number})` : ""}
                </td>
                <td>
                  ${
                    room?.section || item.section
                      ? `<span class="section-badge">${room?.section || item.section}</span>`
                      : "—"
                  }
                </td>
                
                <td class="inv-number">${item.inv_number || "—"}</td>
                <td>${item.inventory_tools_type || "Без категории"}</td>
                <td class="price-cell">${formatPrice(item.price || 0)}</td>
              </tr>
            `,
              )
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
          ?.map(
            (room: InventoryRoom) => `
          <div class="room">
            <div class="room-header">
              <h3>${room.room_name} (ком. ${room.room_number})</h3>
              ${room.section ? `<span class="room-section-badge">${room.section}</span>` : ""}
            </div>
            <div class="room-section">
              ${renderItemsTable(room["correct-item"], "Найденные МЦ", room)}
              ${renderItemsTable(room["missing-item"], "Отсутствующие МЦ", room)}
              ${renderItemsTable(room["wrong-room-item"], " МЦ не из этой комнаты", room)}
            </div>
          </div>
        `,
          )
          .join("")}

        
      </div>
    </body>
    </html>
  `;
};
