import os
import json
import datetime
from google import genai

# Initialize Gemini Client with API key from environment variable
client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])

# Generate current timestamp for filename (e.g. 2026-07-24-1744)
now = datetime.datetime.now(datetime.timezone.utc)
timestamp_str = now.strftime("%Y-%m-%d-%H%M")

prompt = """
Generate a daily financial briefing JSON for HK/US stock markets based on recent financial news (such as Zhitongcaijing).
Return ONLY valid JSON matching this schema exactly, without any markdown formatting or extra text:

{
  "generatedAt": "2026-07-24T17:44:00+08:00",
  "coverageWindow": {
    "start": "2026-07-24T08:00:00+08:00",
    "end": "2026-07-24T17:44:00+08:00"
  },
  "timezone": "Asia/Hong_Kong",
  "marketLayer": [
    {
      "title": "Sector/Topic Name",
      "fact": "Fact summary from news",
      "inference": "Market implication/inference",
      "keyUncertainty": "Key risk or uncertainty factor"
    }
  ]
}
"""

response = client.models.generate_content(
    model='gemini-2.5-flash',
    contents=prompt
)

# Extract raw text from Gemini response
content = response.text.strip()
if content.startswith("```json"):
    content = content[7:]
if content.endswith("```"):
    content = content[:-3]

# Save to briefings directory
os.makedirs("briefings", exist_ok=True)
filepath = os.path.join("briefings", f"{timestamp_str}.json")

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content.strip())

print(f"✅ Generated new briefing: {filepath}")
