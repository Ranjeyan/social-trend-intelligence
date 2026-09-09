import os
import json

from dotenv import load_dotenv
from google import genai

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

client = genai.Client(
    api_key=GEMINI_API_KEY
)


def analyze_content(topic, videos, news_articles, trend_status, trend_score):

    content = []

    for video in videos:
        content.append({
        "video_id": video["video_id"].strip(),
        "title": video["title"],
        "description": video["description"],
        "channel": video["channel"]
    })

    news_content = []

    for article in news_articles:
        news_content.append({
            "article_id": article["content_id"],
            "title": article["title"],
            "description": article["description"],
            "publisher": article.get("publisher", "Unknown")
        })

    prompt = f"""
You are a social trend intelligence analyst.

Analyze YouTube content related to:

"{topic}"

Python has already calculated the quantitative trend:

Trend status: {trend_status}
Trend score: {trend_score}%

The trend status and score are authoritative.
Do NOT calculate or change them.

Here are the YouTube videos:

{json.dumps(content, indent=2)}

News articles:

{json.dumps(news_content, indent=2)}

Return ONLY valid JSON using exactly this structure:

{{
    "video_sentiments": [
        {{
            "video_id": "",
            "sentiment": "positive | neutral | negative"
        }}
    ],
    "news_sentiments": [
        {{
            "article_id": "",
            "sentiment": "positive | neutral | negative"
        }}
    ],

    "trend_explanation": "",
    "key_themes": [],
    "positive_topics": [],
    "negative_topics": [],
    "emerging_trends": [],
    "content_patterns": [],
    "summary": ""
}}

Rules:

1. Classify every provided video and news article exactly once.
2. Use only the title and description.
3. Use "positive" when the content expresses enthusiasm,
   benefits, opportunities, or positive outcomes.
4. Use "negative" when the content expresses problems,
   risks, criticism, fear, or negative outcomes.
5. Use "neutral" when the content is primarily educational,
   explanatory, or informational without a clear sentiment.
6. Do not invent sentiment evidence.
7. Return one classification for every video_id.
"""

    response = client.models.generate_content(
        model="gemini-3.6-flash",
        contents=prompt
    )

    text = response.text.strip()

    if text.startswith("```"):
        text = text.replace("```json", "")
        text = text.replace("```", "")
        text = text.strip()

    return json.loads(text)