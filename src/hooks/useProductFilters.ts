import { useState, useMemo } from "react";
import {
  InventoryItem,
  isDisposal,
  Product,
  Disposal,
} from "../types/product.types";

interface FiltersState {
  category: string;
  room: string;
  section: string;
}

export const useProductFilters = (
  items: InventoryItem[],
  allRooms?: string[],
) => {
  const [openFilter, setOpenFilter] = useState<string | null>(null);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [sortType, setSortType] = useState<string | null>(null);
  const [priceFrom, setPriceFrom] = useState<number | "">("");
  const [priceTo, setPriceTo] = useState<number | "">("");
  const [searchCategory, setSearchCategory] = useState("");
  const [searchRoom, setSearchRoom] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<FiltersState>({
    category: "",
    room: "",
    section: "",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [searchSection, setSearchSection] = useState("");

  const uniqueSections = useMemo(() => {
    const activeItems = items.filter(
      (item): item is Product => !isDisposal(item),
    );
    const sections = new Set<string>();
    activeItems.forEach((item) => {
      if (item.section && item.section !== "Без секции") {
        sections.add(item.section);
      }
    });
    return Array.from(sections).sort();
  }, [items]);

  const uniqueCategories = useMemo(() => {
    return [...new Set(items.map((item) => item.inventory_tools_type))].filter(
      Boolean,
    );
  }, [items]);

  const uniqueRooms = useMemo(() => {
    if (allRooms && allRooms.length > 0) {
      return allRooms;
    }
    return [...new Set(items.map((item) => item.room_name || ""))].filter(
      Boolean,
    );
  }, [items, allRooms]);

  const filteredProducts = useMemo(() => {
    if (!items) return [];

    let result = [...items];

    if (searchQuery) {
      result = result.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    if (selectedFilters.section) {
      result = result.filter((item) => {
        if (isDisposal(item)) return true;
        return (item as Product).section === selectedFilters.section;
      });
    }

    if (selectedSection) {
      result = result.filter((item) => {
        if (isDisposal(item)) return true;
        return (item as Product).section === selectedSection;
      });
    }

    if (selectedFilters.category) {
      result = result.filter(
        (item) => item.inventory_tools_type === selectedFilters.category,
      );
    }

    if (selectedFilters.room) {
      result = result.filter((item) => item.room_name === selectedFilters.room);
    }

    if (priceFrom !== "") {
      result = result.filter((item) => item.price >= Number(priceFrom));
    }
    if (priceTo !== "") {
      result = result.filter((item) => item.price <= Number(priceTo));
    }

    if (searchCategory) {
      result = result.filter((item) =>
        item.inventory_tools_type
          ?.toLowerCase()
          .includes(searchCategory.toLowerCase()),
      );
    }

    if (searchRoom) {
      result = result.filter((item) =>
        item.room_name?.toLowerCase().includes(searchRoom.toLowerCase()),
      );
    }

    if (sortType === "name-asc") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortType === "name-desc") {
      result.sort((a, b) => b.name.localeCompare(a.name));
    } else if (sortType === "price-asc") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortType === "price-desc") {
      result.sort((a, b) => b.price - a.price);
    }

    return result;
  }, [
    items,
    selectedSection,
    selectedFilters,
    priceFrom,
    priceTo,
    searchCategory,
    searchRoom,
    sortType,
    searchQuery,
  ]);

  const resetFilters = () => {
    setSelectedSection(null);
    setSortType(null);
    setPriceFrom("");
    setPriceTo("");
    setSearchCategory("");
    setSearchRoom("");
    setSearchQuery("");
    setSearchSection("");
    setSelectedFilters({ category: "", room: "", section: "" });
    setOpenFilter(null);
  };

  const toggleFilter = (filterName: string) => {
    setOpenFilter(openFilter === filterName ? null : filterName);
  };

  return {
    openFilter,
    selectedSection,
    sortType,
    priceFrom,
    priceTo,
    searchCategory,
    searchRoom,
    selectedFilters,
    searchQuery,
    searchSection,

    uniqueSections,
    uniqueCategories,
    uniqueRooms,

    filteredProducts,

    setSelectedSection,
    setSortType,
    setPriceFrom,
    setPriceTo,
    setSearchCategory,
    setSearchRoom,
    setSelectedFilters,
    setSearchQuery,
    setSearchSection,
    toggleFilter,
    resetFilters,
  };
};
