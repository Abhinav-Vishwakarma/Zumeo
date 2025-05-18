"use client"

import { Check } from "lucide-react"

const SubscriptionCard = ({ title, price, features, isPopular = false, buttonText = "Get Started", onSelect }) => {
  return (
    <div className={`glass-card relative ${isPopular ? "border-2 border-neon-pink" : ""}`}>
      {isPopular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-neon-pink text-white px-4 py-1 rounded-full text-sm font-medium">
          Most Popular
        </div>
      )}

      <h3 className="text-xl font-bold mb-2">{title}</h3>

      <div className="mb-6">
        <span className="text-3xl font-bold">${price}</span>
        <span className="text-gray-400 ml-1">/month</span>
      </div>

      <ul className="space-y-3 mb-6">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start">
            <Check className="h-5 w-5 text-electric-blue mr-2 mt-0.5 flex-shrink-0" />
            <span className="text-gray-300">{feature}</span>
          </li>
        ))}
      </ul>

      <button
        onClick={onSelect}
        className={`w-full py-2 rounded-md font-medium transition-all ${
          isPopular
            ? "bg-gradient-to-r from-neon-purple to-neon-pink text-white hover:opacity-90"
            : "bg-cyber-gray border border-electric-blue text-white hover:bg-cyber-gray/80"
        }`}
      >
        {buttonText}
      </button>
    </div>
  )
}

export default SubscriptionCard
