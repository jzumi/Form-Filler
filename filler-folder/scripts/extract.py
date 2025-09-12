import os
import PyPDF2
from openai import OpenAI
from dotenv import load_dotenv

# Load environment variables
load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def extract_text_from_pdf(file_path):
    """Extracts raw text from a PDF resume"""
    text = ""
    with open(file_path, "rb") as f:
        reader = PyPDF2.PdfReader(f)
        for page in reader.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
    return text

def parse_resume_with_gpt(resume_text):
    """Uses GPT to structure resume into JSON sections"""
    prompt = f"""
    Extract and structure the following resume into JSON with keys:
    - name
    - education
    - skills
    - technical_experience
    - projects
    - leadership
    - other

    Resume Text:
    {resume_text}
    """

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "You are a helpful assistant that parses resumes into structured JSON."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.2
    )

    return response.choices[0].message.content

if __name__ == "__main__":
    # Step 1: Extract text from resume.pdf
    pdf_file = "resume.pdf"
    resume_text = extract_text_from_pdf(pdf_file)

    # Step 2: Parse with GPT
    structured_resume = parse_resume_with_gpt(resume_text)

    # Step 3: Print or save JSON
    print("\n📌 Structured Resume Output:\n")
    print(structured_resume)
