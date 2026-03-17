// hooks/useInventoryReport.ts
import { useState, useEffect } from "react";
import { inventoryApi } from "../api/inventory/inventory.api";
import {
  InventoryReport,
  NestedInventoryReport,
  InventoryRoom,
  RoomInventoryStatus,
  RoomInventoryDetails, // 👈 ЭТОТ ИМПОРТ ВАЖЕН!
  CorrectItem,
  MissingItem,
  WrongRoomItem,
} from "../types/inventory.types";

export const useInventoryReport = () => {
  const [reports, setReports] = useState<InventoryReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<InventoryReport | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Загрузка всех отчетов
  const loadReports = async () => {
    setLoading(true);
    try {
      const data = await inventoryApi.getReports();
      setReports(data);
      // Автоматически выбираем последний отчет
      if (data.length > 0) {
        setSelectedReport(data[0]);
      }
    } catch (err) {
      setError("Ошибка загрузки отчетов");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Загрузка конкретного отчета
  const loadReportById = async (reportId: string) => {
    setLoading(true);
    try {
      const report = await inventoryApi.getReportById(reportId);
      setSelectedReport(report);
    } catch (err) {
      setError("Ошибка загрузки отчета");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Получение статуса для конкретной комнаты
  const getRoomStatus = (roomId: string): RoomInventoryStatus | null => {
    if (!selectedReport) return null;

    // Ищем комнату в основном массиве rooms
    const room = selectedReport.rooms?.find((r) => r.room_id === roomId);

    if (!room) {
      // Ищем в wrong-room-item (там могут быть вложенные отчеты)
      const nestedReports = selectedReport[
        "wrong-room-item"
      ] as NestedInventoryReport[];

      for (const nestedReport of nestedReports) {
        const foundRoom = nestedReport.rooms?.find((r) => r.room_id === roomId);
        if (foundRoom) {
          return calculateRoomStatus(foundRoom, roomId);
        }
      }
      return null;
    }

    return calculateRoomStatus(room, roomId);
  };

  // Вспомогательная функция для расчета статуса комнаты
  const calculateRoomStatus = (
    room: InventoryRoom,
    roomId: string,
  ): RoomInventoryStatus => {
    const correct = room["correct-item"] || [];
    const missing = room["missing-item"] || [];
    const wrong = room["wrong-room-item"] || [];

    const correctCount = correct.length;
    const missingCount = missing.length;
    const wrongCount = wrong.length;
    const totalItems = correctCount + missingCount + wrongCount;

    const correctPrice = correct.reduce(
      (sum: number, item: CorrectItem) => sum + (item.price || 0),
      0,
    );
    const missingPrice = missing.reduce(
      (sum: number, item: MissingItem) => sum + (item.price || 0),
      0,
    );
    const wrongPrice = wrong.reduce(
      (sum: number, item: WrongRoomItem) => sum + (item.price || 0),
      0,
    );

    // Определяем статус
    let status: "success" | "warning" | "danger" | "pending" = "success";
    const hasMissing = missingCount > 0;
    const hasWrong = wrongCount > 0;
    const hasIssues = hasMissing || hasWrong;

    if (hasIssues) {
      if (missingCount > 0 && wrongCount > 0) status = "danger";
      else if (missingCount > 0) status = "danger";
      else if (wrongCount > 0) status = "warning";
    }

    return {
      roomId,
      roomNumber: room.room_number,
      roomName: room.room_name,
      status,
      correctCount,
      missingCount,
      wrongCount,
      totalItems,
      correctPrice,
      missingPrice,
      wrongPrice,
      totalPrice: correctPrice + missingPrice + wrongPrice,
      hasIssues,
      hasMissing,
      hasWrong,
    };
  };

  // Получение деталей комнаты
  const getRoomDetails = (roomId: string): RoomInventoryDetails | null => {
    if (!selectedReport) return null;

    // Ищем в основном массиве rooms
    const room = selectedReport.rooms?.find((r) => r.room_id === roomId);

    if (room) {
      return {
        correct: room["correct-item"] || [],
        missing: room["missing-item"] || [],
        wrong: room["wrong-room-item"] || [],
      };
    }

    // Ищем во вложенных отчетах
    const nestedReports = selectedReport[
      "wrong-room-item"
    ] as NestedInventoryReport[];
    for (const nestedReport of nestedReports) {
      const foundRoom = nestedReport.rooms?.find((r) => r.room_id === roomId);
      if (foundRoom) {
        return {
          correct: foundRoom["correct-item"] || [],
          missing: foundRoom["missing-item"] || [],
          wrong: foundRoom["wrong-room-item"] || [],
        };
      }
    }

    return null;
  };

  useEffect(() => {
    loadReports();
  }, []);

  return {
    reports,
    selectedReport,
    loading,
    error,
    loadReports,
    loadReportById,
    getRoomStatus,
    getRoomDetails,
  };
};
