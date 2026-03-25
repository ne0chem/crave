import React, { useState } from "react";
import "./ReportModal.css";

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (format: "excel" | "word") => void;
  onPreview?: (format: "word") => void;
  itemCount: number;
}

const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  onGenerate,
  onPreview,
  itemCount,
}) => {
  const [selectedFormat, setSelectedFormat] = useState<"excel" | "word">(
    "excel",
  );
  const [includeFilters, setIncludeFilters] = useState(true);
  const [includeDate, setIncludeDate] = useState(true);

  if (!isOpen) return null;

  const handleGenerate = () => {
    onGenerate(selectedFormat);
  };

  const handlePreview = () => {
    if (onPreview && selectedFormat === "word") {
      onPreview("word");
    }
  };

  return (
    <div className="report-modal-overlay">
      <div className="report-modal">
        <div className="report-modal-header">
          <h2>Сформировать отчет</h2>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="report-modal-content">
          <p className="items-count">
            Будет сформирован отчет по <strong>{itemCount}</strong> товарам
          </p>

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
                  onChange={(e) => setSelectedFormat(e.target.value as "excel")}
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
                      setSelectedFormat(e.target.value as "word")
                    }
                  />

                  <span className="format-name">Word</span>
                </label>

                {selectedFormat === "word" && onPreview && (
                  <button
                    className="preview-btn"
                    onClick={handlePreview}
                    type="button"
                  >
                    Предпросмотр
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="options-section">
            <h3>Дополнительно:</h3>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={includeFilters}
                onChange={(e) => setIncludeFilters(e.target.checked)}
              />
              Включить примененные фильтры в отчет
            </label>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={includeDate}
                onChange={(e) => setIncludeDate(e.target.checked)}
              />
              Показать дату формирования
            </label>
          </div>
        </div>

        <div className="report-modal-footer">
          <button className="cancel-btn" onClick={onClose}>
            Отмена
          </button>
          <button className="generate-btn" onClick={handleGenerate}>
            Сформировать {selectedFormat === "excel" ? "Excel" : "Word"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportModal;
