import React, { useState, useEffect } from "react";
import { useInventoryReport } from "../../hooks/useInventoryReport";
import { InventoryReport } from "../../types/inventory.types";
import {
  getReportStats,
  getUniqueSections,
  formatRoomsList,
} from "../../utils/reportUtils";
import "./SelectReportForDisplay.css";

interface SelectReportForDisplayProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectReport: (reportId: string) => void;
}

const SelectReportForDisplay: React.FC<SelectReportForDisplayProps> = ({
  isOpen,
  onClose,
  onSelectReport,
}) => {
  const { reports, loading, loadReportById } = useInventoryReport();
  const [selectedReportId, setSelectedReportId] = useState<string>("");

  useEffect(() => {
    if (!isOpen) {
      setSelectedReportId("");
    }
  }, [isOpen]);

  const handleSelect = async () => {
    if (selectedReportId) {
      await loadReportById(selectedReportId);
      onSelectReport(selectedReportId);
    }
    onClose();
  };

  if (!isOpen) return null;

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString("ru-RU", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="select-report-overlay" onClick={onClose}>
      <div
        className="select-report-content"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="select-report-header">
          <h3>Выберите инвентаризацию для отображения на плане</h3>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="select-report-body">
          {loading ? (
            <div className="loading-state">Загрузка отчетов...</div>
          ) : reports && reports.length > 0 ? (
            <div className="reports-list">
              {reports.map((report: InventoryReport) => {
                const stats = getReportStats(report);
                const sections = getUniqueSections(report);
                const roomsList = formatRoomsList(report);
                const isSelected = selectedReportId === report.report_id;
                const totalItems =
                  stats.totalCorrect + stats.totalMissing + stats.totalWrong;

                return (
                  <div
                    key={report.report_id}
                    className={`report-item ${isSelected ? "selected" : ""}`}
                    onClick={() => setSelectedReportId(report.report_id)}
                  >
                    <div className="report-item-header">
                      <span className="report-date">
                        {formatDate(report.date)}
                      </span>
                    </div>

                    <div className="report-stats">
                      <span className="stat total">Всего: {totalItems}</span>
                      <span className="stat correct">
                        Найденные МЦ {stats.totalCorrect}
                      </span>
                      <span className="stat missing">
                        Отсутствующие МЦ {stats.totalMissing}
                      </span>
                      <span className="stat wrong">
                        МЦ не на месте {stats.totalWrong}
                      </span>
                    </div>

                    <div className="report-details">
                      <div className="detail-item">
                        <span className="detail-label">Помещение:</span>
                        <span className="detail-value" title={roomsList}>
                          {roomsList}
                        </span>
                      </div>

                      {sections.length > 0 && (
                        <div className="detail-item">
                          <span className="detail-label">Секция:</span>
                          <div className="sections-list">
                            {sections.map((section) => (
                              <span key={section} className="section-tag">
                                {section}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="no-reports">
              <p>Нет доступных отчетов</p>
              <p className="no-reports-hint">
                Сначала проведите инвентаризацию
              </p>
            </div>
          )}
        </div>

        <div className="select-report-footer">
          <button className="cancel-btn" onClick={onClose}>
            Отмена
          </button>
          <button
            className="select-btn"
            onClick={handleSelect}
            disabled={!selectedReportId}
          >
            Показать результаты
          </button>
        </div>
      </div>
    </div>
  );
};

export default SelectReportForDisplay;
