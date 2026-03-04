// ================ БАЗОВЫЙ ТИП ================
// Общие поля для всех товаров
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
}

// ================ АКТИВНЫЕ ТОВАРЫ ================
export interface Product extends BaseInventoryItem {
  // Специфические поля для активных товаров
  building: string;
  room_name: string;
  room_number: string;
  section: string;
  roomInfo: {
    id: string;
    number: string;
    name: string;
    floor: number;
  };
  // У активных товаров нет deleted_at
}

// ================ СПИСАННЫЕ ТОВАРЫ ================
export interface Disposal extends BaseInventoryItem {
  // Специфические поля для списанных
  room_number: number; // может быть число
  room_name?: string; // опционально для совместимости
  written_off_by: string;
  reason?: string; // причина списания
  deleted_at: string; // обязательное поле - дата списания
  // Обновляем updated_at - он может быть строкой
  updated_at: string;
}

// ================ ОБЪЕДИНЕННЫЕ ТИПЫ ================
export type InventoryItem = Product | Disposal;

// Type guards для проверки типа
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

// ================ ОТВЕТЫ ОТ API ================
export interface ProductsResponse {
  items: Product[];
  total?: number; // опционально, если API возвращает общее количество
  page?: number;
  limit?: number;
}

export interface DisposalResponse {
  items: Disposal[];
  total?: number;
  page?: number;
  limit?: number;
}

// Объединенный тип ответа
export type InventoryResponse = ProductsResponse | DisposalResponse;

// ================ ФИЛЬТРЫ ================
export interface ProductFilters {
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  sortByName?: "asc" | "desc";
  sortByPrice?: "asc" | "desc";
  section?: string; // фильтр по секции
  room?: string; // фильтр по комнате
  dateFrom?: string; // фильтр по дате
  dateTo?: string;
}

// Фильтры для списанных товаров
export interface DisposalFilters extends ProductFilters {
  writtenOffBy?: string; // кто списал
  dateFrom?: string; // дата списания с
  dateTo?: string; // дата списания по
}

// ================ СОЗДАНИЕ/ОБНОВЛЕНИЕ ================
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
  section: string;
  roomInfo: {
    id: string;
    number: string;
    name: string;
    floor: number;
  };
}

// Данные для списания
export interface WriteoffData {
  productId: string;
  reason: string;
  date: string;
  person: string;
}

// Обновление товара (Partial значит все поля опциональные)
export interface UpdateProductData extends Partial<CreateProductData> {
  id: string; // id обязателен
}

// ================ СТАТИСТИКА ================
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
  bySection: {
    [key: string]: number;
  };
}

// ================ ДЛЯ МОДАЛОК ================
export interface ProductFormData {
  name: string;
  category: string;
  description: string;
  price: number | string;
  inventNumber: string;
  roomId: string;
  roomName: string;
  info?: string;
}

export interface WriteoffFormData {
  reason: string;
  date: string;
  person: string;
}
// Добавь в конец файла, после существующих типов

// ================ ОТЧЕТЫ ================
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
