import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { roomsApi } from "../api/rooms/roomsApi";
import { Floor, Room } from "../types/room.types";

console.log("📁 RoomsContext модуль загружен");

interface RoomsContextType {
  floors: Floor[];
  rooms: Room[];
  isLoading: boolean;
  error: string | null;
  fetchRooms: () => Promise<void>;
  getRoomsByBuilding: (building: string) => Room[];
  getRoomsByFloor: (floorNumber: number, building: string) => Room[];
}

const RoomsContext = createContext<RoomsContextType | undefined>(undefined);

export const RoomsProvider = ({ children }: { children: React.ReactNode }) => {
  const [floors, setFloors] = useState<Floor[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRooms = useCallback(async () => {
    console.log("🔄 Загрузка комнат...");
    setIsLoading(true);
    setError(null);

    try {
      const response = await roomsApi.getRoomsFloors();
      console.log("📦 Ответ от API комнат:", response);

      const floorsData = response.floors || [];
      setFloors(floorsData);

      const allRooms: Room[] = [];
      floorsData.forEach((floor: any) => {
        const roomsArray = floor.room || floor.inventory_room || [];
        roomsArray.forEach((room: any) => {
          allRooms.push({
            room_id: room.id,
            id: room.id,
            number: room.number,
            name: room.name,
            section: room.section,
            floor_number: floor.number || floor.name,
            building: floor.building,
            floor: floor.number || floor.name,
          });
        });
      });

      const sortedRooms = allRooms.sort((a, b) => {
        const numA = parseInt(a.number) || 0;
        const numB = parseInt(b.number) || 0;
        return numA - numB;
      });

      setRooms(sortedRooms);

      console.log("✅ Комнаты загружены и отсортированы:", {
        floors: floorsData.length,
        rooms: sortedRooms.length,
        firstRooms: sortedRooms
          .slice(0, 5)
          .map((r) => `${r.number} - ${r.name}`),
      });
    } catch (err: any) {
      console.error("❌ Ошибка загрузки комнат:", err);
      setError(err.message || "Ошибка загрузки комнат");
      setFloors([]);
      setRooms([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getRoomsByBuilding = useCallback(
    (building: string) => {
      return rooms.filter((room) => room.building === building);
    },
    [rooms],
  );

  const getRoomsByFloor = useCallback(
    (floorNumber: number, building: string) => {
      const floor = floors.find(
        (f) =>
          (f.number === floorNumber || f.name === floorNumber) &&
          f.building === building,
      );

      return (floor as any)?.room || (floor as any)?.inventory_room || [];
    },
    [floors],
  );

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  return (
    <RoomsContext.Provider
      value={{
        floors,
        rooms,
        isLoading,
        error,
        fetchRooms,
        getRoomsByBuilding,
        getRoomsByFloor,
      }}
    >
      {children}
    </RoomsContext.Provider>
  );
};

export const useRooms = () => {
  const context = useContext(RoomsContext);
  if (!context) {
    throw new Error("useRooms must be used within RoomsProvider");
  }
  return context;
};
