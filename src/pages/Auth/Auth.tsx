import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import "./Auth.css";

export default function Auth() {
  const [formData, setFormData] = useState({
    login: "",
    password: "",
  });
  const [localError, setLocalError] = useState("");

  const { login, isLoading, error } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setLocalError("");
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLocalError("");

    if (!formData.login.trim() || !formData.password.trim()) {
      setLocalError("Заполните все поля");
      return;
    }

    try {
      console.log("📤 Отправка данных для входа:", {
        login: formData.login,
        password: "***",
      });

      await login({
        login: formData.login,
        password: formData.password,
      });

      console.log("✅ Вход выполнен успешно");

      const token = localStorage.getItem("token");
      const user = localStorage.getItem("user");
      console.log("🔑 Токен после входа:", token ? "есть" : "нет");
      console.log(
        "👤 Пользователь после входа:",
        user ? JSON.parse(user) : "нет",
      );

      navigate("/main", { replace: true });
      console.log("🔄 Редирект на /main выполнен");
    } catch (err) {
      console.error("❌ Ошибка входа в handleSubmit:", err);
    }
  };

  return (
    <div className="auth">
      <div className="auth__container">
        <div className="auth__header">
          <h1 className="auth__title">Добро пожаловать</h1>
          <p className="auth__subtitle">Войдите в свой аккаунт</p>
        </div>

        {(error || localError) && (
          <div className="auth__error">{error || localError}</div>
        )}

        <form className="auth__form" onSubmit={handleSubmit}>
          <div className="auth__input-group">
            <label htmlFor="login" className="auth__label">
              Логин
            </label>
            <input
              className={`auth__input ${error || localError ? "auth__input--error" : ""}`}
              type="text"
              name="login"
              id="login"
              value={formData.login}
              onChange={handleChange}
              placeholder="Введите ваш логин"
              disabled={isLoading}
              autoComplete="username"
            />
          </div>

          <div className="auth__input-group">
            <label htmlFor="password" className="auth__label">
              Пароль
            </label>
            <input
              className={`auth__input ${error || localError ? "auth__input--error" : ""}`}
              type="password"
              name="password"
              id="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Введите ваш пароль"
              disabled={isLoading}
              autoComplete="current-password"
            />
          </div>

          <button type="submit" className="auth__button" disabled={isLoading}>
            {isLoading ? "Вход..." : "Войти в аккаунт"}
          </button>
        </form>

        {isLoading && (
          <div className="auth__loading">
            <div className="auth__spinner"></div>
          </div>
        )}
      </div>
    </div>
  );
}
