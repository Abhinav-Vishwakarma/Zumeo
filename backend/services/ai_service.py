import google.generativeai as genai
import os
import json
from typing import List, Dict, Any, Optional
from dotenv import load_dotenv

load_dotenv()

# Configure Gemini AI
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=GEMINI_API_KEY)

# Set up the model
model = genai.GenerativeModel('gemini-pro')

def extract_resume_data(resume_content: str) -> Dict[str, Any]:
    """Extract structured data from resume content using Gemini AI."""
    prompt = f"""
    Extract the following information from this resume:
    - Full Name
    - Email
    - Phone
    - LinkedIn URL (if available)
    - Education (list of schools, degrees, dates)
    - Work Experience (list of companies, positions, dates, descriptions)
    - Skills (technical and soft skills)
    - Certifications (if available)
    - Projects (if available)
    
    Format the output as a JSON object.
    
    Resume:
    {resume_content}
    """
    
    try:
        response = model.generate_content(prompt)
        # Extract JSON from response
        json_str = response.text
        # Clean up the response to ensure it's valid JSON
        json_str = json_str.replace("```json", "").replace("```", "").strip()
        extracted_data = json.loads(json_str)
        return extracted_data
    except Exception as e:
        print(f"Error extracting resume data: {e}")
        # Return a basic structure if extraction fails
        return {
            "full_name": "",
            "email": "",
            "phone": "",
            "linkedin": "",
            "education": [],
            "work_experience": [],
            "skills": [],
            "certifications": [],
            "projects": []
        }

def analyze_resume(resume_content: str, job_description: Optional[str] = None) -> Dict[str, Any]:
    """Analyze resume content and provide feedback using Gemini AI."""
    if job_description:
        prompt = f"""
        Analyze this resume for the following job description:
        
        Job Description:
        {job_description}
        
        Resume:
        {resume_content}
        
        Provide:
        1. Overall feedback on the resume
        2. A score from 0-100 on how well the resume matches the job description
        3. A list of specific improvement suggestions
        
        Format the output as a JSON object with keys: "feedback", "score", "improvement_suggestions".
        """
    else:
        prompt = f"""
        Analyze this resume and provide general feedback:
        
        Resume:
        {resume_content}
        
        Provide:
        1. Overall feedback on the resume
        2. A score from 0-100 on the quality of the resume
        3. A list of specific improvement suggestions
        
        Format the output as a JSON object with keys: "feedback", "score", "improvement_suggestions".
        """
    
    try:
        response = model.generate_content(prompt)
        # Extract JSON from response
        json_str = response.text
        # Clean up the response to ensure it's valid JSON
        json_str = json_str.replace("```json", "").replace("```", "").strip()
        analysis_result = json.loads(json_str)
        return analysis_result
    except Exception as e:
        print(f"Error analyzing resume: {e}")
        # Return a basic structure if analysis fails
        return {
            "feedback": "Unable to analyze resume at this time.",
            "score": 50.0,
            "improvement_suggestions": ["Try again later."]
        }

def generate_career_roadmap(
    current_role: str, 
    target_role: str, 
    experience_years: int, 
    skills: List[str],
    preferences: Optional[str] = None
) -> str:
    """Generate a career roadmap using Gemini AI."""
    skills_str = ", ".join(skills)
    
    prompt = f"""
    Create a detailed career roadmap from {current_role} to {target_role}.
    
    Current details:
    - Current role: {current_role}
    - Target role: {target_role}
    - Years of experience: {experience_years}
    - Current skills: {skills_str}
    """
    
    if preferences:
        prompt += f"\n- Preferences/constraints: {preferences}"
    
    prompt += """
    
    Please include:
    1. A timeline with key milestones
    2. Skills to acquire at each stage
    3. Recommended certifications or education
    4. Potential job titles for each stage
    5. Estimated time to reach the target role
    
    Format the response as a detailed roadmap with clear sections and bullet points.
    """
    
    try:
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        print(f"Error generating career roadmap: {e}")
        return "Unable to generate career roadmap at this time. Please try again later."

def check_fake_resume(resume_content: str) -> Dict[str, Any]:
    """Check if a resume contains fake or exaggerated information using Gemini AI."""
    prompt = f"""
    Analyze this resume and determine if it contains potentially fake, exaggerated, or misleading information.
    
    Resume:
    {resume_content}
    
    Provide:
    1. A boolean indicating if the resume likely contains fake information (true/false)
    2. A confidence score from 0.0 to 1.0
    3. A detailed explanation of your assessment, pointing out specific red flags or inconsistencies
    
    Format the output as a JSON object with keys: "is_fake", "confidence", "explanation".
    """
    
    try:
        response = model.generate_content(prompt)
        # Extract JSON from response
        json_str = response.text
        # Clean up the response to ensure it's valid JSON
        json_str = json_str.replace("```json", "").replace("```", "").strip()
        check_result = json.loads(json_str)
        return check_result
    except Exception as e:
        print(f"Error checking fake resume: {e}")
        # Return a basic structure if check fails
        return {
            "is_fake": False,
            "confidence": 0.5,
            "explanation": "Unable to analyze resume for authenticity at this time."
        }
