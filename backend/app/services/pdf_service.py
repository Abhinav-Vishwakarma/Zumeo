import os
import fitz  # PyMuPDF
import tempfile
from typing import Dict, List, Optional, Any
import re
from app.config import settings

class PDFService:
    @staticmethod
    async def extract_text_from_pdf(file_path: str) -> str:
        """Extract text from PDF file"""
        try:
            doc = fitz.open(file_path)
            text = ""
            
            for page in doc:
                text += page.get_text()
            
            return text
        except Exception as e:
            raise Exception(f"Error extracting text from PDF: {str(e)}")
    
    @staticmethod
    async def extract_resume_data(file_path: str) -> Dict[str, Any]:
        """Extract structured data from resume PDF"""
        try:
            # Extract raw text
            text = await PDFService.extract_text_from_pdf(file_path)
            
            # Parse resume sections
            resume_data = {
                "personal_info": PDFService._extract_personal_info(text),
                "summary": PDFService._extract_summary(text),
                "skills": PDFService._extract_skills(text),
                "experience": PDFService._extract_experience(text),
                "education": PDFService._extract_education(text),
                "certifications": PDFService._extract_certifications(text)
            }
            
            return resume_data
        except Exception as e:
            raise Exception(f"Error extracting resume data: {str(e)}")
    
    @staticmethod
    def _extract_personal_info(text: str) -> Dict[str, str]:
        """Extract personal information from resume text"""
        # This is a simplified implementation
        # In a real application, you would use more sophisticated NLP techniques
        
        personal_info = {}
        
        # Extract name (assuming it's at the beginning of the resume)
        name_match = re.search(r'^([A-Z][a-z]+(?:\s[A-Z][a-z]+)+)', text, re.MULTILINE)
        if name_match:
            personal_info["name"] = name_match.group(1)
        
        # Extract email
        email_match = re.search(r'[\w\.-]+@[\w\.-]+\.\w+', text)
        if email_match:
            personal_info["email"] = email_match.group(0)
        
        # Extract phone
        phone_match = re.search(r'(\+\d{1,3}[\s-]?)?$$?\d{3}$$?[\s.-]?\d{3}[\s.-]?\d{4}', text)
        if phone_match:
            personal_info["phone"] = phone_match.group(0)
        
        # Extract location (simplified)
        location_match = re.search(r'([A-Z][a-z]+(?:,\s[A-Z]{2}))', text)
        if location_match:
            personal_info["location"] = location_match.group(0)
        
        # Extract LinkedIn
        linkedin_match = re.search(r'linkedin\.com/in/[\w-]+', text)
        if linkedin_match:
            personal_info["linkedin"] = linkedin_match.group(0)
        
        return personal_info
    
    @staticmethod
    def _extract_summary(text: str) -> Optional[str]:
        """Extract summary/objective from resume text"""
        # Look for common section headers
        summary_patterns = [
            r'(?:SUMMARY|PROFESSIONAL SUMMARY|PROFILE|OBJECTIVE)(?:\s*OF QUALIFICATIONS)?:(.*?)(?:\n\n|\n[A-Z]+:)',
            r'(?:SUMMARY|PROFESSIONAL SUMMARY|PROFILE|OBJECTIVE)(?:\s*OF QUALIFICATIONS)?(?:\n+)(.*?)(?:\n\n|\n[A-Z]+:)'
        ]
        
        for pattern in summary_patterns:
            match = re.search(pattern, text, re.IGNORECASE | re.DOTALL)
            if match:
                summary = match.group(1).strip()
                return summary
        
        return None
    
    @staticmethod
    def _extract_skills(text: str) -> List[str]:
        """Extract skills from resume text"""
        # Look for skills section
        skills_pattern = r'(?:SKILLS|TECHNICAL SKILLS|KEY SKILLS|CORE COMPETENCIES)(?:\s*:)?\s*(.*?)(?:\n\n|\n[A-Z]+:)'
        match = re.search(skills_pattern, text, re.IGNORECASE | re.DOTALL)
        
        if match:
            skills_text = match.group(1)
            # Split by common separators
            skills = re.split(r'[,•|\n]+', skills_text)
            # Clean and filter
            skills = [skill.strip() for skill in skills if skill.strip()]
            return skills
        
        return []
    
    @staticmethod
    def _extract_experience(text: str) -> List[Dict[str, Any]]:
        """Extract work experience from resume text"""
        # This is a simplified implementation
        experience_section = re.search(
            r'(?:EXPERIENCE|WORK EXPERIENCE|EMPLOYMENT|PROFESSIONAL EXPERIENCE)(?:\s*:)?\s*(.*?)(?:\n\n|\n(?:EDUCATION|SKILLS):)',
            text,
            re.IGNORECASE | re.DOTALL
        )
        
        if not experience_section:
            return []
        
        experience_text = experience_section.group(1)
        
        # Try to identify individual positions
        # This is a simplified approach - real implementation would be more robust
        positions = []
        
        # Look for patterns like "Company Name | Position | Dates"
        position_matches = re.finditer(
            r'([A-Z][A-Za-z\s&,]+)\s*(?:\||–|-|,)\s*([A-Za-z\s]+)\s*(?:\||–|-|,)\s*([A-Za-z\s0-9\-\.]+)',
            experience_text
        )
        
        for match in position_matches:
            company = match.group(1).strip()
            title = match.group(2).strip()
            dates = match.group(3).strip()
            
            # Get the description (text until the next position or end of section)
            start_pos = match.end()
            end_pos = experience_text.find(company, start_pos)
            if end_pos == -1:
                description_text = experience_text[start_pos:].strip()
            else:
                description_text = experience_text[start_pos:end_pos].strip()
            
            # Split description into bullet points
            description = [
                bullet.strip() for bullet in re.split(r'•|\*|\-|\n+', description_text)
                if bullet.strip()
            ]
            
            positions.append({
                "title": title,
                "company": company,
                "dates": dates,
                "description": description
            })
        
        return positions
    
    @staticmethod
    def _extract_education(text: str) -> List[Dict[str, Any]]:
        """Extract education from resume text"""
        education_section = re.search(
            r'(?:EDUCATION|ACADEMIC BACKGROUND)(?:\s*:)?\s*(.*?)(?:\n\n|\n(?:SKILLS|EXPERIENCE|CERTIFICATIONS):|\Z)',
            text,
            re.IGNORECASE | re.DOTALL
        )
        
        if not education_section:
            return []
        
        education_text = education_section.group(1)
        
        # Try to identify individual education entries
        education = []
        
        # Look for degree patterns
        degree_matches = re.finditer(
            r'((?:Bachelor|Master|Ph\.D|MBA|B\.S\.|M\.S\.|B\.A\.|M\.A\.|Doctor)[^,\n]*),\s*([^,\n]*),\s*([^,\n]*)',
            education_text,
            re.IGNORECASE
        )
        
        for match in degree_matches:
            degree = match.group(1).strip()
            institution = match.group(2).strip()
            dates = match.group(3).strip()
            
            education.append({
                "degree": degree,
                "institution": institution,
                "dates": dates
            })
        
        return education
    
    @staticmethod
    def _extract_certifications(text: str) -> List[str]:
        """Extract certifications from resume text"""
        cert_section = re.search(
            r'(?:CERTIFICATIONS|CERTIFICATES|LICENSES)(?:\s*:)?\s*(.*?)(?:\n\n|\n(?:SKILLS|EXPERIENCE|EDUCATION):|\Z)',
            text,
            re.IGNORECASE | re.DOTALL
        )
        
        if not cert_section:
            return []
        
        cert_text = cert_section.group(1)
        
        # Split by common separators
        certs = re.split(r'[,•|\n]+', cert_text)
        # Clean and filter
        certs = [cert.strip() for cert in certs if cert.strip()]
        
        return certs