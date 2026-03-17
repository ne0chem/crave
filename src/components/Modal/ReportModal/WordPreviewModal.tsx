//ппредварительный показ модалки с отчетом по товарам из страницы категорий
import React, { useEffect, useRef, useState } from "react";
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
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (isOpen && htmlContent) {
      setIsLoading(true);

      try {
        // Используем iframe для правильного отображения стилей
        if (iframeRef.current) {
          const iframe = iframeRef.current;
          const iframeDoc =
            iframe.contentDocument || iframe.contentWindow?.document;

          if (iframeDoc) {
            iframeDoc.open();
            iframeDoc.write(htmlContent);
            iframeDoc.close();
          }
        }

        setRenderedHtml(htmlContent);
      } catch (error) {
        console.error("Ошибка при отображении:", error);
      } finally {
        setIsLoading(false);
      }
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
            <>
              <iframe
                ref={iframeRef}
                style={{
                  width: "100%",
                  height: "100%",
                  border: "none",
                  display: "block",
                }}
                title="Word Preview"
              />

              <div
                className="word-preview-html hidden"
                dangerouslySetInnerHTML={{ __html: renderedHtml }}
                style={{ display: "none" }}
              />
            </>
          )}
        </div>

        <div className="word-preview-footer">
          <div className="preview-info"></div>
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
