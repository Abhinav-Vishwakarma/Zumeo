"use client"

import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { useState, useEffect } from "react"
import { AuthProvider } from "./contexts/AuthContext"
import { TokenProvider } from "./contexts/TokenContext"
import { ThemeProvider } from "./contexts/ThemeContext"
import { NotificationProvider } from "./contexts/NotificationContext"
import ProtectedRoute from "./components/auth/ProtectedRoute"
import Layout from "./components/layout/Layout"
import Dashboard from "./pages/Dashboard"
import Login from "./pages/Login"
import Register from "./pages/Register"
import ResumeExtractor from "./pages/ResumeExtractor"
import ResumeBuilder from "./pages/ResumeBuilder"
import ResumeChecker from "./pages/ResumeChecker"
import RoadmapGenerator from "./pages/RoadmapGenerator"
import BusinessConnect from "./pages/BusinessConnect"
import FakeDetector from "./pages/FakeDetector"
import Profile from "./pages/Profile"
import Subscription from "./pages/Subscription"
import NotFound from "./pages/NotFound"
import LandingPage from "./pages/LandingPage"
import "./index.css"

function App() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate initial loading
    setTimeout(() => {
      setIsLoading(false)
    }, 1500)
  }, [])

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-24 h-24 border-t-4 border-b-4 border-primary rounded-full animate-spin mx-auto"></div>
          <h2 className="mt-4 text-2xl font-bold text-secondary animate-pulse">Loading AI Resume Platform...</h2>
        </div>
      </div>
    )
  }

  return (
    <Router>
      <ThemeProvider>
        <NotificationProvider>
          <AuthProvider>
            <TokenProvider>
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Dashboard and protected routes */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Layout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<Dashboard />} />
                </Route>

                {/* Tool routes - these need to be at the same level as dashboard */}
                <Route
                  path="/resume-extractor"
                  element={
                    <ProtectedRoute>
                      <Layout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<ResumeExtractor />} />
                </Route>
                <Route
                  path="/resume-builder"
                  element={
                    <ProtectedRoute>
                      <Layout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<ResumeBuilder />} />
                </Route>
                <Route
                  path="/resume-checker"
                  element={
                    <ProtectedRoute>
                      <Layout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<ResumeChecker />} />
                </Route>
                <Route
                  path="/roadmap-generator"
                  element={
                    <ProtectedRoute>
                      <Layout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<RoadmapGenerator />} />
                </Route>
                <Route
                  path="/business-connect"
                  element={
                    <ProtectedRoute>
                      <Layout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<BusinessConnect />} />
                </Route>
                <Route
                  path="/fake-detector"
                  element={
                    <ProtectedRoute>
                      <Layout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<FakeDetector />} />
                </Route>
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Layout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<Profile />} />
                </Route>
                <Route
                  path="/subscription"
                  element={
                    <ProtectedRoute>
                      <Layout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<Subscription />} />
                </Route>

                {/* Legacy app routes - keeping for backward compatibility */}
                <Route path="/app/*" element={<Navigate to="/dashboard" replace />} />

                <Route path="*" element={<NotFound />} />
              </Routes>
            </TokenProvider>
          </AuthProvider>
        </NotificationProvider>
      </ThemeProvider>
    </Router>
  )
}

export default App
