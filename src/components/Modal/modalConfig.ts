import { ModalType, ModalConfigMap } from "../../types/modal.types";

export const modalTypes = ModalType;

export const modalConfig: ModalConfigMap = {
  [ModalType.ITEM_VIEW]: {
    title: "Просмотр товара",
  },
  [ModalType.ITEM_EDIT]: {
    title: "Редактирование товара",
  },
  [ModalType.ITEM_ADD]: {
    title: "Добавление товара",
  },
  [ModalType.ACTION]: {
    title: "Списание товара",
  },
  [ModalType.CONFIRM]: {
    title: "Подтверждение",
  },
};
