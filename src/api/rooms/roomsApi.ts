// api/rooms/roomsApi.ts
import { apiClient } from "../client";
import { RoomsFloorsResponse, Floor, Room } from "../../types/room.types";

console.log("📁 Rooms API модуль загружен");

export const roomsApi = {
  getRoomsFloors: async (building?: string, legalEntity?: string) => {
    console.log("📦 Запрос списка комнат и этажей", { building, legalEntity });

    try {
      const response = await apiClient.get("/rooms_floors_list", {
        params: {
          building,
          legal_entity: legalEntity,
        },
      });
      console.log("✅ Комнаты и этажи получены:", response.data);
      return response.data as RoomsFloorsResponse;
    } catch (error: any) {
      console.error("❌ Ошибка получения комнат:", error);
      throw error;
    }
  },

  getAllRoomsFlat: async (building?: string, legalEntity?: string) => {
    console.log("📦 Запрос всех комнат (плоский список)");

    try {
      const response = await apiClient.get("/rooms_floors_list", {
        params: {
          building,
          legal_entity: legalEntity,
        },
      });
      const floors: Floor[] = response.data.floors || [];

      const allRooms: Room[] = [];
      floors.forEach((floor) => {
        floor.inventory_room?.forEach((room) => {
          allRooms.push({
            ...room,
            floor_number: floor.number,
            building: floor.building,
          });
        });
      });

      console.log("✅ Все комнаты (плоский список):", allRooms);
      return allRooms;
    } catch (error: any) {
      console.error("❌ Ошибка получения комнат:", error);
      throw error;
    }
  },
};
