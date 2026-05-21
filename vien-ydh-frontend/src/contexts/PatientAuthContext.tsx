"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";

interface PatientUser {
  id: string;
  phone: string;
  fullName: string | null;
  email: string | null;
}

interface PatientAuthContextType {
  patient: PatientUser | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string, patient: PatientUser) => void;
  logout: () => void;
}

const PatientAuthContext = createContext<PatientAuthContextType>({
  patient: null,
  token: null,
  isAuthenticated: false,
  login: () => {},
  logout: () => {},
});

const STORAGE_KEY = "patient_token";
const PATIENT_KEY = "patient_user";

export function PatientAuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [patient, setPatient] = useState<PatientUser | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem(STORAGE_KEY);
    const storedPatient = localStorage.getItem(PATIENT_KEY);
    if (storedToken && storedPatient) {
      try {
        setToken(storedToken);
        setPatient(JSON.parse(storedPatient));
      } catch {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(PATIENT_KEY);
      }
    }
  }, []);

  const login = useCallback((newToken: string, newPatient: PatientUser) => {
    setToken(newToken);
    setPatient(newPatient);
    localStorage.setItem(STORAGE_KEY, newToken);
    localStorage.setItem(PATIENT_KEY, JSON.stringify(newPatient));
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setPatient(null);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(PATIENT_KEY);
  }, []);

  return (
    <PatientAuthContext.Provider value={{ patient, token, isAuthenticated: !!token, login, logout }}>
      {children}
    </PatientAuthContext.Provider>
  );
}

export function usePatientAuth() {
  return useContext(PatientAuthContext);
}
