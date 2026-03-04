// src/types/report.types.ts

// Типы форматов отчетов
export type ReportFormat = "excel" | "word" | "pdf";

// Типы отчетов
export type ReportType = "active" | "writtenOff" | "all";

// Интерфейс опций отчета
export interface ReportOptions {
  format: ReportFormat;
  type: ReportType;
  title?: string;
  showFilters?: boolean;
  showDate?: boolean;
  includeFields?: string[];
}

// Интерфейс данных для отчета
export interface ReportData {
  items: any[];
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
  type: ReportType;
  generatedAt: string;
  totalCount: number;
  totalSum: number;
}

// Константы для заголовков
export const REPORT_TITLES = {
  active: "Отчет по активным товарам",
  writtenOff: "Отчет по списанным товарам",
  all: "Отчет по всем товарам",
  search: {
    active: "Отчет по активным товарам (поиск)",
    writtenOff: "Отчет по списанным товарам (поиск)",
    all: "Отчет по всем товарам (поиск)",
  },
} as const;

// Константы для названий файлов
export const REPORT_FILENAMES = {
  active: "активные",
  writtenOff: "списанные",
  all: "все_товары",
} as const;

// Константы для иконок форматов
export const FORMAT_ICONS = {
  excel: "📊",
  word: "📄",
  pdf: "📑",
} as const;

// Константы для названий форматов
export const FORMAT_NAMES = {
  excel: "Excel",
  word: "Word",
  pdf: "PDF",
} as const;
