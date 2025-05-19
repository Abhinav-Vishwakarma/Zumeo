import { Heart } from "lucide-react"

const Footer = () => {
  return (
    <footer className="glass border-t border-gray-800 py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-4 md:mb-0">
            <span className="text-gradient text-xl font-bold">Zumeo</span>
            <span className="ml-2 text-sm text-gray-400">© {new Date().getFullYear()}</span>
          </div>

          <div className="flex items-center text-sm text-gray-400">
            <span>Made with</span>
            <Heart className="h-4 w-4 mx-1 text-neon-pink" />
            <span>by Zumeo Team</span>
          </div>

          <div className="flex space-x-4 mt-4 md:mt-0">
            <a href="#" className="text-gray-400 hover:text-electric-blue transition-colors">
              Privacy
            </a>
            <a href="#" className="text-gray-400 hover:text-electric-blue transition-colors">
              Terms
            </a>
            <a href="#" className="text-gray-400 hover:text-electric-blue transition-colors">
              Support
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
