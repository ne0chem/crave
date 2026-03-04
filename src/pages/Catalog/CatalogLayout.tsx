import "./CatalogLayout.css"; // создадим файл со стилями

import Main from "../../components/Main/Main";

const CatalogLayout = () => {
  return (
    <div className="catalog-layout">
      <div className="container">
        <main className="catalog-main">
          <Main />
        </main>
      </div>
    </div>
  );
};

export default CatalogLayout;
