// src/components/InventoryReportSelector.tsx

import React, { useState } from "react";
import { useInventory } from "../../contexts/InventoryContext";
import Modal from "../Modal/Modal";
import WordPreviewModal from "../Modal/ReportModal/WordPreviewModal";
import ReportItem from "../ReportItem/ReportItem";
import { saveAs } from "file-saver";
import {
  getReportStats,
  getUniqueSections,
  formatRoomsList,
  formatSectionsWithStats,
} from "../../utils/reportUtils";
import { generateReportHtml } from "../../utils/wordGenerator";
import { generateExcel } from "../../utils/excelGenerator";
import { InventoryReport, ReportStats } from "../../types/inventory.types"; // 👈 ИМПОРТИРУЕМ ТИПЫ
import "./InventoryReportSelector.css";

interface InventoryReportSelectorProps {
  isOpen: boolean;
  onClose: () => void;
}

const InventoryReportSelector: React.FC<InventoryReportSelectorProps> = ({
  isOpen,
  onClose,
}) => {
  const { reports, isLoading } = useInventory();
  const [selectedReport, setSelectedReport] = useState<string>("");
  const [showPreview, setShowPreview] = useState(false);
  const [previewHtml, setPreviewHtml] = useState<string>("");
  const [selectedFormat, setSelectedFormat] = useState<"excel" | "word">(
    "excel",
  );
  const [isGenerating, setIsGenerating] = useState(false);

  const handleSelectReport = (reportId: string) => {
    setSelectedReport(reportId);
  };

  const handlePreview = () => {
    if (selectedReport && selectedFormat === "word") {
      const report = reports?.find((r) => r.report_id === selectedReport);
      if (report) {
        setPreviewHtml(generateReportHtml(report));
        setShowPreview(true);
      }
    }
  };

  const handleGenerate = () => {
    if (!selectedReport) return;

    setIsGenerating(true);
    try {
      const report = reports?.find((r) => r.report_id === selectedReport);
      if (!report) throw new Error("Отчет не найден");

      if (selectedFormat === "excel") {
        const blob = generateExcel(report);
        saveAs(blob, `inventory-report-${selectedReport.slice(0, 8)}.xlsx`);
      } else {
        const blob = new Blob([generateReportHtml(report)], {
          type: "application/msword",
        });
        saveAs(blob, `inventory-report-${selectedReport.slice(0, 8)}.doc`);
      }
      onClose();
    } catch (error) {
      console.error("Ошибка:", error);
      alert("Не удалось сгенерировать отчет");
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <Modal
        isOpen={isOpen && !showPreview}
        onClose={onClose}
        title="Выберите отчет инвентаризации"
      >
        <div className="report-selector">
          {isLoading ? (
            <div className="loading-state">Загрузка отчетов...</div>
          ) : (
            <>
              <div className="reports-list">
                {reports?.map((report: InventoryReport) => {
                  // 👈 ЯВНО УКАЗЫВАЕМ ТИП
                  const stats: ReportStats = getReportStats(report); // 👈 ЯВНО УКАЗЫВАЕМ ТИП
                  const sections: string[] = getUniqueSections(report); // 👈 ЯВНО УКАЗЫВАЕМ ТИП
                  const roomsList: string = formatRoomsList(report); // 👈 ЯВНО УКАЗЫВАЕМ ТИП
                  const sectionsFormatted: string =
                    formatSectionsWithStats(report); // 👈 ЯВНО УКАЗЫВАЕМ ТИП
                  const isSelected = selectedReport === report.report_id;

                  return (
                    <ReportItem
                      key={report.report_id}
                      report={report}
                      isSelected={isSelected}
                      onSelect={handleSelectReport}
                      stats={stats}
                      sections={sections}
                      roomsList={roomsList}
                      sectionsFormatted={sectionsFormatted}
                    />
                  );
                })}
              </div>

              {selectedReport && (
                <div className="format-section">
                  <h3>Формат отчета:</h3>
                  <div className="format-options">
                    <label
                      className={`format-option ${selectedFormat === "excel" ? "selected" : ""}`}
                    >
                      <input
                        type="radio"
                        name="format"
                        value="excel"
                        checked={selectedFormat === "excel"}
                        onChange={(e) =>
                          setSelectedFormat(e.target.value as "excel" | "word")
                        }
                      />
                      <span className="format-name">Excel</span>
                    </label>

                    <div className="word-options">
                      <label
                        className={`format-option ${selectedFormat === "word" ? "selected" : ""}`}
                      >
                        <input
                          type="radio"
                          name="format"
                          value="word"
                          checked={selectedFormat === "word"}
                          onChange={(e) =>
                            setSelectedFormat(
                              e.target.value as "excel" | "word",
                            )
                          }
                        />
                        <span className="format-name">Word</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              <div className="selector-footer">
                <button className="cancel-btn" onClick={onClose}>
                  Отмена
                </button>
                {selectedReport && (
                  <>
                    {selectedFormat === "word" && (
                      <button className="preview-btn" onClick={handlePreview}>
                        Предпросмотр
                      </button>
                    )}
                    <button
                      className="generate-btn"
                      onClick={handleGenerate}
                      disabled={isGenerating}
                    >
                      {isGenerating
                        ? "Генерация..."
                        : `Сформировать ${selectedFormat === "excel" ? "Excel" : "Word"}`}
                    </button>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </Modal>

      <WordPreviewModal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        htmlContent={previewHtml}
        onDownload={handleGenerate}
      />
    </>
  );
};

export default InventoryReportSelector;
