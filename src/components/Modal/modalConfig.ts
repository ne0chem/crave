import { ModalType, ModalConfigMap } from "../../types/modal.types";

export const modalTypes = ModalType;

export const modalConfig: ModalConfigMap = {
  [ModalType.ITEM_VIEW]: {
    title: "Просмотр МЦ",
  },
  [ModalType.ITEM_EDIT]: {
    title: "Редактирование МЦ",
  },
  [ModalType.ITEM_ADD]: {
    title: "Добавление МЦ",
  },
  [ModalType.ACTION]: {
    title: "Списание МЦ",
  },
  [ModalType.CONFIRM]: {
    title: "Подтверждение",
  },
};
