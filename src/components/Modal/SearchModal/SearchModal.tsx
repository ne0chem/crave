// src/components/Modal/SearchModal/SearchModal.tsx
import React, { useState } from "react";
import { useProducts } from "../../../contexts/ProductsContext";
import { useProductFilters } from "../../../hooks/useProductFilters";
import { useProductColors } from "../../../hooks/useProductColors";
import ProductList from "../../ProductList/ProductList";
import Filtres from "../../Filtres/Filtres";
import { ReportOptions } from "../../../types/product.types";
import { reportService } from "../../services/reportService";
import ReportModal from "../ReportModal/ReportModal";
import WordPreviewModal from "../ReportModal/WordPreviewModal";
import "./SearchModal.css";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const { products, writtenOffProducts } = useProducts();
  const [showWrittenOff, setShowWrittenOff] = useState(false);
  const [openProductId, setOpenProductId] = useState<string | null>(null);

  // Состояния для отчетов
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewContent, setPreviewContent] = useState("");

  const currentProducts = showWrittenOff ? writtenOffProducts : products;
  const filters = useProductFilters(currentProducts);
  const colors = useProductColors(currentProducts);

  const {
    selectedSection,
    setSelectedSection,
    searchQuery,
    setSearchQuery,
    filteredProducts,
    uniqueSections,
    priceFrom,
    priceTo,
    selectedFilters,
  } = filters;

  const { getCategoryColor, getSectionColor } = colors;

  const handleProductClick = (productId: string) => {
    setOpenProductId(openProductId === productId ? null : productId);
  };

  const handleViewClick = (product: any) => {
    console.log("Просмотр товара:", product);
  };

  // Обработчик генерации отчета
  const handleGenerateReport = (format: "excel" | "word") => {
    console.log("📊 Генерация отчета в модалке поиска:", format);
    console.log("Товаров для отчета:", filteredProducts.length);

    const options: ReportOptions = {
      format,
      type: showWrittenOff ? "writtenOff" : "active",
      title: showWrittenOff
        ? "Отчет по списанным товарам (поиск)"
        : "Отчет по активным товарам (поиск)",
      showFilters: true,
      showDate: true,
    };

    reportService.generateReport(filteredProducts, options, {
      searchQuery,
      selectedSection,
      priceFrom: priceFrom,
      priceTo: priceTo,
      selectedFilters: selectedFilters,
    });

    setIsReportModalOpen(false);
  };

  // Обработчик предпросмотра Word
  const handlePreviewWord = (format: "word") => {
    console.log("👁️ Предпросмотр Word в модалке поиска");

    const options: ReportOptions = {
      format: "word",
      type: showWrittenOff ? "writtenOff" : "active",
      title: showWrittenOff
        ? "Отчет по списанным товарам (поиск)"
        : "Отчет по активным товарам (поиск)",
      showFilters: true,
      showDate: true,
    };

    const htmlContent = reportService.generateWordHTML(
      filteredProducts,
      options,
      {
        searchQuery,
        selectedSection,
        priceFrom: priceFrom,
        priceTo: priceTo,
        selectedFilters: selectedFilters,
      },
    );

    setPreviewContent(htmlContent);
    setIsPreviewOpen(true);
  };

  // Обработчик скачивания из предпросмотра
  const handleDownloadFromPreview = () => {
    const options: ReportOptions = {
      format: "word",
      type: showWrittenOff ? "writtenOff" : "active",
      title: showWrittenOff
        ? "Отчет по списанным товарам (поиск)"
        : "Отчет по активным товарам (поиск)",
      showFilters: true,
      showDate: true,
    };

    reportService.downloadWordFromHTML(previewContent, options);
    setIsPreviewOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="search-modal-overlay" onClick={onClose}>
      <div className="search-modal" onClick={(e) => e.stopPropagation()}>
        <div className="search-modal-header">
          <h2>Поиск материальных ценностей</h2>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="search-modal-content">
          <div className="search-modal-layout">
            {/* Левое меню с секциями */}
            <div className="search-left-menu">
              {!showWrittenOff ? (
                <>
                  <p
                    className={`left-category ${!selectedSection ? "active" : ""}`}
                    onClick={() => setSelectedSection(null)}
                  >
                    Все секции
                    <span className="section-count">
                      {products?.length || 0}
                    </span>
                  </p>

                  {uniqueSections.map((section, index) => (
                    <p
                      key={section}
                      className={`left-category section-item ${selectedSection === section ? "active" : ""}`}
                      onClick={() => setSelectedSection(section)}
                      style={{
                        ["--section-color" as any]: getSectionColor(index),
                      }}
                    >
                      {section}
                      <span className="section-count">
                        {products?.filter((p) => p.section === section).length}
                      </span>
                    </p>
                  ))}
                </>
              ) : (
                <div className="written-off-info">
                  <p className="left-category active">
                    Списанные МЦ
                    <span className="section-count">
                      {writtenOffProducts?.length || 0}
                    </span>
                  </p>
                </div>
              )}
            </div>

            {/* Центральная часть с товарами */}
            <div className="search-catalog">
              <div className="search-catalog-header">
                <input
                  type="text"
                  className="search-input"
                  placeholder={`🔍 Поиск ${showWrittenOff ? "списанных" : ""} МЦ по названию...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                />
              </div>

              <div className="search-products-list">
                <ProductList
                  products={filteredProducts}
                  openProductId={openProductId}
                  onProductClick={handleProductClick}
                  onEditClick={() => {}}
                  onViewClick={handleViewClick}
                  onWriteoffClick={() => {}}
                  getCategoryColor={getCategoryColor}
                  showWrittenOff={showWrittenOff}
                />
              </div>
            </div>

            {/* Правое меню с фильтрами и отчетом */}
            <div className="search-right-menu">
              <Filtres filters={filters} />
              <div className="search-actions">
                <button
                  className={`toggle-view-btn ${showWrittenOff ? "active" : ""}`}
                  onClick={() => setShowWrittenOff(!showWrittenOff)}
                >
                  {showWrittenOff ? "Активные МЦ" : "Списанные МЦ"}
                </button>

                <button
                  className="report-btn"
                  onClick={() => {
                    console.log("Клик по кнопке отчета");
                    setIsReportModalOpen(true);
                  }}
                >
                  Сформировать отчет
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Модалки отчета - теперь ВНУТРИ search-modal, но поверх контента */}
        {isReportModalOpen && (
          <div className="modal-stack">
            <ReportModal
              isOpen={isReportModalOpen}
              onClose={() => {
                console.log("Закрытие модалки отчета");
                setIsReportModalOpen(false);
              }}
              onGenerate={handleGenerateReport}
              onPreview={handlePreviewWord}
              itemCount={filteredProducts.length}
            />
          </div>
        )}

        {/* Модалка предпросмотра Word */}
        {isPreviewOpen && (
          <div className="modal-stack">
            <WordPreviewModal
              isOpen={isPreviewOpen}
              onClose={() => setIsPreviewOpen(false)}
              htmlContent={previewContent}
              onDownload={handleDownloadFromPreview}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchModal;
