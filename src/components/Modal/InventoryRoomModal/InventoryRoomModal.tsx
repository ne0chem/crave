import React from "react";
import {
  RoomInventoryDetails,
  RoomInventoryStatus,
} from "../../../types/inventory.types";
import "./InventoryRoomModal.css";

interface InventoryRoomModalProps {
  room: any;
  details: RoomInventoryDetails | null;
  status: RoomInventoryStatus | null;
  onClose: () => void;
}

const InventoryRoomModal: React.FC<InventoryRoomModalProps> = ({
  room,
  details,
  status,
  onClose,
}) => {
  const roomNumber = room.roomNumber || room.number || room.room_number || "?";
  const roomName = room.name || room.room_name || "Комната";

  if (!details || !status) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content inventory-modal">
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
          <h2>{roomName}</h2>
          <p className="room-number">Комната №{roomNumber}</p>
          <div className="no-data">Нет данных инвентаризации</div>
        </div>
      </div>
    );
  }

  const hasCorrect = details.correct.length > 0;
  const hasMissing = details.missing.length > 0;
  const hasWrong = details.wrong.length > 0;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content inventory-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-close" onClick={onClose}>
          ×
        </button>

        <div className="modal-header">
          <h2>{roomName}</h2>
          <p className="room-number">Комната №{roomNumber}</p>
        </div>

        <div className="inventory-stats">
          <div
            className={`stat-card success ${status.status === "success" ? "active" : ""}`}
          >
            <div className="stat-value">{status.correctCount}</div>
            <div className="stat-label">Найдено верно</div>
            <div className="stat-price">
              {status.correctPrice.toLocaleString()} ₽
            </div>
          </div>

          <div
            className={`stat-card missing ${status.hasMissing ? "active" : ""}`}
          >
            <div className="stat-value">{status.missingCount}</div>
            <div className="stat-label">Отсутствует</div>
            <div className="stat-price">
              {status.missingPrice.toLocaleString()} ₽
            </div>
          </div>

          <div className={`stat-card wrong ${status.hasWrong ? "active" : ""}`}>
            <div className="stat-value">{status.wrongCount}</div>
            <div className="stat-label">Чужие</div>
            <div className="stat-price">
              {status.wrongPrice.toLocaleString()} ₽
            </div>
          </div>
        </div>

        <div className="inventory-lists">
          {hasCorrect && (
            <div className="inventory-section correct">
              <h3>Найденные МЦ</h3>
              <div className="items-list">
                {details.correct.map((item: any) => (
                  <div key={item.id} className="inventory-item">
                    <span className="item-name">{item.name}</span>
                    <span className="item-price">
                      {item.price.toLocaleString()} ₽
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {hasMissing && (
            <div className="inventory-section missing">
              <h3>Отсутствуют</h3>
              <div className="items-list">
                {details.missing.map((item: any) => (
                  <div key={item.id} className="inventory-item">
                    <span className="item-name">{item.name}</span>
                    <span className="item-price">
                      {item.price.toLocaleString()} ₽
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {hasWrong && (
            <div className="inventory-section wrong">
              <h3>МЦ из другой комнаты</h3>
              <div className="items-list">
                {details.wrong.map((item: any) => (
                  <div key={item.id} className="inventory-item">
                    <span className="item-name">{item.name}</span>
                    <span className="item-location">
                      Из комнаты {item.expectedRoom}
                    </span>
                    <span className="item-price">
                      {item.price.toLocaleString()} ₽
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="inventory-total">
          <div className="total-label">Общая стоимость:</div>
          <div className="total-value">
            {status.totalPrice.toLocaleString()} ₽
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryRoomModal;
