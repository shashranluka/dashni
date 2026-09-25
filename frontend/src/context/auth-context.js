import { createContext } from "react";

// ცალკე ფაილში იმიტომ, რომ AuthContext.jsx მხოლოდ კომპონენტს ექსპორტავდეს —
// ასე Vite-ის fast refresh სწორად მუშაობს რედაქტირებისას.
export const AuthContext = createContext(null);
