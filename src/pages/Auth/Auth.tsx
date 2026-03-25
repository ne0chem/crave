import { useState, useCallback, memo } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import "./Auth.css";

function Auth() {
  const [formData, setFormData] = useState({
    login: "",
    password: "",
  });
  const [localError, setLocalError] = useState("");

  const { login, isLoading, error } = useAuth();
  const navigate = useNavigate();

  // Мемоизируем обработчик изменения
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setLocalError("");
  }, []);

  // Мемоизируем обработчик отправки
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setLocalError("");

      if (!formData.login.trim() || !formData.password.trim()) {
        setLocalError("Заполните все поля");
        return;
      }

      try {
        await login({
          login: formData.login,
          password: formData.password,
        });

        navigate("/main", { replace: true });
      } catch (err) {
        // Ошибка уже обрабатывается в AuthContext
        console.error("Ошибка входа:", err);
      }
    },
    [formData.login, formData.password, login, navigate],
  );

  // Мемоизируем значение ошибки для отображения
  const displayError = error || localError;

  return (
    <div className="auth">
      <div className="auth__container">
        <div className="auth__header">
          <h1 className="auth__title">Добро пожаловать</h1>
          <p className="auth__subtitle">Войдите в свой аккаунт</p>
        </div>

        {displayError && <div className="auth__error">{displayError}</div>}

        <form className="auth__form" onSubmit={handleSubmit}>
          <div className="auth__input-group">
            <label htmlFor="login" className="auth__label">
              Логин
            </label>
            <input
              className={`auth__input ${displayError ? "auth__input--error" : ""}`}
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
              className={`auth__input ${displayError ? "auth__input--error" : ""}`}
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

// Мемоизируем компонент
export default memo(Auth);
