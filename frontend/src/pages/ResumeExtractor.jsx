"use client"

import { useState } from "react"
import { Upload, FileText, AlertCircle, Check, Loader2 } from "lucide-react"
import DashboardLayout from "../components/DashboardLayout"
import { resumeService } from "../services/api"

const ResumeExtractor = () => {
  const [file, setFile] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [resumeData, setResumeData] = useState(null)
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

    setLoading(true)
    setStep("analyzing")
    setError("")

    try {
      // Upload the resume
      const uploadResponse = await resumeService.uploadResume(file)
      const resumeId = uploadResponse.data.resume_id

      // Analyze the resume
      const analysisResponse = await resumeService.analyzeResume(resumeId)
      setResumeData(analysisResponse.data)
      setStep("results")
    } catch (err) {
      console.error("Error processing resume:", err)
      setError(err.response?.data?.detail || "An error occurred while processing your resume")
      setStep("upload")
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setFile(null)
    setResumeData(null)
    setError("")
    setStep("upload")
  }

  return (
    <DashboardLayout title="Resume Extractor">
      <div className="max-w-4xl mx-auto">
        {step === "upload" && (
          <div className="glassmorphism rounded-xl p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Upload Your Resume</h2>
            <p className="text-gray-300 mb-6">
              Upload your existing resume to extract key information automatically. We'll analyze your resume and
              extract relevant details.
            </p>

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
                disabled={!file || loading}
                className="cyber-button w-full flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  "Extract Resume Data"
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
              Please wait while our AI extracts information from your resume. This may take a moment...
            </p>
          </div>
        )}

        {step === "results" && resumeData && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Extracted Resume Data</h2>
              <button onClick={handleReset} className="cyber-button-secondary">
                Upload Another Resume
              </button>
            </div>

            <div className="space-y-6">
              {/* Personal Information */}
              <div className="glassmorphism rounded-xl p-6">
                <h3 className="text-lg font-bold mb-4">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-400 text-sm">Name</p>
                    <p className="font-medium">{resumeData.name || "Not found"}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Email</p>
                    <p className="font-medium">{resumeData.contact?.email || "Not found"}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Phone</p>
                    <p className="font-medium">{resumeData.contact?.phone || "Not found"}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">LinkedIn</p>
                    <p className="font-medium">{resumeData.contact?.linkedin || "Not found"}</p>
                  </div>
                </div>
              </div>

              {/* Summary */}
              {resumeData.summary && (
                <div className="glassmorphism rounded-xl p-6">
                  <h3 className="text-lg font-bold mb-4">Summary</h3>
                  <p>{resumeData.summary}</p>
                </div>
              )}

              {/* Experience */}
              {resumeData.experience && resumeData.experience.length > 0 && (
                <div className="glassmorphism rounded-xl p-6">
                  <h3 className="text-lg font-bold mb-4">Experience</h3>
                  <div className="space-y-4">
                    {resumeData.experience.map((exp, index) => (
                      <div key={index} className="border-b border-border pb-4 last:border-0 last:pb-0">
                        <div className="flex justify-between">
                          <h4 className="font-bold">{exp.title}</h4>
                          <span className="text-gray-400 text-sm">{exp.dates}</span>
                        </div>
                        <p className="text-accent">{exp.company}</p>
                        <p className="mt-2 text-gray-300">{exp.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Education */}
              {resumeData.education && resumeData.education.length > 0 && (
                <div className="glassmorphism rounded-xl p-6">
                  <h3 className="text-lg font-bold mb-4">Education</h3>
                  <div className="space-y-4">
                    {resumeData.education.map((edu, index) => (
                      <div key={index} className="border-b border-border pb-4 last:border-0 last:pb-0">
                        <div className="flex justify-between">
                          <h4 className="font-bold">{edu.degree}</h4>
                          <span className="text-gray-400 text-sm">{edu.dates}</span>
                        </div>
                        <p className="text-accent">{edu.institution}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Skills */}
              {resumeData.skills && resumeData.skills.length > 0 && (
                <div className="glassmorphism rounded-xl p-6">
                  <h3 className="text-lg font-bold mb-4">Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {resumeData.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="bg-primary/20 text-primary-foreground px-3 py-1 rounded-full text-sm"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Suggestions */}
              {resumeData.suggestions_for_improvement && resumeData.suggestions_for_improvement.length > 0 && (
                <div className="glassmorphism rounded-xl p-6">
                  <h3 className="text-lg font-bold mb-4">Suggestions for Improvement</h3>
                  <ul className="space-y-2">
                    {resumeData.suggestions_for_improvement.map((suggestion, index) => (
                      <li key={index} className="flex items-start">
                        <Check className="h-5 w-5 text-accent mr-2 mt-0.5 flex-shrink-0" />
                        <span>{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

export default ResumeExtractor
