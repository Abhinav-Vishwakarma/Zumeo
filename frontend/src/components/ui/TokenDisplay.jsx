import { useToken } from "../../contexts/TokenContext"
import { Coins } from "lucide-react"

const TokenDisplay = ({ showBuyButton = false }) => {
  const { tokens } = useToken()

  return (
    <div className="flex items-center">
      <div className="flex items-center px-3 py-1 rounded-full bg-cyber-gray border border-electric-blue">
        <Coins className="h-4 w-4 text-electric-blue mr-2" />
        <span className="text-electric-blue font-bold">{tokens}</span>
        <span className="ml-1 text-sm text-gray-300">Tokens</span>
      </div>

      {showBuyButton && (
        <button className="ml-2 px-3 py-1 text-sm rounded-full bg-gradient-to-r from-neon-purple to-neon-pink text-white hover:opacity-90 transition-opacity">
          Buy More
        </button>
      )}
    </div>
  )
}

export default TokenDisplay
