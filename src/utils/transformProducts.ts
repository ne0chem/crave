import { Product } from "../types/product.types";

export interface Floor {
  floor_id: string;
  number: number;
  building: string;
  inventory_room: InventoryRoom[];
}

export interface InventoryRoom {
  room_id: string;
  number: string;
  name: string;
  section?: string;
  inventory_tools?: Product[];
}

export const transformFloorsToProducts = (floors: Floor[]): Product[] => {
  const products: Product[] = [];

  floors.forEach((floor) => {
    floor.inventory_room?.forEach((room) => {
      if (room.inventory_tools && room.inventory_tools.length > 0) {
        room.inventory_tools.forEach((tool) => {
          products.push({
            ...tool,
            floor_number: floor.number,
            room_name: room.name,
            room_number: room.number,
            room_id: room.room_id,
            building: floor.building,

            section: room.section || tool.section || "Без секции",
            roomInfo: {
              id: room.room_id,
              number: room.number,
              name: room.name,
              floor: floor.number,
            },
          });
        });
      }
    });
  });

  console.log(`📊 Трансформировано ${products.length} товаров из floors`);
  if (products.length > 0) {
    console.log("📋 Пример товара после трансформации:", {
      id: products[0].id,
      name: products[0].name,
      section: products[0].section,
      room_name: products[0].room_name,
    });
  }
  return products;
};

export const getUniqueSections = (products: Product[]): string[] => {
  const sections = new Set<string>();
  products.forEach((product) => {
    if (product.section && product.section !== "Без секции") {
      sections.add(product.section);
    }
  });
  return Array.from(sections).sort();
};

export const filterProductsBySection = (
  products: Product[],
  selectedSection: string | null,
): Product[] => {
  if (!selectedSection) return products;
  return products.filter((product) => product.section === selectedSection);
};
