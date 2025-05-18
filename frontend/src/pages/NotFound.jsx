"use client"

import { Link } from "react-router-dom"
import { Home, ArrowLeft } from "lucide-react"

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-cyber-black py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 glass-card text-center">
        <div>
          <h1 className="text-6xl font-bold text-gradient mb-2">404</h1>
          <h2 className="text-2xl font-bold text-white mb-4">Page Not Found</h2>
          <div className="cyber-line"></div>
          <p className="mt-4 text-gray-300">
            The page you're looking for doesn't exist or has been moved to another URL.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
          <Link to="/" className="cyber-button flex items-center justify-center w-full sm:w-auto">
            <Home className="mr-2 h-5 w-5" />
            Go to Homepage
          </Link>
          <button
            onClick={() => window.history.back()}
            className="cyber-button-secondary flex items-center justify-center w-full sm:w-auto"
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            Go Back
          </button>
        </div>
      </div>
    </div>
  )
}

export default NotFound
