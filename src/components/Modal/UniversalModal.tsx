import React, { useState, useEffect } from "react";
import Modal from "./Modal";
import { modalTypes, modalConfig } from "./modalConfig";
import { ModalType, Room } from "../../types/modal.types";
import "./UniversalModal.css";

interface FormData {
  name: string;
  category: string;
  roomId: string;
  price: string;
  inventNumber: string;
  info: string;
  actionType: string;
  actionDate: string;
  actionReason: string;
  actionPerson: string;
  confirmMessage: string;
}

interface UniversalModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: ModalType | null;
  itemData?: any;
  rooms?: Room[]; // 👈 Используем тип Room
  categories?: string[];
  onSave?: (data: Partial<FormData>) => void;
  onConfirm?: () => void;
  onSubmit?: (data: Partial<FormData>) => void;
}

const UniversalModal: React.FC<UniversalModalProps> = ({
  isOpen,
  onClose,
  type,
  itemData = null,
  rooms = [],
  categories = [],
  onSave,
  onConfirm,
  onSubmit,
}) => {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    category: "",
    roomId: "",
    price: "",
    inventNumber: "",
    info: "",
    actionType: "writeoff",
    actionDate: "",
    actionReason: "",
    actionPerson: "",
    confirmMessage: "",
  });

  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    if (itemData) {
      setFormData((prev) => ({
        ...prev,
        ...itemData,
      }));
    }
  }, [itemData]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (type === modalTypes.CONFIRM) {
      onConfirm?.();
    } else if (type === modalTypes.ACTION) {
      onSubmit?.(formData);
    } else {
      onSave?.(formData);
    }
  };

  // 👇 Функция для форматирования названия комнаты
  const getRoomDisplayName = (room: Room): string => {
    return `${room.name} ${room.number} (${room.building}, ${room.floor} этаж)`;
  };

  const renderItemForm = () => (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Наименование товара:</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          readOnly={type === modalTypes.ITEM_VIEW && !isEditMode}
        />
      </div>

      <div>
        <label>Категория:</label>
        <select
          name="category"
          value={formData.category}
          onChange={handleInputChange}
          disabled={type === modalTypes.ITEM_VIEW && !isEditMode}
        >
          <option value="">Выберите категорию</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label>Местоположение:</label>
        <select
          name="roomId"
          value={formData.roomId}
          onChange={handleInputChange}
          disabled={type === modalTypes.ITEM_VIEW && !isEditMode}
        >
          <option value="">Выберите помещение</option>
          {rooms.map((room) => (
            <option key={room.id} value={room.id}>
              {getRoomDisplayName(room)}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label>Стоимость:</label>
        <input
          type="number"
          name="price"
          value={formData.price}
          onChange={handleInputChange}
          readOnly={type === modalTypes.ITEM_VIEW && !isEditMode}
        />
      </div>

      <div>
        <label>Инвентаризационный номер:</label>
        <input
          type="text"
          name="inventNumber"
          value={formData.inventNumber}
          onChange={handleInputChange}
          readOnly={type === modalTypes.ITEM_VIEW && !isEditMode}
        />
      </div>

      <div>
        <label>Информация о товаре:</label>
        <input
          type="text"
          name="info"
          value={formData.info}
          onChange={handleInputChange}
          readOnly={type === modalTypes.ITEM_VIEW && !isEditMode}
        />
      </div>

      {type === modalTypes.ITEM_VIEW && (
        <div>
          {!isEditMode ? (
            <button type="button" onClick={() => setIsEditMode(true)}>
              Редактировать
            </button>
          ) : (
            <>
              <button type="submit">Сохранить</button>
              <button type="button" onClick={() => setIsEditMode(false)}>
                Отменить
              </button>
            </>
          )}
        </div>
      )}

      {(type === modalTypes.ITEM_EDIT || type === modalTypes.ITEM_ADD) && (
        <div>
          <button type="submit">
            {type === modalTypes.ITEM_ADD ? "Добавить" : "Сохранить"}
          </button>
          <button type="button" onClick={onClose}>
            Отмена
          </button>
        </div>
      )}
    </form>
  );

  const renderActionForm = () => (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Действие:</label>
        <div>
          <label>
            <input
              type="radio"
              name="actionType"
              value="writeoff"
              checked={formData.actionType === "writeoff"}
              onChange={handleInputChange}
            />
            Списать
          </label>
        </div>
      </div>

      <div>
        <label>Название товара:</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
        />
      </div>

      <div>
        <label>Дата списания:</label>
        <input
          type="date"
          name="actionDate"
          value={formData.actionDate}
          onChange={handleInputChange}
        />
      </div>

      <div>
        <label>Причина списания:</label>
        <textarea
          name="actionReason"
          value={formData.actionReason}
          onChange={handleInputChange}
          rows={3}
        />
      </div>

      <div>
        <label>ФИО ответственного:</label>
        <input
          type="text"
          name="actionPerson"
          value={formData.actionPerson}
          onChange={handleInputChange}
        />
      </div>

      <div>
        <button type="button" onClick={onClose}>
          Отмена
        </button>
        <button type="submit">Подтвердить</button>
      </div>
    </form>
  );

  const renderConfirmForm = () => (
    <div>
      <p>
        {formData.confirmMessage || "Вы уверены, что хотите списать товар?"}
      </p>
      <div>
        <button onClick={onClose}>Отмена</button>
        <button onClick={onConfirm}>Да</button>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (type) {
      case modalTypes.ITEM_VIEW:
      case modalTypes.ITEM_EDIT:
      case modalTypes.ITEM_ADD:
        return renderItemForm();
      case modalTypes.ACTION:
        return renderActionForm();
      case modalTypes.CONFIRM:
        return renderConfirmForm();
      default:
        return null;
    }
  };

  if (!type) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={modalConfig[type]?.title || "Модальное окно"}
    >
      {renderContent()}
    </Modal>
  );
};

export default UniversalModal;
