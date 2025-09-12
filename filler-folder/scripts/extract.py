import os
import json
import PyPDF2
from openai import OpenAI
from dotenv import load_dotenv

# Load environment variables
load_dotenv(dotenv_path="C:/Users/Samuel/pythonprojects/Tracking_software/Form-Filler/filler-folder/scripts/api.env")

# Get API key
api_key = os.getenv("OPENAI_API_KEY")
if not api_key:
    raise ValueError("❌ No API key found. Did you set OPENAI_API_KEY in your .env file?")

# OpenAI client
client = OpenAI(api_key=api_key)

def extract_text_from_pdf(file_path):
    """Extract raw text from a PDF resume"""
    text = ""
    with open(file_path, "rb") as f:
        reader = PyPDF2.PdfReader(f)
        for page in reader.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
    return text

def parse_resume_with_gpt(resume_text):
    """Use GPT to structure resume into JSON"""
    prompt = f"""
    Extract and structure the following resume into JSON with keys:
    - name
    - education
    - skills
    - experience
    - projects
    - extracurriculars

    Resume Text:
    {resume_text}
    """

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a helpful assistant that parses resumes into structured JSON."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.2
        )
        return json.loads(response.choices[0].message.content)

    except Exception as e:
        print(f"⚠️ LLM API failed: {e}\n➡️ Using fallback parser.")
        return fallback_parser(resume_text)

def fallback_parser(text):
    """Fallback keyword-based parser"""
    parsed = {
        "name": "Unknown",
        "education": "",
        "skills": [],
        "experience": [],
        "projects": [],
        "extracurriculars": []
    }

    if "Education" in text:
        parsed["education"] = text.split("Education")[1].split("Skills")[0].strip()
    if "Skills" in text:
        parsed["skills"] = text.split("Skills")[1].split("Experience")[0].strip().split(",")
    if "Experience" in text:
        parsed["experience"] = [text.split("Experience")[1].split("Projects")[0].strip()]
    if "Projects" in text:
        parsed["projects"] = [text.split("Projects")[1].split("Extracurriculars")[0].strip()]
    if "Extracurriculars" in text:
        parsed["extracurriculars"] = text.split("Extracurriculars")[1].strip().split(",")

    return parsed

if __name__ == "__main__":
    # Input resume file
    pdf_file = "resume 2.0.docx.pdf"
    resume_text = extract_text_from_pdf(pdf_file)

    # Parse into JSON
    structured_resume = parse_resume_with_gpt(resume_text)

    # Save to file
    with open("structured_resume.json", "w", encoding="utf-8") as f:
        json.dump(structured_resume, f, indent=4, ensure_ascii=False)

    print("\n📌 Structured Resume Output saved to structured_resume.json\n")
    print(json.dumps(structured_resume, indent=4))
