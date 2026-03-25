interface BaseInventoryItem {
  id: string;
  name: string;
  inventory_tools_type: string;
  description: string | null;
  inv_number: string;
  price: number;
  floor_number: number;
  rfid: string | null;
  attributes: string | null;
  created_at: string;
  updated_at: string;
  room_id?: string;
}

export interface Product extends BaseInventoryItem {
  building: string;
  room_name: string;
  room_number: string;
  section?: string;
  roomInfo?: {
    id: string;
    number: string;
    name: string;
    floor: number;
  };
}

export interface Disposal extends BaseInventoryItem {
  room_number: number | string;
  room_name?: string;
  section?: string;
  written_off_by: string;
  reason?: string;
  deleted_at: string;
  updated_at: string;
  building: string;
  floor_number: number;
}

export type InventoryItem = Product | Disposal;

export function isDisposal(item: InventoryItem): item is Disposal {
  return (
    "deleted_at" in item &&
    item.deleted_at !== null &&
    item.deleted_at !== undefined
  );
}

export function isProduct(item: InventoryItem): item is Product {
  return !("deleted_at" in item);
}

export interface ProductsResponse {
  items: Product[];
  total?: number;
  page?: number;
  limit?: number;
}

export interface DisposalResponse {
  items: Disposal[];
  total?: number;
  page?: number;
  limit?: number;
}

export type InventoryResponse = ProductsResponse | DisposalResponse;

export interface ProductFilters {
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  sortByName?: "asc" | "desc";
  sortByPrice?: "asc" | "desc";
  section?: string;
  room?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface DisposalFilters extends ProductFilters {
  writtenOffBy?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface CreateProductData {
  name: string;
  inventory_tools_type: string;
  description: string | null;
  attributes: string | null;
  building: string;
  created_at: string;
  floor_number: number;
  inv_number: string;
  price: number;
  rfid: string;
  room_name: string;
  room_number: string;
  updated_at: string | null;
  section?: string;
  room_id?: string;
  roomInfo?: {
    id: string;
    number: string;
    name: string;
    floor: number;
  };
}

export interface WriteoffData {
  productId: string;
  reason: string;
  date: string;
  person: string;
  description?: string;
  written_off_by?: string;
}

export interface UpdateProductData extends Partial<CreateProductData> {
  id: string;
}

export interface InventoryStats {
  totalProducts: number;
  totalDisposals: number;
  totalValue: number;
  disposalsValue: number;
  byCategory: {
    [key: string]: {
      count: number;
      value: number;
    };
  };
  bySection?: {
    [key: string]: number;
  };
}

export interface ProductFormData {
  name: string;
  category: string;
  description: string;
  price: number | string;
  inventNumber: string;
  roomId: string;
  roomName: string;
  info?: string;
  section?: string;
}

export interface WriteoffFormData {
  reason: string;
  date: string;
  person: string;
}

export type ReportFormat = "excel" | "word" | "pdf";

export interface ReportOptions {
  format: ReportFormat;
  includeFields?: string[];
  type: "active" | "writtenOff";
  title?: string;
  showDate?: boolean;
  showFilters?: boolean;
}

export interface ReportData {
  items: InventoryItem[];
  filters: {
    searchQuery?: string;
    selectedSection?: string | null;
    priceFrom?: number | string;
    priceTo?: number | string;
    selectedFilters?: {
      category?: string;
      room?: string;
      section?: string;
    };
  };
  type: "active" | "writtenOff";
  generatedAt: string;
  totalCount: number;
  totalSum: number;
}
