// components/HeaderMain/HeaderMain.tsx
import { useAuth } from "../../contexts/DummyAuthContext";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import SearchModal from "../Modal/SearchModal/SearchModal";
import InventoryReportSelector from "../InventoryReportSelector/InventoryReportSelector";
import "./HeaderMain.css";

interface HeaderMainProps {
  onInventoryModeChange?: (isActive: boolean) => void;
}

export default function HeaderMain({ onInventoryModeChange }: HeaderMainProps) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isReportSelectorOpen, setIsReportSelectorOpen] = useState(false);
  const [isInventoryMode, setIsInventoryMode] = useState(false);

  const handleSectionClick = (sectionName: any) => {
    navigate("/catalog", {
      state: { selectedSection: sectionName },
    });
  };

  const handleInventoryClick = () => {
    const newMode = !isInventoryMode;
    setIsInventoryMode(newMode);
    onInventoryModeChange?.(newMode);
  };

  return (
    <>
      <header className="main-header">
        <div className="header__button">
          <button
            className={`reuslt ${isInventoryMode ? "active" : ""}`}
            onClick={handleInventoryClick}
          >
            Результаты инвентаризации
          </button>

          <button
            className="reuslt"
            onClick={() => setIsReportSelectorOpen(true)}
          >
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
              handleSectionClick("Административно-управленческая (служебная)");
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
            className="section-link stock-btn"
            onClick={() => handleSectionClick("Склад")}
          >
            Склад
          </button>
        </nav>

        <div className="user-info">
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
    </>
  );
}
