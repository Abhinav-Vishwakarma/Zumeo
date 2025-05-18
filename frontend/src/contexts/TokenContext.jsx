"use client"

import { createContext, useState, useContext, useEffect } from "react"
import { useAuth } from "./AuthContext"
import { useNotification } from "./NotificationContext"

const TokenContext = createContext()

export const useToken = () => useContext(TokenContext)

export const TokenProvider = ({ children }) => {
  const [tokens, setTokens] = useState(0)
  const [loading, setLoading] = useState(true)
  const { currentUser } = useAuth()
  const { showNotification } = useNotification()

  // Load tokens from localStorage on initial load
  useEffect(() => {
    if (currentUser) {
      const savedTokens = localStorage.getItem(`tokens_${currentUser.id}`)
      if (savedTokens) {
        setTokens(Number.parseInt(savedTokens))
      } else {
        // New user gets 10 free tokens
        setTokens(10)
        localStorage.setItem(`tokens_${currentUser.id}`, "10")
      }
    }
    setLoading(false)
  }, [currentUser])

  // Save tokens to localStorage whenever they change
  useEffect(() => {
    if (currentUser && !loading) {
      localStorage.setItem(`tokens_${currentUser.id}`, tokens.toString())
    }
  }, [tokens, currentUser, loading])

  // Add tokens
  const addTokens = (amount) => {
    setTokens((prev) => {
      const newAmount = prev + amount
      showNotification(`${amount} tokens added to your account`, "success")
      return newAmount
    })
  }

  // Use tokens
  const useTokens = (amount = 1, feature) => {
    if (tokens >= amount) {
      setTokens((prev) => {
        const newAmount = prev - amount
        showNotification(`Used ${amount} token${amount > 1 ? "s" : ""} for ${feature}`, "info")
        return newAmount
      })
      return true
    } else {
      showNotification("Not enough tokens. Please purchase more.", "error")
      return false
    }
  }

  // Purchase tokens (mock)
  const purchaseTokens = async (amount, paymentMethod) => {
    try {
      setLoading(true)
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      addTokens(amount)
      showNotification(`Successfully purchased ${amount} tokens`, "success")
      return true
    } catch (error) {
      showNotification("Failed to purchase tokens", "error")
      return false
    } finally {
      setLoading(false)
    }
  }

  // Earn tokens by watching ads (mock)
  const earnTokensByAd = async () => {
    try {
      setLoading(true)
      // Simulate watching an ad
      await new Promise((resolve) => setTimeout(resolve, 3000))

      const earnedTokens = 2
      addTokens(earnedTokens)
      showNotification(`Earned ${earnedTokens} tokens by watching an ad`, "success")
      return true
    } catch (error) {
      showNotification("Failed to earn tokens", "error")
      return false
    } finally {
      setLoading(false)
    }
  }

  // Earn tokens by referral (mock)
  const earnTokensByReferral = async (email) => {
    try {
      setLoading(true)
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const earnedTokens = 5
      addTokens(earnedTokens)
      showNotification(`Earned ${earnedTokens} tokens by referring ${email}`, "success")
      return true
    } catch (error) {
      showNotification("Failed to process referral", "error")
      return false
    } finally {
      setLoading(false)
    }
  }

  const value = {
    tokens,
    addTokens,
    useTokens,
    purchaseTokens,
    earnTokensByAd,
    earnTokensByReferral,
    loading,
  }

  return <TokenContext.Provider value={value}>{children}</TokenContext.Provider>
}
