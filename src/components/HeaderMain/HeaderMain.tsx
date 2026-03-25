import { useAuth } from "../../contexts/AuthContext";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import SearchModal from "../Modal/SearchModal/SearchModal";
import InventoryReportSelector from "../InventoryReportSelector/InventoryReportSelector";
import SelectReportForDisplay from "../SelectReportForDisplay/SelectReportForDisplay";
import "./HeaderMain.css";

interface HeaderMainProps {
  onInventoryModeChange?: (isActive: boolean) => void;
  onSelectReportForDisplay?: (reportId: string) => void;
  isInventoryMode?: boolean;
  selectedReportId?: string | null;
}

export default function HeaderMain({
  onInventoryModeChange,
  onSelectReportForDisplay,
  isInventoryMode: externalIsInventoryMode,
  selectedReportId,
}: HeaderMainProps) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isReportSelectorOpen, setIsReportSelectorOpen] = useState(false);
  const [isDisplaySelectorOpen, setIsDisplaySelectorOpen] = useState(false);
  const [internalInventoryMode, setInternalInventoryMode] = useState(false);

  const isInventoryMode =
    externalIsInventoryMode !== undefined
      ? externalIsInventoryMode
      : internalInventoryMode;

  const handleSectionClick = (sectionName: any) => {
    navigate("/catalog", {
      state: { selectedSection: sectionName },
    });
  };

  const handleInventoryResultsClick = () => {
    setIsDisplaySelectorOpen(true);
  };

  const handleReportSelectForDisplay = (reportId: string) => {
    const newMode = true;
    setInternalInventoryMode(newMode);
    onInventoryModeChange?.(newMode);
    onSelectReportForDisplay?.(reportId);
    setIsDisplaySelectorOpen(false);
  };

  const handleExitInventoryMode = () => {
    const newMode = false;
    setInternalInventoryMode(newMode);
    onInventoryModeChange?.(newMode);
  };

  const handleReportClick = () => {
    setIsReportSelectorOpen(true);
  };

  return (
    <>
      <header className="main-header">
        <div className="header__button">
          <button
            className={`reuslt ${isInventoryMode ? "active" : ""}`}
            onClick={
              isInventoryMode
                ? handleExitInventoryMode
                : handleInventoryResultsClick
            }
          >
            {isInventoryMode
              ? "Выйти из режима инвентаризации"
              : "Результаты инвентаризации"}
          </button>

          <button className="reuslt" onClick={handleReportClick}>
            Отчет инвентаризации
          </button>

          <button
            className="poisk__mz"
            onClick={() => setIsSearchModalOpen(true)}
          >
            Поиск МЦ
          </button>
        </div>

        <nav className="sections-nav">
          <a
            className="section1"
            href="#"
            onClick={(e) => {
              e.preventDefault();
              handleSectionClick("Административно-управленческая (Служебная)");
            }}
          >
            Административно-управленческая (служебная)
          </a>
          <a
            className="section2"
            href="#"
            onClick={(e) => {
              e.preventDefault();
              handleSectionClick("Гостевая");
            }}
          >
            Гостевая
          </a>
          <a
            className="section3"
            href="#"
            onClick={(e) => {
              e.preventDefault();
              handleSectionClick("Сценографическая");
            }}
          >
            Сценографическая
          </a>
          <button
            className="section4"
            onClick={() => handleSectionClick("Склад")}
          >
            Склад
          </button>
        </nav>

        <div className="user-info">
          {isInventoryMode && selectedReportId && (
            <span className="active-report-badge">
              Отчет: {selectedReportId.slice(0, 8)}...
            </span>
          )}
          <button onClick={logout} className="logout-btn">
            Выйти
          </button>
        </div>
      </header>

      <SearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
      />

      <InventoryReportSelector
        isOpen={isReportSelectorOpen}
        onClose={() => setIsReportSelectorOpen(false)}
      />

      <SelectReportForDisplay
        isOpen={isDisplaySelectorOpen}
        onClose={() => setIsDisplaySelectorOpen(false)}
        onSelectReport={handleReportSelectForDisplay}
      />
    </>
  );
}
