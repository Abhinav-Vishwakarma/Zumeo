import axios from "axios"

// Create axios instance with base URL
export const api = axios.create({
  baseURL: "https://zumeo-production.up.railway.app", // Ensure this is HTTPS
  headers: {
    "Content-Type": "application/json",
  },
})

// Add a request interceptor to include the token in all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Add a response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expired or invalid
      localStorage.removeItem("token")
      localStorage.removeItem("user")
      // Redirect to login page
      window.location.href = "/login"
    }
    return Promise.reject(error)
  },
)

// Resume service
export const resumeService = {
  uploadResume: (file) => {
    const formData = new FormData()
    formData.append("file", file)
    return api.post("/upload-resume", formData, { // Removed trailing slash
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
  },

  analyzeResume: (resumeId) => {
    return api.get(`/analyze-resume/${resumeId}`)
  },

  checkResumeATS: (resumeId) => {
    return api.get(`/check-resume-ats/${resumeId}`)
  },

  downloadResume: (resumeId) => {
    return api.get(`/download-resume/${resumeId}`, { responseType: "blob" })
  },

  deleteResume: (resumeId) => {
    return api.delete(`/delete-resume/${resumeId}`)
  },
}

// Roadmap service
export const roadmapService = {
  generateRoadmap: (roadmapData) => {
    return api.post("/generate-roadmap", roadmapData) // Removed trailing slash
  },

  getRoadmap: (roadmapId) => {
    return api.get(`/get-roadmap/${roadmapId}`)
  },

  listRoadmaps: () => {
    return api.get("/list-roadmaps") // Removed trailing slash
  },
}

// Credits service
export const creditsService = {
  getCredits: () => {
    return api.get("/credits") // Removed trailing slash
  },

  buyCredits: (amount, transactionDetails) => {
    return api.post("/buy-credits", { // Removed trailing slash
      amount,
      transaction_details: transactionDetails,
    })
  },
}
