"use client"

import { useState } from "react"
import ReactFlow, { Background, Controls, MiniMap, MarkerType } from "reactflow"
import "reactflow/dist/style.css"
import { Loader2, AlertCircle } from "lucide-react"
import DashboardLayout from "../components/DashboardLayout"
import { roadmapService } from "../services/api"
import { useAuth } from "../contexts/AuthContext"

const RoadmapGenerator = () => {
  const { credits, updateCredits } = useAuth()
  const [formData, setFormData] = useState({
    current_role: "",
    target_role: "",
    years_of_experience: "0-1 years",
    timeframe: "6 months",
    current_skills: "",
    areas_of_interest: "",
    preferred_learning_style: "visual",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [roadmapData, setRoadmapData] = useState(null)
  const [step, setStep] = useState("form") // form, generating, results

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (credits < 3) {
      setError("You need at least 3 credits to generate a roadmap")
      return
    }

    setLoading(true)
    setError("")
    setStep("generating")

    try {
      const response = await roadmapService.generateRoadmap(formData)
      setRoadmapData(response.data)
      setStep("results")

      // Update credits after successful operation
      updateCredits()
    } catch (err) {
      console.error("Error generating roadmap:", err)
      setError(err.response?.data?.detail || "An error occurred while generating your roadmap")
      setStep("form")
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setRoadmapData(null)
    setStep("form")
  }

  // Custom node styles
  const nodeTypes = {
    start: { style: { background: "rgba(147, 51, 234, 0.2)", borderColor: "#9333ea" } },
    step: { style: { background: "rgba(59, 130, 246, 0.2)", borderColor: "#3b82f6" } },
    milestone: { style: { background: "rgba(236, 72, 153, 0.2)", borderColor: "#ec4899" } },
    skill: { style: { background: "rgba(16, 185, 129, 0.2)", borderColor: "#10b981" } },
    project: { style: { background: "rgba(245, 158, 11, 0.2)", borderColor: "#f59e0b" } },
    end: { style: { background: "rgba(239, 68, 68, 0.2)", borderColor: "#ef4444" } },
  }

  // Apply custom styles to nodes
  const getStyledNodes = (nodes) => {
    if (!nodes) return []

    return nodes.map((node) => {
      const typeStyle = nodeTypes[node.type]?.style || {}
      return {
        ...node,
        style: {
          ...typeStyle,
          padding: 10,
          borderWidth: 2,
          borderRadius: 8,
          width: 200,
        },
      }
    })
  }

  // Apply custom styles to edges
  const getStyledEdges = (edges) => {
    if (!edges) return []

    return edges.map((edge) => ({
      ...edge,
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 20,
        height: 20,
      },
      style: {
        stroke: "#9333ea",
        strokeWidth: 2,
      },
      animated: edge.animated || false,
    }))
  }

  return (
    <DashboardLayout title="Career Roadmap Generator">
      <div className="max-w-4xl mx-auto">
        {step === "form" && (
          <div className="glassmorphism rounded-xl p-6 mb-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xl font-bold">Generate Your Career Roadmap</h2>
                <p className="text-gray-300 mt-1">
                  Create a personalized career roadmap based on your goals and preferences.
                </p>
              </div>
              <div className="bg-primary/20 px-4 py-2 rounded-lg">
                <p className="text-sm">
                  Cost: <span className="font-bold">3 credits</span>
                </p>
                <p className="text-xs text-gray-400">You have {credits} credits</p>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="mb-6 p-3 bg-destructive/20 border border-destructive/50 rounded-md flex items-start">
                <AlertCircle className="h-5 w-5 text-destructive mr-2 flex-shrink-0 mt-0.5" />
                <p>{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="current_role" className="block text-sm font-medium mb-1">
                    Current Role
                  </label>
                  <input
                    id="current_role"
                    name="current_role"
                    type="text"
                    value={formData.current_role}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-secondary border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                    placeholder="e.g., Junior Developer"
                  />
                </div>

                <div>
                  <label htmlFor="target_role" className="block text-sm font-medium mb-1">
                    Target Role
                  </label>
                  <input
                    id="target_role"
                    name="target_role"
                    type="text"
                    value={formData.target_role}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-secondary border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                    placeholder="e.g., Senior Developer"
                  />
                </div>

                <div>
                  <label htmlFor="years_of_experience" className="block text-sm font-medium mb-1">
                    Years of Experience
                  </label>
                  <select
                    id="years_of_experience"
                    name="years_of_experience"
                    value={formData.years_of_experience}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-secondary border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  >
                    <option value="0-1 years">0-1 years</option>
                    <option value="1-3 years">1-3 years</option>
                    <option value="3-5 years">3-5 years</option>
                    <option value="5-10 years">5-10 years</option>
                    <option value="10+ years">10+ years</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="timeframe" className="block text-sm font-medium mb-1">
                    Timeframe for Transition
                  </label>
                  <select
                    id="timeframe"
                    name="timeframe"
                    value={formData.timeframe}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-secondary border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  >
                    <option value="6 months">6 months</option>
                    <option value="1 year">1 year</option>
                    <option value="2 years">2 years</option>
                    <option value="3 years">3 years</option>
                    <option value="5 years">5 years</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="current_skills" className="block text-sm font-medium mb-1">
                    Current Skills (comma separated)
                  </label>
                  <input
                    id="current_skills"
                    name="current_skills"
                    type="text"
                    value={formData.current_skills}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-secondary border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                    placeholder="e.g., JavaScript, HTML, CSS, React"
                  />
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="areas_of_interest" className="block text-sm font-medium mb-1">
                    Areas of Interest (comma separated)
                  </label>
                  <input
                    id="areas_of_interest"
                    name="areas_of_interest"
                    type="text"
                    value={formData.areas_of_interest}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-secondary border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                    placeholder="e.g., Machine Learning, Cloud Computing, Mobile Development"
                  />
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="preferred_learning_style" className="block text-sm font-medium mb-1">
                    Preferred Learning Style
                  </label>
                  <select
                    id="preferred_learning_style"
                    name="preferred_learning_style"
                    value={formData.preferred_learning_style}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-secondary border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  >
                    <option value="visual">Visual</option>
                    <option value="auditory">Auditory</option>
                    <option value="kinesthetic">Kinesthetic (hands-on)</option>
                    <option value="reading/writing">Reading/Writing</option>
                  </select>
                </div>
              </div>

              <div className="mt-6">
                <button
                  type="submit"
                  disabled={loading || credits < 3}
                  className="cyber-button w-full flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    "Generate Roadmap"
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {step === "generating" && (
          <div className="glassmorphism rounded-xl p-8 text-center">
            <Loader2 className="h-12 w-12 text-primary mx-auto animate-spin mb-4" />
            <h2 className="text-xl font-bold mb-2">Generating Your Career Roadmap</h2>
            <p className="text-gray-300">
              Please wait while our AI creates your personalized career roadmap. This may take a moment...
            </p>
          </div>
        )}

        {step === "results" && roadmapData && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Your Career Roadmap</h2>
              <button onClick={handleReset} className="cyber-button-secondary">
                Generate New Roadmap
              </button>
            </div>

            <div className="glassmorphism rounded-xl p-6 mb-6">
              <h3 className="text-lg font-bold mb-4">
                Roadmap: {formData.current_role} → {formData.target_role}
              </h3>

              <div className="h-[600px] w-full bg-secondary/50 rounded-lg">
                <ReactFlow nodes={getStyledNodes(roadmapData.nodes)} edges={getStyledEdges(roadmapData.edges)} fitView>
                  <Background color="#9333ea" gap={16} size={1} />
                  <Controls />
                  <MiniMap
                    nodeStrokeColor={(n) => {
                      const type = n.type || "default"
                      return nodeTypes[type]?.style?.borderColor || "#9333ea"
                    }}
                    nodeColor={(n) => {
                      const type = n.type || "default"
                      return nodeTypes[type]?.style?.background || "rgba(147, 51, 234, 0.2)"
                    }}
                  />
                </ReactFlow>
              </div>

              <div className="mt-4 grid grid-cols-3 md:grid-cols-6 gap-2">
                {Object.entries(nodeTypes).map(([type, { style }]) => (
                  <div key={type} className="flex items-center">
                    <div
                      className="w-4 h-4 rounded-sm mr-2"
                      style={{
                        background: style.background,
                        borderWidth: 1,
                        borderColor: style.borderColor,
                        borderStyle: "solid",
                      }}
                    ></div>
                    <span className="text-xs capitalize">{type}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

export default RoadmapGenerator
