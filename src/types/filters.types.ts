// types/filters.types.ts (или прямо в файле Filtres.tsx)
interface FiltersProps {
  // Состояния
  sortType: string | null;
  priceFrom: number | "";
  priceTo: number | "";
  searchCategory: string;
  searchRoom: string;
  selectedFilters: {
    category: string;
    room: string;
    section: string;
  };
  searchSection: string;

  // Функции для обновления
  setSortType: (value: string | null) => void;
  setPriceFrom: (value: number | "") => void;
  setPriceTo: (value: number | "") => void;
  setSearchCategory: (value: string) => void;
  setSearchRoom: (value: string) => void;
  setSelectedFilters: (value: any) => void;
  setSearchSection: (value: string) => void;
  setOpenFilter: (value: string | null) => void;

  // Данные для отображения
  uniqueCategories: string[];
  uniqueSections: string[];
  uniqueRooms: string[];

  // Состояние открытого фильтра
  openFilter: string | null;

  // Функция сброса
  resetFilters: () => void;
}
