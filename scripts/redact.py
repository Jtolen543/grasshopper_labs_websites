import sys
import re
import os
import fitz  # PyMuPDF

def redact_pdf(input_path, output_path, student_name):
    print(f"Opening {input_path}")
    doc = fitz.open(input_path)
    
    # Pre-compile regexes
    patterns = [
        re.compile(r'[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+'), # Email
        re.compile(r'\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}'),             # Phone
        re.compile(r'\b(?:https?:\/\/)?(?:www\.)?linkedin\.com\/[^\s|]+'), # LinkedIn
        re.compile(r'\b(?:https?:\/\/)?(?:www\.)?github\.com\/[^\s|]+'),    # Github
        re.compile(r'\b(?:https?:\/\/)?(?:www\.)?[a-zA-Z0-9-]+\.(?:com|org|net|me|io)\b(?:\/[^\s|]+)?'), # Websites loosely
        re.compile(r'\b[A-Z][a-zA-Z]+(?: [A-Z][a-zA-Z]+)?, (?:AL|AK|AZ|AR|CA|CO|CT|DE|FL|GA|HI|ID|IL|IN|IA|KS|KY|LA|ME|MD|MA|MI|MN|MS|MO|MT|NE|NV|NH|NJ|NM|NY|NC|ND|OH|OK|OR|PA|RI|SC|SD|TN|TX|UT|VT|VA|WA|WV|WI|WY|ST)(?:\s+\d{5}(?:-\d{4})?)?\b'), # City, State, Zip
        re.compile(r'\b[A-Za-z0-9-]{1,8}\s+[A-Za-z0-9\s.,]+(?:\bStreet\b|\bSt\.?\b|\bAvenue\b|\bAve\.?\b|\bRoad\b|\bRd\.?\b|\bBoulevard\b|\bBlvd\.?\b|\bLane\b|\bLn\.?\b|\bDrive\b|\bDr\.?\b|\bCourt\b|\bCt\.?\b|\bWay\b|\bCircle\b|\bCir\.?\b)\b', re.IGNORECASE) # Street Address
    ]
    
    name_parts = student_name.split() if student_name else []

    for page in doc:
        # Extract all text on the page as a single string
        page_text = page.get_text("text")
        
        matches_to_redact = set()
        
        # Find exact literal matches using Regex on the extracted text
        for pattern in patterns:
            found = pattern.findall(page_text)
            for m in found:
                matches_to_redact.add(m.strip())

        # Also add name parts to our list of literals to redact
        if student_name:
            matches_to_redact.add(student_name)
            for part in name_parts:
                if len(part) > 2: # Avoid redacting small initials accidentally matching other words
                    matches_to_redact.add(part)

        # Now, search the page for these exact literal strings and redact the bounding boxes
        for literal in matches_to_redact:
            if not literal: continue
            
            # search_for returns a list of Quads
            text_instances = page.search_for(literal, quads=True)
            for quad in text_instances:
                page.add_redact_annot(quad, fill=(0.1, 0.1, 0.1)) # Dark grey/black

        # Apply redactions (this permanently removes text from the PDF stream)
        page.apply_redactions()

    # Create PNG for the first page
    first_page = doc[0]
    pix = first_page.get_pixmap(dpi=150)
    
    # Save the output image
    pix.save(output_path)
    print(f"Saved rasterized redacted image to {output_path}")

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python redact.py <input.pdf> <output.png> [Student Name]")
        sys.exit(1)
        
    input_file = sys.argv[1]
    output_image = sys.argv[2]
    name = sys.argv[3] if len(sys.argv) > 3 else ""
    
    os.makedirs(os.path.dirname(output_image), exist_ok=True)
    
    redact_pdf(input_file, output_image, name)
