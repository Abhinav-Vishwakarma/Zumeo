"use client"

import { useState } from "react"
import { Briefcase, Search, Filter, User, MapPin, Building, Clock, ExternalLink } from "lucide-react"
import { useToken } from "../contexts/TokenContext"
import { useNotification } from "../contexts/NotificationContext"
import TokenDisplay from "../components/ui/TokenDisplay"

const BusinessConnect = () => {
  const { tokens, useTokens } = useToken()
  const { showNotification } = useNotification()
  const [activeTab, setActiveTab] = useState("jobs")
  const [searchQuery, setSearchQuery] = useState("")
  const [filters, setFilters] = useState({
    location: "",
    jobType: "all",
    experience: "all",
    salary: "all",
  })
  const [showFilters, setShowFilters] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false) // Add a state to track connection status
  const [hasEnoughTokens, setHasEnoughTokens] = useState(true)

  // Mock job listings
  const mockJobs = [
    {
      id: 1,
      title: "Senior Frontend Developer",
      company: "TechCorp Inc.",
      location: "San Francisco, CA (Remote)",
      type: "Full-time",
      salary: "$120,000 - $150,000",
      posted: "2 days ago",
      description:
        "We're looking for a Senior Frontend Developer to join our team. You'll be responsible for building user interfaces for our web applications using React, TypeScript, and modern frontend tools.",
      requirements: [
        "5+ years of experience with JavaScript and frontend frameworks",
        "Strong knowledge of React, Redux, and TypeScript",
        "Experience with responsive design and CSS preprocessors",
        "Familiarity with testing frameworks like Jest and React Testing Library",
      ],
      logo: "https://i.pravatar.cc/150?u=techcorp",
    },
    {
      id: 2,
      title: "Full Stack Engineer",
      company: "InnovateSoft",
      location: "New York, NY",
      type: "Full-time",
      salary: "$130,000 - $160,000",
      posted: "1 week ago",
      description:
        "InnovateSoft is seeking a Full Stack Engineer to help build and maintain our cloud-based platform. You'll work on both frontend and backend components using modern technologies.",
      requirements: [
        "3+ years of full stack development experience",
        "Proficiency in JavaScript/TypeScript, React, and Node.js",
        "Experience with SQL and NoSQL databases",
        "Knowledge of cloud services (AWS, Azure, or GCP)",
      ],
      logo: "https://i.pravatar.cc/150?u=innovatesoft",
    },
    {
      id: 3,
      title: "DevOps Engineer",
      company: "CloudScale Systems",
      location: "Austin, TX (Hybrid)",
      type: "Contract",
      salary: "$100,000 - $130,000",
      posted: "3 days ago",
      description:
        "Join our DevOps team to help automate and optimize our infrastructure. You'll work on CI/CD pipelines, containerization, and cloud infrastructure management.",
      requirements: [
        "Experience with Docker, Kubernetes, and container orchestration",
        "Knowledge of infrastructure as code (Terraform, CloudFormation)",
        "Familiarity with CI/CD tools (Jenkins, GitHub Actions)",
        "Understanding of cloud platforms (preferably AWS)",
      ],
      logo: "https://i.pravatar.cc/150?u=cloudscale",
    },
    {
      id: 4,
      title: "Machine Learning Engineer",
      company: "AI Innovations",
      location: "Remote",
      type: "Full-time",
      salary: "$140,000 - $180,000",
      posted: "5 days ago",
      description:
        "We're looking for a Machine Learning Engineer to join our AI research team. You'll develop and deploy machine learning models for various applications.",
      requirements: [
        "Strong background in machine learning and deep learning",
        "Experience with Python and ML frameworks (TensorFlow, PyTorch)",
        "Knowledge of data processing and feature engineering",
        "Familiarity with deploying ML models to production",
      ],
      logo: "https://i.pravatar.cc/150?u=aiinnovations",
    },
  ]

  // Mock talent profiles
  const mockTalent = [
    {
      id: 1,
      name: "Alex Johnson",
      title: "Senior Software Engineer",
      skills: ["JavaScript", "React", "Node.js", "AWS", "TypeScript"],
      experience: "8 years",
      location: "San Francisco, CA",
      availability: "Available in 2 weeks",
      bio: "Experienced software engineer with a focus on full-stack JavaScript development. I've worked with startups and large enterprises to build scalable web applications.",
      avatar: "https://i.pravatar.cc/150?u=alex",
    },
    {
      id: 2,
      name: "Samantha Lee",
      title: "UX/UI Designer",
      skills: ["UI Design", "User Research", "Figma", "Adobe XD", "Prototyping"],
      experience: "5 years",
      location: "New York, NY",
      availability: "Available now",
      bio: "Creative designer passionate about creating intuitive and beautiful user experiences. I combine user research with design thinking to solve complex problems.",
      avatar: "https://i.pravatar.cc/150?u=samantha",
    },
    {
      id: 3,
      name: "Michael Chen",
      title: "Data Scientist",
      skills: ["Python", "Machine Learning", "SQL", "Data Visualization", "Statistics"],
      experience: "4 years",
      location: "Remote",
      availability: "Available in 1 month",
      bio: "Data scientist with experience in predictive modeling and machine learning. I help companies make data-driven decisions through analytics and visualization.",
      avatar: "https://i.pravatar.cc/150?u=michael",
    },
    {
      id: 4,
      name: "Olivia Martinez",
      title: "DevOps Engineer",
      skills: ["Docker", "Kubernetes", "AWS", "CI/CD", "Terraform"],
      experience: "6 years",
      location: "Austin, TX",
      availability: "Available now",
      bio: "DevOps engineer specializing in cloud infrastructure and automation. I build reliable, scalable systems that enable teams to deploy with confidence.",
      avatar: "https://i.pravatar.cc/150?u=olivia",
    },
  ]

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value)
  }

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters({
      ...filters,
      [name]: value,
    })
  }

  const toggleFilters = () => {
    setShowFilters(!showFilters)
  }

  const handleConnect = async (id) => {
    setIsConnecting(true) // Set connecting state to true

    try {
      // Check if user has enough tokens
      const canUseTokens = useTokens(2, "Business Connect")
      setHasEnoughTokens(canUseTokens)

      if (!canUseTokens) {
        showNotification("Not enough tokens. Please purchase more.", "error")
        return
      }

      showNotification("Connection request sent successfully", "success")
    } finally {
      setIsConnecting(false) // Set connecting state back to false after the operation is complete
    }
  }

  const filteredJobs = mockJobs.filter((job) => {
    return (
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })

  const filteredTalent = mockTalent.filter((talent) => {
    return (
      talent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      talent.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      talent.skills.some((skill) => skill.toLowerCase().includes(searchQuery.toLowerCase()))
    )
  })

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-2">Business Connect</h1>
          <p className="text-gray-300">Connect with businesses and find job opportunities</p>
        </div>

        <TokenDisplay />
      </div>

      <div className="glass-card">
        {/* Tabs */}
        <div className="flex border-b border-gray-700 mb-6">
          <button
            className={`px-4 py-2 font-medium ${
              activeTab === "jobs"
                ? "text-electric-blue border-b-2 border-electric-blue"
                : "text-gray-400 hover:text-white"
            }`}
            onClick={() => setActiveTab("jobs")}
          >
            Job Listings
          </button>
          <button
            className={`px-4 py-2 font-medium ${
              activeTab === "talent"
                ? "text-electric-blue border-b-2 border-electric-blue"
                : "text-gray-400 hover:text-white"
            }`}
            onClick={() => setActiveTab("talent")}
          >
            Find Talent
          </button>
        </div>

        {/* Search and filters */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder={`Search ${activeTab === "jobs" ? "jobs" : "talent"}...`}
                value={searchQuery}
                onChange={handleSearchChange}
                className="cyber-input pl-10"
              />
            </div>

            <button
              onClick={toggleFilters}
              className="cyber-button-secondary flex items-center justify-center md:w-auto"
            >
              <Filter className="mr-2 h-4 w-4" />
              Filters
            </button>
          </div>

          {showFilters && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Location</label>
                <input
                  type="text"
                  name="location"
                  value={filters.location}
                  onChange={handleFilterChange}
                  placeholder="Any location"
                  className="cyber-input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Job Type</label>
                <select name="jobType" value={filters.jobType} onChange={handleFilterChange} className="cyber-input">
                  <option value="all">All Types</option>
                  <option value="full-time">Full-time</option>
                  <option value="part-time">Part-time</option>
                  <option value="contract">Contract</option>
                  <option value="remote">Remote</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Experience</label>
                <select
                  name="experience"
                  value={filters.experience}
                  onChange={handleFilterChange}
                  className="cyber-input"
                >
                  <option value="all">Any Experience</option>
                  <option value="entry">Entry Level (0-2 years)</option>
                  <option value="mid">Mid Level (3-5 years)</option>
                  <option value="senior">Senior (5+ years)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Salary Range</label>
                <select name="salary" value={filters.salary} onChange={handleFilterChange} className="cyber-input">
                  <option value="all">Any Salary</option>
                  <option value="50k-100k">$50k - $100k</option>
                  <option value="100k-150k">$100k - $150k</option>
                  <option value="150k+">$150k+</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Content based on active tab */}
        {activeTab === "jobs" ? (
          <div className="space-y-6">
            {filteredJobs.length > 0 ? (
              filteredJobs.map((job) => (
                <div
                  key={job.id}
                  className="glass p-6 rounded-lg hover:border-electric-blue border border-transparent transition-colors"
                >
                  <div className="flex flex-col md:flex-row">
                    <div className="md:mr-6 mb-4 md:mb-0">
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-cyber-gray">
                        <img
                          src={job.logo || "/placeholder.svg"}
                          alt={job.company}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>

                    <div className="flex-1">
                      <div className="flex flex-col md:flex-row md:items-center justify-between mb-2">
                        <h3 className="text-xl font-bold text-white">{job.title}</h3>
                        <span className="text-neon-pink text-sm">{job.salary}</span>
                      </div>

                      <div className="flex flex-wrap gap-y-2 mb-4">
                        <div className="flex items-center text-gray-300 text-sm mr-4">
                          <Building className="h-4 w-4 mr-1" />
                          {job.company}
                        </div>
                        <div className="flex items-center text-gray-300 text-sm mr-4">
                          <MapPin className="h-4 w-4 mr-1" />
                          {job.location}
                        </div>
                        <div className="flex items-center text-gray-300 text-sm mr-4">
                          <Briefcase className="h-4 w-4 mr-1" />
                          {job.type}
                        </div>
                        <div className="flex items-center text-gray-300 text-sm">
                          <Clock className="h-4 w-4 mr-1" />
                          {job.posted}
                        </div>
                      </div>

                      <p className="text-gray-300 mb-4">{job.description}</p>

                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-white mb-2">Requirements:</h4>
                        <ul className="list-disc list-inside text-gray-300 text-sm">
                          {job.requirements.map((req, index) => (
                            <li key={index}>{req}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                        <button
                          onClick={() => handleConnect(job.id)}
                          className={`cyber-button flex items-center justify-center ${isConnecting || !hasEnoughTokens ? "opacity-50 cursor-not-allowed" : ""}`}
                          disabled={isConnecting || !hasEnoughTokens}
                        >
                          <Briefcase className="mr-2 h-4 w-4" />
                          {isConnecting ? "Connecting..." : "Apply Now (2 Tokens)"}
                        </button>
                        <a href="#" className="text-electric-blue hover:text-white text-sm flex items-center">
                          View Full Details
                          <ExternalLink className="ml-1 h-4 w-4" />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Briefcase className="h-12 w-12 mx-auto text-gray-500 mb-4" />
                <h3 className="text-xl font-medium text-white mb-2">No jobs found</h3>
                <p className="text-gray-400">Try adjusting your search or filters</p>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredTalent.length > 0 ? (
              filteredTalent.map((talent) => (
                <div
                  key={talent.id}
                  className="glass p-6 rounded-lg hover:border-electric-blue border border-transparent transition-colors"
                >
                  <div className="flex">
                    <div className="mr-4">
                      <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-electric-blue">
                        <img
                          src={talent.avatar || "/placeholder.svg"}
                          alt={talent.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>

                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-white">{talent.name}</h3>
                      <p className="text-electric-blue">{talent.title}</p>

                      <div className="flex items-center text-gray-300 text-sm mt-2 mb-3">
                        <User className="h-4 w-4 mr-1" />
                        <span className="mr-3">{talent.experience} exp</span>
                        <MapPin className="h-4 w-4 mr-1" />
                        <span>{talent.location}</span>
                      </div>

                      <div className="mb-3">
                        <div className="flex flex-wrap gap-2 mb-3">
                          {talent.skills.map((skill, index) => (
                            <span key={index} className="px-2 py-1 text-xs rounded-full bg-cyber-gray text-white">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>

                      <p className="text-gray-300 text-sm mb-4">{talent.bio}</p>

                      <div className="flex items-center justify-between">
                        <span className="text-neon-pink text-sm">{talent.availability}</span>
                        <button
                          onClick={() => handleConnect(talent.id)}
                          className={`cyber-button-secondary text-sm px-3 py-1 ${isConnecting || !hasEnoughTokens ? "opacity-50 cursor-not-allowed" : ""}`}
                          disabled={isConnecting || !hasEnoughTokens}
                        >
                          {isConnecting ? "Connecting..." : "Connect (2 Tokens)"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 col-span-2">
                <User className="h-12 w-12 mx-auto text-gray-500 mb-4" />
                <h3 className="text-xl font-medium text-white mb-2">No talent found</h3>
                <p className="text-gray-400">Try adjusting your search or filters</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default BusinessConnect
