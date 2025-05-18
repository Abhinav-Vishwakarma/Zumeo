"use client"

import { useState, useEffect } from "react"
import { Outlet, useNavigate } from "react-router-dom"
import Navbar from "./Navbar"
import Sidebar from "./Sidebar"
import Footer from "./Footer"
import { useAuth } from "../../contexts/AuthContext"
import { useNotification } from "../../contexts/NotificationContext"

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const { currentUser } = useAuth()
  const { showNotification } = useNotification()
  const navigate = useNavigate()

  // Welcome notification on first load
  useEffect(() => {
    if (currentUser) {
      const welcomeShown = localStorage.getItem("welcomeShown")
      if (!welcomeShown) {
        showNotification(`Welcome back, ${currentUser.name}!`, "info")
        localStorage.setItem("welcomeShown", "true")
      }
    } else {
      navigate("/login")
    }
  }, [currentUser, showNotification, navigate])

  // Add this useEffect to clear the welcomeShown flag when the user logs out
  useEffect(() => {
    // Listen for storage events to detect logout
    const handleStorageChange = (e) => {
      if (e.key === "user" && !e.newValue) {
        localStorage.removeItem("welcomeShown")
      }
    }

    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [])

  // Handle sidebar toggle
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  // Handle responsive sidebar
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSidebarOpen(false)
      } else {
        setSidebarOpen(true)
      }
    }

    window.addEventListener("resize", handleResize)
    handleResize() // Initial check

    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar toggleSidebar={toggleSidebar} />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar isOpen={sidebarOpen} />

        <main
          className={`flex-1 transition-all duration-300 overflow-y-auto p-4 md:p-6 ${sidebarOpen ? "md:ml-64" : ""}`}
        >
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

      <Footer />
    </div>
  )
}

export default Layout
