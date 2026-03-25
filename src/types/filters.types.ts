interface FiltersProps {
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

  setSortType: (value: string | null) => void;
  setPriceFrom: (value: number | "") => void;
  setPriceTo: (value: number | "") => void;
  setSearchCategory: (value: string) => void;
  setSearchRoom: (value: string) => void;
  setSelectedFilters: (value: any) => void;
  setSearchSection: (value: string) => void;
  setOpenFilter: (value: string | null) => void;

  uniqueCategories: string[];
  uniqueSections: string[];
  uniqueRooms: string[];

  openFilter: string | null;

  resetFilters: () => void;
}
