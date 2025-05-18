"use client"

import { useState, useEffect } from "react"
import { AlertTriangle, Shield, CheckCircle, XCircle, Info } from "lucide-react"
import { useToken } from "../contexts/TokenContext"
import { useNotification } from "../contexts/NotificationContext"
import FileUpload from "../components/ui/FileUpload"
import TokenDisplay from "../components/ui/TokenDisplay"

const FakeDetector = () => {
  const { tokens, useTokens } = useToken()
  const { showNotification } = useNotification()
  const [file, setFile] = useState(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [results, setResults] = useState(null)
  const [hasSufficientTokens, setHasSufficientTokens] = useState(true)
  const [canAnalyze, setCanAnalyze] = useState(false)

  useEffect(() => {
    if (file) {
      setCanAnalyze(true)
    } else {
      setCanAnalyze(false)
    }
  }, [file])

  useEffect(() => {
    if (canAnalyze) {
      if (!useTokens(2, "Fake Resume Detection")) {
        setHasSufficientTokens(false)
        return
      }
      setHasSufficientTokens(true)
    }
  }, [canAnalyze, useTokens])

  // Mock analysis results
  const mockResults = {
    score: 65,
    verdict: "Potentially Misleading",
    summary: "This resume contains some potentially misleading or exaggerated claims that should be verified.",
    issues: [
      {
        type: "critical",
        section: "Work Experience",
        claim: "Led a team of 50 engineers at a startup",
        analysis: "Company records show the entire engineering department had only 20 people during this period.",
        confidence: 92,
      },
      {
        type: "warning",
        section: "Skills",
        claim: "Expert in quantum computing",
        analysis: "No evidence of formal education or projects in quantum computing found in public records.",
        confidence: 78,
      },
      {
        type: "warning",
        section: "Education",
        claim: "MBA from Harvard Business School",
        analysis: "Degree verification services could not confirm this credential.",
        confidence: 85,
      },
      {
        type: "info",
        section: "Achievements",
        claim: "Increased company revenue by 300%",
        analysis: "Company financial records show a 70% increase during this period. Claim is exaggerated.",
        confidence: 88,
      },
    ],
    verifiedClaims: [
      {
        section: "Work Experience",
        claim: "Software Engineer at Tech Solutions Inc. (2018-2020)",
        confidence: 95,
      },
      {
        section: "Education",
        claim: "Bachelor's degree in Computer Science",
        confidence: 98,
      },
      {
        section: "Projects",
        claim: "Developed an e-commerce platform with React",
        confidence: 90,
      },
    ],
  }

  const handleFileSelect = (selectedFile) => {
    setFile(selectedFile)
    setResults(null)
  }

  const handleAnalyze = async () => {
    if (!file) {
      showNotification("Please upload a resume first", "error")
      return
    }

    if (!hasSufficientTokens) {
      showNotification("Not enough tokens. Please purchase more.", "error")
      return
    }

    try {
      setAnalyzing(true)

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 3000))

      setResults(mockResults)
      showNotification("Resume analyzed successfully", "success")
    } catch (error) {
      showNotification("Failed to analyze resume", "error")
    } finally {
      setAnalyzing(false)
    }
  }

  const getScoreColor = (score) => {
    if (score >= 80) return "text-green-500"
    if (score >= 60) return "text-yellow-500"
    return "text-red-500"
  }

  const getIssueIcon = (type) => {
    switch (type) {
      case "critical":
        return <XCircle className="h-5 w-5 text-red-500" />
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      case "info":
        return <Info className="h-5 w-5 text-blue-500" />
      default:
        return <Info className="h-5 w-5 text-gray-500" />
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-2">Fake Resume Detector</h1>
          <p className="text-gray-300">Detect fake or exaggerated claims in resumes</p>
        </div>

        <TokenDisplay />
      </div>

      <div className="glass-card">
        <h2 className="text-xl font-bold mb-4">Upload Resume for Analysis</h2>

        <FileUpload
          accept=".pdf,.doc,.docx"
          maxSize={5}
          onFileSelect={handleFileSelect}
          label="Resume File"
          description="Upload a resume to check for potentially fake or exaggerated claims"
        />

        <div className="mt-6">
          <button
            onClick={handleAnalyze}
            disabled={!file || analyzing || !hasSufficientTokens}
            className={`cyber-button w-full md:w-auto ${!file || !hasSufficientTokens ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {analyzing ? (
              <>
                <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2"></div>
                Analyzing...
              </>
            ) : (
              <>
                <AlertTriangle className="mr-2 h-5 w-5" />
                Analyze Resume (2 Tokens)
              </>
            )}
          </button>
        </div>
      </div>

      {results && (
        <div className="space-y-6">
          {/* Overall Results */}
          <div className="glass-card">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Analysis Results</h2>
              <div className="flex items-center mt-4 md:mt-0">
                <Shield className="h-5 w-5 mr-2 text-electric-blue" />
                <span className="text-sm text-gray-300">AI-powered analysis</span>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center mb-6">
              <div className="relative w-32 h-32 mb-6 md:mb-0">
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
                    className={`${results.score >= 80 ? "text-green-500" : results.score >= 60 ? "text-yellow-500" : "text-red-500"} stroke-current`}
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
                  <span className={`text-3xl font-bold ${getScoreColor(results.score)}`}>{results.score}</span>
                  <span className="text-xs text-gray-400">Truthfulness</span>
                </div>
              </div>

              <div className="md:ml-8 flex-1">
                <div className="glass p-4 rounded-lg mb-4">
                  <h3 className="text-lg font-medium mb-2">Verdict: {results.verdict}</h3>
                  <p className="text-gray-300">{results.summary}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="glass p-3 rounded-lg text-center">
                    <p className="text-sm text-gray-300">Issues Found</p>
                    <p className="text-2xl font-bold text-red-500">{results.issues.length}</p>
                  </div>
                  <div className="glass p-3 rounded-lg text-center">
                    <p className="text-sm text-gray-300">Verified Claims</p>
                    <p className="text-2xl font-bold text-green-500">{results.verifiedClaims.length}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Problematic Claims */}
          <div className="glass-card">
            <h2 className="text-xl font-bold mb-4">Problematic Claims</h2>

            <div className="space-y-4">
              {results.issues.map((issue, index) => (
                <div
                  key={index}
                  className={`glass p-4 rounded-lg border-l-4 ${
                    issue.type === "critical"
                      ? "border-red-500"
                      : issue.type === "warning"
                        ? "border-yellow-500"
                        : "border-blue-500"
                  }`}
                >
                  <div className="flex items-start">
                    <div className="mr-3 mt-1">{getIssueIcon(issue.type)}</div>
                    <div className="flex-1">
                      <div className="flex flex-col md:flex-row md:items-center justify-between mb-2">
                        <h3 className="font-medium text-white">{issue.section}</h3>
                        <span className="text-sm text-gray-400">
                          Confidence: <span className="text-electric-blue">{issue.confidence}%</span>
                        </span>
                      </div>
                      <p className="text-gray-300 mb-2">
                        <span className="font-medium">Claim:</span> {issue.claim}
                      </p>
                      <p className="text-gray-300">
                        <span className="font-medium">Analysis:</span> {issue.analysis}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Verified Claims */}
          <div className="glass-card">
            <h2 className="text-xl font-bold mb-4">Verified Claims</h2>

            <div className="space-y-4">
              {results.verifiedClaims.map((claim, index) => (
                <div key={index} className="glass p-4 rounded-lg border-l-4 border-green-500">
                  <div className="flex items-start">
                    <div className="mr-3 mt-1">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-col md:flex-row md:items-center justify-between mb-2">
                        <h3 className="font-medium text-white">{claim.section}</h3>
                        <span className="text-sm text-gray-400">
                          Confidence: <span className="text-electric-blue">{claim.confidence}%</span>
                        </span>
                      </div>
                      <p className="text-gray-300">{claim.claim}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Disclaimer */}
          <div className="glass p-4 rounded-lg border border-gray-700">
            <div className="flex items-start">
              <Info className="h-5 w-5 text-gray-400 mr-3 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-gray-400">
                This analysis is based on AI algorithms and available data. Results should be verified through
                traditional means such as reference checks and interviews. False positives may occur.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default FakeDetector
