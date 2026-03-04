export enum ModalType {
  ITEM_VIEW = "itemView",
  ITEM_EDIT = "itemEdit",
  ITEM_ADD = "itemAdd",
  ACTION = "action",
  CONFIRM = "confirm",
}

export interface ModalConfig {
  title: string;
}

export type ModalConfigMap = Record<ModalType, ModalConfig>;

// 👇 Обновленный интерфейс комнаты в соответствии с данными из бэка
export interface Room {
  id: string; // uuid
  name: string; // "Кабинет"
  number: string; // "44/1"
  building: string; // "theatre"
  floor: number; // 1
  floor_number?: number; // опционально, если есть
  // можно добавить другие поля по необходимости
}

// 👇 Вспомогательная функция для получения полного названия комнаты
export const getRoomFullName = (room: Room): string => {
  return `${room.name} ${room.number} (${room.building}, ${room.floor} этаж)`;
};
