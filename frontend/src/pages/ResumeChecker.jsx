"use client"

import { useState, useEffect } from "react"
import { CheckCircle, AlertTriangle, FileText, Download } from "lucide-react"
import { useToken } from "../contexts/TokenContext"
import { useNotification } from "../contexts/NotificationContext"
import FileUpload from "../components/ui/FileUpload"
import TokenDisplay from "../components/ui/TokenDisplay"

const ResumeChecker = () => {
  const { tokens, useTokens } = useToken()
  const { showNotification } = useNotification()
  const [file, setFile] = useState(null)
  const [checking, setChecking] = useState(false)
  const [results, setResults] = useState(null)
  const [hasSufficientTokens, setHasSufficientTokens] = useState(true)

  useEffect(() => {
    const checkTokens = async () => {
      if (file) {
        // Check if user has enough tokens
        const sufficient = await useTokens(1, "Resume Checker")
        setHasSufficientTokens(sufficient)
      }
    }

    checkTokens()
  }, [file, useTokens])

  // Mock ATS check results
  const mockResults = {
    score: 82,
    matches: 85,
    readability: 78,
    format: 90,
    keywords: 75,
    issues: [
      {
        type: "warning",
        message: "Missing quantifiable achievements in your work experience",
        suggestion: "Add specific metrics and results to demonstrate your impact",
      },
      {
        type: "warning",
        message: "Resume is slightly longer than recommended",
        suggestion: "Consider condensing to a single page for better readability",
      },
      {
        type: "error",
        message: "Contact information is incomplete",
        suggestion: "Add your LinkedIn profile and professional email",
      },
      {
        type: "info",
        message: "Skills section could be more targeted",
        suggestion: "Tailor your skills to match the job description more closely",
      },
    ],
    missingKeywords: ["cloud architecture", "agile methodology", "team leadership"],
    recommendations: [
      "Use more action verbs at the beginning of bullet points",
      "Include a professional summary that highlights your unique value proposition",
      "Add relevant certifications to strengthen your qualifications",
      "Ensure consistent formatting throughout the document",
    ],
  }

  const handleFileSelect = (selectedFile) => {
    setFile(selectedFile)
    setResults(null)
  }

  const handleCheck = async () => {
    if (!file) {
      showNotification("Please upload a resume first", "error")
      return
    }

    if (!hasSufficientTokens) {
      showNotification("Not enough tokens. Please purchase more.", "error")
      return
    }

    try {
      setChecking(true)

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2500))

      setResults(mockResults)
      showNotification("Resume checked successfully", "success")
    } catch (error) {
      showNotification("Failed to check resume", "error")
    } finally {
      setChecking(false)
    }
  }

  const handleDownloadReport = () => {
    if (!results) return

    showNotification("Report downloaded successfully", "success")
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-2">Resume ATS Checker</h1>
          <p className="text-gray-300">Check how your resume performs against Applicant Tracking Systems</p>
        </div>

        <TokenDisplay />
      </div>

      <div className="glass-card">
        <h2 className="text-xl font-bold mb-4">Upload Your Resume</h2>

        <FileUpload
          accept=".pdf,.doc,.docx"
          maxSize={5}
          onFileSelect={handleFileSelect}
          label="Resume File"
          description="Upload your resume to check against ATS systems"
        />

        <div className="mt-6">
          <button
            onClick={handleCheck}
            disabled={!file || checking || !hasSufficientTokens}
            className={`cyber-button w-full md:w-auto ${!file || !hasSufficientTokens ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {checking ? (
              <>
                <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2"></div>
                Analyzing...
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 h-5 w-5" />
                Check Resume (1 Token)
              </>
            )}
          </button>
        </div>
      </div>

      {results && (
        <div className="space-y-6">
          {/* Overall Score */}
          <div className="glass-card">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
              <h2 className="text-xl font-bold">ATS Compatibility Score</h2>
              <button onClick={handleDownloadReport} className="cyber-button-secondary flex items-center mt-4 md:mt-0">
                <Download className="mr-2 h-4 w-4" />
                Download Full Report
              </button>
            </div>

            <div className="flex flex-col md:flex-row items-center">
              <div className="relative w-48 h-48 mb-6 md:mb-0">
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  <circle
                    className="text-cyber-gray stroke-current"
                    strokeWidth="10"
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                  ></circle>
                  <circle
                    className="text-electric-blue stroke-current"
                    strokeWidth="10"
                    strokeLinecap="round"
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    strokeDasharray={`${2 * Math.PI * 40}`}
                    strokeDashoffset={`${2 * Math.PI * 40 * (1 - results.score / 100)}`}
                    transform="rotate(-90 50 50)"
                  ></circle>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-bold text-electric-blue">{results.score}</span>
                  <span className="text-sm text-gray-300">out of 100</span>
                </div>
              </div>

              <div className="md:ml-8 flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="glass p-4 rounded-lg text-center">
                  <p className="text-sm text-gray-300">Job Match</p>
                  <p className="text-2xl font-bold text-neon-pink">{results.matches}%</p>
                </div>
                <div className="glass p-4 rounded-lg text-center">
                  <p className="text-sm text-gray-300">Readability</p>
                  <p className="text-2xl font-bold text-neon-pink">{results.readability}%</p>
                </div>
                <div className="glass p-4 rounded-lg text-center">
                  <p className="text-sm text-gray-300">Format</p>
                  <p className="text-2xl font-bold text-neon-pink">{results.format}%</p>
                </div>
                <div className="glass p-4 rounded-lg text-center">
                  <p className="text-sm text-gray-300">Keywords</p>
                  <p className="text-2xl font-bold text-neon-pink">{results.keywords}%</p>
                </div>
              </div>
            </div>
          </div>

          {/* Issues */}
          <div className="glass-card">
            <h2 className="text-xl font-bold mb-4">Issues Detected</h2>

            <div className="space-y-4">
              {results.issues.map((issue, index) => (
                <div
                  key={index}
                  className={`glass p-4 rounded-lg border-l-4 ${
                    issue.type === "error"
                      ? "border-red-500"
                      : issue.type === "warning"
                        ? "border-yellow-500"
                        : "border-electric-blue"
                  }`}
                >
                  <div className="flex items-start">
                    <div className="mr-3">
                      {issue.type === "error" ? (
                        <AlertTriangle className="h-5 w-5 text-red-500" />
                      ) : issue.type === "warning" ? (
                        <AlertTriangle className="h-5 w-5 text-yellow-500" />
                      ) : (
                        <FileText className="h-5 w-5 text-electric-blue" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-white">{issue.message}</p>
                      <p className="text-gray-300 mt-1">{issue.suggestion}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Missing Keywords */}
          <div className="glass-card">
            <h2 className="text-xl font-bold mb-4">Missing Keywords</h2>

            <div className="flex flex-wrap gap-2">
              {results.missingKeywords.map((keyword, index) => (
                <span key={index} className="px-3 py-1 rounded-full bg-cyber-gray text-white text-sm">
                  {keyword}
                </span>
              ))}
            </div>
          </div>

          {/* Recommendations */}
          <div className="glass-card">
            <h2 className="text-xl font-bold mb-4">Recommendations</h2>

            <ul className="space-y-2">
              {results.recommendations.map((recommendation, index) => (
                <li key={index} className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-electric-blue mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300">{recommendation}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}

export default ResumeChecker
