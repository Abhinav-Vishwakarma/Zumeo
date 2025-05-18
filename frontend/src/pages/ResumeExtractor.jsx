"use client"

import { useState, useEffect } from "react"
import { FileText, Download, Copy, Check } from "lucide-react"
import { useToken } from "../contexts/TokenContext"
import { useNotification } from "../contexts/NotificationContext"
import FileUpload from "../components/ui/FileUpload"
import TokenDisplay from "../components/ui/TokenDisplay"

const ResumeExtractor = () => {
  const { tokens, useTokens } = useToken()
  const { showNotification } = useNotification()
  const [file, setFile] = useState(null)
  const [extracting, setExtracting] = useState(false)
  const [extracted, setExtracted] = useState(false)
  const [extractedData, setExtractedData] = useState(null)
  const [copied, setCopied] = useState(false)
  const [hasSufficientTokens, setHasSufficientTokens] = useState(true)

  // Mock extracted data
  const mockExtractedData = {
    personalInfo: {
      name: "John Doe",
      email: "john.doe@example.com",
      phone: "(123) 456-7890",
      location: "San Francisco, CA",
      linkedin: "linkedin.com/in/johndoe",
    },
    summary:
      "Experienced software engineer with 5+ years of experience in full-stack development, specializing in React, Node.js, and cloud technologies. Passionate about building scalable applications and solving complex problems.",
    skills: [
      "JavaScript",
      "TypeScript",
      "React",
      "Node.js",
      "Express",
      "MongoDB",
      "AWS",
      "Docker",
      "Kubernetes",
      "CI/CD",
      "Git",
      "Agile Methodologies",
    ],
    experience: [
      {
        title: "Senior Software Engineer",
        company: "Tech Solutions Inc.",
        location: "San Francisco, CA",
        dates: "Jan 2020 - Present",
        description: [
          "Led a team of 5 engineers to develop a microservices architecture",
          "Reduced API response time by 40% through optimization techniques",
          "Implemented CI/CD pipelines using GitHub Actions and AWS",
        ],
      },
      {
        title: "Software Engineer",
        company: "WebDev Co.",
        location: "San Francisco, CA",
        dates: "Mar 2018 - Dec 2019",
        description: [
          "Developed responsive web applications using React and Redux",
          "Collaborated with UX designers to implement user-friendly interfaces",
          "Participated in code reviews and mentored junior developers",
        ],
      },
    ],
    education: [
      {
        degree: "Master of Science in Computer Science",
        institution: "Stanford University",
        location: "Stanford, CA",
        dates: "2016 - 2018",
      },
      {
        degree: "Bachelor of Science in Computer Engineering",
        institution: "University of California, Berkeley",
        location: "Berkeley, CA",
        dates: "2012 - 2016",
      },
    ],
    certifications: [
      "AWS Certified Solutions Architect",
      "Google Cloud Professional Developer",
      "MongoDB Certified Developer",
    ],
  }

  const handleFileSelect = (selectedFile) => {
    setFile(selectedFile)
    setExtracted(false)
    setExtractedData(null)
  }

  const handleExtract = async () => {
    if (!file) {
      showNotification("Please upload a resume first", "error")
      return
    }

    // Check if user has enough tokens
    if (!hasSufficientTokens) {
      return
    }

    try {
      setExtracting(true)

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      setExtractedData(mockExtractedData)
      setExtracted(true)
      showNotification("Resume extracted successfully", "success")
    } catch (error) {
      showNotification("Failed to extract resume data", "error")
    } finally {
      setExtracting(false)
    }
  }

  const handleCopyToClipboard = () => {
    if (!extractedData) return

    const formattedData = JSON.stringify(extractedData, null, 2)
    navigator.clipboard.writeText(formattedData)

    setCopied(true)
    showNotification("Copied to clipboard", "success")

    setTimeout(() => {
      setCopied(false)
    }, 2000)
  }

  const handleDownload = () => {
    if (!extractedData) return

    const formattedData = JSON.stringify(extractedData, null, 2)
    const blob = new Blob([formattedData], { type: "application/json" })
    const url = URL.createObjectURL(blob)

    const a = document.createElement("a")
    a.href = url
    a.download = "extracted_resume_data.json"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    showNotification("Downloaded JSON data", "success")
  }

  useEffect(() => {
    if (!file) {
      return
    }

    if (!useTokens(1, "Resume Extraction")) {
      setHasSufficientTokens(false)
      return
    }

    setHasSufficientTokens(true)
  }, [file, useTokens])

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-2">Resume Extractor</h1>
          <p className="text-gray-300">Upload your resume and extract key information automatically</p>
        </div>

        <TokenDisplay />
      </div>

      <div className="glass-card">
        <h2 className="text-xl font-bold mb-4">Upload Resume</h2>

        <FileUpload
          accept=".pdf,.doc,.docx"
          maxSize={5}
          onFileSelect={handleFileSelect}
          label="Resume File"
          description="Upload your resume in PDF, DOC, or DOCX format"
        />

        <div className="mt-6">
          <button
            onClick={handleExtract}
            disabled={!file || extracting || !hasSufficientTokens}
            className={`cyber-button w-full md:w-auto ${!file ? "opacity-50 cursor-not-allowed" : ""} ${!hasSufficientTokens ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {extracting ? (
              <>
                <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2"></div>
                Extracting...
              </>
            ) : (
              <>
                <FileText className="mr-2 h-5 w-5" />
                Extract Resume Data (1 Token)
              </>
            )}
          </button>
        </div>
      </div>

      {extracted && extractedData && (
        <div className="glass-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Extracted Data</h2>

            <div className="flex space-x-2">
              <button
                onClick={handleCopyToClipboard}
                className="p-2 rounded-md bg-cyber-gray text-white hover:bg-cyber-gray/80 transition-colors"
                title="Copy to clipboard"
              >
                {copied ? <Check className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5" />}
              </button>

              <button
                onClick={handleDownload}
                className="p-2 rounded-md bg-cyber-gray text-white hover:bg-cyber-gray/80 transition-colors"
                title="Download JSON"
              >
                <Download className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="space-y-6">
            {/* Personal Information */}
            <div>
              <h3 className="text-lg font-medium text-electric-blue mb-2">Personal Information</h3>
              <div className="glass p-4 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-400 text-sm">Name</p>
                    <p className="text-white">{extractedData.personalInfo.name}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Email</p>
                    <p className="text-white">{extractedData.personalInfo.email}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Phone</p>
                    <p className="text-white">{extractedData.personalInfo.phone}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Location</p>
                    <p className="text-white">{extractedData.personalInfo.location}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">LinkedIn</p>
                    <p className="text-white">{extractedData.personalInfo.linkedin}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Summary */}
            <div>
              <h3 className="text-lg font-medium text-electric-blue mb-2">Summary</h3>
              <div className="glass p-4 rounded-lg">
                <p className="text-white">{extractedData.summary}</p>
              </div>
            </div>

            {/* Skills */}
            <div>
              <h3 className="text-lg font-medium text-electric-blue mb-2">Skills</h3>
              <div className="glass p-4 rounded-lg">
                <div className="flex flex-wrap gap-2">
                  {extractedData.skills.map((skill, index) => (
                    <span key={index} className="px-3 py-1 rounded-full bg-cyber-gray text-white text-sm">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Experience */}
            <div>
              <h3 className="text-lg font-medium text-electric-blue mb-2">Experience</h3>
              <div className="space-y-4">
                {extractedData.experience.map((exp, index) => (
                  <div key={index} className="glass p-4 rounded-lg">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-2">
                      <h4 className="text-white font-medium">{exp.title}</h4>
                      <p className="text-neon-pink">{exp.dates}</p>
                    </div>
                    <p className="text-gray-300 mb-2">
                      {exp.company}, {exp.location}
                    </p>
                    <ul className="list-disc list-inside text-gray-300 space-y-1">
                      {exp.description.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* Education */}
            <div>
              <h3 className="text-lg font-medium text-electric-blue mb-2">Education</h3>
              <div className="space-y-4">
                {extractedData.education.map((edu, index) => (
                  <div key={index} className="glass p-4 rounded-lg">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-2">
                      <h4 className="text-white font-medium">{edu.degree}</h4>
                      <p className="text-neon-pink">{edu.dates}</p>
                    </div>
                    <p className="text-gray-300">
                      {edu.institution}, {edu.location}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Certifications */}
            {extractedData.certifications.length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-electric-blue mb-2">Certifications</h3>
                <div className="glass p-4 rounded-lg">
                  <ul className="list-disc list-inside text-gray-300 space-y-1">
                    {extractedData.certifications.map((cert, index) => (
                      <li key={index}>{cert}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default ResumeExtractor
