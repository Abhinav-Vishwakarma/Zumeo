"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { ArrowLeft } from "lucide-react"

const RegisterPage = () => {
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    // Validate passwords match
    if (password !== confirmPassword) {
      return setError("Passwords do not match")
    }

    // Validate password strength
    if (password.length < 8) {
      return setError("Password must be at least 8 characters long")
    }

    setLoading(true)

    try {
      const result = await register(username, email, password)
      if (result.success) {
        // Redirect to login page after successful registration
        navigate("/login", { state: { message: "Registration successful! Please log in." } })
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
          <h1 className="text-2xl font-bold mt-6">Create an account</h1>
          <p className="text-gray-400 mt-2">Sign up to get started with Zumeo</p>
        </div>

        <div className="glassmorphism rounded-xl p-8">
          {error && (
            <div className="bg-destructive/20 border border-destructive/50 text-white p-3 rounded-md mb-6">{error}</div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="username" className="block text-sm font-medium mb-1">
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3 py-2 bg-secondary border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

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
                <label htmlFor="password" className="block text-sm font-medium mb-1">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-secondary border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-secondary border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              <button type="submit" disabled={loading} className="cyber-button w-full flex items-center justify-center">
                {loading ? "Creating account..." : "Create account"}
              </button>
            </div>
          </form>
        </div>

        <div className="text-center mt-6">
          <p className="text-gray-400">
            Already have an account?{" "}
            <Link to="/login" className="text-primary hover:text-primary/80">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage
