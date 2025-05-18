"use client"

import { useState } from "react"
import { PenTool, Download, ArrowRight, ArrowLeft } from "lucide-react"
import { useToken } from "../contexts/TokenContext"
import { useNotification } from "../contexts/NotificationContext"
import TokenDisplay from "../components/ui/TokenDisplay"

const ResumeBuilder = () => {
  const { tokens, useTokens } = useToken()
  const { showNotification } = useNotification()

  const [step, setStep] = useState(1)
  const [generating, setGenerating] = useState(false)
  const [preview, setPreview] = useState(false)
  const [resumeData, setResumeData] = useState({
    personalInfo: {
      name: "",
      email: "",
      phone: "",
      location: "",
      linkedin: "",
    },
    objective: "",
    skills: "",
    experience: [
      {
        title: "",
        company: "",
        location: "",
        startDate: "",
        endDate: "",
        description: "",
      },
    ],
    education: [
      {
        degree: "",
        institution: "",
        location: "",
        startDate: "",
        endDate: "",
      },
    ],
    projects: [
      {
        name: "",
        description: "",
        technologies: "",
      },
    ],
  })

  // Handle input change for personal info
  const handlePersonalInfoChange = (e) => {
    const { name, value } = e.target
    setResumeData({
      ...resumeData,
      personalInfo: {
        ...resumeData.personalInfo,
        [name]: value,
      },
    })
  }

  // Handle input change for objective
  const handleObjectiveChange = (e) => {
    setResumeData({
      ...resumeData,
      objective: e.target.value,
    })
  }

  // Handle input change for skills
  const handleSkillsChange = (e) => {
    setResumeData({
      ...resumeData,
      skills: e.target.value,
    })
  }

  // Handle input change for experience items
  const handleExperienceChange = (index, field, value) => {
    const updatedExperience = [...resumeData.experience]
    updatedExperience[index] = {
      ...updatedExperience[index],
      [field]: value,
    }

    setResumeData({
      ...resumeData,
      experience: updatedExperience,
    })
  }

  // Add new experience item
  const addExperience = () => {
    setResumeData({
      ...resumeData,
      experience: [
        ...resumeData.experience,
        {
          title: "",
          company: "",
          location: "",
          startDate: "",
          endDate: "",
          description: "",
        },
      ],
    })
  }

  // Remove experience item
  const removeExperience = (index) => {
    if (resumeData.experience.length === 1) return

    const updatedExperience = resumeData.experience.filter((_, i) => i !== index)
    setResumeData({
      ...resumeData,
      experience: updatedExperience,
    })
  }

  // Handle input change for education items
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

  // Add new education item
  const addEducation = () => {
    setResumeData({
      ...resumeData,
      education: [
        ...resumeData.education,
        {
          degree: "",
          institution: "",
          location: "",
          startDate: "",
          endDate: "",
        },
      ],
    })
  }

  // Remove education item
  const removeEducation = (index) => {
    if (resumeData.education.length === 1) return

    const updatedEducation = resumeData.education.filter((_, i) => i !== index)
    setResumeData({
      ...resumeData,
      education: updatedEducation,
    })
  }

  // Handle input change for project items
  const handleProjectChange = (index, field, value) => {
    const updatedProjects = [...resumeData.projects]
    updatedProjects[index] = {
      ...updatedProjects[index],
      [field]: value,
    }

    setResumeData({
      ...resumeData,
      projects: updatedProjects,
    })
  }

  // Add new project item
  const addProject = () => {
    setResumeData({
      ...resumeData,
      projects: [
        ...resumeData.projects,
        {
          name: "",
          description: "",
          technologies: "",
        },
      ],
    })
  }

  // Remove project item
  const removeProject = (index) => {
    if (resumeData.projects.length === 1) return

    const updatedProjects = resumeData.projects.filter((_, i) => i !== index)
    setResumeData({
      ...resumeData,
      projects: updatedProjects,
    })
  }

  // Handle next step
  const handleNextStep = () => {
    setStep(step + 1)
  }

  // Handle previous step
  const handlePrevStep = () => {
    setStep(step - 1)
  }

  // Handle AI generation

  // Handle download as PDF
  const handleDownload = () => {
    showNotification("Resume downloaded as PDF", "success")
  }

  // Render form based on current step
  const renderForm = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-electric-blue">Personal Information</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={resumeData.personalInfo.name}
                  onChange={handlePersonalInfoChange}
                  className="cyber-input"
                  placeholder="e.g. John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={resumeData.personalInfo.email}
                  onChange={handlePersonalInfoChange}
                  className="cyber-input"
                  placeholder="e.g. john.doe@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Phone</label>
                <input
                  type="text"
                  name="phone"
                  value={resumeData.personalInfo.phone}
                  onChange={handlePersonalInfoChange}
                  className="cyber-input"
                  placeholder="e.g. (123) 456-7890"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Location</label>
                <input
                  type="text"
                  name="location"
                  value={resumeData.personalInfo.location}
                  onChange={handlePersonalInfoChange}
                  className="cyber-input"
                  placeholder="e.g. San Francisco, CA"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-1">LinkedIn URL</label>
                <input
                  type="text"
                  name="linkedin"
                  value={resumeData.personalInfo.linkedin}
                  onChange={handlePersonalInfoChange}
                  className="cyber-input"
                  placeholder="e.g. linkedin.com/in/johndoe"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Professional Summary / Objective</label>
              <textarea
                rows={4}
                value={resumeData.objective}
                onChange={handleObjectiveChange}
                className="cyber-input"
                placeholder="Write a brief summary of your professional background and career objectives..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Skills (comma separated)</label>
              <textarea
                rows={3}
                value={resumeData.skills}
                onChange={handleSkillsChange}
                className="cyber-input"
                placeholder="e.g. JavaScript, React, Node.js, AWS, Python, SQL, Project Management"
              />
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-electric-blue">Work Experience</h2>
              <button type="button" onClick={addExperience} className="text-sm text-electric-blue hover:text-white">
                + Add Experience
              </button>
            </div>

            {resumeData.experience.map((exp, index) => (
              <div key={index} className="glass p-4 rounded-lg space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Experience {index + 1}</h3>
                  {resumeData.experience.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeExperience(index)}
                      className="text-red-500 hover:text-red-400 text-sm"
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Job Title</label>
                    <input
                      type="text"
                      value={exp.title}
                      onChange={(e) => handleExperienceChange(index, "title", e.target.value)}
                      className="cyber-input"
                      placeholder="e.g. Software Engineer"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Company</label>
                    <input
                      type="text"
                      value={exp.company}
                      onChange={(e) => handleExperienceChange(index, "company", e.target.value)}
                      className="cyber-input"
                      placeholder="e.g. Tech Solutions Inc."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Location</label>
                    <input
                      type="text"
                      value={exp.location}
                      onChange={(e) => handleExperienceChange(index, "location", e.target.value)}
                      className="cyber-input"
                      placeholder="e.g. San Francisco, CA"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Start Date</label>
                      <input
                        type="month"
                        value={exp.startDate}
                        onChange={(e) => handleExperienceChange(index, "startDate", e.target.value)}
                        className="cyber-input"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">End Date</label>
                      <input
                        type="month"
                        value={exp.endDate}
                        onChange={(e) => handleExperienceChange(index, "endDate", e.target.value)}
                        className="cyber-input"
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                    <textarea
                      rows={4}
                      value={exp.description}
                      onChange={(e) => handleExperienceChange(index, "description", e.target.value)}
                      className="cyber-input"
                      placeholder="Describe your responsibilities and achievements..."
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-electric-blue">Education</h2>
              <button type="button" onClick={addEducation} className="text-sm text-electric-blue hover:text-white">
                + Add Education
              </button>
            </div>

            {resumeData.education.map((edu, index) => (
              <div key={index} className="glass p-4 rounded-lg space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Education {index + 1}</h3>
                  {resumeData.education.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeEducation(index)}
                      className="text-red-500 hover:text-red-400 text-sm"
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Degree</label>
                    <input
                      type="text"
                      value={edu.degree}
                      onChange={(e) => handleEducationChange(index, "degree", e.target.value)}
                      className="cyber-input"
                      placeholder="e.g. Bachelor of Science in Computer Science"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Institution</label>
                    <input
                      type="text"
                      value={edu.institution}
                      onChange={(e) => handleEducationChange(index, "institution", e.target.value)}
                      className="cyber-input"
                      placeholder="e.g. Stanford University"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Location</label>
                    <input
                      type="text"
                      value={edu.location}
                      onChange={(e) => handleEducationChange(index, "location", e.target.value)}
                      className="cyber-input"
                      placeholder="e.g. Stanford, CA"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Start Date</label>
                      <input
                        type="month"
                        value={edu.startDate}
                        onChange={(e) => handleEducationChange(index, "startDate", e.target.value)}
                        className="cyber-input"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">End Date</label>
                      <input
                        type="month"
                        value={edu.endDate}
                        onChange={(e) => handleEducationChange(index, "endDate", e.target.value)}
                        className="cyber-input"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-electric-blue">Projects</h2>
              <button type="button" onClick={addProject} className="text-sm text-electric-blue hover:text-white">
                + Add Project
              </button>
            </div>

            {resumeData.projects.map((project, index) => (
              <div key={index} className="glass p-4 rounded-lg space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Project {index + 1}</h3>
                  {resumeData.projects.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeProject(index)}
                      className="text-red-500 hover:text-red-400 text-sm"
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Project Name</label>
                    <input
                      type="text"
                      value={project.name}
                      onChange={(e) => handleProjectChange(index, "name", e.target.value)}
                      className="cyber-input"
                      placeholder="e.g. E-commerce Platform"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                    <textarea
                      rows={3}
                      value={project.description}
                      onChange={(e) => handleProjectChange(index, "description", e.target.value)}
                      className="cyber-input"
                      placeholder="Describe the project and your role..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Technologies Used</label>
                    <input
                      type="text"
                      value={project.technologies}
                      onChange={(e) => handleProjectChange(index, "technologies", e.target.value)}
                      className="cyber-input"
                      placeholder="e.g. React, Node.js, MongoDB, AWS"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )

      default:
        return null
    }
  }

  // Render resume preview
  const renderPreview = () => {
    return (
      <div className="glass-card">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-electric-blue">Resume Preview</h2>
          <div className="flex space-x-2">
            <button onClick={() => setPreview(false)} className="cyber-button-secondary">
              Edit
            </button>
            <button onClick={handleDownload} className="cyber-button flex items-center">
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </button>
          </div>
        </div>

        <div className="bg-white text-black p-8 rounded-lg shadow-lg">
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold">{resumeData.personalInfo.name}</h1>
            <div className="flex flex-wrap justify-center gap-x-4 text-sm mt-2">
              <span>{resumeData.personalInfo.email}</span>
              <span>{resumeData.personalInfo.phone}</span>
              <span>{resumeData.personalInfo.location}</span>
              {resumeData.personalInfo.linkedin && <span>{resumeData.personalInfo.linkedin}</span>}
            </div>
          </div>

          {/* Objective */}
          {resumeData.objective && (
            <div className="mb-6">
              <h2 className="text-lg font-bold border-b border-gray-300 pb-1 mb-2">Professional Summary</h2>
              <p className="text-sm">{resumeData.objective}</p>
            </div>
          )}

          {/* Skills */}
          {resumeData.skills && (
            <div className="mb-6">
              <h2 className="text-lg font-bold border-b border-gray-300 pb-1 mb-2">Skills</h2>
              <p className="text-sm">{resumeData.skills}</p>
            </div>
          )}

          {/* Experience */}
          {resumeData.experience.length > 0 && resumeData.experience[0].title && (
            <div className="mb-6">
              <h2 className="text-lg font-bold border-b border-gray-300 pb-1 mb-2">Experience</h2>
              {resumeData.experience.map((exp, index) => (
                <div key={index} className="mb-4">
                  <div className="flex justify-between">
                    <h3 className="font-bold">{exp.title}</h3>
                    <span className="text-sm">
                      {exp.startDate &&
                        new Date(exp.startDate).toLocaleDateString("en-US", { year: "numeric", month: "short" })}{" "}
                      -
                      {exp.endDate === "Present"
                        ? " Present"
                        : exp.endDate &&
                          new Date(exp.endDate).toLocaleDateString("en-US", { year: "numeric", month: "short" })}
                    </span>
                  </div>
                  <p className="text-sm font-medium">
                    {exp.company}, {exp.location}
                  </p>
                  <p className="text-sm whitespace-pre-line mt-1">{exp.description}</p>
                </div>
              ))}
            </div>
          )}

          {/* Education */}
          {resumeData.education.length > 0 && resumeData.education[0].degree && (
            <div className="mb-6">
              <h2 className="text-lg font-bold border-b border-gray-300 pb-1 mb-2">Education</h2>
              {resumeData.education.map((edu, index) => (
                <div key={index} className="mb-2">
                  <div className="flex justify-between">
                    <h3 className="font-bold">{edu.degree}</h3>
                    <span className="text-sm">
                      {edu.startDate &&
                        new Date(edu.startDate).toLocaleDateString("en-US", { year: "numeric", month: "short" })}{" "}
                      -
                      {edu.endDate &&
                        new Date(edu.endDate).toLocaleDateString("en-US", { year: "numeric", month: "short" })}
                    </span>
                  </div>
                  <p className="text-sm">
                    {edu.institution}, {edu.location}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Projects */}
          {resumeData.projects.length > 0 && resumeData.projects[0].name && (
            <div>
              <h2 className="text-lg font-bold border-b border-gray-300 pb-1 mb-2">Projects</h2>
              {resumeData.projects.map((project, index) => (
                <div key={index} className="mb-2">
                  <h3 className="font-bold">{project.name}</h3>
                  <p className="text-sm mt-1">{project.description}</p>
                  <p className="text-sm italic mt-1">Technologies: {project.technologies}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  const [hasEnoughTokens, setHasEnoughTokens] = useState(true)

  // Handle AI generation
  const handleAiGenerate = async () => {
    // Check if user has enough tokens
    if (!useTokens(2, "Resume Generation")) {
      setHasEnoughTokens(false)
      return
    }
    setHasEnoughTokens(true)

    try {
      setGenerating(true)

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2500))

      // Mock AI-generated resume data
      const aiGeneratedData = {
        personalInfo: {
          name: resumeData.personalInfo.name || "John Doe",
          email: resumeData.personalInfo.email || "john.doe@example.com",
          phone: resumeData.personalInfo.phone || "(123) 456-7890",
          location: resumeData.personalInfo.location || "San Francisco, CA",
          linkedin: resumeData.personalInfo.linkedin || "linkedin.com/in/johndoe",
        },
        objective:
          resumeData.objective ||
          "Dedicated and innovative software engineer with a passion for creating efficient, scalable solutions. Seeking to leverage my technical expertise and problem-solving skills in a challenging role that allows for professional growth and the opportunity to contribute to impactful projects.",
        skills:
          resumeData.skills ||
          "JavaScript, TypeScript, React, Node.js, Express, MongoDB, AWS, Docker, Kubernetes, CI/CD, Git, Agile Methodologies, Python, SQL, NoSQL, REST APIs, GraphQL, Redux, Jest, Cypress",
        experience: [
          {
            title: "Senior Software Engineer",
            company: "Tech Solutions Inc.",
            location: "San Francisco, CA",
            startDate: "2020-01",
            endDate: "Present",
            description:
              "• Led a team of 5 engineers to develop a microservices architecture\n• Reduced API response time by 40% through optimization techniques\n• Implemented CI/CD pipelines using GitHub Actions and AWS\n• Mentored junior developers and conducted code reviews\n• Collaborated with product managers to define and prioritize features",
          },
          {
            title: "Software Engineer",
            company: "WebDev Co.",
            location: "San Francisco, CA",
            startDate: "2018-03",
            endDate: "2019-12",
            description:
              "• Developed responsive web applications using React and Redux\n• Collaborated with UX designers to implement user-friendly interfaces\n• Participated in code reviews and mentored junior developers\n• Optimized database queries resulting in 30% faster page loads\n• Implemented automated testing using Jest and Cypress",
          },
        ],
        education: [
          {
            degree: "Master of Science in Computer Science",
            institution: "Stanford University",
            location: "Stanford, CA",
            startDate: "2016-09",
            endDate: "2018-06",
          },
          {
            degree: "Bachelor of Science in Computer Engineering",
            institution: "University of California, Berkeley",
            location: "Berkeley, CA",
            startDate: "2012-09",
            endDate: "2016-05",
          },
        ],
        projects: [
          {
            name: "E-commerce Platform",
            description: "Developed a full-stack e-commerce platform with React, Node.js, and MongoDB",
            technologies: "React, Node.js, Express, MongoDB, Redux, Stripe API, AWS S3",
          },
          {
            name: "Task Management System",
            description: "Built a collaborative task management system with real-time updates",
            technologies: "React, Firebase, Material-UI, Redux, Jest",
          },
        ],
      }

      setResumeData(aiGeneratedData)
      showNotification("Resume generated successfully", "success")
      setPreview(true)
    } catch (error) {
      showNotification("Failed to generate resume", "error")
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-2">AI Resume Builder</h1>
          <p className="text-gray-300">Create a professional resume with AI assistance</p>
        </div>

        <TokenDisplay />
      </div>

      {preview ? (
        renderPreview()
      ) : (
        <div className="glass-card">
          {/* Progress steps */}
          <div className="flex justify-between mb-8">
            {[1, 2, 3, 4].map((stepNumber) => (
              <div
                key={stepNumber}
                className={`flex flex-col items-center ${stepNumber < step ? "text-electric-blue" : stepNumber === step ? "text-neon-pink" : "text-gray-500"}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${
                    stepNumber < step
                      ? "bg-electric-blue text-cyber-black"
                      : stepNumber === step
                        ? "bg-neon-pink text-white"
                        : "bg-cyber-gray text-gray-400"
                  }`}
                >
                  {stepNumber}
                </div>
                <span className="text-xs hidden md:block">
                  {stepNumber === 1
                    ? "Basic Info"
                    : stepNumber === 2
                      ? "Experience"
                      : stepNumber === 3
                        ? "Education"
                        : "Projects"}
                </span>
              </div>
            ))}
          </div>

          {/* Form */}
          <form>
            {renderForm()}

            {/* Navigation buttons */}
            <div className="flex justify-between mt-8">
              {step > 1 ? (
                <button type="button" onClick={handlePrevStep} className="cyber-button-secondary flex items-center">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Previous
                </button>
              ) : (
                <div></div>
              )}

              {step < 4 ? (
                <button type="button" onClick={handleNextStep} className="cyber-button flex items-center">
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleAiGenerate}
                  className={`cyber-button flex items-center ${generating ? "opacity-50 cursor-not-allowed" : ""}`}
                  disabled={generating}
                >
                  {generating ? (
                    <>Generating...</>
                  ) : (
                    <>
                      <PenTool className="mr-2 h-4 w-4" />
                      Generate Resume
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

export default ResumeBuilder
