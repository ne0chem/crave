import "./Main.css";
import { useState, useEffect } from "react";
import "./style/main.css";
import "./style/leftMenu.css";
import "./style/filter.css";
import { useProducts } from "../../contexts/ProductsContext";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useRooms } from "../../contexts/RoomsContext";
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
  const location = useLocation();

  const {
    products,
    writtenOffProducts,
    createProduct,
    updateProduct,
    writeoffProduct,
  } = useProducts();

  const { rooms: allRooms, isLoading: roomsLoading, fetchRooms } = useRooms();

  const [showWrittenOff, setShowWrittenOff] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewContent, setPreviewContent] = useState("");

  const currentProducts = showWrittenOff ? writtenOffProducts : products;

  const filters = useProductFilters(currentProducts);
  const colors = useProductColors(currentProducts);

  const [openProductId, setOpenProductId] = useState<string | null>(null);

  useEffect(() => {
    if (location.state?.selectedSection) {
      filters.setSelectedSection(location.state.selectedSection);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    type: ModalType | null;
    data: any | null;
  }>({
    isOpen: false,
    type: null,
    data: null,
  });

  const rooms: Room[] = allRooms.map((room) => ({
    id: room.room_id,
    room_id: room.room_id,
    name: room.name,
    number: room.number,
    floor: (room as any).floor_number || 1,
    building: (room as any).building || "theatre",
  }));

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

  const handleProductClick = (productId: string) => {
    setOpenProductId(openProductId === productId ? null : productId);
  };

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
  const handleWriteoffClick = (product: any) => {
    if (showWrittenOff) return;

    openModal(ModalType.ACTION, {
      id: product.id,
      name: product.name,
    });
  };

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

  const handleEditProduct = (formData: any) => {
    if (!modalState.data?.id) return;

    const selectedRoom = rooms.find((room) => room.id === formData.roomId);

    console.log("📝 Редактирование товара:", {
      formData,
      selectedRoom,
      roomId: formData.roomId,
    });

    const updatedProduct = {
      id: modalState.data.id,
      name: formData.name,
      inventory_tools_type: formData.category,
      description: formData.info || null,
      price: parseFloat(formData.price),
      inv_number: formData.inventNumber,

      room_id:
        formData.roomId && formData.roomId !== "" ? formData.roomId : undefined,
      room_name: selectedRoom?.name || formData.roomName,
      room_number: selectedRoom?.number || "",
      building: selectedRoom?.building || "",
      floor_number: selectedRoom?.floor || 0,
      section: formData.category,
    };

    const cleanedProduct = Object.fromEntries(
      Object.entries(updatedProduct).filter(
        ([_, value]) => value !== undefined,
      ),
    );

    console.log("📤 Отправляем на обновление:", cleanedProduct);
    updateProduct(cleanedProduct as any);
    closeModal();
  };

  const handleWriteoff = (formData: any) => {
    console.log("📝 handleWriteoff получил:", formData);

    if (modalState.data?.id) {
      writeoffProduct({
        productId: modalState.data.id,
        reason: formData.reason,
        date: formData.date,
        person: formData.written_off_by,
      });
    }

    closeModal();
  };

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
  const handlePreviewWord = (format: "word") => {
    const options: ReportOptions = {
      format: "word",
      type: showWrittenOff ? "writtenOff" : "active",
      title: showWrittenOff ? "Отчет по списанным МЦ" : "Отчет по активным МЦ",
      showFilters: true,
      showDate: true,
    };

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

  console.log("🏢 Комнаты в Main:", rooms);
  console.log("📊 Количество комнат:", rooms.length);

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

        {/* 👇 ВАЖНО: передаем rooms в ProductList */}
        <ProductList
          products={filteredProducts}
          openProductId={openProductId}
          onProductClick={handleProductClick}
          onEditClick={handleEditClick}
          onViewClick={handleViewClick}
          onWriteoffClick={handleWriteoffClick}
          getCategoryColor={getCategoryColor}
          showWrittenOff={showWrittenOff}
          rooms={rooms}
        />
      </div>

      {/* Правое меню с фильтрами */}
      <div className="filter__conteiner">
        <Filtres
          filters={filters}
          rooms={rooms.map((room) => `${room.name} (№${room.number})`)}
        />
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
        onPreview={handlePreviewWord}
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
