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
  onSave?: (data: Partial<FormData>) => any;
  onConfirm?: () => void;
  onSubmit?: (data: Partial<FormData>) => any;
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
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (itemData) {
      console.log("📦 UniversalModal получил itemData:", itemData);

      setFormData((prev) => ({
        ...prev,
        name: itemData.name || "",
        category: itemData.category || itemData.inventory_tools_type || "",
        roomId: itemData.room_id || itemData.roomId || "",
        price: itemData.price?.toString() || "",
        inventNumber: itemData.inventNumber || itemData.inv_number || "",
        info: itemData.info || itemData.description || "",
        actionDate: itemData.actionDate || "",
        actionReason: itemData.actionReason || "",
        actionPerson: itemData.actionPerson || "",
      }));
    }
  }, [itemData]);

  useEffect(() => {
    setIsEditMode(false);
    setIsSubmitting(false);
  }, [type, itemData]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting) return;

    console.log("📤 Отправка формы:", { type, formData });

    if (type === modalTypes.ACTION && !validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      if (type === modalTypes.ACTION) {
        const writeoffData = {
          productId: itemData?.id,
          description: formData.info || itemData?.description || "",
          written_off_by: formData.actionPerson,

          reason: formData.actionReason,
          date: formData.actionDate,
        };

        console.log("📤 Данные для списания:", writeoffData);
        await (onSubmit as any)?.(writeoffData);
        onClose();
      } else {
        const saveData: any = {
          name: formData.name,
          category: formData.category,
          roomId: formData.roomId,
          price: formData.price,
          inventNumber: formData.inventNumber,
          info: formData.info,
        };

        if (itemData?.room_id) {
          saveData.room_id = formData.roomId;
        }

        console.log("📤 Данные для сохранения:", saveData);
        onSave?.(saveData);
        onClose();
      }
    } catch (error) {
      console.error("❌ Ошибка при отправке формы:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRoomDisplayName = (room: Room): string => {
    return `${room.name} (№${room.number}) - ${room.building}, ${room.floor} этаж`;
  };

  const selectedRoom = rooms.find((room) => room.id === formData.roomId);
  const selectedRoomDisplay = selectedRoom
    ? getRoomDisplayName(selectedRoom)
    : formData.roomId
      ? "Выберите помещение"
      : "";

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
          disabled={isSubmitting}
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
          disabled={
            (type === modalTypes.ITEM_VIEW && !isEditMode) || isSubmitting
          }
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
        {type === modalTypes.ITEM_VIEW && !isEditMode ? (
          <div className="input__text readonly">
            {selectedRoomDisplay || formData.roomId || "Не указано"}
          </div>
        ) : (
          <select
            className={`input__text ${errors.roomId ? "error" : ""}`}
            name="roomId"
            value={formData.roomId}
            onChange={handleInputChange}
            disabled={
              (type === modalTypes.ITEM_VIEW && !isEditMode) || isSubmitting
            }
          >
            <option value="">Выберите помещение</option>
            {rooms.map((room) => (
              <option key={room.id} value={room.id}>
                {getRoomDisplayName(room)}
              </option>
            ))}
          </select>
        )}
        {errors.roomId && (
          <span className="error-message">{errors.roomId}</span>
        )}
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
          disabled={isSubmitting}
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
          disabled={isSubmitting}
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
          disabled={isSubmitting}
        />
      </div>

      {type === modalTypes.ITEM_VIEW && (
        <div className="button__container">
          {!isEditMode ? (
            <button
              type="button"
              className="button__modal secondary"
              onClick={() => setIsEditMode(true)}
              disabled={isSubmitting}
            >
              Редактировать
            </button>
          ) : (
            <>
              <button
                type="submit"
                className="button__modal"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Сохранение..." : "Сохранить"}
              </button>
              <button
                type="button"
                className="button__modal secondary"
                onClick={() => setIsEditMode(false)}
                disabled={isSubmitting}
              >
                Отменить
              </button>
            </>
          )}
        </div>
      )}

      {(type === modalTypes.ITEM_EDIT || type === modalTypes.ITEM_ADD) && (
        <div className="button__container">
          <button
            className="button__modal"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? type === modalTypes.ITEM_ADD
                ? "Добавление..."
                : "Сохранение..."
              : type === modalTypes.ITEM_ADD
                ? "Добавить"
                : "Сохранить"}
          </button>
          <button
            className="button__modal secondary"
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Отмена
          </button>
        </div>
      )}
    </form>
  );

  const renderActionForm = () => (
    <form className="form__style" onSubmit={handleSubmit}>
      <div className="form__input">
        <label className="label__text">Наименование МЦ:</label>
        <input
          className={`input__text ${errors.name ? "error" : ""}`}
          type="text"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          readOnly
          disabled={isSubmitting}
        />
        {errors.name && <span className="error-message">{errors.name}</span>}
      </div>

      <div className="form__input">
        <label className="label__text">Описание:</label>
        <textarea
          className={`input__text ${errors.info ? "error" : ""}`}
          name="info"
          value={formData.info}
          onChange={handleInputChange}
          placeholder="Введите описание (необязательно)"
          rows={3}
          disabled={isSubmitting}
        />
      </div>

      <div className="form__input">
        <label className="label__text">Дата списания:</label>
        <input
          className={`input__text ${errors.actionDate ? "error" : ""}`}
          type="date"
          name="actionDate"
          value={formData.actionDate}
          onChange={handleInputChange}
          disabled={isSubmitting}
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
          disabled={isSubmitting}
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
          disabled={isSubmitting}
        />
        {errors.actionPerson && (
          <span className="error-message">{errors.actionPerson}</span>
        )}
      </div>

      <div className="button__container">
        <button type="submit" className="button__modal" disabled={isSubmitting}>
          {isSubmitting ? "Списание..." : "Подтвердить списание"}
        </button>
        <button
          type="button"
          className="button__modal secondary"
          onClick={onClose}
          disabled={isSubmitting}
        >
          Отмена
        </button>
      </div>
    </form>
  );

  const renderContent = () => {
    switch (type) {
      case modalTypes.ITEM_VIEW:
      case modalTypes.ITEM_EDIT:
      case modalTypes.ITEM_ADD:
        return renderItemForm();
      case modalTypes.ACTION:
        return renderActionForm();
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
