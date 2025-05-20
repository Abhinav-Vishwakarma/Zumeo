"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { api } from "../services/api"

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [credits, setCredits] = useState(0)

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem("token")
    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`
      fetchUserData()
    } else {
      setLoading(false)
    }
  }, [])

  const fetchUserData = async () => {
    try {
      // Fetch user credits
      const response = await api.get("/credits")
      setCredits(response.data.credits)
      setUser(JSON.parse(localStorage.getItem("user")))
    } catch (error) {
      console.error("Error fetching user data:", error)
      logout() // Token might be expired or invalid
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    try {
      const response = await api.post("/login", { email, password })
      const { access_token, token_type } = response.data

      // Store token in localStorage
      localStorage.setItem("token", access_token)

      // Set token in axios headers for future requests
      api.defaults.headers.common["Authorization"] = `Bearer ${access_token}`

      // For simplicity, we'll store basic user info
      const userInfo = { email }
      localStorage.setItem("user", JSON.stringify(userInfo))
      setUser(userInfo)

      // Fetch user credits
      await fetchUserData()

      return { success: true }
    } catch (error) {
      console.error("Login error:", error)
      return {
        success: false,
        message: error.response?.data?.detail || "Login failed. Please try again.",
      }
    }
  }

  const register = async (username, email, password) => {
    try {
      const response = await api.post("/register", { username, email, password })
      return { success: true }
    } catch (error) {
      console.error("Registration error:", error)
      return {
        success: false,
        message: error.response?.data?.detail || "Registration failed. Please try again.",
      }
    }
  }

  const logout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    delete api.defaults.headers.common["Authorization"]
    setUser(null)
    setCredits(0)
  }

  const updateCredits = async () => {
    try {
      const response = await api.get("/credits")
      setCredits(response.data.credits)
    } catch (error) {
      console.error("Error fetching credits:", error)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        login,
        register,
        logout,
        credits,
        updateCredits,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
