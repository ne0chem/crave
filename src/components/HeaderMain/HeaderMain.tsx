import { useAuth } from "../../contexts/DummyAuthContext";
import { Link } from "react-router-dom";
import { useState } from "react";
import SearchModal from "../Modal/SearchModal/SearchModal";
import "./HeaderMain.css";

export default function HeaderMain() {
  const { logout } = useAuth();
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  return (
    <>
      <header className="main-header">
        <div className="header__button">
          <button>Результаты инвентаризации</button>
          <button>Отчет инвентаризации</button>
          <button onClick={() => setIsSearchModalOpen(true)}>Поиск МЦ</button>
        </div>

        <nav className="sections-nav">
          {/* <Link
            to="/catalog"
            state={{
              selectedSection: "Административно-управленческая (служебная)",
            }}
            className="section-link"
          >
            Административно-управленческая
          </Link>

          <Link
            to="/catalog"
            state={{ selectedSection: "Гостевая" }}
            className="section-link"
          >
            Гостевая
          </Link>

          <Link
            to="/catalog"
            state={{ selectedSection: "Сценографическая" }}
            className="section-link"
          >
            Сценографическая
          </Link> */}

          <button className="section-link stock-btn">Склад</button>
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
    </>
  );
}
