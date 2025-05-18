"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"
import { useToken } from "../../contexts/TokenContext"
import { Bell, User, LogOut, MenuIcon } from "lucide-react"

const Navbar = ({ toggleSidebar }) => {
  const { currentUser, logout } = useAuth()
  const { tokens } = useToken()
  const [profileOpen, setProfileOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const navigate = useNavigate()

  // Mock notifications
  const notifications = [
    { id: 1, message: "Your resume was analyzed successfully", read: false, time: "2 hours ago" },
    { id: 2, message: "New roadmap generated", read: true, time: "1 day ago" },
    { id: 3, message: "You earned 5 tokens from a referral", read: false, time: "3 days ago" },
  ]

  const handleLogout = () => {
    logout()
    navigate("/")
  }

  return (
    <nav className="glassmorphism sticky top-0 z-30 border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-md text-gray-400 hover:text-white focus:outline-none"
            >
              <MenuIcon className="h-6 w-6" />
            </button>

            <Link to="/dashboard" className="ml-4 flex items-center">
              <span className="text-2xl font-bold text-gradient">ResumeAI</span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {/* Token display */}
            <div className="hidden md:flex items-center px-3 py-1 rounded-full bg-muted border border-accent">
              <span className="text-accent font-bold">{tokens}</span>
              <span className="ml-1 text-sm text-gray-300">Tokens</span>
            </div>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="p-2 rounded-full text-gray-400 hover:text-white focus:outline-none relative"
              >
                <Bell className="h-6 w-6" />
                {notifications.some((n) => !n.read) && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-secondary rounded-full"></span>
                )}
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 glassmorphism rounded-lg shadow-lg py-1 z-50 border border-border">
                  <div className="px-4 py-2 border-b border-border">
                    <h3 className="text-lg font-medium">Notifications</h3>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`px-4 py-3 hover:bg-muted border-l-2 ${notification.read ? "border-transparent" : "border-secondary"}`}
                        >
                          <p className="text-sm">{notification.message}</p>
                          <p className="text-xs text-gray-400 mt-1">{notification.time}</p>
                        </div>
                      ))
                    ) : (
                      <p className="px-4 py-3 text-sm text-gray-400">No notifications</p>
                    )}
                  </div>
                  <div className="px-4 py-2 border-t border-border">
                    <button className="text-sm text-accent hover:text-white">Mark all as read</button>
                  </div>
                </div>
              )}
            </div>

            {/* Profile dropdown */}
            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center space-x-2 focus:outline-none"
              >
                <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-accent">
                  <img
                    src={currentUser?.avatar || "https://i.pravatar.cc/150?u=unknown"}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="hidden md:inline-block text-sm font-medium">{currentUser?.name || "User"}</span>
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-2 w-48 glassmorphism rounded-lg shadow-lg py-1 z-50 border border-border">
                  <Link
                    to="/profile"
                    className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-muted"
                    onClick={() => setProfileOpen(false)}
                  >
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-muted"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
