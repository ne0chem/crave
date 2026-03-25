export interface Room {
  id: string;
  room_id: string;
  number: string;
  name: string;
  section?: string;
  floor_number?: number;
  building?: string;
  floor?: number;
  inventory_tools?: any[];
}

export interface Floor {
  id: string;
  number: number;
  name?: number;
  building: string;
  room?: Room[];
  inventory_room?: Room[];
}

export interface RoomsFloorsResponse {
  floors: Floor[];
}
