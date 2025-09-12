import os
import json
import pdfplumber
from openai import OpenAI
from dotenv import load_dotenv


# Load variables from .env file
load_dotenv()

# Access the key
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# Initialize OpenAI client
client = OpenAI(api_key=os.getenv("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"))

# -------- Step 1: Extract text from PDF --------
def extract_text_from_pdf(path):
    text = ""
    with pdfplumber.open(path) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
    return text.strip()

# -------- Step 2: Call LLM to parse resume --------
def parse_resume_with_llm(resume_text):
    prompt = f"""
    You are a resume parser. Extract the following sections from the given resume text. 
    Return ONLY valid JSON with the following keys:
    - Name (string)
    - Education (string or array)
    - Skills (array of strings)
    - TechnicalExperience (array of strings)
    - Projects (array of strings)
    - Leadership (array of strings)
    - Other (array of strings)

    Resume Text:
    {resume_text}
    """

    response = client.chat.completions.create(
        model="gpt-4.1-mini",  # you can use gpt-4.1 or gpt-3.5-turbo if limited
        messages=[{"role": "user", "content": prompt}],
        temperature=0
    )

    raw_output = response.choices[0].message.content

    # Parse into JSON safely
    try:
        data = json.loads(raw_output)
    except json.JSONDecodeError:
        print("⚠️ Could not parse JSON. Raw output:")
        print(raw_output)
        data = {}
    return data

# -------- Step 3: Save JSON --------
def save_resume_json(data, output_path="resume.json"):
    with open(output_path, "w") as f:
        json.dump(data, f, indent=2)
    print(f"✅ Resume parsed and saved to {output_path}")

# -------- Main pipeline --------
if __name__ == "__main__":
    # 1. Load resume (PDF example)
    resume_path = "sample_resume.pdf"
    resume_text = extract_text_from_pdf(resume_path)

    # 2. Parse with LLM
    parsed_data = parse_resume_with_llm(resume_text)

    # 3. Save result
    save_resume_json(parsed_data)

