"use client"

import { useState, useRef } from "react"
import { Upload, X, FileText, Check } from "lucide-react"

const FileUpload = ({
  accept = ".pdf,.doc,.docx",
  maxSize = 5, // in MB
  onFileSelect,
  label = "Upload File",
  description = "Drag and drop your file here, or click to browse",
}) => {
  const [file, setFile] = useState(null)
  const [error, setError] = useState("")
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const fileInputRef = useRef(null)

  const handleFileSelect = (selectedFile) => {
    setError("")

    // Check file type
    const fileType = selectedFile.type
    const validTypes = accept.split(",").map((type) => {
      return type.trim().replace(".", "").toLowerCase()
    })

    const isValidType = validTypes.some((type) => {
      if (type === "pdf" && fileType === "application/pdf") return true
      if (type === "doc" && fileType === "application/msword") return true
      if (type === "docx" && fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document")
        return true
      return false
    })

    if (!isValidType) {
      setError(`Invalid file type. Please upload ${accept} files.`)
      return
    }

    // Check file size
    if (selectedFile.size > maxSize * 1024 * 1024) {
      setError(`File size exceeds ${maxSize}MB limit.`)
      return
    }

    setFile(selectedFile)

    // Simulate upload process
    setIsUploading(true)
    setTimeout(() => {
      setIsUploading(false)
      setIsSuccess(true)

      if (onFileSelect) {
        onFileSelect(selectedFile)
      }

      // Reset success state after a delay
      setTimeout(() => {
        setIsSuccess(false)
      }, 3000)
    }, 1500)
  }

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

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0])
    }
  }

  const handleClick = () => {
    fileInputRef.current.click()
  }

  const handleChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelect(e.target.files[0])
    }
  }

  const handleRemove = () => {
    setFile(null)
    setError("")
    setIsSuccess(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-300 mb-2">{label}</label>

      <div
        className={`border-2 border-dashed rounded-lg p-6 transition-all ${
          isDragging
            ? "border-neon-pink bg-cyber-gray bg-opacity-50"
            : error
              ? "border-red-500 bg-red-900 bg-opacity-10"
              : isSuccess
                ? "border-green-500 bg-green-900 bg-opacity-10"
                : "border-gray-700 hover:border-electric-blue"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input type="file" className="hidden" accept={accept} ref={fileInputRef} onChange={handleChange} />

        {!file && !isUploading && (
          <div className="text-center">
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-300">{description}</p>
            <p className="mt-1 text-xs text-gray-400">
              Max file size: {maxSize}MB ({accept.replace(/\./g, "").toUpperCase()})
            </p>
          </div>
        )}

        {isUploading && (
          <div className="text-center">
            <div className="w-12 h-12 border-t-4 border-b-4 border-electric-blue rounded-full animate-spin mx-auto"></div>
            <p className="mt-2 text-sm text-gray-300">Uploading file...</p>
          </div>
        )}

        {file && !isUploading && (
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FileText className="h-8 w-8 text-electric-blue" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-white truncate max-w-xs">{file.name}</p>
                <p className="text-xs text-gray-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            </div>

            <div className="flex items-center">
              {isSuccess && <Check className="h-5 w-5 text-green-500 mr-2" />}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  handleRemove()
                }}
                className="text-gray-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
    </div>
  )
}

export default FileUpload
