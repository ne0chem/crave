import "./Main.css";
import HeaderMain from "../../components/HeaderMain/HeaderMain";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { useState, useEffect, useMemo } from "react";
import ProductList from "../../components/ProductList/ProductList";
import InventoryRoomModal from "../../components/Modal/InventoryRoomModal/InventoryRoomModal";
import { useProducts } from "../../contexts/ProductsContext";
import { useProductColors } from "../../hooks/useProductColors";
import { useInventoryReport } from "../../hooks/useInventoryReport";
import { Product } from "../../types/product.types";
import { ROOMS_THEATER, ROOMS_WAREHOUSE } from "../../constants/rooms";

interface Room {
  id: string;
  name: string;
  left: string;
  top: string;
  width: string;
  height: string;
  roomNumber: string;
  zIndex?: string;
  style?: object;
  clipPath?: string;
  borderRadius?: string;
  transform?: string;
  section?: string;
}

const MainPage = () => {
  const { products, isLoading: productsLoading } = useProducts();
  const { getCategoryColor } = useProductColors(products);
  const [hoveredSection, setHoveredSection] = useState<string | null>(null);

  const [isInventoryMode, setIsInventoryMode] = useState(false);
  const {
    getRoomStatus,
    getRoomDetails,
    loading: inventoryLoading,
    selectedReport,
    loadReportById,
  } = useInventoryReport();
  const [showWarehouse, setShowWarehouse] = useState(false);

  const rooms = showWarehouse ? ROOMS_WAREHOUSE : ROOMS_THEATER;

  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [inventoryModalOpen, setInventoryModalOpen] = useState(false);
  const [roomProducts, setRoomProducts] = useState<Product[]>([]);
  const [openProductId, setOpenProductId] = useState<string | null>(null);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);

  const handleInventoryModeChange = (isActive: boolean) => {
    setIsInventoryMode(isActive);

    if (!isActive) {
      setSelectedReportId(null);
    }
  };

  const handleSelectReportForDisplay = async (reportId: string) => {
    console.log("📊 handleSelectReportForDisplay вызван с reportId:", reportId);
    setSelectedReportId(reportId);
    try {
      await loadReportById(reportId);
      console.log("✅ Отчет загружен, selectedReport:", selectedReport);
      setIsInventoryMode(true);
    } catch (error) {
      console.error("❌ Ошибка загрузки отчета:", error);
    }
  };

  useEffect(() => {
    console.log("📊 Режим просмотра:", showWarehouse ? "Склад" : "Театр");
    console.log("📊 Режим инвентаризации:", isInventoryMode);
    console.log("📊 Выбранный отчет:", selectedReport?.report_id);
    console.log("📊 Выбранный ID отчета:", selectedReportId);
  }, [showWarehouse, isInventoryMode, selectedReport, selectedReportId]);

  useEffect(() => {
    if (selectedReport) {
      console.log("📋 Комнаты из отчета:");
      selectedReport.rooms?.forEach((room) => {
        console.log(
          `  ${room.room_name}: ${room.room_id} (№${room.room_number}) - секция: ${room.room_section || room.section}`,
        );
      });
    }
  }, [selectedReport]);

  useEffect(() => {
    if (selectedRoom && modalOpen) {
      console.log("Фильтруем товары для комнаты:", selectedRoom.roomNumber);

      const filtered = products.filter(
        (product) => product.room_number === selectedRoom.roomNumber,
      );

      console.log("Отфильтрованные товары:", filtered);
      setRoomProducts(filtered);
    }
  }, [selectedRoom, modalOpen, products]);

  const totalPrice = useMemo(() => {
    return roomProducts.reduce((sum, product) => sum + (product.price || 0), 0);
  }, [roomProducts]);

  const handleRoomClick = (room: Room) => {
    console.log("🖱️ Клик по комнате:", room);
    console.log("🖱️ Режим инвентаризации:", isInventoryMode);

    setSelectedRoom(room);

    if (isInventoryMode) {
      console.log("🖱️ Открываем модалку инвентаризации для комнаты:", room.id);
      const status = getRoomStatus(room.id);
      const details = getRoomDetails(room.id);
      console.log("📊 Статус комнаты:", status);
      console.log("📊 Детали комнаты:", details);
      setInventoryModalOpen(true);
    } else {
      setModalOpen(true);
    }

    setOpenProductId(null);
  };

  const closeModal = () => {
    setModalOpen(false);
    setInventoryModalOpen(false);
    setSelectedRoom(null);
    setRoomProducts([]);
    setOpenProductId(null);
  };

  const handleProductClick = (productId: string) => {
    setOpenProductId(openProductId === productId ? null : productId);
  };

  const handleViewClick = (item: any) => {
    console.log("Просмотр товара:", item);
  };

  const getSectionColor = (
    section: string | undefined,
    opacity: number = 0.3,
  ) => {
    if (!section) return null;
    if (isInventoryMode) return null;

    switch (section) {
      case "Сценографическая":
        return `rgba(170, 220, 180, 0.2)`;
      case "Служебная":
        return `rgba(200, 180, 240, 0.2)`;
      case "Гостевая":
        return `rgba(160, 220, 220, 0.2)`;
      case "Склад":
        return `rgba(100, 150, 200, 0.3)`;
      default:
        return null;
    }
  };

  const roomsForProductList = useMemo(() => {
    return rooms.map((room) => ({
      id: room.id,
      room_id: room.id,
      name: room.name,
      number: room.roomNumber,
      floor: 1,
      building: showWarehouse ? "warehouse" : "theatre",
    }));
  }, [rooms, showWarehouse]);

  const getRoomColor = (roomId: string) => {
    if (!isInventoryMode) {
      return showWarehouse
        ? "rgba(100, 150, 200, 0.2)"
        : "rgba(84, 134, 86, 0)";
    }

    const status = getRoomStatus(roomId);

    if (!status) {
      return "rgba(158, 158, 158, 0.2)";
    }

    switch (status.status) {
      case "success":
        return "rgba(1, 66, 2, 0.25)";
      case "warning":
        return "rgba(255, 152, 0, 0.3)";
      case "danger":
        return "rgba(87, 7, 1, 0.43)";
      default:
        return "rgba(158, 158, 158, 0.2)";
    }
  };

  const getRoomBorderColor = (roomId: string) => {
    if (!isInventoryMode) return "#f3f5f300";

    const status = getRoomStatus(roomId);
    if (!status) return "#9e9e9e";

    switch (status.status) {
      case "success":
        return "#4caf50";
      case "warning":
        return "#ff9800";
      case "danger":
        return "#f44336";
      default:
        return "#9e9e9e";
    }
  };

  return (
    <div className="main-page">
      <HeaderMain
        onInventoryModeChange={handleInventoryModeChange}
        onSelectReportForDisplay={handleSelectReportForDisplay}
        isInventoryMode={isInventoryMode}
        selectedReportId={selectedReportId}
      />

      <button
        className="sklad__bitton"
        onClick={() => setShowWarehouse(!showWarehouse)}
      >
        {showWarehouse ? "Переключиться на театр" : "Переключиться на склад"}
      </button>
      <div className="logo__svg">
        <img className="logo" src="/crave_logo.svg" alt="" />
      </div>

      <div className="zoom-container zoom-wrapper">
        <TransformWrapper
          initialScale={showWarehouse ? 1 : 1.5}
          minScale={showWarehouse ? 0.5 : 1.5}
          maxScale={5}
          wheel={{ step: 0.2 }}
          pinch={{ step: 5 }}
          doubleClick={{ disabled: true }}
          limitToBounds={true}
          centerOnInit={true}
          initialPositionX={0}
          initialPositionY={0}
          panning={{ velocityDisabled: true }}
        >
          <TransformComponent
            wrapperStyle={{
              width: "100%",
              height: "100%",
            }}
          >
            <div className="main-content">
              {/* Показываем фоновое изображение в зависимости от режима */}
              {!showWarehouse ? (
                <img
                  className="main-content-svg"
                  src="/1515.svg"
                  alt="План театра"
                />
              ) : (
                <div className="warehouse-bg">
                  <img
                    className="warehouse-image"
                    src="/sklad123(1).svg"
                    alt="План склада"
                  />
                  <img
                    className="warehouse-image"
                    src="/sklad123(2).svg"
                    alt="План склада"
                  />
                </div>
              )}

              {/* Рендерим комнаты из выбранного массива */}
              {rooms.map((room) => {
                const status = isInventoryMode ? getRoomStatus(room.id) : null;
                let backgroundColor = getRoomColor(room.id);

                if (hoveredSection && room.section === hoveredSection) {
                  backgroundColor =
                    getSectionColor(room.section, 0.5) || backgroundColor;
                } else if (hoveredSection && room.section !== hoveredSection) {
                  backgroundColor = "rgba(0, 0, 0, 0.1)";
                }

                return (
                  <div
                    key={room.id}
                    className={`room-block ${isInventoryMode ? "inventory-mode" : ""}`}
                    style={{
                      left: room.left,
                      top: room.top,
                      width: room.width,
                      height: room.height,
                      clipPath: room.clipPath,
                      transform: room.transform,
                      borderRadius: room.borderRadius,
                      backgroundColor: backgroundColor,
                      borderColor: getRoomBorderColor(room.id),
                      borderWidth: isInventoryMode ? "2px" : "1px",
                      transition: "all 0.2s ease",
                      cursor: "pointer",
                      zIndex: room.zIndex || "auto",
                    }}
                    onClick={() => handleRoomClick(room)}
                    onMouseEnter={() =>
                      room.section && setHoveredSection(room.section)
                    }
                    onMouseLeave={() => setHoveredSection(null)}
                    data-tooltip={`${room.name} (№${room.roomNumber})${room.section ? ` [${room.section}]` : ""}`}
                  >
                    {/* Показываем название на блоках склада */}
                    {showWarehouse && (
                      <div className="warehouse-room-label">{room.name}</div>
                    )}

                    {isInventoryMode &&
                      status &&
                      (status.hasMissing || status.hasWrong) && (
                        <div className="room-status-badge">
                          {status.missingCount > 0 && (
                            <span className="status-missing">
                              📦 {status.missingCount}
                            </span>
                          )}
                          {status.wrongCount > 0 && (
                            <span className="status-wrong">
                              ↺ {status.wrongCount}
                            </span>
                          )}
                        </div>
                      )}
                  </div>
                );
              })}
            </div>
          </TransformComponent>
        </TransformWrapper>
      </div>

      {/* Обычная модалка с товарами */}
      {modalOpen && selectedRoom && !isInventoryMode && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>
              ×
            </button>

            <div className="modal-header">
              <h2>{selectedRoom.name}</h2>
              <p className="room-number">
                {showWarehouse ? "Склад" : "Комната"} №{selectedRoom.roomNumber}
              </p>
            </div>

            {productsLoading ? (
              <div className="loading">Загрузка товаров...</div>
            ) : (
              <>
                <div className="room-stats">
                  <div className="stat-item">
                    <span className="stat-label">Количество МЦ:</span>
                    <span className="stat-value">{roomProducts.length}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Общая стоимость:</span>
                    <span className="stat-value stat-value">
                      {totalPrice.toLocaleString()} ₽
                    </span>
                  </div>
                </div>

                {roomProducts.length > 0 ? (
                  <ProductList
                    products={roomProducts}
                    openProductId={openProductId}
                    onProductClick={handleProductClick}
                    onViewClick={handleViewClick}
                    getCategoryColor={getCategoryColor}
                    showWrittenOff={false}
                    rooms={roomsForProductList}
                  />
                ) : (
                  <div className="no-products">
                    <p>В этом помещении нет МЦ</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Модалка инвентаризации */}
      {inventoryModalOpen && selectedRoom && isInventoryMode && (
        <InventoryRoomModal
          room={selectedRoom}
          details={getRoomDetails(selectedRoom.id)}
          status={getRoomStatus(selectedRoom.id)}
          onClose={closeModal}
        />
      )}
    </div>
  );
};

export default MainPage;
