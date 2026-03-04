/* вся логика фильтрации */
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

export const useProductFilters = (items: InventoryItem[]) => {
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

  // Уникальные значения для фильтров (только из активных товаров)
  const uniqueSections = useMemo(() => {
    // Берем только активные товары (Product) для секций
    const activeItems = items.filter(
      (item): item is Product => !isDisposal(item),
    );
    return [...new Set(activeItems.map((p) => p.section))].filter(Boolean);
  }, [items]);

  const uniqueCategories = useMemo(() => {
    // Категории есть и у активных, и у списанных
    return [...new Set(items.map((item) => item.inventory_tools_type))].filter(
      Boolean,
    );
  }, [items]);

  const uniqueRooms = useMemo(() => {
    // Комнаты есть и у активных, и у списанных
    return [...new Set(items.map((item) => item.room_name || ""))].filter(
      Boolean,
    );
  }, [items]);

  // Фильтрация товаров
  const filteredProducts = useMemo(() => {
    if (!items) return [];

    let result = [...items];

    // Поиск по названию
    if (searchQuery) {
      result = result.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    // Фильтр по секции (из правого меню) - ТОЛЬКО для активных товаров
    if (selectedFilters.section) {
      result = result.filter((item) => {
        // Для списанных игнорируем фильтр по секции или показываем все
        if (isDisposal(item)) return true;
        return (item as Product).section === selectedFilters.section;
      });
    }

    // Фильтр по секции из левого меню - ТОЛЬКО для активных товаров
    if (selectedSection) {
      result = result.filter((item) => {
        // Для списанных игнорируем фильтр по секции или показываем все
        if (isDisposal(item)) return true;
        return (item as Product).section === selectedSection;
      });
    }

    // Фильтр по категории (работает для всех)
    if (selectedFilters.category) {
      result = result.filter(
        (item) => item.inventory_tools_type === selectedFilters.category,
      );
    }

    // Фильтр по помещению (работает для всех)
    if (selectedFilters.room) {
      result = result.filter((item) => item.room_name === selectedFilters.room);
    }

    // Фильтр по цене (работает для всех)
    if (priceFrom !== "") {
      result = result.filter((item) => item.price >= Number(priceFrom));
    }
    if (priceTo !== "") {
      result = result.filter((item) => item.price <= Number(priceTo));
    }

    // Поиск по категории (работает для всех)
    if (searchCategory) {
      result = result.filter((item) =>
        item.inventory_tools_type
          ?.toLowerCase()
          .includes(searchCategory.toLowerCase()),
      );
    }

    // Поиск по помещению (работает для всех)
    if (searchRoom) {
      result = result.filter((item) =>
        item.room_name?.toLowerCase().includes(searchRoom.toLowerCase()),
      );
    }

    // Сортировка (работает для всех)
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

  // Сброс всех фильтров
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
    // Состояния
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

    // Уникальные значения
    uniqueSections,
    uniqueCategories,
    uniqueRooms,

    // Результат фильтрации
    filteredProducts,

    // Функции для обновления
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
