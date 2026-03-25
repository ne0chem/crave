import React from "react";
import { InventoryReport } from "../../types/inventory.types";

interface ReportItemProps {
  report: InventoryReport;
  isSelected: boolean;
  onSelect: (reportId: string) => void;
  stats: {
    totalCorrect: number;
    totalMissing: number;
    totalWrong: number;
    totalCorrectPrice: number;
    totalMissingPrice: number;
    totalWrongPrice: number;
  };
  sections: string[];
  roomsList: string;
  sectionsFormatted: string;
}

const ReportItem: React.FC<ReportItemProps> = ({
  report,
  isSelected,
  onSelect,
  stats,
  sections,
  roomsList,
  sectionsFormatted,
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("ru-RU", {
      style: "currency",
      currency: "RUB",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const hasSections = sections && sections.length > 0;

  return (
    <div
      className={`report-item ${isSelected ? "selected" : ""}`}
      onClick={() => onSelect(report.report_id)}
    >
      <div className="report-item-header">
        <span className="report-date">{formatDate(report.date)}</span>
      </div>

      <div className="report-stats">
        <span className="stat total">
          Всего: {stats.totalCorrect + stats.totalMissing + stats.totalWrong}
        </span>
        <span className="stat correct">Найдено: {stats.totalCorrect}</span>
        <span className="stat missing">Отсутствует: {stats.totalMissing}</span>
        <span className="stat wrong">Не на месте: {stats.totalWrong}</span>
      </div>

      <div className="report-details">
        <div className="detail-item">
          <span className="detail-label">Помещение:</span>
          <span className="detail-value" title={roomsList}>
            {roomsList || "Все помещения"}
          </span>
        </div>

        {hasSections && (
          <div className="detail-item">
            <span className="detail-label">Секции:</span>
            <div className="sections-list">
              {sections.map((section) => (
                <span key={section} className="section-tag">
                  {section}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Если нет секций, но есть formatted строка, показываем её */}
        {!hasSections && sectionsFormatted && (
          <div className="detail-item">
            <span className="detail-label">Секции:</span>
            <span className="detail-value" title={sectionsFormatted}>
              {sectionsFormatted}
            </span>
          </div>
        )}

        <div className="detail-item">
          <span className="detail-label">Общая стоимость:</span>
          <span className="detail-value price">
            {formatPrice(
              stats.totalCorrectPrice +
                stats.totalMissingPrice +
                stats.totalWrongPrice,
            )}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ReportItem;
