import { useProductFilters } from "../../hooks/useProductFilters";
import "./Filtres.css";

interface FiltersProps {
  filters: ReturnType<typeof useProductFilters>;
  rooms?: string[];
}

export default function Filtres({ filters, rooms = [] }: FiltersProps) {
  const {
    openFilter,
    sortType,
    priceFrom,
    priceTo,
    searchCategory,
    searchRoom,
    selectedFilters,
    searchSection,
    uniqueCategories,
    uniqueSections,
    uniqueRooms,
    setSortType,
    setPriceFrom,
    setPriceTo,
    setSearchCategory,
    setSearchRoom,
    setSelectedFilters,
    setSearchSection,
    toggleFilter,
    resetFilters,
  } = filters;

  const displayRooms = rooms.length > 0 ? rooms : uniqueRooms;

  return (
    <div className="poik__container">
      <div className="poisk">
        <ul className="filter-menu">
          {/* Сортировка */}
          <li className="filter-item">
            <button
              className={`filter-trigger ${openFilter === "sort" ? "active" : ""}`}
              onClick={() => toggleFilter("sort")}
            >
              Сортировка {sortType && "✓"}
            </button>
            <div
              className={`filter-content ${openFilter === "sort" ? "active" : ""}`}
            >
              <div className="sort-options">
                <a
                  href="#"
                  className={`sort-link ${sortType === "name-asc" ? "active" : ""}`}
                  onClick={(e) => {
                    e.preventDefault();
                    setSortType("name-asc");
                  }}
                >
                  От А до Я
                </a>
                <a
                  href="#"
                  className={`sort-link ${sortType === "name-desc" ? "active" : ""}`}
                  onClick={(e) => {
                    e.preventDefault();
                    setSortType("name-desc");
                  }}
                >
                  От Я до А
                </a>
                <a
                  href="#"
                  className={`sort-link ${sortType === "price-asc" ? "active" : ""}`}
                  onClick={(e) => {
                    e.preventDefault();
                    setSortType("price-asc");
                  }}
                >
                  Сначала дешевые
                </a>
                <a
                  href="#"
                  className={`sort-link ${sortType === "price-desc" ? "active" : ""}`}
                  onClick={(e) => {
                    e.preventDefault();
                    setSortType("price-desc");
                  }}
                >
                  Сначала дорогие
                </a>
              </div>
            </div>
          </li>

          {/* Стоимость */}
          <li className="filter-item">
            <button
              className={`filter-trigger ${openFilter === "price" ? "active" : ""}`}
              onClick={() => toggleFilter("price")}
            >
              Стоимость {(priceFrom !== "" || priceTo !== "") && "✓"}
            </button>
            <div
              className={`filter-content ${openFilter === "price" ? "active" : ""}`}
            >
              <div className="price-inputs">
                <input
                  type="number"
                  className="price-input"
                  placeholder="От"
                  value={priceFrom}
                  onChange={(e) =>
                    setPriceFrom(e.target.value ? Number(e.target.value) : "")
                  }
                />
                <input
                  type="number"
                  className="price-input"
                  placeholder="До"
                  value={priceTo}
                  onChange={(e) =>
                    setPriceTo(e.target.value ? Number(e.target.value) : "")
                  }
                />
              </div>
            </div>
          </li>

          {/* Категории */}
          <li className="filter-item">
            <button
              className={`filter-trigger ${openFilter === "categories" ? "active" : ""}`}
              onClick={() => toggleFilter("categories")}
            >
              Категории {selectedFilters.category && "✓"}
            </button>
            <div
              className={`filter-content ${openFilter === "categories" ? "active" : ""}`}
            >
              <input
                type="text"
                className="filter-input"
                placeholder="🔍 Поиск категории..."
                value={searchCategory}
                onChange={(e) => setSearchCategory(e.target.value)}
              />
              <div className="filter-list">
                {uniqueCategories
                  .filter((cat) =>
                    cat.toLowerCase().includes(searchCategory.toLowerCase()),
                  )
                  .map((cat) => (
                    <div
                      key={cat}
                      className={`filter-list-item ${selectedFilters.category === cat ? "active" : ""}`}
                      onClick={() =>
                        setSelectedFilters((prev) => ({
                          ...prev,
                          category: prev.category === cat ? "" : cat,
                        }))
                      }
                      style={{
                        cursor: "pointer",
                        backgroundColor:
                          selectedFilters.category === cat
                            ? "#e6f7ff"
                            : "transparent",
                      }}
                    >
                      {cat}
                    </div>
                  ))}
              </div>
            </div>
          </li>

          {/* Секции */}
          <li className="filter-item">
            <button
              className={`filter-trigger ${openFilter === "sections" ? "active" : ""}`}
              onClick={() => toggleFilter("sections")}
            >
              Секции {selectedFilters.section && "✓"}
            </button>
            <div
              className={`filter-content ${openFilter === "sections" ? "active" : ""}`}
            >
              <input
                type="text"
                className="filter-input"
                placeholder="🔍 Поиск секции..."
                value={searchSection}
                onChange={(e) => setSearchSection(e.target.value)}
              />
              <div className="filter-list">
                {uniqueSections
                  .filter((section) =>
                    section.toLowerCase().includes(searchSection.toLowerCase()),
                  )
                  .map((section) => (
                    <div
                      key={section}
                      className={`filter-list-item ${selectedFilters.section === section ? "active" : ""}`}
                      onClick={() =>
                        setSelectedFilters((prev) => ({
                          ...prev,
                          section: prev.section === section ? "" : section,
                        }))
                      }
                      style={{
                        cursor: "pointer",
                        backgroundColor:
                          selectedFilters.section === section
                            ? "#e6f7ff"
                            : "transparent",
                      }}
                    >
                      {section}
                    </div>
                  ))}
              </div>
            </div>
          </li>

          {/* Помещения */}
          <li className="filter-item">
            <button
              className={`filter-trigger ${openFilter === "rooms" ? "active" : ""}`}
              onClick={() => toggleFilter("rooms")}
            >
              Помещения {selectedFilters.room && "✓"}
            </button>
            <div
              className={`filter-content ${openFilter === "rooms" ? "active" : ""}`}
            >
              <input
                type="text"
                className="filter-input"
                placeholder="🔍 Поиск помещения..."
                value={searchRoom}
                onChange={(e) => setSearchRoom(e.target.value)}
              />
              <div className="filter-list">
                {displayRooms
                  .filter((room) =>
                    room.toLowerCase().includes(searchRoom.toLowerCase()),
                  )
                  .map((room) => (
                    <div
                      key={room}
                      className={`filter-list-item ${selectedFilters.room === room ? "active" : ""}`}
                      onClick={() =>
                        setSelectedFilters((prev) => ({
                          ...prev,
                          room: prev.room === room ? "" : room,
                        }))
                      }
                      style={{
                        cursor: "pointer",
                        backgroundColor:
                          selectedFilters.room === room
                            ? "#e6f7ff"
                            : "transparent",
                      }}
                    >
                      {room}
                    </div>
                  ))}
              </div>
            </div>
          </li>
        </ul>

        <div className="search-container">
          <button className="newtype2" id="showAllBtn" onClick={resetFilters}>
            Сбросить все фильтры
          </button>
        </div>
      </div>
    </div>
  );
}
