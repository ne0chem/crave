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
  active: "Отчет по активным МЦ",
  writtenOff: "Отчет по списанным МЦ",
  all: "Отчет по всем МЦ",
  search: {
    active: "Отчет по активным МЦ (поиск)",
    writtenOff: "Отчет по списанным МЦ (поиск)",
    all: "Отчет по всем МЦ (поиск)",
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
