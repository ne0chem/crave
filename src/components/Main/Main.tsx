import "./Main.css";
import { useState } from "react";
import "./style/main.css";
import "./style/leftMenu.css";
import "./style/filter.css";
import { useProducts } from "../../contexts/ProductsContext";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/DummyAuthContext";
import Filtres from "../Filtres/Filtres";
import { useProductFilters } from "../../hooks/useProductFilters";
import { useProductColors } from "../../hooks/useProductColors";
import ProductList from "../ProductList/ProductList";
import UniversalModal from "../Modal/UniversalModal";
import { ModalType, Room } from "../../types/modal.types";
import { CreateProductData, ReportOptions } from "../../types/product.types";
import { reportService } from "../services/reportService";
import ReportModal from "../Modal/ReportModal/ReportModal";
import WordPreviewModal from "../Modal/ReportModal/WordPreviewModal";

const Main = () => {
  const { logout } = useAuth();
  const {
    products,
    writtenOffProducts,
    createProduct,
    updateProduct,
    writeoffProduct,
  } = useProducts();

  // Состояния
  const [showWrittenOff, setShowWrittenOff] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false); // 👈 ДОБАВЛЕНО
  const [previewContent, setPreviewContent] = useState(""); // 👈 ДОБАВЛЕНО

  // Выбираем какой массив показывать
  const currentProducts = showWrittenOff ? writtenOffProducts : products;

  const filters = useProductFilters(currentProducts);
  const colors = useProductColors(currentProducts);

  const [openProductId, setOpenProductId] = useState<string | null>(null);

  // Состояние для модалки
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    type: ModalType | null;
    data: any | null;
  }>({
    isOpen: false,
    type: null,
    data: null,
  });

  // Данные для комнат
  const rooms: Room[] = [
    { id: "1", name: "Кабинет 101", number: "1", floor: 1, building: "dd" },
    { id: "2", name: "Склад №1", number: "1", floor: 1, building: "dd" },
    { id: "3", name: "Актовый зал", number: "1", floor: 1, building: "dd" },
    { id: "4", name: "Кабинет 102", number: "1", floor: 1, building: "dd" },
    { id: "5", name: "Склад №2", number: "1", floor: 1, building: "dd" },
  ];

  // Категории
  const categories: string[] = [
    "Офисная мебель",
    "Мебель",
    "Бытовая техника",
    "Компьютерная техника",
    "Звуковая аппаратура",
    "Видео аппаратура",
    "Световые приборы",
    "Костюмерный цех",
    "Декорации",
    "Инструменты",
    "Складское оборудование",
  ];

  const {
    selectedSection,
    setSelectedSection,
    searchQuery,
    setSearchQuery,
    filteredProducts,
    uniqueSections,
  } = filters;

  const { getCategoryColor, getSectionColor } = colors;

  // Функции для открытия модалок
  const openModal = (type: ModalType, data: any = null) => {
    setModalState({
      isOpen: true,
      type,
      data,
    });
  };

  const closeModal = () => {
    setModalState({
      isOpen: false,
      type: null,
      data: null,
    });
  };

  // Обработчик клика по товару
  const handleProductClick = (productId: string) => {
    setOpenProductId(openProductId === productId ? null : productId);
  };

  // Обработчик просмотра товара
  const handleViewClick = (product: any) => {
    openModal(ModalType.ITEM_VIEW, {
      id: product.id,
      name: product.name,
      category: product.inventory_tools_type,
      room_id: product.room_id,
      roomName: product.room_name,
      price: product.price,
      inventNumber: product.inv_number,
      info: product.description || "",
      writtenOff: showWrittenOff,
      deleted_at: product.deleted_at,
      written_off_by: product.written_off_by,
      reason: product.reason,
    });
  };

  // Обработчик редактирования товара (только для активных)
  const handleEditClick = (product: any) => {
    if (showWrittenOff) return;

    openModal(ModalType.ITEM_EDIT, {
      id: product.id,
      name: product.name,
      category: product.inventory_tools_type,
      room_id: product.room_id,
      roomName: product.room_name,
      price: product.price,
      inventNumber: product.inv_number,
      info: product.description || "",
    });
  };

  // Обработчик списания товара (только для активных)
  const handleWriteoffClick = (product: any) => {
    if (showWrittenOff) return;

    openModal(ModalType.ACTION, {
      id: product.id,
      name: product.name,
    });
  };

  // Сохранение нового товара
  const handleAddProduct = (formData: any) => {
    const selectedRoom = rooms.find((room) => room.id === formData.roomId);

    const newProduct: CreateProductData = {
      name: formData.name,
      inventory_tools_type: formData.category,
      description: formData.info || null,
      attributes: null,
      building: selectedRoom?.building || "",
      created_at: new Date().toISOString(),
      floor_number: selectedRoom?.floor || 0,
      inv_number: formData.inventNumber,
      price: parseFloat(formData.price),
      rfid: "",
      room_name: selectedRoom?.name || "",
      room_number: selectedRoom?.number || "",
      updated_at: null,
      section: formData.category,
      roomInfo: selectedRoom
        ? {
            id: selectedRoom.id,
            number: selectedRoom.number,
            name: selectedRoom.name,
            floor: selectedRoom.floor,
          }
        : {
            id: "",
            number: "",
            name: "",
            floor: 0,
          },
    };

    createProduct(newProduct);
    closeModal();
  };

  // Сохранение изменений товара
  const handleEditProduct = (formData: any) => {
    if (!modalState.data?.id) return;

    const updatedProduct = {
      id: modalState.data.id,
      name: formData.name,
      inventory_tools_type: formData.category,
      room_name: formData.roomName,
      room_id: formData.roomId,
      price: parseFloat(formData.price),
      inv_number: formData.inventNumber,
      description: formData.info,
    };

    updateProduct(updatedProduct);
    closeModal();
  };

  // Обработчик списания
  const handleWriteoff = (formData: any) => {
    if (modalState.data?.id) {
      writeoffProduct({
        productId: modalState.data.id,
        reason: formData.actionReason,
        date: formData.actionDate,
        person: formData.actionPerson,
      });
    }

    openModal(ModalType.CONFIRM, {
      message: `МЦ "${modalState.data?.name}" успешно списан`,
    });
  };

  // Обработчик генерации отчета
  const handleGenerateReport = (format: "excel" | "word") => {
    const options: ReportOptions = {
      format,
      type: showWrittenOff ? "writtenOff" : "active",
      title: showWrittenOff ? "Отчет по списанным МЦ" : "Отчет по активным МЦ",
      showFilters: true,
      showDate: true,
    };

    reportService.generateReport(filteredProducts, options, {
      searchQuery,
      selectedSection,
      priceFrom: filters.priceFrom,
      priceTo: filters.priceTo,
      selectedFilters: filters.selectedFilters,
    });

    setIsReportModalOpen(false);
  };

  // Обработчик предпросмотра Word
  const handlePreviewWord = (format: "word") => {
    const options: ReportOptions = {
      format: "word",
      type: showWrittenOff ? "writtenOff" : "active",
      title: showWrittenOff
        ? "Отчет по списанным товарам"
        : "Отчет по активным товарам",
      showFilters: true,
      showDate: true,
    };

    // Генерируем HTML для предпросмотра
    const htmlContent = reportService.generateWordHTML(
      filteredProducts,
      options,
      {
        searchQuery,
        selectedSection,
        priceFrom: filters.priceFrom,
        priceTo: filters.priceTo,
        selectedFilters: filters.selectedFilters,
      },
    );

    setPreviewContent(htmlContent);
    setIsPreviewOpen(true);
  };
  return (
    <div className="Main__container">
      {/* Левое меню с секциями */}
      <div className="left__section">
        <div className="left-menu">
          {!showWrittenOff ? (
            <>
              <p
                className={`left-category ${!selectedSection ? "active" : ""}`}
                onClick={() => setSelectedSection(null)}
              >
                Все секции
                <span className="section-count">{products?.length || 0}</span>
              </p>

              {uniqueSections.map((section, index) => (
                <p
                  key={section}
                  className={`left-category section-item ${selectedSection === section ? "active" : ""}`}
                  onClick={() => setSelectedSection(section)}
                  style={{
                    color: "black",
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
        <div className="link__btn">
          <Link to="/main" className="btn__link">
            На главную
          </Link>
        </div>
      </div>

      {/* Центральный каталог */}
      <div className="catalog">
        <div className="catalog-search">
          <input
            type="text"
            className="search-input"
            placeholder={`🔍 Поиск ${showWrittenOff ? "списанных" : ""} МЦ по названию...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <h1 className="catalog-title">
          {showWrittenOff ? "Списанные МЦ" : selectedSection || "Все секции"} (
          {filteredProducts.length})
        </h1>

        <ProductList
          products={filteredProducts}
          openProductId={openProductId}
          onProductClick={handleProductClick}
          onEditClick={handleEditClick}
          onViewClick={handleViewClick}
          onWriteoffClick={handleWriteoffClick}
          getCategoryColor={getCategoryColor}
          showWrittenOff={showWrittenOff}
        />
      </div>

      {/* Правое меню с фильтрами */}
      <div className="filter__conteiner">
        <Filtres filters={filters} />
        <div className="report__conteainer">
          <button
            className="addMZ"
            onClick={() => openModal(ModalType.ITEM_ADD)}
            disabled={showWrittenOff}
          >
            Добавить МЦ
          </button>

          <button
            className={`delMZ ${showWrittenOff ? "active" : ""}`}
            onClick={() => setShowWrittenOff(!showWrittenOff)}
          >
            {showWrittenOff ? "Активные МЦ" : "Списанные МЦ"}
          </button>

          <button
            className="ReportMZ"
            onClick={() => setIsReportModalOpen(true)}
          >
            Сформировать отчет
          </button>
        </div>
      </div>

      <button onClick={logout} className="logout-btn">
        Выйти
      </button>

      {/* Универсальная модалка */}
      <UniversalModal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        type={modalState.type}
        itemData={modalState.data}
        rooms={rooms}
        categories={categories}
        onSave={(data: any) => {
          if (modalState.type === ModalType.ITEM_ADD) {
            handleAddProduct(data);
          } else if (modalState.type === ModalType.ITEM_EDIT) {
            handleEditProduct(data);
          }
        }}
        onSubmit={handleWriteoff}
      />

      {/* Модалка выбора отчета */}
      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onGenerate={handleGenerateReport}
        onPreview={handlePreviewWord} // 👈 ДОБАВЛЕНО
        itemCount={filteredProducts.length}
      />

      {/* Модалка предпросмотра Word */}
      <WordPreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        htmlContent={previewContent}
        onDownload={() => handleGenerateReport("word")}
      />
    </div>
  );
};

export default Main;
