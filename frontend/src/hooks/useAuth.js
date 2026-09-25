import { useContext } from "react";
import { AuthContext } from "../context/auth-context";

// აბრუნებს { user, loading, refresh, logout }.
// user === null ნიშნავს სტუმარს; loading === true — ჯერ არ ვიცით.
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth უნდა გამოიყენებოდეს <AuthProvider>-ის შიგნით");
  }
  return context;
}
