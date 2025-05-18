"use client"

import { createContext, useState, useContext, useCallback } from "react"

const NotificationContext = createContext()

export const useNotification = () => useContext(NotificationContext)

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([])

  const showNotification = useCallback((message, type = "info", duration = 5000) => {
    const id = Date.now()

    setNotifications((prev) => [...prev, { id, message, type, duration }])

    // Auto remove notification after duration
    setTimeout(() => {
      removeNotification(id)
    }, duration)

    return id
  }, [])

  const removeNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id))
  }, [])

  const value = {
    notifications,
    showNotification,
    removeNotification,
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
      {notifications.length > 0 && (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`glass p-4 rounded-lg shadow-lg max-w-md flex items-start gap-3 animate-fade-in-up ${
                notification.type === "success"
                  ? "border-l-4 border-green-500"
                  : notification.type === "error"
                    ? "border-l-4 border-red-500"
                    : notification.type === "warning"
                      ? "border-l-4 border-yellow-500"
                      : "border-l-4 border-electric-blue"
              }`}
            >
              <div className="flex-1">
                <p className="text-white">{notification.message}</p>
              </div>
              <button onClick={() => removeNotification(notification.id)} className="text-gray-400 hover:text-white">
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </NotificationContext.Provider>
  )
}
