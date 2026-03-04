// App.tsx
import { Routes, Route, Navigate } from "react-router-dom";
// import { useAuth } from "./contexts/AuthContext";
import { useAuth } from "./contexts/DummyAuthContext";
import Auth from "./pages/Auth/Auth";
import MainPage from "./pages/Main/Main";
import CatalogLayout from "./pages/Catalog/CatalogLayout"; // ← исправил путь
import "./App.css";

// const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
//   const { token, isLoading } = useAuth();

//   if (isLoading) {
//     return <div className="loading-page">Загрузка...</div>;
//   }

//   if (!token) {
//     return <Navigate to="/login" replace />;
//   }

//   return <>{children}</>;
// };

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Auth />} />

      {/* Все маршруты каталога обернуты в ProtectedRoute и CatalogLayout */}
      <Route
        element={
          // <ProtectedRoute>
          <CatalogLayout />
          // </ProtectedRoute>
        }
      >
        <Route path="/catalog" element={<div>Категория 1</div>} />{" "}
        {/* основной каталог */}
        <Route path="/catalog/category1" element={<div>Категория 1</div>} />
        <Route path="/catalog/category2" element={<div>Категория 2</div>} />
        <Route path="/catalog/category3" element={<div>Категория 3</div>} />
      </Route>

      <Route
        path="/main"
        element={
          // <ProtectedRoute>
          <MainPage />
          // </ProtectedRoute>
        }
      />

      <Route path="/" element={<Navigate to="/main" replace />} />
    </Routes>
  );
}

export default App;
