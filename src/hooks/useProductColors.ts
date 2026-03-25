import { useMemo } from "react";
import { InventoryItem, isDisposal, Product } from "../types/product.types";

const CATEGORY_COLORS = [
  "#E6D5B8",
  "#D4E2D4",
  "#E8D0B3",
  "#D5C7E8",
  "#F5D7D7",
  "#C4D7E0",
  "#E2CFC4",
  "#D1E0D7",
  "#E8D3D0",
  "#D9D0C9",
  "#D6E0E8",
  "#E0D3D0",
];

const SECTION_COLORS = ["#916ed3", "#53dddd", "#a2c05d", "#5dc071"];

const WRITTEN_OFF_COLOR = "#dc3545";

export const useProductColors = (items: InventoryItem[]) => {
  const uniqueCategories = useMemo(
    () =>
      items
        ? [...new Set(items.map((item) => item.inventory_tools_type))].filter(
            Boolean,
          )
        : [],
    [items],
  );

  const categoryColorMap = useMemo(() => {
    const map = new Map();
    uniqueCategories.forEach((category, index) => {
      map.set(category, CATEGORY_COLORS[index % CATEGORY_COLORS.length]);
    });
    return map;
  }, [uniqueCategories]);

  const getCategoryColor = (category: string): string => {
    return categoryColorMap.get(category) || "#ccc";
  };

  const getItemColor = (item: InventoryItem): string => {
    if (isDisposal(item)) {
      return WRITTEN_OFF_COLOR;
    }

    return getCategoryColor(item.inventory_tools_type);
  };

  const getSectionColor = (index: number): string => {
    return SECTION_COLORS[index % SECTION_COLORS.length];
  };

  const sectionColorsMap = useMemo(() => {
    const map = new Map();

    const activeProducts = items.filter(
      (item): item is Product => !isDisposal(item),
    );

    if (activeProducts.length > 0) {
      const uniqueSections = [
        ...new Set(activeProducts.map((p) => p.section)),
      ].filter(Boolean);

      uniqueSections.forEach((section, index) => {
        map.set(section, getSectionColor(index));
      });
    }
    return map;
  }, [items]);

  const getSectionColorByName = (section: string): string => {
    return sectionColorsMap.get(section) || "#ccc";
  };

  const getLeftMenuColor = (section: string, index: number): string => {
    return getSectionColor(index);
  };

  const categoryStats = useMemo(() => {
    const stats = new Map();
    items.forEach((item) => {
      const category = item.inventory_tools_type;
      const current = stats.get(category) || { total: 0, writtenOff: 0 };
      stats.set(category, {
        total: current.total + 1,
        writtenOff: current.writtenOff + (isDisposal(item) ? 1 : 0),
      });
    });
    return stats;
  }, [items]);

  return {
    getCategoryColor,
    getSectionColor,
    getSectionColorByName,
    getItemColor,
    getLeftMenuColor,
    uniqueCategories,
    categoryColorMap,
    sectionColorsMap,
    categoryStats,

    categoryColors: CATEGORY_COLORS,
    sectionColors: SECTION_COLORS,
    writtenOffColor: WRITTEN_OFF_COLOR,
  };
};
