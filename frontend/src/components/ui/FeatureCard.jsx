import { Link } from "react-router-dom"
import { ArrowRight } from "lucide-react"

const FeatureCard = ({ icon: Icon, title, description, path, tokenCost, disabled = false }) => {
  return (
    <div className={`glass-card relative ${disabled ? "opacity-70" : ""}`}>
      {disabled && (
        <div className="absolute inset-0 flex items-center justify-center bg-cyber-black bg-opacity-80 rounded-lg z-10">
          <span className="text-neon-pink font-bold">Coming Soon</span>
        </div>
      )}

      <div className="flex items-center mb-4">
        <div className="p-2 rounded-lg bg-cyber-gray text-neon-pink">
          <Icon className="h-6 w-6" />
        </div>
        <h3 className="ml-3 text-lg font-medium text-white">{title}</h3>
      </div>

      <p className="text-gray-300 mb-4">{description}</p>

      <div className="flex items-center justify-between mt-auto">
        <div className="flex items-center">
          <span className="text-sm text-gray-400">Cost: </span>
          <span className="ml-1 text-sm font-medium text-electric-blue">
            {tokenCost} token{tokenCost !== 1 ? "s" : ""}
          </span>
        </div>

        {!disabled && (
          <Link to={path} className="flex items-center text-neon-pink hover:text-white transition-colors">
            <span className="mr-1">Use</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        )}
      </div>
    </div>
  )
}

export default FeatureCard
