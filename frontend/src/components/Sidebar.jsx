"use client"

import { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { FileText, CheckCircle, GitBranch, User, Home, LogOut, CreditCard, Menu, X } from "lucide-react"
import { useAuth } from "../contexts/AuthContext"

const Sidebar = () => {
  const { logout, credits } = useAuth()
  const location = useLocation()
  const [isOpen, setIsOpen] = useState(false)

  const menuItems = [
    { path: "/dashboard", icon: <Home size={20} />, label: "Dashboard" },
    { path: "/resume-extractor", icon: <FileText size={20} />, label: "Resume Extractor" },
    { path: "/resume-builder", icon: <FileText size={20} />, label: "Resume Builder" },
    { path: "/resume-checker", icon: <CheckCircle size={20} />, label: "Resume Checker" },
    { path: "/roadmap-generator", icon: <GitBranch size={20} />, label: "Roadmap Generator" },
    { path: "/profile", icon: <User size={20} />, label: "Profile" },
  ]

  const toggleSidebar = () => {
    setIsOpen(!isOpen)
  }

  return (
    <>
      {/* Mobile menu button */}
      <button onClick={toggleSidebar} className="fixed top-4 left-4 z-50 p-2 rounded-md bg-secondary md:hidden">
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-40 w-64 glassmorphism transform transition-transform duration-300 ease-in-out md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-4 border-b border-border/50">
            <Link to="/dashboard" className="flex items-center">
              <span className="text-2xl font-bold text-gradient">Zumeo</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-4 py-3 rounded-md transition-colors ${
                  location.pathname === item.path ? "bg-primary/20 text-primary-foreground" : "hover:bg-secondary"
                }`}
                onClick={() => setIsOpen(false)}
              >
                {item.icon}
                <span className="ml-3">{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* Credits */}
          <div className="p-4 border-t border-border/50">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <CreditCard size={20} className="text-accent" />
                <span className="ml-3">Credits</span>
              </div>
              <span className="font-bold text-accent">{credits}</span>
            </div>

            {/* Logout button */}
            <button
              onClick={logout}
              className="flex items-center w-full px-4 py-2 rounded-md hover:bg-secondary transition-colors"
            >
              <LogOut size={20} />
              <span className="ml-3">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

export default Sidebar
