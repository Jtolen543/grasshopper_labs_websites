from PyPDF2 import PdfReader
import re
from pathlib import Path
from typing import Dict, Any, List

class ResumeParser:
    def __init__(self):
        self.gpa_pattern = re.compile(r'GPA:\s*([0-4]\.[0-9]+)')
        
        # Refined section markers
        self.section_markers = {
            'education': r'Education\n',
            'experience': r'Experience\n',
            'projects': r'Projects\n',
            'skills': r'Technical Skills\n',
        }
        
        # Internship identifiers
        self.internship_patterns = [
            r'(\w+\s)?Intern\b',
            r'Internship',
        ]

    def extract_text(self, pdf_path: Path) -> str:
        with open(pdf_path, 'rb') as file:
            pdf = PdfReader(file)
            return '\n'.join(page.extract_text() for page in pdf.pages)

    def find_section_bounds(self, text: str) -> Dict[str, tuple]:
        sections = {}
        lines = text.split('\n')
        
        for i, line in enumerate(lines):
            # Check for Education section and extract coursework
            if line.strip() == 'Education':
                education_start = i
                for j, edu_line in enumerate(lines[i:], start=i):
                    if '•Relevant Coursework:' in edu_line:
                        sections['coursework'] = (j, self._find_next_section(lines, j))
                        break
                sections['education'] = (education_start, self._find_next_section(lines, i))
            
            # Check for Experience section
            elif line.strip() == 'Experience':
                sections['experience'] = (i, self._find_next_section(lines, i))
            
            # Check for Projects section
            elif line.strip() == 'Projects':
                sections['projects'] = (i, self._find_next_section(lines, i))
            
            # Check for Technical Skills section
            elif line.strip() == 'Technical Skills':
                sections['skills'] = (i, len(lines))
        
        return sections

    def _find_next_section(self, lines: List[str], start_idx: int) -> int:
        section_headers = ['Experience', 'Projects', 'Technical Skills']
        for i, line in enumerate(lines[start_idx + 1:], start=start_idx + 1):
            if line.strip() in section_headers:
                return i
        return len(lines)

    def extract_bullet_points(self, lines: List[str], start: int, end: int) -> List[str]:
        bullet_points = []
        current_point = []
        
        for line in lines[start:end]:
            if line.strip().startswith('•'):
                if current_point:
                    bullet_points.append(' '.join(current_point))
                    current_point = []
                current_point.append(line.strip()[1:].strip())
            elif current_point and line.strip():
                current_point[-1] += ' ' + line.strip()
        
        if current_point:
            bullet_points.append(' '.join(current_point))
        
        return bullet_points

    def count_internships(self, experience_text: str) -> int:
        count = 0
        lines = experience_text.split('\n')
        for line in lines:
            if any(re.search(pattern, line, re.IGNORECASE) for pattern in self.internship_patterns):
                count += 1
        return count

    def extract_fields(self, pdf_path: Path) -> Dict[str, Any]:
        text = self.extract_text(pdf_path)
        lines = text.split('\n')
        sections = self.find_section_bounds(text)
        
        results = {
            'education': [],
            'coursework': [],
            'experience': [],
            'internships': 0,
            'projects': [],
            'skills': [],
            'gpa': None
        }
        
        # Extract GPA
        gpa_match = self.gpa_pattern.search(text)
        if gpa_match:
            results['gpa'] = float(gpa_match.group(1))
        
        # Process Education
        if 'education' in sections:
            start, end = sections['education']
            edu_text = '\n'.join(lines[start:end])
            results['education'] = [line.strip() for line in lines[start+1:end] 
                                  if line.strip() and not line.strip().startswith('•')]
        
        # Process Coursework
        if 'coursework' in sections:
            start, end = sections['coursework']
            coursework_text = '\n'.join(lines[start:end])
            results['coursework'] = [course.strip() for course in 
                                   coursework_text.split('•')[1].split(',')]
        
        # Process Experience
        if 'experience' in sections:
            start, end = sections['experience']
            exp_text = '\n'.join(lines[start:end])
            results['experience'] = self.extract_bullet_points(lines, start, end)
            results['internships'] = self.count_internships(exp_text)
        
        # Process Projects
        if 'projects' in sections:
            start, end = sections['projects']
            results['projects'] = self.extract_bullet_points(lines, start, end)
        
        # Process Skills
        if 'skills' in sections:
            start, end = sections['skills']
            skills_text = '\n'.join(lines[start:end])
            # Extract skills by category
            for line in lines[start:end]:
                if ':' in line:
                    category, skills = line.split(':')
                    results['skills'].extend([s.strip() for s in skills.split(',')])
        
        return results