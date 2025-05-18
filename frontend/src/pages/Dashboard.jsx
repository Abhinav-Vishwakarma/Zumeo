"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { FileText, CheckCircle, GitBranch, Briefcase, AlertTriangle, PenTool, Award, ArrowRight } from "lucide-react"
import { useAuth } from "../contexts/AuthContext"
import { useToken } from "../contexts/TokenContext"
import FeatureCard from "../components/ui/FeatureCard"
import StatsCard from "../components/ui/StatsCard"
import TokenDisplay from "../components/ui/TokenDisplay"

const Dashboard = () => {
  const { currentUser } = useAuth()
  const { tokens } = useToken()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  // Mock data fetching
  useEffect(() => {
    const fetchStats = async () => {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setStats({
        resumesAnalyzed: 12,
        resumesCreated: 5,
        roadmapsGenerated: 3,
        leetcodeProblems: 47,
      })

      setLoading(false)
    }

    fetchStats()
  }, [])

  const features = [
    {
      title: "Resume Extractor",
      description: "Extract key information from your resume automatically",
      icon: FileText,
      path: "/resume-extractor",
      tokenCost: 1,
    },
    {
      title: "AI Resume Builder",
      description: "Generate professional resumes with AI assistance",
      icon: PenTool,
      path: "/resume-builder",
      tokenCost: 2,
    },
    {
      title: "Resume Checker",
      description: "Check your resume against ATS systems and get feedback",
      icon: CheckCircle,
      path: "/resume-checker",
      tokenCost: 1,
    },
    {
      title: "Roadmap Generator",
      description: "Create personalized career roadmaps based on your goals",
      icon: GitBranch,
      path: "/roadmap-generator",
      tokenCost: 3,
    },
    {
      title: "Business Connect",
      description: "Connect with recruiters and businesses looking for talent",
      icon: Briefcase,
      path: "/business-connect",
      tokenCost: 2,
    },
    {
      title: "Fake Resume Detector",
      description: "Detect fake or exaggerated claims in resumes",
      icon: AlertTriangle,
      path: "/fake-detector",
      tokenCost: 2,
      disabled: true,
    },
  ]

  return (
    <div className="space-y-8">
      {/* Welcome section */}
      <div className="glass-card">
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">
              Welcome back, <span className="text-gradient">{currentUser?.name}</span>
            </h1>
            <p className="text-gray-300">Continue enhancing your career journey with our AI-powered tools</p>
          </div>

          <TokenDisplay showBuyButton={true} />
        </div>
      </div>

      {/* Stats section */}
      <div>
        <h2 className="text-xl font-bold mb-4">Your Stats</h2>

        {loading ? (
          <div className="dashboard-grid">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="glass-card animate-pulse">
                <div className="h-5 w-24 bg-cyber-gray rounded mb-4"></div>
                <div className="h-8 w-16 bg-cyber-gray rounded"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="dashboard-grid">
            <StatsCard
              title="Resumes Analyzed"
              value={stats.resumesAnalyzed}
              icon={FileText}
              change="25%"
              changeType="increase"
            />
            <StatsCard
              title="Resumes Created"
              value={stats.resumesCreated}
              icon={PenTool}
              change="10%"
              changeType="increase"
            />
            <StatsCard title="Roadmaps Generated" value={stats.roadmapsGenerated} icon={GitBranch} />
            <StatsCard
              title="LeetCode Problems"
              value={stats.leetcodeProblems}
              icon={Award}
              change="5"
              changeType="increase"
            />
          </div>
        )}
      </div>

      {/* Recent activity */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Recent Activity</h2>
          <Link to="/profile" className="text-electric-blue hover:text-white text-sm flex items-center">
            View All <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>

        <div className="glass-card">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center animate-pulse">
                  <div className="h-10 w-10 rounded-full bg-cyber-gray"></div>
                  <div className="ml-4 space-y-2 flex-1">
                    <div className="h-4 bg-cyber-gray rounded w-3/4"></div>
                    <div className="h-3 bg-cyber-gray rounded w-1/4"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="p-2 rounded-full bg-cyber-gray text-neon-pink">
                  <FileText className="h-5 w-5" />
                </div>
                <div className="ml-3">
                  <p className="text-white">Resume analyzed: "Senior Software Engineer.pdf"</p>
                  <p className="text-xs text-gray-400">2 hours ago</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="p-2 rounded-full bg-cyber-gray text-electric-blue">
                  <GitBranch className="h-5 w-5" />
                </div>
                <div className="ml-3">
                  <p className="text-white">Roadmap generated: "Full Stack Developer Path"</p>
                  <p className="text-xs text-gray-400">Yesterday</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="p-2 rounded-full bg-cyber-gray text-neon-purple">
                  <PenTool className="h-5 w-5" />
                </div>
                <div className="ml-3">
                  <p className="text-white">Resume created: "Frontend Developer.pdf"</p>
                  <p className="text-xs text-gray-400">3 days ago</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* AI Tools section */}
      <div>
        <h2 className="text-xl font-bold mb-4">AI Tools</h2>

        <div className="dashboard-grid">
          {features.map((feature) => (
            <FeatureCard
              key={feature.title}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              path={feature.path}
              tokenCost={feature.tokenCost}
              disabled={feature.disabled}
            />
          ))}
        </div>
      </div>

      {/* Token section */}
      {tokens < 5 && (
        <div className="glass-card border border-neon-pink">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div>
              <h3 className="text-lg font-bold mb-2">Running low on tokens?</h3>
              <p className="text-gray-300 mb-4 md:mb-0">
                You have {tokens} token{tokens !== 1 ? "s" : ""} remaining. Purchase more to continue using our AI
                tools.
              </p>
            </div>

            <Link to="/subscription" className="cyber-button">
              Get More Tokens
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard
