import React, { createContext, useContext } from "react";

const DummyAuthContext = createContext({
  user: { id: "1", name: "Dev User", role: "admin" },
  isLoading: false,
  error: null,
  login: async () => {},
  logout: () => {},
});

export const DummyAuthProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <DummyAuthContext.Provider
      value={{
        user: { id: "1", name: "Dev User", role: "admin" },
        isLoading: false,
        error: null,
        login: async () => console.log("🧪 Dev login"),
        logout: () => console.log("🧪 Dev logout"),
      }}
    >
      {children}
    </DummyAuthContext.Provider>
  );
};

export const useAuth = () => useContext(DummyAuthContext);
