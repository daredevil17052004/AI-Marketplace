"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import {
  StoredUser,
  getAccessToken,
  getRefreshToken,
  getSavedUser,
  saveTokens,
  clearTokens,
} from "@/lib/auth";
import { login as apiLogin, register as apiRegister, logout as apiLogout, fetchCreditBalance } from "@/lib/api";

interface AuthContextType {
  user: StoredUser | null;
  accessToken: string | null;
  balance: number;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshBalance: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<StoredUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [balance, setBalance] = useState<number>(50);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshBalance = useCallback(async () => {
    try {
      const res = await fetchCreditBalance();
      setBalance(res.balance);
    } catch {
      // keep current balance
    }
  }, []);

  // Silent refresh / restore session on mount
  useEffect(() => {
    async function initAuth() {
      try {
        const storedUser = getSavedUser();
        const access = getAccessToken();
        const refresh = getRefreshToken();

        if (access && storedUser) {
          setUser(storedUser);
          setAccessToken(access);
          await refreshBalance();
        } else if (refresh) {
          // Attempt refresh
          const res = await fetch("/api/auth/refresh", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refreshToken: refresh }),
          });
          if (res.ok) {
            const data = await res.json();
            if (data.accessToken) {
              saveTokens(data.accessToken, refresh, storedUser || undefined);
              setAccessToken(data.accessToken);
              if (storedUser) setUser(storedUser);
              await refreshBalance();
            }
          }
        }
      } catch (e) {
        console.error("Auth init error:", e);
      } finally {
        setIsLoading(false);
      }
    }

    initAuth();
  }, [refreshBalance]);

  const login = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      const res = await apiLogin(email, pass);
      saveTokens(res.accessToken, res.refreshToken, res.user);
      setUser(res.user);
      setAccessToken(res.accessToken);
      await refreshBalance();
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      const res = await apiRegister(email, pass);
      saveTokens(res.accessToken, res.refreshToken, res.user);
      setUser(res.user);
      setAccessToken(res.accessToken);
      await refreshBalance();
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await apiLogout();
    } finally {
      clearTokens();
      setUser(null);
      setAccessToken(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        balance,
        isLoading,
        login,
        register,
        logout,
        refreshBalance,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
