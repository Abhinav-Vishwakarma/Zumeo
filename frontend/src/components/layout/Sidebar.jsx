"use client"

import { useState, useEffect } from "react"
import { NavLink, useLocation } from "react-router-dom"
import {
  Home,
  FileText,
  CheckCircle,
  GitBranch,
  Briefcase,
  AlertTriangle,
  User,
  CreditCard,
  PenTool,
  ChevronDown,
  ChevronRight,
} from "lucide-react"

const Sidebar = ({ isOpen }) => {
  const location = useLocation()
  const [expandedSection, setExpandedSection] = useState("tools")
  const [isMobile, setIsMobile] = useState(false)

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section)
  }

  const isActive = (path) => {
    return location.pathname === path
  }

  // Check if on mobile device
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkIfMobile()
    window.addEventListener("resize", checkIfMobile)

    return () => {
      window.removeEventListener("resize", checkIfMobile)
    }
  }, [])

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-20 w-64 glass border-r border-border transition-transform duration-300 ease-in-out transform ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      } md:translate-x-0 pt-16`}
    >
      <div className="h-full flex flex-col overflow-y-auto">
        <div className="px-4 py-2">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `flex items-center px-4 py-2 rounded-lg transition-colors ${
                isActive ? "bg-gradient-to-r from-primary to-secondary text-white" : "text-gray-300 hover:bg-muted"
              }`
            }
          >
            <Home className="mr-3 h-5 w-5" />
            <span>Dashboard</span>
          </NavLink>
        </div>

        {/* AI Tools Section */}
        <div className="px-4 py-2">
          <button
            onClick={() => toggleSection("tools")}
            className="flex items-center justify-between w-full px-4 py-2 text-left text-gray-300 hover:bg-muted rounded-lg transition-colors"
          >
            <div className="flex items-center">
              <PenTool className="mr-3 h-5 w-5 text-secondary" />
              <span>AI Tools</span>
            </div>
            {expandedSection === "tools" ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>

          {expandedSection === "tools" && (
            <div className="mt-2 ml-4 space-y-1">
              <NavLink
                to="/resume-extractor"
                className={({ isActive }) =>
                  `flex items-center px-4 py-2 rounded-lg transition-colors ${
                    isActive ? "bg-muted text-accent" : "text-gray-300 hover:bg-muted"
                  }`
                }
              >
                <FileText className="mr-3 h-5 w-5" />
                <span>Resume Extractor</span>
              </NavLink>

              <NavLink
                to="/resume-builder"
                className={({ isActive }) =>
                  `flex items-center px-4 py-2 rounded-lg transition-colors ${
                    isActive ? "bg-muted text-accent" : "text-gray-300 hover:bg-muted"
                  }`
                }
              >
                <PenTool className="mr-3 h-5 w-5" />
                <span>Resume Builder</span>
              </NavLink>

              <NavLink
                to="/resume-checker"
                className={({ isActive }) =>
                  `flex items-center px-4 py-2 rounded-lg transition-colors ${
                    isActive ? "bg-muted text-accent" : "text-gray-300 hover:bg-muted"
                  }`
                }
              >
                <CheckCircle className="mr-3 h-5 w-5" />
                <span>Resume Checker</span>
              </NavLink>

              <NavLink
                to="/roadmap-generator"
                className={({ isActive }) =>
                  `flex items-center px-4 py-2 rounded-lg transition-colors ${
                    isActive ? "bg-muted text-accent" : "text-gray-300 hover:bg-muted"
                  }`
                }
              >
                <GitBranch className="mr-3 h-5 w-5" />
                <span>Roadmap Generator</span>
              </NavLink>

              <NavLink
                to="/fake-detector"
                className={({ isActive }) =>
                  `flex items-center px-4 py-2 rounded-lg transition-colors ${
                    isActive ? "bg-muted text-accent" : "text-gray-300 hover:bg-muted"
                  }`
                }
              >
                <AlertTriangle className="mr-3 h-5 w-5" />
                <span>Fake Detector</span>
              </NavLink>
            </div>
          )}
        </div>

        {/* Business Section */}
        <div className="px-4 py-2">
          <NavLink
            to="/business-connect"
            className={({ isActive }) =>
              `flex items-center px-4 py-2 rounded-lg transition-colors ${
                isActive ? "bg-gradient-to-r from-primary to-secondary text-white" : "text-gray-300 hover:bg-muted"
              }`
            }
          >
            <Briefcase className="mr-3 h-5 w-5" />
            <span>Business Connect</span>
          </NavLink>
        </div>

        <div className="mt-auto">
          <div className="px-4 py-2">
            <NavLink
              to="/profile"
              className={({ isActive }) =>
                `flex items-center px-4 py-2 rounded-lg transition-colors ${
                  isActive ? "bg-muted text-accent" : "text-gray-300 hover:bg-muted"
                }`
              }
            >
              <User className="mr-3 h-5 w-5" />
              <span>Profile</span>
            </NavLink>

            <NavLink
              to="/subscription"
              className={({ isActive }) =>
                `flex items-center px-4 py-2 rounded-lg transition-colors ${
                  isActive ? "bg-muted text-accent" : "text-gray-300 hover:bg-muted"
                }`
              }
            >
              <CreditCard className="mr-3 h-5 w-5" />
              <span>Subscription</span>
            </NavLink>
          </div>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
