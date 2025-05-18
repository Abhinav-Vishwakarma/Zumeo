"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import {
  FileText,
  CheckCircle,
  GitBranch,
  Briefcase,
  AlertTriangle,
  ChevronRight,
  ArrowRight,
  Check,
  Menu,
  X,
} from "lucide-react"

const LandingPage = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header/Navigation */}
      <header className="glassmorphism sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center">
                <span className="text-2xl font-bold text-gradient">ResumeAI</span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-300 hover:text-white transition-colors">
                Features
              </a>
              <a href="#pricing" className="text-gray-300 hover:text-white transition-colors">
                Pricing
              </a>
              <a href="#testimonials" className="text-gray-300 hover:text-white transition-colors">
                Testimonials
              </a>
              <a href="#faq" className="text-gray-300 hover:text-white transition-colors">
                FAQ
              </a>
              <Link to="/login" className="text-gray-300 hover:text-white transition-colors">
                Login
              </Link>
              <Link to="/register" className="cyber-button">
                Get Started
              </Link>
            </nav>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button onClick={toggleMobileMenu} className="text-gray-300 hover:text-white focus:outline-none">
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden glassmorphism">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <a
                href="#features"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-muted"
                onClick={() => setMobileMenuOpen(false)}
              >
                Features
              </a>
              <a
                href="#pricing"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-muted"
                onClick={() => setMobileMenuOpen(false)}
              >
                Pricing
              </a>
              <a
                href="#testimonials"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-muted"
                onClick={() => setMobileMenuOpen(false)}
              >
                Testimonials
              </a>
              <a
                href="#faq"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-muted"
                onClick={() => setMobileMenuOpen(false)}
              >
                FAQ
              </a>
              <Link
                to="/login"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-muted"
                onClick={() => setMobileMenuOpen(false)}
              >
                Login
              </Link>
              <Link
                to="/register"
                className="block px-3 py-2 rounded-md text-base font-medium bg-gradient-to-r from-primary to-secondary text-white"
                onClick={() => setMobileMenuOpen(false)}
              >
                Get Started
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/20 via-background to-background"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-center">
            <div className="lg:w-1/2 lg:pr-12 mb-12 lg:mb-0">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                Elevate Your Career with <span className="text-gradient">AI-Powered</span> Resume Tools
              </h1>
              <p className="text-xl text-gray-300 mb-8">
                Create professional resumes, get personalized career roadmaps, and connect with businesses using our
                advanced AI platform.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/register" className="cyber-button flex items-center justify-center">
                  Get Started Free
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Link>
                <a href="#features" className="cyber-button-secondary flex items-center justify-center">
                  Explore Features
                </a>
              </div>
              <div className="mt-8 flex items-center text-sm text-gray-400">
                <Check className="h-5 w-5 text-accent mr-2" />
                No credit card required for free plan
              </div>
            </div>
            <div className="lg:w-1/2 relative">
              <div className="glassmorphism rounded-xl p-2 shadow-xl animate-float">
                <img
                  src="/placeholder.svg?height=600&width=800"
                  alt="ResumeAI Dashboard"
                  className="rounded-lg w-full"
                />
              </div>
              {/* Fixed the floating elements by ensuring they have proper z-index and positioning */}
              <div className="absolute -bottom-4 -left-4 glassmorphism p-4 rounded-lg shadow-lg z-20">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-accent flex items-center justify-center text-white font-bold">
                    85
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-white">ATS Score</p>
                    <p className="text-xs text-gray-400">Resume optimized</p>
                  </div>
                </div>
              </div>
              <div className="absolute -top-4 -right-4 glassmorphism p-4 rounded-lg shadow-lg z-20">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center text-white font-bold">
                    <Check className="h-6 w-6" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-white">AI Generated</p>
                    <p className="text-xs text-gray-400">Professional content</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Powerful AI Tools for Your Career</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Our comprehensive suite of AI-powered tools helps you build the perfect resume, plan your career path, and
              connect with opportunities.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="glassmorphism rounded-xl p-6 transition-transform hover:scale-105">
              <div className="h-12 w-12 rounded-lg bg-primary/20 flex items-center justify-center mb-6">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">Resume Extractor</h3>
              <p className="text-gray-300 mb-4">
                Extract key information from your existing resume automatically, saving time and ensuring no important
                details are missed.
              </p>
              <Link to="/register" className="text-accent hover:text-white flex items-center text-sm">
                Learn more <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>

            <div className="glassmorphism rounded-xl p-6 transition-transform hover:scale-105">
              <div className="h-12 w-12 rounded-lg bg-secondary/20 flex items-center justify-center mb-6">
                <FileText className="h-6 w-6 text-secondary" />
              </div>
              <h3 className="text-xl font-bold mb-3">AI Resume Builder</h3>
              <p className="text-gray-300 mb-4">
                Create professional, ATS-optimized resumes with AI assistance. Customize templates and content to match
                your career goals.
              </p>
              <Link to="/register" className="text-accent hover:text-white flex items-center text-sm">
                Learn more <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>

            <div className="glassmorphism rounded-xl p-6 transition-transform hover:scale-105">
              <div className="h-12 w-12 rounded-lg bg-accent/20 flex items-center justify-center mb-6">
                <CheckCircle className="h-6 w-6 text-accent" />
              </div>
              <h3 className="text-xl font-bold mb-3">Resume Checker</h3>
              <p className="text-gray-300 mb-4">
                Check your resume against ATS systems and get detailed feedback on how to improve your chances of
                getting past automated filters.
              </p>
              <Link to="/register" className="text-accent hover:text-white flex items-center text-sm">
                Learn more <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>

            <div className="glassmorphism rounded-xl p-6 transition-transform hover:scale-105">
              <div className="h-12 w-12 rounded-lg bg-primary/20 flex items-center justify-center mb-6">
                <GitBranch className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">Roadmap Generator</h3>
              <p className="text-gray-300 mb-4">
                Create personalized career roadmaps based on your goals. Get step-by-step guidance on skills to develop
                and milestones to achieve.
              </p>
              <Link to="/register" className="text-accent hover:text-white flex items-center text-sm">
                Learn more <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>

            <div className="glassmorphism rounded-xl p-6 transition-transform hover:scale-105">
              <div className="h-12 w-12 rounded-lg bg-secondary/20 flex items-center justify-center mb-6">
                <Briefcase className="h-6 w-6 text-secondary" />
              </div>
              <h3 className="text-xl font-bold mb-3">Business Connect</h3>
              <p className="text-gray-300 mb-4">
                Connect with recruiters and businesses looking for talent. Find job opportunities that match your skills
                and career aspirations.
              </p>
              <Link to="/register" className="text-accent hover:text-white flex items-center text-sm">
                Learn more <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>

            <div className="glassmorphism rounded-xl p-6 transition-transform hover:scale-105">
              <div className="h-12 w-12 rounded-lg bg-accent/20 flex items-center justify-center mb-6">
                <AlertTriangle className="h-6 w-6 text-accent" />
              </div>
              <h3 className="text-xl font-bold mb-3">Fake Resume Detector</h3>
              <p className="text-gray-300 mb-4">
                Detect fake or exaggerated claims in resumes. Ensure your hiring process is based on accurate
                information.
              </p>
              <Link to="/register" className="text-accent hover:text-white flex items-center text-sm">
                Learn more <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How ResumeAI Works</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Our platform simplifies the process of creating professional resumes and advancing your career
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="h-16 w-16 rounded-full bg-primary flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold">
                1
              </div>
              <h3 className="text-xl font-bold mb-3">Create Your Profile</h3>
              <p className="text-gray-300">
                Sign up and enter your professional information or upload an existing resume to get started.
              </p>
            </div>

            <div className="text-center">
              <div className="h-16 w-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold">
                2
              </div>
              <h3 className="text-xl font-bold mb-3">Use AI Tools</h3>
              <p className="text-gray-300">
                Leverage our AI-powered tools to create, optimize, and check your resume against industry standards.
              </p>
            </div>

            <div className="text-center">
              <div className="h-16 w-16 rounded-full bg-accent flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold">
                3
              </div>
              <h3 className="text-xl font-bold mb-3">Apply & Connect</h3>
              <p className="text-gray-300">
                Apply to jobs with your optimized resume and connect with businesses looking for your skills.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Choose the plan that works best for your needs, from free to premium options
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glassmorphism rounded-xl p-8 border border-border">
              <h3 className="text-2xl font-bold mb-2">Free</h3>
              <p className="text-3xl font-bold mb-6">
                $0<span className="text-gray-400 text-base font-normal">/month</span>
              </p>
              <div className="border-t border-border my-6"></div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-accent mr-2 mt-0.5 flex-shrink-0" />
                  <span>10 free tokens on signup</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-accent mr-2 mt-0.5 flex-shrink-0" />
                  <span>Access to Resume Extractor</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-accent mr-2 mt-0.5 flex-shrink-0" />
                  <span>Access to Resume Checker</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-accent mr-2 mt-0.5 flex-shrink-0" />
                  <span>Basic support</span>
                </li>
              </ul>
              <Link to="/register" className="cyber-button-secondary w-full flex items-center justify-center">
                Get Started Free
              </Link>
            </div>

            <div className="glassmorphism rounded-xl p-8 border-2 border-primary relative transform scale-105 z-10">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-primary text-white px-4 py-1 rounded-full text-sm font-medium">
                Most Popular
              </div>
              <h3 className="text-2xl font-bold mb-2">Pro</h3>
              <p className="text-3xl font-bold mb-6">
                $9.99<span className="text-gray-400 text-base font-normal">/month</span>
              </p>
              <div className="border-t border-border my-6"></div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-accent mr-2 mt-0.5 flex-shrink-0" />
                  <span>50 tokens per month</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-accent mr-2 mt-0.5 flex-shrink-0" />
                  <span>Access to all AI tools</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-accent mr-2 mt-0.5 flex-shrink-0" />
                  <span>Priority support</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-accent mr-2 mt-0.5 flex-shrink-0" />
                  <span>Download unlimited resumes</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-accent mr-2 mt-0.5 flex-shrink-0" />
                  <span>No ads</span>
                </li>
              </ul>
              <Link to="/register" className="cyber-button w-full flex items-center justify-center">
                Get Started
              </Link>
            </div>

            <div className="glassmorphism rounded-xl p-8 border border-border">
              <h3 className="text-2xl font-bold mb-2">Premium</h3>
              <p className="text-3xl font-bold mb-6">
                $19.99<span className="text-gray-400 text-base font-normal">/month</span>
              </p>
              <div className="border-t border-border my-6"></div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-accent mr-2 mt-0.5 flex-shrink-0" />
                  <span>100 tokens per month</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-accent mr-2 mt-0.5 flex-shrink-0" />
                  <span>Access to all AI tools</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-accent mr-2 mt-0.5 flex-shrink-0" />
                  <span>Priority support</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-accent mr-2 mt-0.5 flex-shrink-0" />
                  <span>Custom roadmap consultations</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-accent mr-2 mt-0.5 flex-shrink-0" />
                  <span>Early access to new features</span>
                </li>
              </ul>
              <Link to="/register" className="cyber-button-secondary w-full flex items-center justify-center">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">What Our Users Say</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Thousands of professionals have advanced their careers with ResumeAI
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glassmorphism rounded-xl p-6">
              <div className="flex items-center mb-4">
                <div className="h-12 w-12 rounded-full overflow-hidden">
                  <img src="https://i.pravatar.cc/150?u=user1" alt="User" className="h-full w-full object-cover" />
                </div>
                <div className="ml-4">
                  <h4 className="font-bold">Sarah Johnson</h4>
                  <p className="text-sm text-gray-400">Software Engineer</p>
                </div>
              </div>
              <p className="text-gray-300">
                "ResumeAI helped me optimize my resume for ATS systems, and I started getting more interview calls
                immediately. The roadmap feature also gave me clarity on my career path."
              </p>
            </div>

            <div className="glassmorphism rounded-xl p-6">
              <div className="flex items-center mb-4">
                <div className="h-12 w-12 rounded-full overflow-hidden">
                  <img src="https://i.pravatar.cc/150?u=user2" alt="User" className="h-full w-full object-cover" />
                </div>
                <div className="ml-4">
                  <h4 className="font-bold">Michael Chen</h4>
                  <p className="text-sm text-gray-400">Product Manager</p>
                </div>
              </div>
              <p className="text-gray-300">
                "The AI Resume Builder saved me hours of work. It generated a professional resume that highlighted my
                skills perfectly. I landed my dream job within a month!"
              </p>
            </div>

            <div className="glassmorphism rounded-xl p-6">
              <div className="flex items-center mb-4">
                <div className="h-12 w-12 rounded-full overflow-hidden">
                  <img src="https://i.pravatar.cc/150?u=user3" alt="User" className="h-full w-full object-cover" />
                </div>
                <div className="ml-4">
                  <h4 className="font-bold">Emily Rodriguez</h4>
                  <p className="text-sm text-gray-400">Marketing Director</p>
                </div>
              </div>
              <p className="text-gray-300">
                "As someone who hires frequently, the Fake Resume Detector has been invaluable. It helps us quickly
                verify candidate claims and focus on truly qualified applicants."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-xl text-gray-300">Find answers to common questions about ResumeAI</p>
          </div>

          <div className="space-y-6">
            <div className="glassmorphism rounded-xl p-6">
              <h3 className="text-xl font-bold mb-2">How does the token system work?</h3>
              <p className="text-gray-300">
                Tokens are used to access our AI tools. Each tool requires a specific number of tokens. Free users get
                10 tokens on signup, while paid plans include monthly token allocations. You can also purchase
                additional tokens as needed.
              </p>
            </div>

            <div className="glassmorphism rounded-xl p-6">
              <h3 className="text-xl font-bold mb-2">Is my data secure?</h3>
              <p className="text-gray-300">
                Yes, we take data security seriously. Your personal information and resume data are encrypted and stored
                securely. We do not share your information with third parties without your consent.
              </p>
            </div>

            <div className="glassmorphism rounded-xl p-6">
              <h3 className="text-xl font-bold mb-2">Can I cancel my subscription anytime?</h3>
              <p className="text-gray-300">
                Yes, you can cancel your subscription at any time. Your access will continue until the end of your
                current billing period. There are no cancellation fees or long-term commitments.
              </p>
            </div>

            <div className="glassmorphism rounded-xl p-6">
              <h3 className="text-xl font-bold mb-2">How accurate is the AI Resume Builder?</h3>
              <p className="text-gray-300">
                Our AI Resume Builder uses advanced machine learning algorithms trained on millions of successful
                resumes. While it provides high-quality content, we recommend reviewing and personalizing the generated
                content to ensure it accurately represents your experience and skills.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-primary/20 via-background to-background"></div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="glassmorphism rounded-xl p-12 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Advance Your Career?</h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Join thousands of professionals who have transformed their careers with ResumeAI's powerful tools.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/register" className="cyber-button flex items-center justify-center">
                Get Started Free
                <ChevronRight className="ml-2 h-5 w-5" />
              </Link>
              <Link to="/login" className="cyber-button-secondary flex items-center justify-center">
                Login
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="glassmorphism py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <Link to="/" className="flex items-center">
                <span className="text-2xl font-bold text-gradient">ResumeAI</span>
              </Link>
              <p className="mt-4 text-gray-400">
                Advanced AI tools to help you build the perfect resume and advance your career.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-bold mb-4">Product</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#features" className="text-gray-400 hover:text-white">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#pricing" className="text-gray-400 hover:text-white">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white">
                    Roadmap
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white">
                    Updates
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-bold mb-4">Company</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-gray-400 hover:text-white">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white">
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-bold mb-4">Legal</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-gray-400 hover:text-white">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white">
                    Cookie Policy
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400">© {new Date().getFullYear()} ResumeAI. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white">
                <span className="sr-only">Twitter</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <span className="sr-only">LinkedIn</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <span className="sr-only">GitHub</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fillRule="evenodd"
                    d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                    clipRule="evenodd"
                  />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
