// types/inventory.types.ts

export interface InventoryItem {
  id: string;
  name: string;
  inventory_tools_type: string;
  description: string;
  inv_number: string;
  price: number;
  rfid: string | null;
}

export interface CorrectItem extends InventoryItem {}

export interface MissingItem extends InventoryItem {
  expected_room: string;
  current_location: string;
}

export interface WrongRoomItem extends InventoryItem {
  room_name: string;
  room_number: string;
  found_in_room: string;
  expectedRoom?: string;
  foundRoom?: string;
}

export interface InventoryRoom {
  room_id: string;
  room_number: string;
  room_name: string;
  section?: string;
  "correct-item": CorrectItem[];
  "missing-item": MissingItem[];
  "wrong-room-item": WrongRoomItem[];
}

// 👇 НОВЫЙ ТИП: для вложенного отчета в wrong-room-item
export interface NestedInventoryReport {
  report_id: string;
  date: string;
  rooms: InventoryRoom[];
  "wrong-room-item"?: any[]; // может быть пустым массивом
}

// 👇 ОБНОВЛЕННЫЙ ТИП: InventoryReport
export interface InventoryReport {
  report_id: string;
  date: string;
  rooms: InventoryRoom[];
  "wrong-room-item": NestedInventoryReport[]; // теперь это массив отчетов!
  section?: string;
}

// Дополнительные типы
export interface InventoryFilters {
  startDate?: string;
  endDate?: string;
  roomId?: string;
  status?: "all" | "correct" | "missing" | "wrong";
}

export interface InventoryActionData {
  itemId: string;
  item: InventoryItem;
  action: "confirm" | "missing" | "move";
  roomInfo?: any;
  targetRoom?: string;
  timestamp: string;
  notes?: string;
}

export type InventoryModalType =
  | "inventory_report_view"
  | "inventory_item_details"
  | "inventory_correct"
  | "inventory_missing"
  | "inventory_wrong_room";

export interface ReportStats {
  totalCorrect: number;
  totalMissing: number;
  totalWrong: number;
  totalCorrectPrice: number;
  totalMissingPrice: number;
  totalWrongPrice: number;
}

export interface RoomInventoryStatus {
  roomId: string;
  roomNumber: string;
  roomName: string;
  status: "success" | "warning" | "danger" | "pending";
  correctCount: number;
  missingCount: number;
  wrongCount: number;
  totalItems: number;
  correctPrice: number;
  missingPrice: number;
  wrongPrice: number;
  totalPrice: number;
  hasIssues: boolean;
  hasMissing: boolean;
  hasWrong: boolean;
}

export interface RoomInventoryDetails {
  correct: CorrectItem[];
  missing: MissingItem[];
  wrong: WrongRoomItem[];
}
