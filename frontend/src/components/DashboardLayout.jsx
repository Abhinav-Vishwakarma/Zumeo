"use client"

import { useEffect } from "react"
import Sidebar from "./Sidebar"
import { useAuth } from "../contexts/AuthContext"

const DashboardLayout = ({ children, title }) => {
  const { updateCredits } = useAuth()

  useEffect(() => {
    // Update credits when dashboard layout mounts
    updateCredits()
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />

      <div className="md:ml-64 min-h-screen">
        <main className="p-4 md:p-8">
          {title && <h1 className="text-2xl md:text-3xl font-bold mb-6">{title}</h1>}
          {children}
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout
