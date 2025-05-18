"use client"

import { useState, useEffect } from "react"
import {
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Calendar,
  Edit,
  Save,
  X,
  Upload,
  Download,
  FileText,
  CheckCircle,
  GitBranch,
  Coins,
} from "lucide-react"
import { useAuth } from "../contexts/AuthContext"
import { useToken } from "../contexts/TokenContext"
import { useNotification } from "../contexts/NotificationContext"
import TokenDisplay from "../components/ui/TokenDisplay"

const Profile = () => {
  const { currentUser } = useAuth()
  const { tokens } = useToken()
  const { showNotification } = useNotification()
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [profileData, setProfileData] = useState(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    company: "",
    position: "",
    bio: "",
    avatar: currentUser?.avatar || "",
  })
  const [activities, setActivities] = useState([])
  const [savedResumes, setSavedResumes] = useState([])

  // Mock data fetching
  useEffect(() => {
    const fetchProfileData = async () => {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const mockProfileData = {
        name: currentUser?.name || "John Doe",
        email: currentUser?.email || "john.doe@example.com",
        phone: "+1 (123) 456-7890",
        location: "San Francisco, CA",
        company: "Tech Solutions Inc.",
        position: "Senior Software Engineer",
        bio: "Experienced software engineer with a passion for building innovative solutions. Specialized in full-stack development with expertise in React, Node.js, and cloud technologies.",
        joinedDate: "January 2023",
        avatar: currentUser?.avatar || "https://i.pravatar.cc/150?u=user",
      }

      setProfileData(mockProfileData)
      setFormData(mockProfileData)

      // Mock activities
      const mockActivities = [
        {
          id: 1,
          type: "resume_check",
          title: "Resume checked with ATS Scanner",
          date: "2 days ago",
          score: 82,
        },
        {
          id: 2,
          type: "roadmap",
          title: "Created career roadmap: 'Frontend to Full Stack'",
          date: "1 week ago",
        },
        {
          id: 3,
          type: "resume_build",
          title: "Generated new resume: 'Senior Developer.pdf'",
          date: "2 weeks ago",
        },
        {
          id: 4,
          type: "token_purchase",
          title: "Purchased 20 tokens",
          date: "1 month ago",
        },
      ]

      setActivities(mockActivities)

      // Mock saved resumes
      const mockResumes = [
        {
          id: 1,
          name: "Software_Engineer_Resume.pdf",
          date: "May 15, 2023",
          size: "245 KB",
        },
        {
          id: 2,
          name: "Frontend_Developer_Resume.pdf",
          date: "April 3, 2023",
          size: "198 KB",
        },
        {
          id: 3,
          name: "Full_Stack_Resume.pdf",
          date: "March 22, 2023",
          size: "276 KB",
        },
      ]

      setSavedResumes(mockResumes)
      setLoading(false)
    }

    fetchProfileData()
  }, [currentUser])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleEditToggle = () => {
    if (editing) {
      // Cancel editing
      setFormData(profileData)
    }
    setEditing(!editing)
  }

  const handleSaveProfile = () => {
    // Simulate API call
    setLoading(true)
    setTimeout(() => {
      const updatedProfile = { ...formData }

      // Update the current user in localStorage to reflect the avatar change
      if (currentUser && formData.avatar) {
        const updatedUser = { ...currentUser, avatar: formData.avatar }
        localStorage.setItem("user", JSON.stringify(updatedUser))
      }

      setProfileData(updatedProfile)
      setEditing(false)
      setLoading(false)
      showNotification("Profile updated successfully", "success")
    }, 1000)
  }

  const handleDownloadResume = (id) => {
    showNotification("Resume downloaded successfully", "success")
  }

  const handleDeleteResume = (id) => {
    setSavedResumes(savedResumes.filter((resume) => resume.id !== id))
    showNotification("Resume deleted successfully", "success")
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-12 h-12 border-t-4 border-b-4 border-electric-blue rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-2">My Profile</h1>
          <p className="text-gray-300">Manage your personal information and account settings</p>
        </div>

        <TokenDisplay showBuyButton={true} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Information */}
        <div className="lg:col-span-2">
          <div className="glass-card">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Profile Information</h2>
              <button
                onClick={handleEditToggle}
                className="cyber-button-secondary flex items-center text-sm px-3 py-1.5"
              >
                {editing ? (
                  <>
                    <X className="mr-1 h-4 w-4" />
                    Cancel
                  </>
                ) : (
                  <>
                    <Edit className="mr-1 h-4 w-4" />
                    Edit Profile
                  </>
                )}
              </button>
            </div>

            <div className="flex flex-col md:flex-row">
              <div className="md:w-1/3 mb-6 md:mb-0 flex flex-col items-center">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-electric-blue mb-4">
                  <img
                    src={formData?.avatar || "https://i.pravatar.cc/150?u=user"}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </div>

                {editing && (
                  <label
                    htmlFor="photo-upload"
                    className="cyber-button-secondary flex items-center text-sm px-3 py-1.5 mt-2 cursor-pointer"
                  >
                    <Upload className="mr-1 h-4 w-4" />
                    Change Photo
                    <input
                      id="photo-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          const reader = new FileReader()
                          reader.onload = (event) => {
                            setFormData({
                              ...formData,
                              avatar: event.target?.result,
                            })
                            showNotification("Profile photo updated. Save changes to apply.", "info")
                          }
                          reader.readAsDataURL(e.target.files[0])
                        }
                      }}
                    />
                  </label>
                )}

                <p className="text-sm text-gray-400 mt-4">Member since {profileData.joinedDate}</p>
              </div>

              <div className="md:w-2/3 md:pl-6">
                {editing ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Full Name</label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          className="cyber-input"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="cyber-input"
                          disabled
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Phone</label>
                        <input
                          type="text"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="cyber-input"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Location</label>
                        <input
                          type="text"
                          name="location"
                          value={formData.location}
                          onChange={handleInputChange}
                          className="cyber-input"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Company</label>
                        <input
                          type="text"
                          name="company"
                          value={formData.company}
                          onChange={handleInputChange}
                          className="cyber-input"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Position</label>
                        <input
                          type="text"
                          name="position"
                          value={formData.position}
                          onChange={handleInputChange}
                          className="cyber-input"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Bio</label>
                      <textarea
                        name="bio"
                        value={formData.bio}
                        onChange={handleInputChange}
                        rows={4}
                        className="cyber-input"
                      />
                    </div>

                    <div className="flex justify-end">
                      <button onClick={handleSaveProfile} className="cyber-button flex items-center">
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4">
                      <div className="flex items-start">
                        <User className="h-5 w-5 text-electric-blue mr-2 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-400">Full Name</p>
                          <p className="text-white">{profileData.name}</p>
                        </div>
                      </div>

                      <div className="flex items-start">
                        <Mail className="h-5 w-5 text-electric-blue mr-2 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-400">Email</p>
                          <p className="text-white">{profileData.email}</p>
                        </div>
                      </div>

                      <div className="flex items-start">
                        <Phone className="h-5 w-5 text-electric-blue mr-2 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-400">Phone</p>
                          <p className="text-white">{profileData.phone}</p>
                        </div>
                      </div>

                      <div className="flex items-start">
                        <MapPin className="h-5 w-5 text-electric-blue mr-2 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-400">Location</p>
                          <p className="text-white">{profileData.location}</p>
                        </div>
                      </div>

                      <div className="flex items-start">
                        <Briefcase className="h-5 w-5 text-electric-blue mr-2 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-400">Company</p>
                          <p className="text-white">{profileData.company}</p>
                        </div>
                      </div>

                      <div className="flex items-start">
                        <Briefcase className="h-5 w-5 text-electric-blue mr-2 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-400">Position</p>
                          <p className="text-white">{profileData.position}</p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2">
                      <p className="text-sm text-gray-400 mb-1">Bio</p>
                      <p className="text-white">{profileData.bio}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Saved Resumes */}
          <div className="glass-card mt-8">
            <h2 className="text-xl font-bold mb-6">Saved Resumes</h2>

            {savedResumes.length > 0 ? (
              <div className="space-y-4">
                {savedResumes.map((resume) => (
                  <div key={resume.id} className="glass p-4 rounded-lg flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="p-2 rounded-lg bg-cyber-gray text-neon-pink mr-3">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-white font-medium">{resume.name}</p>
                        <p className="text-sm text-gray-400">
                          {resume.date} • {resume.size}
                        </p>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleDownloadResume(resume.id)}
                        className="p-2 rounded-md bg-cyber-gray text-white hover:bg-cyber-gray/80 transition-colors"
                        title="Download"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteResume(resume.id)}
                        className="p-2 rounded-md bg-cyber-gray text-white hover:bg-cyber-gray/80 transition-colors"
                        title="Delete"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 mx-auto text-gray-500 mb-4" />
                <h3 className="text-xl font-medium text-white mb-2">No resumes saved yet</h3>
                <p className="text-gray-400">Your saved resumes will appear here</p>
              </div>
            )}
          </div>
        </div>

        {/* Activity and Stats */}
        <div className="lg:col-span-1">
          <div className="glass-card">
            <h2 className="text-xl font-bold mb-6">Recent Activity</h2>

            {activities.length > 0 ? (
              <div className="space-y-4">
                {activities.map((activity) => (
                  <div key={activity.id} className="glass p-4 rounded-lg">
                    <div className="flex items-start">
                      <div className="p-2 rounded-full bg-cyber-gray text-electric-blue mr-3">
                        {activity.type === "resume_check" ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : activity.type === "roadmap" ? (
                          <GitBranch className="h-4 w-4" />
                        ) : activity.type === "resume_build" ? (
                          <FileText className="h-4 w-4" />
                        ) : (
                          <Coins className="h-4 w-4" />
                        )}
                      </div>
                      <div>
                        <p className="text-white">{activity.title}</p>
                        <p className="text-xs text-gray-400">{activity.date}</p>
                        {activity.score && (
                          <div className="mt-1 flex items-center">
                            <span className="text-xs text-gray-400 mr-1">Score:</span>
                            <span className="text-xs text-electric-blue">{activity.score}/100</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 mx-auto text-gray-500 mb-4" />
                <h3 className="text-xl font-medium text-white mb-2">No activity yet</h3>
                <p className="text-gray-400">Your recent activities will appear here</p>
              </div>
            )}
          </div>

          {/* Account Settings */}
          <div className="glass-card mt-8">
            <h2 className="text-xl font-bold mb-6">Account Settings</h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">Email Notifications</p>
                  <p className="text-sm text-gray-400">Receive updates and alerts</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-cyber-gray peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-electric-blue"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">Two-Factor Authentication</p>
                  <p className="text-sm text-gray-400">Enhance your account security</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-cyber-gray peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-electric-blue"></div>
                </label>
              </div>

              <div className="pt-4">
                <button className="w-full cyber-button-secondary">Change Password</button>
              </div>

              <div className="pt-2">
                <button className="w-full text-red-500 hover:text-red-400 text-sm py-2">Delete Account</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
