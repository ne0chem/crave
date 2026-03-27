import { InventoryReport, InventoryRoom } from "../types/inventory.types";

export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    minimumFractionDigits: 0,
  }).format(price);
};

export const calculateTotalPrice = (items: any[] = []): number => {
  return items.reduce((sum, item) => sum + (item.price || 0), 0);
};

export const getReportStats = (report: InventoryReport) => {
  let totalCorrect = 0,
    totalMissing = 0,
    totalWrong = 0;
  let totalCorrectPrice = 0,
    totalMissingPrice = 0,
    totalWrongPrice = 0;

  report.rooms?.forEach((room: InventoryRoom) => {
    totalCorrect += room["correct-item"]?.length || 0;
    totalMissing += room["missing-item"]?.length || 0;
    totalWrong += room["wrong-room-item"]?.length || 0;

    totalCorrectPrice += calculateTotalPrice(room["correct-item"] || []);
    totalMissingPrice += calculateTotalPrice(room["missing-item"] || []);
    totalWrongPrice += calculateTotalPrice(room["wrong-room-item"] || []);
  });

  return {
    totalCorrect,
    totalMissing,
    totalWrong,
    totalCorrectPrice,
    totalMissingPrice,
    totalWrongPrice,
  };
};

export const getUniqueSections = (report: InventoryReport): string[] => {
  if (!report.rooms || !Array.isArray(report.rooms)) {
    return [];
  }

  const sections = report.rooms
    .map((room: InventoryRoom) => {
      return (room as any).room_section || room.section;
    })
    .filter(
      (s: string | undefined): s is string =>
        typeof s === "string" && s.trim() !== "",
    );

  return [...new Set(sections)];
};

export const formatRoomsList = (report: InventoryReport): string => {
  if (!report.rooms?.length) return "Нет комнат";

  const rooms = report.rooms.map((room: InventoryRoom) => {
    if (room.room_name && room.room_number) {
      return `${room.room_name} (${room.room_number})`;
    }
    return room.room_name || room.room_number || "Комната";
  });

  if (rooms.length === 1) return rooms[0];
  if (rooms.length > 3) {
    return `${rooms.slice(0, 3).join(", ")} и еще ${rooms.length - 3}`;
  }
  return rooms.join(", ");
};

export const formatSectionsWithStats = (report: InventoryReport): string => {
  if (!report.rooms?.length) return "Секции не указаны";

  const sections = report.rooms.reduce(
    (acc: Record<string, number>, room: InventoryRoom) => {
      const section = (room as any).room_section || room.section;
      if (section) {
        acc[section] = (acc[section] || 0) + 1;
      }
      return acc;
    },
    {},
  );

  const sectionsList = Object.entries(sections).map(
    ([section, count]) => `${section} (${count})`,
  );

  if (sectionsList.length === 0) return "Секции не указаны";
  if (sectionsList.length === 1) return sectionsList[0];
  if (sectionsList.length > 2) {
    return `${sectionsList.slice(0, 2).join(", ")} и еще ${sectionsList.length - 2}`;
  }
  return sectionsList.join(", ");
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};
