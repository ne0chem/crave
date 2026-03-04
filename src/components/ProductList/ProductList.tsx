// ProductList.tsx
import {
  InventoryItem,
  isDisposal,
  Product,
  Disposal,
} from "../../types/product.types";
import "./ProductList.css";

interface ProductListProps {
  products: InventoryItem[]; // 👈 Может быть и Product и Disposal
  openProductId: string | null;
  onProductClick: (productId: string) => void;
  onEditClick?: (product: Product) => void;
  onViewClick: (item: InventoryItem) => void;
  onWriteoffClick?: (product: Product) => void;
  onRestoreClick?: (disposal: Disposal) => void;
  getCategoryColor: (category: string) => string;
  showWrittenOff?: boolean;
}

export default function ProductList({
  products,
  openProductId,
  onProductClick,
  onEditClick,
  onViewClick,
  onWriteoffClick,
  onRestoreClick,
  getCategoryColor,
  showWrittenOff = false,
}: ProductListProps) {
  // Форматирование даты
  const formatDate = (dateString?: string) => {
    if (!dateString) return "Нет";
    return new Date(dateString).toLocaleDateString("ru-RU");
  };

  return (
    <div className="products-list">
      {products.map((item: InventoryItem) => {
        // 👈 ПРОВЕРЯЕМ ТИП!
        const isDisposalItem = isDisposal(item);

        return (
          <div
            key={item.id}
            className={`product-container ${isDisposalItem ? "written-off-container" : ""}`}
          >
            {/* Кликабельный товар */}
            <div
              className={`product-item ${openProductId === item.id ? "active" : ""} ${isDisposalItem ? "written-off-item" : ""}`}
              onClick={() => onProductClick(item.id)}
              style={{
                borderLeftColor: getCategoryColor(item.inventory_tools_type),
              }}
            >
              <span className="product-name">{item.name}</span>
              <span className="product-price">
                {item.price?.toLocaleString() || 0} ₽
              </span>
            </div>

            {/* Выпадающая информация */}
            {openProductId === item.id && (
              <div
                className={`product-details ${isDisposalItem ? "written-off-details" : ""}`}
                style={{
                  borderLeftColor: getCategoryColor(item.inventory_tools_type),
                }}
              >
                <div className="details-content">
                  <p>
                    <strong>Категория:</strong>{" "}
                    {item.inventory_tools_type || "Не указана"}
                  </p>
                  <p>
                    <strong>Описание:</strong>{" "}
                    {item.description || "Нет описания"}
                  </p>

                  {/* Для активных товаров (Product) */}
                  {!isDisposalItem && (
                    <>
                      <p>
                        <strong>Помещение:</strong>{" "}
                        {(item as Product).room_name || "Не указано"}, этаж{" "}
                        {(item as Product).floor_number || "?"}
                      </p>
                      <p>
                        <strong>Секция:</strong>{" "}
                        {(item as Product).section || "Не указана"}
                      </p>
                    </>
                  )}

                  {/* Для списанных товаров (Disposal) */}
                  {isDisposalItem && (
                    <>
                      <p className="written-off-location">
                        <strong>Последнее местоположение:</strong>{" "}
                        {(item as Disposal).room_name || "Не указано"}
                      </p>
                      <p className="written-off-field">
                        <strong>Дата списания:</strong>{" "}
                        {formatDate((item as Disposal).deleted_at)}
                      </p>
                      <p className="written-off-field">
                        <strong>Причина списания:</strong>{" "}
                        {(item as Disposal).reason ||
                          (item as Disposal).written_off_by ||
                          "Не указана"}
                      </p>
                      <p className="written-off-field">
                        <strong>Кто списал:</strong>{" "}
                        {(item as Disposal).written_off_by || "Не указан"}
                      </p>
                    </>
                  )}

                  <p>
                    <strong>Инв. номер:</strong> {item.inv_number || "Нет"}
                  </p>
                  <p>
                    <strong>Дата добавления:</strong>{" "}
                    {formatDate(item.created_at)}
                  </p>

                  {!isDisposalItem && (item as Product).updated_at && (
                    <p>
                      <strong>Дата редактирования:</strong>{" "}
                      {formatDate((item as Product).updated_at)}
                    </p>
                  )}
                  {item.rfid && (
                    <p>
                      <strong>RFID:</strong> {item.rfid}
                    </p>
                  )}
                </div>

                {/* Панель действий */}
                <div className="details-actions">
                  {/* Для активных товаров */}
                  {!isDisposalItem && onEditClick && onWriteoffClick && (
                    <>
                      <div className="action-item">
                        <p className="action-text">Редактировать МЦ</p>
                        <button
                          className="action-button edit-button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditClick(item as Product);
                          }}
                          title="Редактировать"
                        >
                          <img
                            className="action-icon"
                            src="/eddit.svg"
                            alt="Редактировать"
                          />
                        </button>
                      </div>
                      <div className="action-item">
                        <p className="action-text">Списать МЦ</p>
                        <button
                          className="action-button writeoff-button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onWriteoffClick(item as Product);
                          }}
                          title="Списать"
                        >
                          <img
                            className="action-icon"
                            src="/del.webp"
                            alt="Списать"
                          />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}

      {products.length === 0 && (
        <div className="products-list-empty">
          {showWrittenOff
            ? "Нет списанных товаров"
            : "Нет товаров в этой категории"}
        </div>
      )}
    </div>
  );
}
