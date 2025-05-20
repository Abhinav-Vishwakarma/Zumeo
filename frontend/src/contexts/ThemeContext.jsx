"use client"

import { createContext, useContext, useState, useEffect } from "react"

const ThemeContext = createContext()

export function ThemeProvider({ children }) {
  const [darkMode, setDarkMode] = useState(true) // Default to dark mode

  useEffect(() => {
    // Check if user has a theme preference in localStorage
    const savedTheme = localStorage.getItem("theme")
    if (savedTheme) {
      setDarkMode(savedTheme === "dark")
    } else {
      // Check if user prefers dark mode at OS level
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
      setDarkMode(prefersDark)
    }
  }, [])

  const toggleTheme = () => {
    const newMode = !darkMode
    setDarkMode(newMode)
    localStorage.setItem("theme", newMode ? "dark" : "light")
  }

  return <ThemeContext.Provider value={{ darkMode, toggleTheme }}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}
