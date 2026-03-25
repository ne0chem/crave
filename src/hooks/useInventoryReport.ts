import { useState, useEffect, useCallback } from "react";
import { inventoryApi } from "../api/inventory/inventory.api";
import {
  InventoryReport,
  RoomInventoryStatus,
  RoomInventoryDetails,
} from "../types/inventory.types";

export const useInventoryReport = () => {
  const [reports, setReports] = useState<InventoryReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<InventoryReport | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadReports = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await inventoryApi.getReports();
      setReports(data);
    } catch (err: any) {
      setError(err.message || "Ошибка загрузки отчетов");
      console.error("Ошибка загрузки отчетов:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadReportById = useCallback(
    async (reportId: string) => {
      console.log("🔍 loadReportById вызван с ID:", reportId);
      setLoading(true);
      setError(null);
      try {
        const existingReport = reports.find((r) => r.report_id === reportId);
        if (existingReport) {
          console.log("✅ Отчет найден в кэше:", existingReport);
          setSelectedReport(existingReport);
          setLoading(false);
          return;
        }

        const data = await inventoryApi.getReportById(reportId);
        console.log("✅ Отчет получен с сервера:", data);
        setSelectedReport(data);
      } catch (err: any) {
        console.error("❌ Ошибка загрузки отчета:", err);
        setError(err.message || "Ошибка загрузки отчета");
      } finally {
        setLoading(false);
      }
    },
    [reports],
  );

  const getRoomStatus = useCallback(
    (roomId: string): RoomInventoryStatus | null => {
      console.log("🔍 getRoomStatus вызван для roomId:", roomId);
      console.log("📊 selectedReport:", selectedReport?.report_id);
      console.log(
        "📊 Комнаты в отчете:",
        selectedReport?.rooms?.map((r) => ({
          id: r.room_id,
          name: r.room_name,
        })),
      );

      if (!selectedReport?.rooms) {
        console.log("⚠️ Нет отчета или комнат");
        return null;
      }

      const roomData = selectedReport.rooms.find((r) => r.room_id === roomId);

      if (!roomData) {
        console.log(`❌ Комната с ID ${roomId} не найдена в отчете`);
        console.log(
          "Доступные ID:",
          selectedReport.rooms.map((r) => r.room_id),
        );
        return null;
      }

      console.log(`✅ Найдена комната: ${roomData.room_name}`, roomData);

      const correctItems = roomData["correct-item"] || [];
      const missingItems = roomData["missing-item"] || [];
      const wrongItems = roomData["wrong-room-item"] || [];

      const correctCount = correctItems.length;
      const missingCount = missingItems.length;
      const wrongCount = wrongItems.length;

      const correctPrice = correctItems.reduce(
        (sum, item) => sum + (item.price || 0),
        0,
      );
      const missingPrice = missingItems.reduce(
        (sum, item) => sum + (item.price || 0),
        0,
      );
      const wrongPrice = wrongItems.reduce(
        (sum, item) => sum + (item.price || 0),
        0,
      );

      let status: "success" | "warning" | "danger" = "success";
      if (missingCount > 0 || wrongCount > 0) {
        status = missingCount > 0 ? "danger" : "warning";
      }

      return {
        status,
        correctCount,
        missingCount,
        wrongCount,
        correctPrice,
        missingPrice,
        wrongPrice,
        totalPrice: correctPrice + missingPrice + wrongPrice,
        hasMissing: missingCount > 0,
        hasWrong: wrongCount > 0,
      };
    },
    [selectedReport],
  );

  const getRoomDetails = useCallback(
    (roomId: string): RoomInventoryDetails | null => {
      if (!selectedReport?.rooms) return null;

      const roomData = selectedReport.rooms.find((r) => r.room_id === roomId);

      if (!roomData) return null;

      const correct = (roomData["correct-item"] || []).map((item) => ({
        id: item.id,
        name: item.name,
        inventory_tools_type: item.inventory_tools_type,
        description: item.description,
        inv_number: item.inv_number,
        price: item.price,
        rfid: item.rfid,
        created_at: item.created_at,
        updated_at: item.updated_at,
        room_name: roomData.room_name,
        room_number: roomData.room_number,
      }));

      const missing = (roomData["missing-item"] || []).map((item) => ({
        id: item.id,
        name: item.name,
        inventory_tools_type: item.inventory_tools_type,
        description: item.description,
        inv_number: item.inv_number,
        price: item.price,
        rfid: item.rfid,
        created_at: item.created_at,
        updated_at: item.updated_at,
        expectedRoom: item.expected_room || roomData.room_number,
        currentLocation: item.current_location || "Не найдено",
      }));

      const wrong = (roomData["wrong-room-item"] || []).map((item) => ({
        id: item.id,
        name: item.name,
        inventory_tools_type: item.inventory_tools_type,
        description: item.description,
        inv_number: item.inv_number,
        price: item.price,
        rfid: item.rfid,
        created_at: item.created_at,
        updated_at: item.updated_at,
        expectedRoom: item.room_number || "?",
        currentRoom: roomData.room_number,
      }));

      return {
        correct,
        missing,
        wrong,
      };
    },
    [selectedReport],
  );

  const getReportRooms = useCallback(() => {
    if (!selectedReport?.rooms) return [];
    return selectedReport.rooms.map((room) => ({
      id: room.room_id,
      name: room.room_name,
      number: room.room_number,
      section: room.section,
    }));
  }, [selectedReport]);

  const getReportStats = useCallback(() => {
    if (!selectedReport?.rooms) {
      return {
        totalCorrect: 0,
        totalMissing: 0,
        totalWrong: 0,
        totalCorrectPrice: 0,
        totalMissingPrice: 0,
        totalWrongPrice: 0,
      };
    }

    let totalCorrect = 0;
    let totalMissing = 0;
    let totalWrong = 0;
    let totalCorrectPrice = 0;
    let totalMissingPrice = 0;
    let totalWrongPrice = 0;

    selectedReport.rooms.forEach((room) => {
      const correctItems = room["correct-item"] || [];
      const missingItems = room["missing-item"] || [];
      const wrongItems = room["wrong-room-item"] || [];

      totalCorrect += correctItems.length;
      totalMissing += missingItems.length;
      totalWrong += wrongItems.length;

      totalCorrectPrice += correctItems.reduce(
        (sum, item) => sum + (item.price || 0),
        0,
      );
      totalMissingPrice += missingItems.reduce(
        (sum, item) => sum + (item.price || 0),
        0,
      );
      totalWrongPrice += wrongItems.reduce(
        (sum, item) => sum + (item.price || 0),
        0,
      );
    });

    return {
      totalCorrect,
      totalMissing,
      totalWrong,
      totalCorrectPrice,
      totalMissingPrice,
      totalWrongPrice,
    };
  }, [selectedReport]);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  return {
    reports,
    selectedReport,
    loading,
    error,
    loadReports,
    loadReportById,
    getRoomStatus,
    getRoomDetails,
    getReportRooms,
    getReportStats,
  };
};
