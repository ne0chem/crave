export type ReportFormat = "excel" | "word" | "pdf";

export type ReportType = "active" | "writtenOff" | "all";

export interface ReportOptions {
  format: ReportFormat;
  type: ReportType;
  title?: string;
  showFilters?: boolean;
  showDate?: boolean;
  includeFields?: string[];
}

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

export const REPORT_FILENAMES = {
  active: "активные",
  writtenOff: "списанные",
  all: "все_товары",
} as const;

export const FORMAT_ICONS = {
  excel: "📊",
  word: "📄",
  pdf: "📑",
} as const;

export const FORMAT_NAMES = {
  excel: "Excel",
  word: "Word",
  pdf: "PDF",
} as const;
