export interface InventoryReport {
  report_id: string;
  date: string;
  rooms: InventoryRoom[];
}

export interface InventoryRoom {
  room_id: string;
  room_number: string;
  room_name: string;
  room_section?: string;
  section?: string;
  "correct-item"?: InventoryItem[];
  "missing-item"?: InventoryItem[];
  "wrong-room-item"?: InventoryItem[];
}

export interface InventoryItem {
  id: string;
  name: string;
  inventory_tools_type: string;
  description?: string;
  inv_number: string;
  price: number;
  rfid?: string;
  created_at: string;
  updated_at?: string;
  room_name?: string;
  room_number?: string;
  expected_room?: string;
  current_location?: string;
  section?: string;
}

export interface InventoryFilters {
  reportId?: string;
  roomId?: string;
  status?: "correct" | "missing" | "wrong";
  dateFrom?: string;
  dateTo?: string;
  section?: string;
  search?: string;
}

export interface InventoryActionData {
  itemId: string;
  item: InventoryItem;
  roomInfo?: any;
  targetRoom?: string;
  action: "confirm" | "missing" | "move";
  timestamp: string;
}

export interface ReportStats {
  totalCorrect: number;
  totalMissing: number;
  totalWrong: number;
  totalCorrectPrice: number;
  totalMissingPrice: number;
  totalWrongPrice: number;
}

export interface RoomInventoryStatus {
  status: "success" | "warning" | "danger";
  correctCount: number;
  missingCount: number;
  wrongCount: number;
  correctPrice: number;
  missingPrice: number;
  wrongPrice: number;
  totalPrice: number;
  hasMissing: boolean;
  hasWrong: boolean;
  hasIssues?: boolean;
}

export interface RoomInventoryDetails {
  correct: InventoryItem[];
  missing: InventoryItem[];
  wrong: InventoryItem[];
}
