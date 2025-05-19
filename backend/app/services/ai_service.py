import google.generativeai as genai
from typing import Dict, List, Any, Optional
from app.config import settings

# Configure the Gemini API
genai.configure(api_key=settings.GEMINI_API_KEY)

class GeminiAIService:
    @staticmethod
    async def analyze_resume(resume_text: str, job_description: Optional[str] = None) -> Dict[str, Any]:
        """
        Analyze a resume using Gemini AI
        
        Args:
            resume_text: The text content of the resume
            job_description: Optional job description to match against
            
        Returns:
            Dictionary containing analysis results
        """
        model = genai.GenerativeModel(settings.GEMINI_MODEL)
        
        # Create prompt based on whether job description is provided
        if job_description:
            prompt = f"""
            Analyze the following resume for a job application. Compare it with the job description provided.
            
            RESUME:
            {resume_text}
            
            JOB DESCRIPTION:
            {job_description}
            
            Provide a detailed analysis including:
            1. Overall score (0-100)
            2. Key strengths
            3. Areas for improvement
            4. Keyword matches with the job description
            5. Formatting and structure feedback
            6. Specific suggestions for improvement
            
            Format the response as a structured JSON object with the following keys:
            - overall_score: integer
            - sections: array of objects with name, score, feedback, and suggestions
            - keyword_matches: array of objects with keyword, found (boolean), and importance
            - improvement_suggestions: array of strings
            """
        else:
            prompt = f"""
            Analyze the following resume and provide detailed feedback:
            
            RESUME:
            {resume_text}
            
            Provide a detailed analysis including:
            1. Overall score (0-100)
            2. Key strengths
            3. Areas for improvement
            4. Important keywords found
            5. Formatting and structure feedback
            6. Specific suggestions for improvement
            
            Format the response as a structured JSON object with the following keys:
            - overall_score: integer
            - sections: array of objects with name, score, feedback, and suggestions
            - keyword_matches: array of objects with keyword, found (boolean), and importance
            - improvement_suggestions: array of strings
            """
        
        # Generate response
        response = await model.generate_content_async(prompt)
        
        # Parse the response
        try:
            # Extract JSON from the response
            import json
            import re
            
            # Clean the response text to extract valid JSON
            response_text = response.text
            # Find JSON content (assuming it's enclosed in ```json and ```)
            json_match = re.search(r'```(?:json)?\s*([\s\S]*?)\s*```', response_text)
            if json_match:
                json_str = json_match.group(1)
            else:
                # If not in code block, try to parse the whole response
                json_str = response_text
            
            # Parse JSON
            analysis = json.loads(json_str)
            return analysis
        except Exception as e:
            # Fallback if JSON parsing fails
            return {
                "overall_score": 70,
                "sections": [
                    {
                        "name": "content",
                        "score": 70,
                        "feedback": "The resume content appears to be standard.",
                        "suggestions": ["Could not parse detailed feedback. Please try again."]
                    }
                ],
                "keyword_matches": [],
                "improvement_suggestions": [
                    "Could not generate detailed suggestions due to parsing error.",
                    f"Error: {str(e)}"
                ]
            }
    
    @staticmethod
    async def generate_career_roadmap(
        current_position: str, 
        target_position: str, 
        timeframe: str,
        skills: List[str],
        experience_years: int
    ) -> Dict[str, Any]:
        """
        Generate a career roadmap using Gemini AI
        
        Args:
            current_position: User's current job position
            target_position: User's target job position
            timeframe: Desired timeframe to reach target (e.g., "1 year", "5 years")
            skills: List of user's current skills
            experience_years: Years of experience in current field
            
        Returns:
            Dictionary containing career roadmap
        """
        model = genai.GenerativeModel(settings.GEMINI_MODEL)
        
        skills_text = ", ".join(skills)
        
        prompt = f"""
        Create a detailed career roadmap for someone transitioning from {current_position} to {target_position} within {timeframe}.
        
        CURRENT DETAILS:
        - Current position: {current_position}
        - Target position: {target_position}
        - Timeframe: {timeframe}
        - Current skills: {skills_text}
        - Years of experience: {experience_years}
        
        Provide a detailed roadmap including:
        1. Key milestones to achieve
        2. Skills to develop (technical and soft)
        3. Recommended resources for each skill (courses, books, etc.)
        4. Timeline for each milestone
        
        Format the response as a structured JSON object with the following keys:
        - title: string (name of the roadmap)
        - milestones: array of objects with title, description, timeframe, skills, and completed (boolean)
        - skills: array of objects with name, category, priority, and resources (array of objects with title, url, and type)
        """
        
        # Generate response
        response = await model.generate_content_async(prompt)
        
        # Parse the response
        try:
            # Extract JSON from the response
            import json
            import re
            
            # Clean the response text to extract valid JSON
            response_text = response.text
            # Find JSON content (assuming it's enclosed in ```json and ```)
            json_match = re.search(r'```(?:json)?\s*([\s\S]*?)\s*```', response_text)
            if json_match:
                json_str = json_match.group(1)
            else:
                # If not in code block, try to parse the whole response
                json_str = response_text
            
            # Parse JSON
            roadmap = json.loads(json_str)
            return roadmap
        except Exception as e:
            # Fallback if JSON parsing fails
            return {
                "title": f"Career Roadmap: {current_position} to {target_position}",
                "milestones": [
                    {
                        "title": "Initial Transition Planning",
                        "description": "Begin planning your transition and skill development",
                        "timeframe": "1-3 months",
                        "skills": ["research", "planning"],
                        "completed": False
                    }
                ],
                "skills": [
                    {
                        "name": "Career Planning",
                        "category": "soft",
                        "priority": "high",
                        "resources": [
                            {
                                "title": "Career Transition Guide",
                                "url": "https://example.com/career-guide",
                                "type": "article"
                            }
                        ]
                    }
                ]
            }
    
    @staticmethod
    async def detect_fake_resume(resume_text: str) -> Dict[str, Any]:
        """
        Detect potentially fake or exaggerated content in a resume
        
        Args:
            resume_text: The text content of the resume
            
        Returns:
            Dictionary containing authenticity analysis
        """
        model = genai.GenerativeModel(settings.GEMINI_MODEL)
        
        prompt = f"""
        Analyze the following resume for potential fake, exaggerated, or misleading content:
        
        RESUME:
        {resume_text}
        
        Provide a detailed analysis including:
        1. Overall authenticity score (0-100, where 100 is completely authentic)
        2. Sections or claims that may be exaggerated or fake
        3. Red flags or inconsistencies
        4. Verification suggestions
        
        Format the response as a structured JSON object with the following keys:
        - authenticity: object with score and flags (array of objects with section, issue, and confidence)
        - verification_suggestions: array of strings
        """
        
        # Generate response
        response = await model.generate_content_async(prompt)
        
        # Parse the response
        try:
            # Extract JSON from the response
            import json
            import re
            
            # Clean the response text to extract valid JSON
            response_text = response.text
            # Find JSON content (assuming it's enclosed in ```json and ```)
            json_match = re.search(r'```(?:json)?\s*([\s\S]*?)\s*```', response_text)
            if json_match:
                json_str = json_match.group(1)
            else:
                # If not in code block, try to parse the whole response
                json_str = response_text
            
            # Parse JSON
            analysis = json.loads(json_str)
            return analysis
        except Exception as e:
            # Fallback if JSON parsing fails
            return {
                "authenticity": {
                    "score": 75,
                    "flags": [
                        {
                            "section": "general",
                            "issue": "Could not perform detailed analysis",
                            "confidence": 50
                        }
                    ]
                },
                "verification_suggestions": [
                    "Verify employment history with previous employers",
                    "Check educational credentials with institutions",
                    "Request work samples or portfolio if applicable"
                ]
            }
    
    @staticmethod
    async def improve_resume_section(section_text: str, section_type: str) -> str:
        """
        Improve a specific section of a resume
        
        Args:
            section_text: The text content of the section
            section_type: Type of section (e.g., "summary", "experience", "skills")
            
        Returns:
            Improved section text
        """
        model = genai.GenerativeModel(settings.GEMINI_MODEL)
        
        prompt = f"""
        Improve the following {section_type} section of a resume:
        
        {section_text}
        
        Provide an improved version that:
        1. Uses strong action verbs
        2. Quantifies achievements where possible
        3. Aligns with current industry standards
        4. Is concise and impactful
        5. Maintains the original information but presents it more effectively
        
        Return only the improved text without any explanations or additional formatting.
        """
        
        # Generate response
        response = await model.generate_content_async(prompt)
        
        # Return the improved text
        return response.text.strip()
