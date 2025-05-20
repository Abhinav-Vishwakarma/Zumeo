"use client"

import { Routes, Route, Navigate } from "react-router-dom"
import { useAuth } from "./contexts/AuthContext"
import LandingPage from "./pages/LandingPage"
import LoginPage from "./pages/LoginPage"
import RegisterPage from "./pages/RegisterPage"
import Dashboard from "./pages/Dashboard"
import ResumeExtractor from "./pages/ResumeExtractor"
import ResumeBuilder from "./pages/ResumeBuilder"
import ResumeChecker from "./pages/ResumeChecker"
import RoadmapGenerator from "./pages/RoadmapGenerator"
// import ProfilePage from "./pages/ProfilePage"
// import NotFoundPage from "./pages/NotFoundPage"

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return children
}

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protected routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/resume-extractor"
        element={
          <ProtectedRoute>
            <ResumeExtractor />
          </ProtectedRoute>
        }
      />
      <Route
        path="/resume-builder"
        element={
          <ProtectedRoute>
            <ResumeBuilder />
          </ProtectedRoute>
        }
      />
      <Route
        path="/resume-checker"
        element={
          <ProtectedRoute>
            <ResumeChecker />
          </ProtectedRoute>
        }
      />
      <Route
        path="/roadmap-generator"
        element={
          <ProtectedRoute>
            <RoadmapGenerator />
          </ProtectedRoute>
        }
      />
      {/* <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      /> */}

      {/* 404 route */}
      {/* <Route path="*" element={<NotFoundPage />} /> */}
    </Routes>
  )
}

export default App
