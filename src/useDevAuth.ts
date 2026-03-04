// src/hooks/useDevAuth.ts
import { useEffect, useState } from "react";

export const useDevAuth = () => {
  const [devMode] = useState(() => {
    const stored = localStorage.getItem("dev_mode");

    // Если есть сохраненное значение, используем его
    if (stored !== null) {
      // Сохраняем как строку "true" или "false"
      return stored === "true"; // ✅ Исправлено: проверяем на "true", а не "false"
    }

    // По умолчанию true для разработки
    return true;
  });

  useEffect(() => {
    console.log(`🧪 DevMode: ${devMode ? "ВКЛ" : "ВЫКЛ"}`);

    // Функция для переключения режима через консоль
    (window as any).toggleDevMode = () => {
      const newMode = !devMode;
      localStorage.setItem("dev_mode", String(newMode));
      console.log(`🔄 Переключаем DevMode на: ${newMode ? "ВКЛ" : "ВЫКЛ"}`);
      window.location.reload();
    };

    console.log("🛠️ В консоли доступна: toggleDevMode()");
    console.log("   Пример: toggleDevMode() - переключить режим");
  }, [devMode]);

  return devMode;
};
