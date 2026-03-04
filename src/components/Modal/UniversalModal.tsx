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
  rooms?: Room[];
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
  const [errors, setErrors] = useState<Record<string, string>>({});

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
    // Очищаем ошибку для этого поля при изменении
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (type === modalTypes.ACTION) {
      if (!formData.name) newErrors.name = "Введите наименование МЦ";
      if (!formData.actionDate) newErrors.actionDate = "Выберите дату списания";
      if (!formData.actionReason)
        newErrors.actionReason = "Укажите причину списания";
      if (!formData.actionPerson)
        newErrors.actionPerson = "Введите ФИО ответственного";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (type === modalTypes.ACTION && !validateForm()) {
      return;
    }

    if (type === modalTypes.CONFIRM) {
      onConfirm?.();
    } else if (type === modalTypes.ACTION) {
      onSubmit?.(formData);
    } else {
      onSave?.(formData);
    }
  };

  const getRoomDisplayName = (room: Room): string => {
    return `${room.name} ${room.number} (${room.building}, ${room.floor} этаж)`;
  };

  const renderItemForm = () => (
    <form className="form__style" onSubmit={handleSubmit}>
      <div className="form__input">
        <label className="label__text">Наименование МЦ:</label>
        <input
          className={`input__text ${errors.name ? "error" : ""}`}
          type="text"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          readOnly={type === modalTypes.ITEM_VIEW && !isEditMode}
          placeholder="Введите наименование"
        />
        {errors.name && <span className="error-message">{errors.name}</span>}
      </div>

      <div className="form__input">
        <label className="label__text">Категория:</label>
        <select
          className={`input__text ${errors.category ? "error" : ""}`}
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

      <div className="form__input">
        <label className="label__text">Местоположение:</label>
        <select
          className={`input__text ${errors.roomId ? "error" : ""}`}
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

      <div className="form__input">
        <label className="label__text">Стоимость:</label>
        <input
          className={`input__text ${errors.price ? "error" : ""}`}
          type="number"
          name="price"
          value={formData.price}
          onChange={handleInputChange}
          readOnly={type === modalTypes.ITEM_VIEW && !isEditMode}
          placeholder="Введите стоимость"
        />
      </div>

      <div className="form__input">
        <label className="label__text">Инвентаризационный номер:</label>
        <input
          className={`input__text ${errors.inventNumber ? "error" : ""}`}
          type="text"
          name="inventNumber"
          value={formData.inventNumber}
          onChange={handleInputChange}
          readOnly={type === modalTypes.ITEM_VIEW && !isEditMode}
          placeholder="Введите инвентаризационный номер"
        />
      </div>

      <div className="form__input">
        <label className="label__text">Описание:</label>
        <textarea
          className={`input__text ${errors.info ? "error" : ""}`}
          name="info"
          value={formData.info}
          onChange={handleInputChange}
          readOnly={type === modalTypes.ITEM_VIEW && !isEditMode}
          placeholder="Введите описание"
          rows={3}
        />
      </div>

      {type === modalTypes.ITEM_VIEW && (
        <div className="button__container">
          {!isEditMode ? (
            <button
              type="button"
              className="button__modal secondary"
              onClick={() => setIsEditMode(true)}
            >
              Редактировать
            </button>
          ) : (
            <>
              <button type="submit" className="button__modal">
                Сохранить
              </button>
              <button
                type="button"
                className="button__modal secondary"
                onClick={() => setIsEditMode(false)}
              >
                Отменить
              </button>
            </>
          )}
        </div>
      )}

      {(type === modalTypes.ITEM_EDIT || type === modalTypes.ITEM_ADD) && (
        <div className="button__container">
          <button className="button__modal" type="submit">
            {type === modalTypes.ITEM_ADD ? "Добавить" : "Сохранить"}
          </button>
          <button
            className="button__modal secondary"
            type="button"
            onClick={onClose}
          >
            Отмена
          </button>
        </div>
      )}
    </form>
  );

  const renderActionForm = () => (
    <form className="form__style" onSubmit={handleSubmit}>
      {/* <div className="form__input">
        <label className="label__text">Действие:</label>
        <div className="radio-group">
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
          <label>
            <input
              type="radio"
              name="actionType"
              value="transfer"
              checked={formData.actionType === "transfer"}
              onChange={handleInputChange}
            />
            Переместить
          </label>
        </div>
      </div> */}

      <div className="form__input">
        <label className="label__text">Наименование МЦ:</label>
        <input
          className={`input__text ${errors.name ? "error" : ""}`}
          type="text"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          placeholder="Введите наименование МЦ"
        />
        {errors.name && <span className="error-message">{errors.name}</span>}
      </div>

      <div className="form__input">
        <label className="label__text">Дата списания:</label>
        <input
          className={`input__text ${errors.actionDate ? "error" : ""}`}
          type="date"
          name="actionDate"
          value={formData.actionDate}
          onChange={handleInputChange}
        />
        {errors.actionDate && (
          <span className="error-message">{errors.actionDate}</span>
        )}
      </div>

      <div className="form__input">
        <label className="label__text">Причина списания:</label>
        <textarea
          className={`input__text ${errors.actionReason ? "error" : ""}`}
          name="actionReason"
          value={formData.actionReason}
          onChange={handleInputChange}
          rows={4}
          placeholder="Опишите причину списания"
        />
        {errors.actionReason && (
          <span className="error-message">{errors.actionReason}</span>
        )}
      </div>

      <div className="form__input">
        <label className="label__text">ФИО ответственного:</label>
        <input
          className={`input__text ${errors.actionPerson ? "error" : ""}`}
          type="text"
          name="actionPerson"
          value={formData.actionPerson}
          onChange={handleInputChange}
          placeholder="Введите ФИО ответственного лица"
        />
        {errors.actionPerson && (
          <span className="error-message">{errors.actionPerson}</span>
        )}
      </div>

      <div className="button__container">
        <button type="submit" className="button__modal">
          Подтвердить списание
        </button>
        <button
          type="button"
          className="button__modal secondary"
          onClick={onClose}
        >
          Отмена
        </button>
      </div>
    </form>
  );

  const renderConfirmForm = () => (
    <div className="confirm-content">
      <p>
        {formData.confirmMessage || "Вы уверены, что хотите списать товар?"}
      </p>
      <div className="button__container">
        <button className="button__modal" onClick={onConfirm}>
          Да, списать
        </button>
        <button className="button__modal secondary" onClick={onClose}>
          Отмена
        </button>
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
