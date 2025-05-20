"use client"

import { useState } from "react"
import { Loader2, AlertCircle, Plus, Trash2, Download } from "lucide-react"
import DashboardLayout from "../components/DashboardLayout"
import { useAuth } from "../contexts/AuthContext"

const ResumeBuilder = () => {
  const { credits } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [activeTab, setActiveTab] = useState("personal")
  const [resumeData, setResumeData] = useState({
    personal: {
      name: "",
      email: "",
      phone: "",
      address: "",
      linkedin: "",
      website: "",
    },
    summary: "",
    experience: [{ title: "", company: "", location: "", startDate: "", endDate: "", current: false, description: "" }],
    education: [{ degree: "", institution: "", location: "", startDate: "", endDate: "", description: "" }],
    skills: [""],
  })

  const handlePersonalChange = (e) => {
    const { name, value } = e.target
    setResumeData({
      ...resumeData,
      personal: {
        ...resumeData.personal,
        [name]: value,
      },
    })
  }

  const handleSummaryChange = (e) => {
    setResumeData({
      ...resumeData,
      summary: e.target.value,
    })
  }

  const handleExperienceChange = (index, field, value) => {
    const updatedExperience = [...resumeData.experience]

    if (field === "current") {
      updatedExperience[index] = {
        ...updatedExperience[index],
        [field]: !updatedExperience[index].current,
        endDate: !updatedExperience[index].current ? "" : updatedExperience[index].endDate,
      }
    } else {
      updatedExperience[index] = {
        ...updatedExperience[index],
        [field]: value,
      }
    }

    setResumeData({
      ...resumeData,
      experience: updatedExperience,
    })
  }

  const addExperience = () => {
    setResumeData({
      ...resumeData,
      experience: [
        ...resumeData.experience,
        { title: "", company: "", location: "", startDate: "", endDate: "", current: false, description: "" },
      ],
    })
  }

  const removeExperience = (index) => {
    const updatedExperience = [...resumeData.experience]
    updatedExperience.splice(index, 1)
    setResumeData({
      ...resumeData,
      experience: updatedExperience,
    })
  }

  const handleEducationChange = (index, field, value) => {
    const updatedEducation = [...resumeData.education]
    updatedEducation[index] = {
      ...updatedEducation[index],
      [field]: value,
    }
    setResumeData({
      ...resumeData,
      education: updatedEducation,
    })
  }

  const addEducation = () => {
    setResumeData({
      ...resumeData,
      education: [
        ...resumeData.education,
        { degree: "", institution: "", location: "", startDate: "", endDate: "", description: "" },
      ],
    })
  }

  const removeEducation = (index) => {
    const updatedEducation = [...resumeData.education]
    updatedEducation.splice(index, 1)
    setResumeData({
      ...resumeData,
      education: updatedEducation,
    })
  }

  const handleSkillChange = (index, value) => {
    const updatedSkills = [...resumeData.skills]
    updatedSkills[index] = value
    setResumeData({
      ...resumeData,
      skills: updatedSkills,
    })
  }

  const addSkill = () => {
    setResumeData({
      ...resumeData,
      skills: [...resumeData.skills, ""],
    })
  }

  const removeSkill = (index) => {
    const updatedSkills = [...resumeData.skills]
    updatedSkills.splice(index, 1)
    setResumeData({
      ...resumeData,
      skills: updatedSkills,
    })
  }

  const handleGenerateResume = () => {
    // This would typically call an API to generate the resume
    // For now, we'll just simulate loading
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      // Here you would handle the response from the API
    }, 2000)
  }

  const tabs = [
    { id: "personal", label: "Personal Info" },
    { id: "summary", label: "Summary" },
    { id: "experience", label: "Experience" },
    { id: "education", label: "Education" },
    { id: "skills", label: "Skills" },
  ]

  return (
    <DashboardLayout title="AI Resume Builder">
      <div className="max-w-4xl mx-auto">
        <div className="glassmorphism rounded-xl p-6 mb-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-xl font-bold">Create Your Resume</h2>
              <p className="text-gray-300 mt-1">
                Build a professional, ATS-optimized resume with our AI-powered tools.
              </p>
            </div>
            <div className="bg-primary/20 px-4 py-2 rounded-lg">
              <p className="text-sm">
                Available credits: <span className="font-bold">{credits}</span>
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex overflow-x-auto space-x-2 mb-6 pb-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-md whitespace-nowrap ${
                  activeTab === tab.id ? "bg-primary text-white" : "bg-secondary hover:bg-secondary/80"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-6 p-3 bg-destructive/20 border border-destructive/50 rounded-md flex items-start">
              <AlertCircle className="h-5 w-5 text-destructive mr-2 flex-shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          {/* Tab content */}
          <div className="mb-6">
            {activeTab === "personal" && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium mb-1">
                      Full Name
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      value={resumeData.personal.name}
                      onChange={handlePersonalChange}
                      className="w-full px-3 py-2 bg-secondary border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-1">
                      Email
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={resumeData.personal.email}
                      onChange={handlePersonalChange}
                      className="w-full px-3 py-2 bg-secondary border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="john.doe@example.com"
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium mb-1">
                      Phone
                    </label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={resumeData.personal.phone}
                      onChange={handlePersonalChange}
                      className="w-full px-3 py-2 bg-secondary border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="(123) 456-7890"
                    />
                  </div>
                  <div>
                    <label htmlFor="address" className="block text-sm font-medium mb-1">
                      Address
                    </label>
                    <input
                      id="address"
                      name="address"
                      type="text"
                      value={resumeData.personal.address}
                      onChange={handlePersonalChange}
                      className="w-full px-3 py-2 bg-secondary border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="City, State"
                    />
                  </div>
                  <div>
                    <label htmlFor="linkedin" className="block text-sm font-medium mb-1">
                      LinkedIn
                    </label>
                    <input
                      id="linkedin"
                      name="linkedin"
                      type="text"
                      value={resumeData.personal.linkedin}
                      onChange={handlePersonalChange}
                      className="w-full px-3 py-2 bg-secondary border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="linkedin.com/in/johndoe"
                    />
                  </div>
                  <div>
                    <label htmlFor="website" className="block text-sm font-medium mb-1">
                      Website
                    </label>
                    <input
                      id="website"
                      name="website"
                      type="text"
                      value={resumeData.personal.website}
                      onChange={handlePersonalChange}
                      className="w-full px-3 py-2 bg-secondary border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="johndoe.com"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === "summary" && (
              <div>
                <label htmlFor="summary" className="block text-sm font-medium mb-1">
                  Professional Summary
                </label>
                <textarea
                  id="summary"
                  value={resumeData.summary}
                  onChange={handleSummaryChange}
                  rows={6}
                  className="w-full px-3 py-2 bg-secondary border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Write a brief summary of your professional background and key qualifications..."
                ></textarea>
                <div className="mt-2 flex justify-end">
                  <button className="text-primary hover:text-primary/80 text-sm">Generate with AI</button>
                </div>
              </div>
            )}

            {activeTab === "experience" && (
              <div className="space-y-6">
                {resumeData.experience.map((exp, index) => (
                  <div key={index} className="p-4 bg-secondary/50 rounded-lg">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-medium">Experience {index + 1}</h3>
                      {resumeData.experience.length > 1 && (
                        <button
                          onClick={() => removeExperience(index)}
                          className="text-destructive hover:text-destructive/80"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Job Title</label>
                        <input
                          type="text"
                          value={exp.title}
                          onChange={(e) => handleExperienceChange(index, "title", e.target.value)}
                          className="w-full px-3 py-2 bg-secondary border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="Software Engineer"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Company</label>
                        <input
                          type="text"
                          value={exp.company}
                          onChange={(e) => handleExperienceChange(index, "company", e.target.value)}
                          className="w-full px-3 py-2 bg-secondary border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="Tech Innovations Inc."
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Location</label>
                        <input
                          type="text"
                          value={exp.location}
                          onChange={(e) => handleExperienceChange(index, "location", e.target.value)}
                          className="w-full px-3 py-2 bg-secondary border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="New York, NY"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Start Date</label>
                        <input
                          type="date"
                          value={exp.startDate}
                          onChange={(e) => handleExperienceChange(index, "startDate", e.target.value)}
                          className="w-full px-3 py-2 bg-secondary border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">End Date</label>
                        <input
                          type="date"
                          value={exp.endDate}
                          onChange={(e) => handleExperienceChange(index, "endDate", e.target.value)}
                          className="w-full px-3 py-2 bg-secondary border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Current Job</label>
                        <input
                          type="checkbox"
                          checked={exp.current}
                          onChange={(e) => handleExperienceChange(index, "current", e.target.checked)}
                          className="form-checkbox h-4 w-4 text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Description</label>
                        <textarea
                          rows={4}
                          value={exp.description}
                          onChange={(e) => handleExperienceChange(index, "description", e.target.value)}
                          className="w-full px-3 py-2 bg-secondary border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="Describe your responsibilities and achievements..."
                        ></textarea>
                      </div>
                    </div>
                  </div>
                ))}
                <button
                  onClick={addExperience}
                  className="flex items-center justify-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/80"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Add Experience
                </button>
              </div>
            )}

            {activeTab === "education" && (
              <div className="space-y-6">
                {resumeData.education.map((edu, index) => (
                  <div key={index} className="p-4 bg-secondary/50 rounded-lg">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-medium">Education {index + 1}</h3>
                      {resumeData.education.length > 1 && (
                        <button
                          onClick={() => removeEducation(index)}
                          className="text-destructive hover:text-destructive/80"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Degree</label>
                        <input
                          type="text"
                          value={edu.degree}
                          onChange={(e) => handleEducationChange(index, "degree", e.target.value)}
                          className="w-full px-3 py-2 bg-secondary border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="Bachelor of Science"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Institution</label>
                        <input
                          type="text"
                          value={edu.institution}
                          onChange={(e) => handleEducationChange(index, "institution", e.target.value)}
                          className="w-full px-3 py-2 bg-secondary border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="State University"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Location</label>
                        <input
                          type="text"
                          value={edu.location}
                          onChange={(e) => handleEducationChange(index, "location", e.target.value)}
                          className="w-full px-3 py-2 bg-secondary border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="City, State"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Start Date</label>
                        <input
                          type="date"
                          value={edu.startDate}
                          onChange={(e) => handleEducationChange(index, "startDate", e.target.value)}
                          className="w-full px-3 py-2 bg-secondary border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">End Date</label>
                        <input
                          type="date"
                          value={edu.endDate}
                          onChange={(e) => handleEducationChange(index, "endDate", e.target.value)}
                          className="w-full px-3 py-2 bg-secondary border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Description</label>
                        <textarea
                          rows={4}
                          value={edu.description}
                          onChange={(e) => handleEducationChange(index, "description", e.target.value)}
                          className="w-full px-3 py-2 bg-secondary border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="Describe your coursework and achievements..."
                        ></textarea>
                      </div>
                    </div>
                  </div>
                ))}
                <button
                  onClick={addEducation}
                  className="flex items-center justify-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/80"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Add Education
                </button>
              </div>
            )}

            {activeTab === "skills" && (
              <div className="space-y-4">
                {resumeData.skills.map((skill, index) => (
                  <div key={index} className="flex items-center">
                    <input
                      type="text"
                      value={skill}
                      onChange={(e) => handleSkillChange(index, e.target.value)}
                      className="w-full px-3 py-2 bg-secondary border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Skill Name"
                    />
                    {resumeData.skills.length > 1 && (
                      <button
                        onClick={() => removeSkill(index)}
                        className="ml-2 text-destructive hover:text-destructive/80"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={addSkill}
                  className="flex items-center justify-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/80"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Add Skill
                </button>
              </div>
            )}
          </div>

          {/* Generate Resume Button */}
          <div className="flex justify-end">
            <button
              onClick={handleGenerateResume}
              className="flex items-center justify-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/80"
              disabled={loading}
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Download className="h-5 w-5 mr-2" />}
              Generate Resume
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default ResumeBuilder
