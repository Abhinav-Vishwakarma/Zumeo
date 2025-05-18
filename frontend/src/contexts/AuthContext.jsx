"use client"

import { createContext, useState, useContext, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useNotification } from "./NotificationContext"

const AuthContext = createContext()

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const { showNotification } = useNotification()

  // Check if user is logged in on initial load
  useEffect(() => {
    const user = localStorage.getItem("user")
    if (user) {
      setCurrentUser(JSON.parse(user))
    }
    setLoading(false)
  }, [])

  // Fix the login function to prevent duplicate notifications
  const login = async (email, password) => {
    try {
      setLoading(true)
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Mock validation
      if (email === "demo@example.com" && password === "password") {
        const user = {
          id: "1",
          name: "Demo User",
          email: "demo@example.com",
          avatar: "https://i.pravatar.cc/150?u=demo@example.com",
          role: "user",
          createdAt: new Date().toISOString(),
        }

        setCurrentUser(user)
        localStorage.setItem("user", JSON.stringify(user))
        showNotification("Login successful", "success")
        // Don't navigate here, let the component handle navigation
        return user
      } else {
        throw new Error("Invalid email or password")
      }
    } catch (error) {
      showNotification(error.message, "error")
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Fix the Google OAuth login function
  const googleLogin = async () => {
    try {
      setLoading(true)
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const user = {
        id: "2",
        name: "Google User",
        email: "google@example.com",
        avatar: "https://i.pravatar.cc/150?u=google@example.com",
        role: "user",
        createdAt: new Date().toISOString(),
      }

      setCurrentUser(user)
      localStorage.setItem("user", JSON.stringify(user))
      showNotification("Google login successful", "success")
      // Don't navigate here, let the component handle navigation
      return user
    } catch (error) {
      showNotification("Google login failed", "error")
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Fix the register function
  const register = async (name, email, password) => {
    try {
      setLoading(true)
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const user = {
        id: "3",
        name,
        email,
        avatar: `https://i.pravatar.cc/150?u=${email}`,
        role: "user",
        createdAt: new Date().toISOString(),
      }

      setCurrentUser(user)
      localStorage.setItem("user", JSON.stringify(user))
      showNotification("Registration successful", "success")
      // Don't navigate here, let the component handle navigation
      return user
    } catch (error) {
      showNotification("Registration failed", "error")
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Update the logout function to also clear the welcomeShown flag
  // Logout function
  const logout = () => {
    setCurrentUser(null)
    localStorage.removeItem("user")
    localStorage.removeItem("welcomeShown") // Clear the welcome flag on logout
    showNotification("Logged out successfully", "info")
    navigate("/")
  }

  const value = {
    currentUser,
    login,
    googleLogin,
    register,
    logout,
    loading,
  }

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>
}
