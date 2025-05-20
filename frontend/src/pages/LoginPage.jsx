"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { ArrowLeft } from "lucide-react"

const LoginPage = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const result = await login(email, password)
      if (result.success) {
        navigate("/dashboard")
      } else {
        setError(result.message)
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <div className="absolute top-4 left-4">
        <Link to="/" className="flex items-center text-gray-400 hover:text-white transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Link>
      </div>

      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <span className="text-3xl font-bold text-gradient">Zumeo</span>
          </Link>
          <h1 className="text-2xl font-bold mt-6">Welcome back</h1>
          <p className="text-gray-400 mt-2">Sign in to your account to continue</p>
        </div>

        <div className="glassmorphism rounded-xl p-8">
          {error && (
            <div className="bg-destructive/20 border border-destructive/50 text-white p-3 rounded-md mb-6">{error}</div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-1">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-secondary border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="password" className="block text-sm font-medium">
                    Password
                  </label>
                  <a href="#" className="text-xs text-primary hover:text-primary/80">
                    Forgot password?
                  </a>
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-secondary border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              <button type="submit" disabled={loading} className="cyber-button w-full flex items-center justify-center">
                {loading ? "Signing in..." : "Sign in"}
              </button>
            </div>
          </form>
        </div>

        <div className="text-center mt-6">
          <p className="text-gray-400">
            Don't have an account?{" "}
            <Link to="/register" className="text-primary hover:text-primary/80">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
