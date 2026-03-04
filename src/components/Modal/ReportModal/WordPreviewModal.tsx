// src/components/Modal/WordPreviewModal.tsx
import React, { useEffect, useRef, useState } from "react";
import mammoth from "mammoth";
import "./WordPreviewModal.css";

interface WordPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  htmlContent: string;
  onDownload: () => void;
}

const WordPreviewModal: React.FC<WordPreviewModalProps> = ({
  isOpen,
  onClose,
  htmlContent,
  onDownload,
}) => {
  const [renderedHtml, setRenderedHtml] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && htmlContent) {
      setIsLoading(true);

      // Конвертируем HTML в формат для отображения
      // Mammoth может конвертировать HTML в чистый текст с форматированием
      const converter = async () => {
        try {
          // Создаем временный элемент для обработки HTML
          const tempDiv = document.createElement("div");
          tempDiv.innerHTML = htmlContent;

          // Используем mammoth для конвертации (если нужно)
          // или просто показываем HTML как есть
          setRenderedHtml(htmlContent);
        } catch (error) {
          console.error("Ошибка при конвертации:", error);
        } finally {
          setIsLoading(false);
        }
      };

      converter();
    }
  }, [isOpen, htmlContent]);

  if (!isOpen) return null;

  return (
    <div className="word-preview-overlay">
      <div className="word-preview-modal">
        <div className="word-preview-header">
          <h2>Предпросмотр отчета</h2>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="word-preview-content">
          {isLoading ? (
            <div className="preview-loader">Загрузка...</div>
          ) : (
            <div
              className="word-preview-html"
              dangerouslySetInnerHTML={{ __html: renderedHtml }}
            />
          )}
        </div>

        <div className="word-preview-footer">
          <div className="preview-info">
            <span className="preview-icon">📄</span>
            <span>Документ Word</span>
          </div>
          <div className="preview-actions">
            <button className="cancel-btn" onClick={onClose}>
              Закрыть
            </button>
            <button className="download-btn" onClick={onDownload}>
              Скачать документ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WordPreviewModal;
