"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { FileText, CheckCircle, GitBranch, ArrowRight } from "lucide-react"
import DashboardLayout from "../components/DashboardLayout"
import { useAuth } from "../contexts/AuthContext"

const Dashboard = () => {
  const { user, credits } = useAuth()
  const [greeting, setGreeting] = useState("")

  useEffect(() => {
    // Set greeting based on time of day
    const hour = new Date().getHours()
    if (hour < 12) {
      setGreeting("Good morning")
    } else if (hour < 18) {
      setGreeting("Good afternoon")
    } else {
      setGreeting("Good evening")
    }
  }, [])

  const features = [
    {
      title: "Resume Extractor",
      description: "Extract key information from your existing resume automatically.",
      icon: <FileText className="h-6 w-6 text-primary" />,
      path: "/resume-extractor",
      bgColor: "bg-primary/20",
      iconColor: "text-primary",
    },
    {
      title: "AI Resume Builder",
      description: "Create professional, ATS-optimized resumes with AI assistance.",
      icon: <FileText className="h-6 w-6 text-secondary" />,
      path: "/resume-builder",
      bgColor: "bg-secondary/20",
      iconColor: "text-secondary",
    },
    {
      title: "Resume Checker",
      description: "Check your resume against ATS systems and get detailed feedback.",
      icon: <CheckCircle className="h-6 w-6 text-accent" />,
      path: "/resume-checker",
      bgColor: "bg-accent/20",
      iconColor: "text-accent",
    },
    {
      title: "Roadmap Generator",
      description: "Create personalized career roadmaps based on your goals.",
      icon: <GitBranch className="h-6 w-6 text-primary" />,
      path: "/roadmap-generator",
      bgColor: "bg-primary/20",
      iconColor: "text-primary",
    },
  ]

  return (
    <DashboardLayout>
      {/* Welcome section */}
      <div className="glassmorphism rounded-xl p-6 mb-8">
        <h1 className="text-2xl font-bold mb-2">
          {greeting}, {user?.email?.split("@")[0] || "User"}!
        </h1>
        <p className="text-gray-300">Welcome to your Zumeo dashboard. What would you like to do today?</p>

        <div className="mt-4 flex items-center">
          <div className="flex items-center mr-6">
            <div className="h-8 w-8 rounded-full bg-accent flex items-center justify-center text-white font-bold mr-2">
              <span>{credits}</span>
            </div>
            <span className="text-sm">Credits available</span>
          </div>

          <Link to="/profile" className="text-primary hover:text-primary/80 text-sm flex items-center">
            View profile <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Features grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {features.map((feature) => (
          <Link
            key={feature.title}
            to={feature.path}
            className="glassmorphism rounded-xl p-6 transition-transform hover:scale-105"
          >
            <div className={`h-12 w-12 rounded-lg ${feature.bgColor} flex items-center justify-center mb-4`}>
              {feature.icon}
            </div>
            <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
            <p className="text-gray-300 mb-4">{feature.description}</p>
            <div className="text-accent hover:text-white flex items-center text-sm">
              Get started <ArrowRight className="ml-1 h-4 w-4" />
            </div>
          </Link>
        ))}
      </div>

      {/* Recent activity section */}
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
        <div className="glassmorphism rounded-xl p-6">
          <div className="text-center py-8">
            <p className="text-gray-400">No recent activity yet.</p>
            <p className="text-gray-400 mt-2">Start using our tools to see your activity here!</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default Dashboard
