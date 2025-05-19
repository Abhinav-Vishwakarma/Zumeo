"use client"

import { useState } from "react"
import { CreditCard, Check, Zap, Shield, Star } from "lucide-react"
import { useToken } from "../contexts/TokenContext"
import { useNotification } from "../contexts/NotificationContext"
import TokenDisplay from "../components/ui/TokenDisplay"
import SubscriptionCard from "../components/ui/SubscriptionCard"

const Subscription = () => {
  const { tokens, purchaseTokens, earnTokensByAd, earnTokensByReferral } = useToken()
  const { showNotification } = useNotification()
  const [activeTab, setActiveTab] = useState("plans")
  const [loading, setLoading] = useState(false)
  const [referralEmail, setReferralEmail] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("credit_card")
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [tokenAmount, setTokenAmount] = useState(20)

  // Subscription plans
  const plans = [
    {
      id: "free",
      title: "Free",
      price: 0,
      features: ["10 free tokens on signup", "Access to Resume Extractor", "Access to Resume Checker", "Basic support"],
    },
    {
      id: "pro",
      title: "Pro",
      price: 9.99,
      isPopular: true,
      features: [
        "50 tokens per month",
        "Access to all AI tools",
        "Priority support",
        "Download unlimited resumes",
        "No ads",
      ],
    },
    {
      id: "premium",
      title: "Premium",
      price: 19.99,
      features: [
        "100 tokens per month",
        "Access to all AI tools",
        "Priority support",
        "Download unlimited resumes",
        "No ads",
        "Custom roadmap consultations",
        "Early access to new features",
      ],
    },
  ]

  // Token packages
  const tokenPackages = [
    { id: "small", amount: 20, price: 4.99 },
    { id: "medium", amount: 50, price: 9.99 },
    { id: "large", amount: 100, price: 17.99 },
    { id: "xlarge", amount: 200, price: 29.99 },
  ]

  const handlePlanSelect = (planId) => {
    setSelectedPlan(planId)
    showNotification(`Selected ${planId} plan`, "info")

    // Scroll to the tokens section
    setActiveTab("tokens")
    setTimeout(() => {
      const tokensSection = document.getElementById("tokens-section")
      if (tokensSection) {
        tokensSection.scrollIntoView({ behavior: "smooth" })
      }
    }, 100)
  }

  const handleTokenPackageSelect = (packageId) => {
    const selectedPackage = tokenPackages.find((pkg) => pkg.id === packageId)
    if (selectedPackage) {
      setTokenAmount(selectedPackage.amount)
    }
  }

  const handlePurchaseTokens = async () => {
    setLoading(true)
    try {
      await purchaseTokens(tokenAmount, paymentMethod)
      showNotification(`Successfully purchased ${tokenAmount} tokens`, "success")
    } catch (error) {
      showNotification("Failed to purchase tokens", "error")
    } finally {
      setLoading(false)
    }
  }

  const handleWatchAd = async () => {
    setLoading(true)
    try {
      await earnTokensByAd()
    } catch (error) {
      showNotification("Failed to earn tokens", "error")
    } finally {
      setLoading(false)
    }
  }

  const handleReferral = async (e) => {
    e.preventDefault()
    if (!referralEmail) {
      showNotification("Please enter an email address", "error")
      return
    }

    setLoading(true)
    try {
      await earnTokensByReferral(referralEmail)
      setReferralEmail("")
    } catch (error) {
      showNotification("Failed to process referral", "error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-2">Subscription & Tokens</h1>
          <p className="text-gray-300">Manage your subscription and purchase Tokens</p>
        </div>

        <TokenDisplay />
      </div>

      <div className="glass-card">
        {/* Tabs */}
        <div className="flex border-b border-gray-700 mb-6">
          <button
            className={`px-4 py-2 font-medium ${
              activeTab === "plans"
                ? "text-electric-blue border-b-2 border-electric-blue"
                : "text-gray-400 hover:text-white"
            }`}
            onClick={() => setActiveTab("plans")}
          >
            Subscription Plans
          </button>
          <button
            className={`px-4 py-2 font-medium ${
              activeTab === "tokens"
                ? "text-electric-blue border-b-2 border-electric-blue"
                : "text-gray-400 hover:text-white"
            }`}
            onClick={() => setActiveTab("tokens")}
          >
            Buy Tokens
          </button>
          <button
            className={`px-4 py-2 font-medium ${
              activeTab === "earn"
                ? "text-electric-blue border-b-2 border-electric-blue"
                : "text-gray-400 hover:text-white"
            }`}
            onClick={() => setActiveTab("earn")}
          >
            Earn Free Tokens
          </button>
        </div>

        {/* Content based on active tab */}
        {activeTab === "plans" && (
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-bold mb-2">Choose Your Plan</h2>
              <p className="text-gray-300">Select a subscription plan that works best for your needs</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {plans.map((plan) => (
                <SubscriptionCard
                  key={plan.id}
                  title={plan.title}
                  price={plan.price}
                  features={plan.features}
                  isPopular={plan.isPopular}
                  buttonText={plan.price === 0 ? "Current Plan" : "Select Plan"}
                  onSelect={() => handlePlanSelect(plan.id)}
                />
              ))}
            </div>

            <div className="mt-8 glass p-4 rounded-lg">
              <div className="flex items-start">
                <Shield className="h-5 w-5 text-electric-blue mr-3 mt-0.5" />
                <p className="text-sm text-gray-300">
                  All plans include a 7-day free trial. You can cancel anytime. No credit card required for the free
                  plan.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "tokens" && (
          <div id="tokens-section">
            <div className="mb-6">
              <h2 className="text-xl font-bold mb-2">Purchase Tokens</h2>
              <p className="text-gray-300">
                Buy tokens to use our AI tools. Each tool requires a specific number of tokens.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              {tokenPackages.map((pkg) => (
                <div
                  key={pkg.id}
                  className={`glass p-4 rounded-lg cursor-pointer transition-all hover:border-electric-blue ${
                    tokenAmount === pkg.amount ? "border-2 border-electric-blue" : "border border-transparent"
                  }`}
                  onClick={() => handleTokenPackageSelect(pkg.id)}
                >
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white mb-1">{pkg.amount}</div>
                    <div className="text-sm text-gray-400 mb-2">Tokens</div>
                    <div className="text-lg font-bold text-neon-pink">${pkg.price}</div>
                    <div className="text-xs text-gray-400 mt-1">${(pkg.price / pkg.amount).toFixed(2)} per token</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="glass p-6 rounded-lg mb-6">
              <h3 className="text-lg font-bold mb-4">Payment Method</h3>

              <div className="space-y-4">
                <div
                  className={`flex items-center p-4 rounded-lg cursor-pointer ${
                    paymentMethod === "credit_card"
                      ? "bg-cyber-gray border border-electric-blue"
                      : "bg-cyber-black border border-gray-700"
                  }`}
                  onClick={() => setPaymentMethod("credit_card")}
                >
                  <div
                    className={`w-5 h-5 rounded-full border ${
                      paymentMethod === "credit_card" ? "border-electric-blue" : "border-gray-500"
                    } flex items-center justify-center mr-3`}
                  >
                    {paymentMethod === "credit_card" && <div className="w-3 h-3 rounded-full bg-electric-blue"></div>}
                  </div>
                  <CreditCard className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-white">Credit / Debit Card</p>
                    <p className="text-xs text-gray-400">Visa, Mastercard, American Express</p>
                  </div>
                </div>

                <div
                  className={`flex items-center p-4 rounded-lg cursor-pointer ${
                    paymentMethod === "paypal"
                      ? "bg-cyber-gray border border-electric-blue"
                      : "bg-cyber-black border border-gray-700"
                  }`}
                  onClick={() => setPaymentMethod("paypal")}
                >
                  <div
                    className={`w-5 h-5 rounded-full border ${
                      paymentMethod === "paypal" ? "border-electric-blue" : "border-gray-500"
                    } flex items-center justify-center mr-3`}
                  >
                    {paymentMethod === "paypal" && <div className="w-3 h-3 rounded-full bg-electric-blue"></div>}
                  </div>
                  <div className="h-5 w-5 text-gray-400 mr-3 flex items-center justify-center font-bold text-blue-500">
                    P
                  </div>
                  <p className="text-white">PayPal</p>
                </div>

                <div
                  className={`flex items-center p-4 rounded-lg cursor-pointer ${
                    paymentMethod === "crypto"
                      ? "bg-cyber-gray border border-electric-blue"
                      : "bg-cyber-black border border-gray-700"
                  }`}
                  onClick={() => setPaymentMethod("crypto")}
                >
                  <div
                    className={`w-5 h-5 rounded-full border ${
                      paymentMethod === "crypto" ? "border-electric-blue" : "border-gray-500"
                    } flex items-center justify-center mr-3`}
                  >
                    {paymentMethod === "crypto" && <div className="w-3 h-3 rounded-full bg-electric-blue"></div>}
                  </div>
                  <div className="h-5 w-5 text-gray-400 mr-3 flex items-center justify-center font-bold text-yellow-500">
                    ₿
                  </div>
                  <div>
                    <p className="text-white">Cryptocurrency</p>
                    <p className="text-xs text-gray-400">Bitcoin, Ethereum, USDC</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between glass p-6 rounded-lg">
              <div>
                <p className="text-lg font-bold text-white">
                  {tokenAmount} Tokens for ${tokenPackages.find((pkg) => pkg.amount === tokenAmount)?.price}
                </p>
                <p className="text-sm text-gray-400">Tokens never expire</p>
              </div>

              <button
                onClick={handlePurchaseTokens}
                disabled={loading}
                className={`cyber-button mt-4 md:mt-0 ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {loading ? (
                  <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin mx-auto"></div>
                ) : (
                  "Complete Purchase"
                )}
              </button>
            </div>
          </div>
        )}

        {activeTab === "earn" && (
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-bold mb-2">Earn Free Tokens</h2>
              <p className="text-gray-300">Complete these actions to earn tokens without spending money</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="glass-card">
                <div className="flex items-center mb-4">
                  <div className="p-2 rounded-lg bg-cyber-gray text-neon-pink mr-3">
                    <Zap className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-bold">Watch Ads</h3>
                </div>

                <p className="text-gray-300 mb-4">
                  Watch a short advertisement to earn 2 tokens. You can watch up to 3 ads per day.
                </p>

                <button
                  onClick={handleWatchAd}
                  disabled={loading}
                  className={`cyber-button-secondary w-full ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  {loading ? (
                    <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin mx-auto"></div>
                  ) : (
                    "Watch Ad for 2 Tokens"
                  )}
                </button>
              </div>

              <div className="glass-card">
                <div className="flex items-center mb-4">
                  <div className="p-2 rounded-lg bg-cyber-gray text-neon-pink mr-3">
                    <Star className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-bold">Refer a Friend</h3>
                </div>

                <p className="text-gray-300 mb-4">
                 Share the Zumeo experience! Invite your friends to join, and for every 5 sign-ups, you'll earn 10 tokens. Start earning now!
                </p>

                <form onSubmit={handleReferral} className="space-y-4">
                  <div>
                    <input
                      type="email"
                      value={referralEmail}
                      onChange={(e) => setReferralEmail(e.target.value)}
                      placeholder="Friend's email address"
                      className="cyber-input w-full"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className={`cyber-button-secondary w-full ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin mx-auto"></div>
                    ) : (
                      "Send Invitation"
                    )}
                  </button>
                </form>
              </div>
            </div>

            <div className="mt-8">
              <h3 className="text-lg font-bold mb-4">Token Usage Guide</h3>

              <div className="glass p-6 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-electric-blue font-medium mb-2">Basic Tools (1 Token)</h4>
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <Check className="h-4 w-4 text-electric-blue mr-2 mt-0.5" />
                        <span className="text-gray-300">Resume Extractor</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-4 w-4 text-electric-blue mr-2 mt-0.5" />
                        <span className="text-gray-300">Resume Checker</span>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-electric-blue font-medium mb-2">Advanced Tools (2-3 Tokens)</h4>
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <Check className="h-4 w-4 text-electric-blue mr-2 mt-0.5" />
                        <span className="text-gray-300">AI Resume Builder (2 Tokens)</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-4 w-4 text-electric-blue mr-2 mt-0.5" />
                        <span className="text-gray-300">Business Connect (2 Tokens)</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-4 w-4 text-electric-blue mr-2 mt-0.5" />
                        <span className="text-gray-300">Fake Resume Detector (2 Tokens)</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-4 w-4 text-electric-blue mr-2 mt-0.5" />
                        <span className="text-gray-300">Roadmap Generator (3 Tokens)</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Subscription
