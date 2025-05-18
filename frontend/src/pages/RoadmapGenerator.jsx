"use client"

import { useState } from "react"
import { GitBranch, Download, ArrowRight, Check, ChevronDown, ChevronUp } from "lucide-react"
import { useToken } from "../contexts/TokenContext"
import { useNotification } from "../contexts/NotificationContext"
import TokenDisplay from "../components/ui/TokenDisplay"

const RoadmapGenerator = () => {
  const { tokens, useTokens } = useToken()
  const { showNotification } = useNotification()
  const [currentStep, setCurrentStep] = useState(1)
  const [generating, setGenerating] = useState(false)
  const [roadmap, setRoadmap] = useState(null)
  const [expandedNodes, setExpandedNodes] = useState({})
  const [formData, setFormData] = useState({
    currentRole: "",
    targetRole: "",
    experience: "0-1",
    timeframe: "6",
    skills: "",
    interests: "",
    learningStyle: "visual",
  })
  const [hasEnoughTokens, setHasEnoughTokens] = useState(true)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleNextStep = () => {
    setCurrentStep(currentStep + 1)
  }

  const handlePrevStep = () => {
    setCurrentStep(currentStep - 1)
  }

  const toggleNodeExpansion = (nodeId) => {
    setExpandedNodes({
      ...expandedNodes,
      [nodeId]: !expandedNodes[nodeId],
    })
  }

  const handleGenerate = async () => {
    // Check if user has enough tokens
    if (!useTokens(3, "Roadmap Generation")) {
      showNotification("Not enough tokens. Please purchase more.", "error")
      setHasEnoughTokens(false)
      return
    }
    setHasEnoughTokens(true)

    try {
      setGenerating(true)

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 3000))

      // Mock roadmap data
      const mockRoadmap = {
        title: `${formData.currentRole} to ${formData.targetRole} Roadmap`,
        description: `A personalized career roadmap to transition from ${formData.currentRole} to ${formData.targetRole} within ${formData.timeframe} months.`,
        timeframe: `${formData.timeframe} months`,
        nodes: [
          {
            id: "foundation",
            title: "Foundation",
            description: "Build a strong foundation with these essential skills",
            timeframe: "Month 1-2",
            tasks: [
              {
                title: "Core Concepts",
                description: "Master the fundamental concepts required for your target role",
                resources: [
                  { type: "course", name: "Introduction to Software Engineering", url: "#" },
                  { type: "book", name: "Clean Code by Robert C. Martin", url: "#" },
                ],
                skills: ["Problem Solving", "Algorithmic Thinking", "System Design Basics"],
              },
              {
                title: "Technical Skills",
                description: "Learn the essential technical skills for your target role",
                resources: [
                  { type: "course", name: "Complete Web Development Bootcamp", url: "#" },
                  { type: "documentation", name: "MDN Web Docs", url: "#" },
                ],
                skills: ["HTML/CSS", "JavaScript", "Git Version Control"],
              },
              {
                title: "Industry Knowledge",
                description: "Understand the industry landscape and best practices",
                resources: [
                  { type: "article", name: "State of Software Engineering 2023", url: "#" },
                  { type: "podcast", name: "Software Engineering Daily", url: "#" },
                ],
                skills: ["Industry Trends", "Best Practices", "Development Methodologies"],
              },
            ],
          },
          {
            id: "intermediate",
            title: "Intermediate Skills",
            description: "Develop more advanced skills specific to your target role",
            timeframe: "Month 3-4",
            tasks: [
              {
                title: "Advanced Technical Skills",
                description: "Master more complex technical concepts",
                resources: [
                  { type: "course", name: "Advanced JavaScript Concepts", url: "#" },
                  { type: "tutorial", name: "Building RESTful APIs", url: "#" },
                ],
                skills: ["React.js", "Node.js", "Database Design", "API Development"],
              },
              {
                title: "Project Work",
                description: "Build projects to demonstrate your skills",
                resources: [
                  { type: "project", name: "Full-Stack Web Application", url: "#" },
                  { type: "github", name: "Open Source Contributions", url: "#" },
                ],
                skills: ["Project Management", "Full-Stack Development", "Debugging"],
              },
              {
                title: "Soft Skills Development",
                description: "Enhance your communication and collaboration abilities",
                resources: [
                  { type: "course", name: "Effective Communication for Engineers", url: "#" },
                  { type: "book", name: "Soft Skills: The Software Developer's Life Manual", url: "#" },
                ],
                skills: ["Communication", "Teamwork", "Time Management"],
              },
            ],
          },
          {
            id: "advanced",
            title: "Advanced Specialization",
            description: "Specialize in areas specific to your target role",
            timeframe: "Month 5-6",
            tasks: [
              {
                title: "Specialized Knowledge",
                description: "Develop expertise in specialized areas",
                resources: [
                  { type: "course", name: "Cloud Architecture Masterclass", url: "#" },
                  { type: "certification", name: "AWS Certified Solutions Architect", url: "#" },
                ],
                skills: ["Cloud Computing", "Microservices", "Serverless Architecture"],
              },
              {
                title: "Industry Networking",
                description: "Build your professional network in the industry",
                resources: [
                  { type: "event", name: "Tech Conferences and Meetups", url: "#" },
                  { type: "platform", name: "LinkedIn Networking Strategy", url: "#" },
                ],
                skills: ["Networking", "Personal Branding", "Interview Skills"],
              },
              {
                title: "Job Preparation",
                description: "Prepare for job applications and interviews",
                resources: [
                  { type: "course", name: "Technical Interview Preparation", url: "#" },
                  { type: "tool", name: "Resume and Portfolio Builder", url: "#" },
                ],
                skills: ["Interview Techniques", "Portfolio Development", "Salary Negotiation"],
              },
            ],
          },
        ],
      }

      setRoadmap(mockRoadmap)
      showNotification("Roadmap generated successfully", "success")
    } catch (error) {
      showNotification("Failed to generate roadmap", "error")
    } finally {
      setGenerating(false)
    }
  }

  const handleDownload = () => {
    if (!roadmap) return

    showNotification("Roadmap downloaded successfully", "success")
  }

  const renderFormStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-electric-blue">Career Information</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Current Role</label>
                <input
                  type="text"
                  name="currentRole"
                  value={formData.currentRole}
                  onChange={handleInputChange}
                  className="cyber-input"
                  placeholder="e.g. Junior Developer"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Target Role</label>
                <input
                  type="text"
                  name="targetRole"
                  value={formData.targetRole}
                  onChange={handleInputChange}
                  className="cyber-input"
                  placeholder="e.g. Senior Full Stack Developer"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Years of Experience</label>
                <select
                  name="experience"
                  value={formData.experience}
                  onChange={handleInputChange}
                  className="cyber-input"
                >
                  <option value="0-1">0-1 years</option>
                  <option value="1-3">1-3 years</option>
                  <option value="3-5">3-5 years</option>
                  <option value="5+">5+ years</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Timeframe</label>
                <select
                  name="timeframe"
                  value={formData.timeframe}
                  onChange={handleInputChange}
                  className="cyber-input"
                >
                  <option value="3">3 months</option>
                  <option value="6">6 months</option>
                  <option value="12">12 months</option>
                  <option value="24">24 months</option>
                </select>
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-electric-blue">Skills & Preferences</h2>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Current Skills (comma separated)</label>
              <textarea
                name="skills"
                value={formData.skills}
                onChange={handleInputChange}
                rows={3}
                className="cyber-input"
                placeholder="e.g. JavaScript, HTML, CSS, React basics"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Areas of Interest (comma separated)
              </label>
              <textarea
                name="interests"
                value={formData.interests}
                onChange={handleInputChange}
                rows={3}
                className="cyber-input"
                placeholder="e.g. Web Development, Cloud Computing, Machine Learning"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Preferred Learning Style</label>
              <select
                name="learningStyle"
                value={formData.learningStyle}
                onChange={handleInputChange}
                className="cyber-input"
              >
                <option value="visual">Visual (videos, diagrams)</option>
                <option value="reading">Reading (books, articles)</option>
                <option value="interactive">Interactive (projects, exercises)</option>
                <option value="mixed">Mixed (combination of styles)</option>
              </select>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  const renderRoadmap = () => {
    if (!roadmap) return null

    return (
      <div className="space-y-8">
        <div className="glass-card">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-electric-blue">{roadmap.title}</h2>
              <p className="text-gray-300 mt-2">{roadmap.description}</p>
              <p className="text-neon-pink mt-1">Timeframe: {roadmap.timeframe}</p>
            </div>

            <button onClick={handleDownload} className="cyber-button flex items-center mt-4 md:mt-0">
              <Download className="mr-2 h-4 w-4" />
              Download Roadmap
            </button>
          </div>

          <div className="relative pl-8 border-l-2 border-electric-blue">
            {roadmap.nodes.map((node, nodeIndex) => (
              <div key={node.id} className="mb-12 relative">
                <div className="absolute -left-[41px] w-8 h-8 rounded-full bg-electric-blue flex items-center justify-center">
                  {nodeIndex + 1}
                </div>

                <div className="glass p-6 rounded-lg">
                  <div
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => toggleNodeExpansion(node.id)}
                  >
                    <div>
                      <h3 className="text-xl font-bold text-white">{node.title}</h3>
                      <p className="text-neon-pink text-sm">{node.timeframe}</p>
                    </div>
                    <button className="p-2 rounded-full hover:bg-cyber-gray transition-colors">
                      {expandedNodes[node.id] ? (
                        <ChevronUp className="h-5 w-5 text-electric-blue" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-electric-blue" />
                      )}
                    </button>
                  </div>

                  <p className="text-gray-300 mt-2">{node.description}</p>

                  {expandedNodes[node.id] && (
                    <div className="mt-4 space-y-6">
                      {node.tasks.map((task, taskIndex) => (
                        <div key={taskIndex} className="glass p-4 rounded-lg">
                          <h4 className="text-lg font-medium text-electric-blue">{task.title}</h4>
                          <p className="text-gray-300 mt-1">{task.description}</p>

                          <div className="mt-4">
                            <h5 className="text-sm font-medium text-white mb-2">Key Skills:</h5>
                            <div className="flex flex-wrap gap-2">
                              {task.skills.map((skill, skillIndex) => (
                                <span
                                  key={skillIndex}
                                  className="px-2 py-1 text-xs rounded-full bg-cyber-gray text-white"
                                >
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div className="mt-4">
                            <h5 className="text-sm font-medium text-white mb-2">Resources:</h5>
                            <ul className="space-y-2">
                              {task.resources.map((resource, resourceIndex) => (
                                <li key={resourceIndex} className="flex items-start">
                                  <span className="inline-block w-16 text-xs text-neon-pink mr-2">
                                    {resource.type}:
                                  </span>
                                  <a href={resource.url} className="text-electric-blue hover:text-white text-sm">
                                    {resource.name}
                                  </a>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-2">Custom Roadmap Generator</h1>
          <p className="text-gray-300">Create a personalized career roadmap based on your goals</p>
        </div>

        <TokenDisplay />
      </div>

      {roadmap ? (
        <>
          <div className="flex justify-end">
            <button onClick={() => setRoadmap(null)} className="cyber-button-secondary">
              Create New Roadmap
            </button>
          </div>
          {renderRoadmap()}
        </>
      ) : (
        <div className="glass-card">
          {/* Progress steps */}
          <div className="flex justify-center mb-8">
            {[1, 2].map((stepNumber) => (
              <div
                key={stepNumber}
                className={`flex flex-col items-center mx-4 ${stepNumber < currentStep ? "text-electric-blue" : stepNumber === currentStep ? "text-neon-pink" : "text-gray-500"}`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                    stepNumber < currentStep
                      ? "bg-electric-blue text-cyber-black"
                      : stepNumber === currentStep
                        ? "bg-neon-pink text-white"
                        : "bg-cyber-gray text-gray-400"
                  }`}
                >
                  {stepNumber === 1 ? <GitBranch className="h-5 w-5" /> : <Check className="h-5 w-5" />}
                </div>
                <span className="text-sm">{stepNumber === 1 ? "Career Information" : "Skills & Preferences"}</span>
              </div>
            ))}
          </div>

          {/* Form */}
          <form className="mt-6">
            {renderFormStep()}

            {/* Navigation buttons */}
            <div className="flex justify-between mt-8">
              {currentStep > 1 ? (
                <button type="button" onClick={handlePrevStep} className="cyber-button-secondary flex items-center">
                  <ArrowRight className="mr-2 h-4 w-4 transform rotate-180" />
                  Previous
                </button>
              ) : (
                <div></div>
              )}

              {currentStep < 2 ? (
                <button type="button" onClick={handleNextStep} className="cyber-button flex items-center">
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={generating || !hasEnoughTokens}
                  className={`cyber-button flex items-center ${generating || !hasEnoughTokens ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  {generating ? (
                    <>
                      <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2"></div>
                      Generating...
                    </>
                  ) : (
                    <>
                      <GitBranch className="mr-2 h-5 w-5" />
                      Generate Roadmap (3 Tokens)
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

export default RoadmapGenerator
