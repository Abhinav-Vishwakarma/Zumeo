"use client"

import { createContext, useState, useContext, useEffect } from "react"

const ThemeContext = createContext()

export const useTheme = () => useContext(ThemeContext)

export const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(true) // Default to dark mode

  // Load theme preference from localStorage on initial load
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme")
    if (savedTheme) {
      setDarkMode(savedTheme === "dark")
    }
  }, [])

  // Save theme preference to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("theme", darkMode ? "dark" : "light")

    // Apply theme to document
    if (darkMode) {
      document.documentElement.classList.add("dark-theme")
      document.documentElement.classList.remove("light-theme")
    } else {
      document.documentElement.classList.add("light-theme")
      document.documentElement.classList.remove("dark-theme")
    }
  }, [darkMode])

  const toggleTheme = () => {
    setDarkMode((prev) => !prev)
  }

  const value = {
    darkMode,
    toggleTheme,
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
