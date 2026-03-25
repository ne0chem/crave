import React, { createContext, useContext, useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { inventoryApi } from "../api/inventory/inventory.api";
import {
  InventoryReport,
  InventoryFilters,
  InventoryItem,
  InventoryActionData,
} from "../types/inventory.types";

interface InventoryContextType {
  reports: InventoryReport[] | undefined;
  currentReport: InventoryReport | null;
  selectedItem: InventoryItem | null;
  isLoading: boolean;
  error: Error | null;
  filters: InventoryFilters;

  setCurrentReport: (report: InventoryReport | null) => void;
  setFilters: (filters: InventoryFilters) => void;
  refreshReports: () => void;

  setSelectedItem: (item: InventoryItem | null) => void;
  confirmItem: (item: InventoryItem, roomInfo?: any) => Promise<void>;
  reportMissing: (item: InventoryItem, roomInfo?: any) => Promise<void>;
  moveItem: (item: InventoryItem, targetRoom: string) => Promise<void>;

  exportCurrentReport: (format?: "pdf" | "excel") => Promise<void>;
}

const InventoryContext = createContext<InventoryContextType | undefined>(
  undefined,
);

const INVENTORY_REPORTS_KEY = "inventory-reports";

export const InventoryProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const queryClient = useQueryClient();
  const [currentReport, setCurrentReport] = useState<InventoryReport | null>(
    null,
  );
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [filters, setFilters] = useState<InventoryFilters>({});

  const {
    data: reports,
    isLoading,
    error,
    refetch: refreshReports,
  } = useQuery({
    queryKey: [INVENTORY_REPORTS_KEY, filters],
    queryFn: () => inventoryApi.getReports(filters),
    staleTime: 5 * 60 * 1000,
  });

  const confirmMutation = useMutation({
    mutationFn: (data: InventoryActionData) =>
      inventoryApi.confirmCorrectItem(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [INVENTORY_REPORTS_KEY] });
    },
  });

  const missingMutation = useMutation({
    mutationFn: (data: InventoryActionData) =>
      inventoryApi.reportMissingItem(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [INVENTORY_REPORTS_KEY] });
    },
  });

  const moveMutation = useMutation({
    mutationFn: (data: InventoryActionData) =>
      inventoryApi.moveItemToCorrectRoom(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [INVENTORY_REPORTS_KEY] });
    },
  });

  const confirmItem = useCallback(
    async (item: InventoryItem, roomInfo?: any) => {
      await confirmMutation.mutateAsync({
        itemId: item.id,
        item,
        roomInfo,
        action: "confirm",
        timestamp: new Date().toISOString(),
      });
    },
    [confirmMutation],
  );

  const reportMissing = useCallback(
    async (item: InventoryItem, roomInfo?: any) => {
      await missingMutation.mutateAsync({
        itemId: item.id,
        item,
        roomInfo,
        action: "missing",
        timestamp: new Date().toISOString(),
      });
    },
    [missingMutation],
  );

  const moveItem = useCallback(
    async (item: InventoryItem, targetRoom: string) => {
      await moveMutation.mutateAsync({
        itemId: item.id,
        item,
        targetRoom,
        action: "move",
        timestamp: new Date().toISOString(),
      });
    },
    [moveMutation],
  );

  const exportCurrentReport = useCallback(
    async (format: "pdf" | "excel" = "pdf") => {
      if (!currentReport) return;
      await inventoryApi.exportReport(currentReport.report_id, format);
    },
    [currentReport],
  );

  const value = {
    reports,
    currentReport,
    selectedItem,
    isLoading,
    error: error as Error | null,
    filters,
    setCurrentReport,
    setFilters,
    refreshReports,
    setSelectedItem,
    confirmItem,
    reportMissing,
    moveItem,
    exportCurrentReport,
  };

  return (
    <InventoryContext.Provider value={value}>
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (context === undefined) {
    throw new Error("useInventory must be used within an InventoryProvider");
  }
  return context;
};
