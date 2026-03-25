import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import Auth from "./pages/Auth/Auth";
import MainPage from "./pages/Main/Main";
import CatalogLayout from "./pages/Catalog/CatalogLayout";
import "./App.css";
import { memo, useMemo } from "react";

// Мемоизируем ProtectedRoute
const ProtectedRoute = memo(({ children }: { children: React.ReactNode }) => {
  const { token, isLoading } = useAuth();

  if (isLoading) {
    return <div className="loading-page">Загрузка...</div>;
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
});

// Выносим компоненты для маршрутов, чтобы они не создавались заново
const Category1 = memo(() => <div>Категория 1</div>);
const Category2 = memo(() => <div>Категория 2</div>);
const Category3 = memo(() => <div>Категория 3</div>);

function AppRoutes() {
  // Мемоизируем маршруты, чтобы они не пересоздавались
  const routes = useMemo(
    () => (
      <Routes>
        <Route path="/login" element={<Auth />} />

        <Route
          element={
            <ProtectedRoute>
              <CatalogLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/catalog" element={<Category1 />} />
          <Route path="/catalog/category1" element={<Category1 />} />
          <Route path="/catalog/category2" element={<Category2 />} />
          <Route path="/catalog/category3" element={<Category3 />} />
        </Route>

        <Route
          path="/main"
          element={
            <ProtectedRoute>
              <MainPage />
            </ProtectedRoute>
          }
        />

        <Route path="/" element={<Navigate to="/main" replace />} />
      </Routes>
    ),
    [],
  ); // Пустой массив зависимостей, так как маршруты статичны

  return routes;
}

function App() {
  return <AppRoutes />;
}

export default App;
