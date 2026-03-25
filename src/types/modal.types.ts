export enum ModalType {
  ITEM_VIEW = "itemView",
  ITEM_EDIT = "itemEdit",
  ITEM_ADD = "itemAdd",
  ACTION = "action",
}

export interface ModalConfig {
  title: string;
}

export type ModalConfigMap = Record<ModalType, ModalConfig>;

export interface Room {
  id: string;
  name: string;
  number: string;
  building: string;
  floor: number;
  floor_number?: number;
}

export const getRoomFullName = (room: Room): string => {
  return `${room.name} ${room.number} (${room.building}, ${room.floor} этаж)`;
};
