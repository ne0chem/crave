/* логика отображение цветов */
import { useMemo } from "react";
import { InventoryItem, isDisposal, Product } from "../types/product.types";

// Пастельные цвета для категорий товаров
const CATEGORY_COLORS = [
  "#E6D5B8", // песочный
  "#D4E2D4", // мятно-зеленый
  "#E8D0B3", // кремовый
  "#D5C7E8", // лавандовый
  "#F5D7D7", // бледно-розовый
  "#C4D7E0", // голубовато-серый
  "#E2CFC4", // телесный
  "#D1E0D7", // светлый шалфей
  "#E8D3D0", // пудрово-розовый
  "#D9D0C9", // серо-бежевый
  "#D6E0E8", // светлый блюз
  "#E0D3D0", // розовато-серый
];

// Цвета секций (только для активных товаров)
const SECTION_COLORS = ["#916ed3", "#53dddd", "#6ac07b"];

// Добавим цвет для списанных товаров (если нужно)
const WRITTEN_OFF_COLOR = "#dc3545"; // красный для списанных

export const useProductColors = (items: InventoryItem[]) => {
  // Мемоизируем уникальные категории из всех товаров
  const uniqueCategories = useMemo(
    () =>
      items
        ? [...new Set(items.map((item) => item.inventory_tools_type))].filter(
            Boolean,
          )
        : [],
    [items],
  );

  // Создаем Map для соответствия категория -> цвет
  const categoryColorMap = useMemo(() => {
    const map = new Map();
    uniqueCategories.forEach((category, index) => {
      map.set(category, CATEGORY_COLORS[index % CATEGORY_COLORS.length]);
    });
    return map;
  }, [uniqueCategories]);

  // Функция получения цвета категории (работает для всех товаров)
  const getCategoryColor = (category: string): string => {
    return categoryColorMap.get(category) || "#ccc";
  };

  // Функция получения цвета для товара с учетом статуса
  const getItemColor = (item: InventoryItem): string => {
    // Если товар списан - возвращаем красный цвет
    if (isDisposal(item)) {
      return WRITTEN_OFF_COLOR;
    }
    // Если активный - цвет по категории
    return getCategoryColor(item.inventory_tools_type);
  };

  // Функция получения цвета секции по индексу (только для активных товаров)
  const getSectionColor = (index: number): string => {
    return SECTION_COLORS[index % SECTION_COLORS.length];
  };

  // Для каждой секции получаем ее цвет (только из активных товаров)
  const sectionColorsMap = useMemo(() => {
    const map = new Map();
    // Берем только активные товары для секций
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

  // Функция получения цвета секции по названию (только для активных товаров)
  const getSectionColorByName = (section: string): string => {
    return sectionColorsMap.get(section) || "#ccc";
  };

  // Функция получения цвета для отображения в левом меню
  const getLeftMenuColor = (section: string, index: number): string => {
    return getSectionColor(index);
  };

  // Статистика по категориям (для всех товаров)
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
    getItemColor, // 👈 НОВОЕ: цвет с учетом статуса
    getLeftMenuColor, // 👈 НОВОЕ: для левого меню
    uniqueCategories,
    categoryColorMap,
    sectionColorsMap,
    categoryStats, // 👈 НОВОЕ: статистика по категориям
    // Если нужны сами массивы цветов
    categoryColors: CATEGORY_COLORS,
    sectionColors: SECTION_COLORS,
    writtenOffColor: WRITTEN_OFF_COLOR, // 👈 НОВОЕ
  };
};
