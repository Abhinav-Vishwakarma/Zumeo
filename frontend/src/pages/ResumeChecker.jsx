"use client"

import { useState } from "react"
import { Upload, FileText, AlertCircle, Check, Loader2, AlertTriangle } from "lucide-react"
import DashboardLayout from "../components/DashboardLayout"
import { resumeService } from "../services/api"
import { useAuth } from "../contexts/AuthContext"

const ResumeChecker = () => {
  const { credits, updateCredits } = useAuth()
  const [file, setFile] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [atsData, setAtsData] = useState(null)
  const [resumeId, setResumeId] = useState(null)
  const [step, setStep] = useState("upload") // upload, analyzing, results

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)

    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile && droppedFile.type === "application/pdf") {
      setFile(droppedFile)
      setError("")
    } else {
      setError("Please upload a PDF file")
    }
  }

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile)
      setError("")
    } else {
      setError("Please upload a PDF file")
    }
  }

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file to upload")
      return
    }

    if (credits < 2) {
      setError("You need at least 2 credits to use the Resume Checker")
      return
    }

    setLoading(true)
    setError("")

    try {
      // Upload the resume
      const uploadResponse = await resumeService.uploadResume(file)
      const id = uploadResponse.data.resume_id
      setResumeId(id)
      setStep("analyzing")

      // Check the resume against ATS
      const atsResponse = await resumeService.checkResumeATS(id)
      setAtsData(atsResponse.data)
      setStep("results")

      // Update credits after successful operation
      updateCredits()
    } catch (err) {
      console.error("Error checking resume:", err)
      setError(err.response?.data?.detail || "An error occurred while checking your resume")
      setStep("upload")
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setFile(null)
    setAtsData(null)
    setResumeId(null)
    setError("")
    setStep("upload")
  }

  const getScoreColor = (score) => {
    if (score >= 80) return "text-green-500"
    if (score >= 60) return "text-yellow-500"
    return "text-red-500"
  }

  const getScoreBackground = (score) => {
    if (score >= 80) return "bg-green-500/20"
    if (score >= 60) return "bg-yellow-500/20"
    return "bg-red-500/20"
  }

  return (
    <DashboardLayout title="Resume Checker">
      <div className="max-w-4xl mx-auto">
        {step === "upload" && (
          <div className="glassmorphism rounded-xl p-6 mb-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-bold">ATS Resume Checker</h2>
                <p className="text-gray-300 mt-1">
                  Check your resume against Applicant Tracking Systems and get detailed feedback.
                </p>
              </div>
              <div className="bg-primary/20 px-4 py-2 rounded-lg">
                <p className="text-sm">
                  Cost: <span className="font-bold">2 credits</span>
                </p>
                <p className="text-xs text-gray-400">You have {credits} credits</p>
              </div>
            </div>

            {/* File upload area */}
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center ${
                isDragging ? "border-primary bg-primary/10" : "border-border"
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="flex flex-col items-center">
                <Upload className="h-12 w-12 text-gray-400 mb-4" />
                <p className="text-lg font-medium mb-2">Drag and drop your resume here</p>
                <p className="text-gray-400 mb-4">or</p>
                <label className="cyber-button-secondary cursor-pointer">
                  <span>Browse files</span>
                  <input type="file" className="hidden" accept=".pdf" onChange={handleFileChange} />
                </label>
                <p className="text-gray-400 mt-4">Supports PDF files up to 10MB</p>
              </div>
            </div>

            {/* Selected file */}
            {file && (
              <div className="mt-6 p-4 bg-secondary/50 rounded-lg flex items-center">
                <FileText className="h-6 w-6 text-primary mr-3" />
                <div className="flex-1">
                  <p className="font-medium">{file.name}</p>
                  <p className="text-sm text-gray-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
                <button onClick={handleReset} className="text-gray-400 hover:text-white">
                  Remove
                </button>
              </div>
            )}

            {/* Error message */}
            {error && (
              <div className="mt-4 p-3 bg-destructive/20 border border-destructive/50 rounded-md flex items-start">
                <AlertCircle className="h-5 w-5 text-destructive mr-2 flex-shrink-0 mt-0.5" />
                <p>{error}</p>
              </div>
            )}

            {/* Upload button */}
            <div className="mt-6">
              <button
                onClick={handleUpload}
                disabled={!file || loading || credits < 2}
                className="cyber-button w-full flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Check Resume"
                )}
              </button>
            </div>
          </div>
        )}

        {step === "analyzing" && (
          <div className="glassmorphism rounded-xl p-8 text-center">
            <Loader2 className="h-12 w-12 text-primary mx-auto animate-spin mb-4" />
            <h2 className="text-xl font-bold mb-2">Analyzing Your Resume</h2>
            <p className="text-gray-300">
              Please wait while our AI checks your resume against ATS systems. This may take a moment...
            </p>
          </div>
        )}

        {step === "results" && atsData && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">ATS Check Results</h2>
              <button onClick={handleReset} className="cyber-button-secondary">
                Check Another Resume
              </button>
            </div>

            <div className="space-y-6">
              {/* ATS Score */}
              <div className="glassmorphism rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold">ATS Compatibility Score</h3>
                  <div className={`text-3xl font-bold ${getScoreColor(atsData.ats_score)}`}>
                    {atsData.ats_score}/100
                  </div>
                </div>

                <div className="mt-4 w-full bg-secondary rounded-full h-4">
                  <div
                    className={`h-4 rounded-full ${getScoreBackground(atsData.ats_score)}`}
                    style={{ width: `${atsData.ats_score}%` }}
                  ></div>
                </div>

                <div className="mt-4">
                  {atsData.ats_score >= 80 ? (
                    <div className="flex items-start text-green-500">
                      <Check className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                      <p>Your resume is well-optimized for ATS systems!</p>
                    </div>
                  ) : atsData.ats_score >= 60 ? (
                    <div className="flex items-start text-yellow-500">
                      <AlertTriangle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                      <p>Your resume needs some improvements to pass ATS systems effectively.</p>
                    </div>
                  ) : (
                    <div className="flex items-start text-red-500">
                      <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                      <p>Your resume needs significant improvements to pass ATS systems.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Suggestions */}
              {atsData.suggestions && atsData.suggestions.length > 0 && (
                <div className="glassmorphism rounded-xl p-6">
                  <h3 className="text-lg font-bold mb-4">Improvement Suggestions</h3>
                  <ul className="space-y-3">
                    {atsData.suggestions.map((suggestion, index) => (
                      <li key={index} className="flex items-start">
                        <Check className="h-5 w-5 text-accent mr-2 mt-0.5 flex-shrink-0" />
                        <span>{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Download button */}
              {resumeId && (
                <div className="flex justify-center mt-8">
                  <button
                    onClick={async () => {
                      try {
                        const response = await resumeService.downloadResume(resumeId)

                        // Create a blob from the response data
                        const blob = new Blob([response.data], { type: "application/pdf" })

                        // Create a URL for the blob
                        const url = window.URL.createObjectURL(blob)

                        // Create a temporary link element
                        const link = document.createElement("a")
                        link.href = url
                        link.setAttribute("download", "resume.pdf")

                        // Append the link to the body
                        document.body.appendChild(link)

                        // Click the link to trigger the download
                        link.click()

                        // Clean up
                        link.parentNode.removeChild(link)
                        window.URL.revokeObjectURL(url)
                      } catch (err) {
                        console.error("Error downloading resume:", err)
                        setError("Failed to download resume")
                      }
                    }}
                    className="cyber-button-secondary flex items-center"
                  >
                    <FileText className="mr-2 h-5 w-5" />
                    Download Resume
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

export default ResumeChecker
