import os
import requests
from dotenv import load_dotenv

load_dotenv()

NEWS_API_KEY = os.getenv("NEWS_API_KEY")
NEWS_API_URL = "https://newsapi.org/v2/everything"


def search_news(
    topic,
    from_date=None,
    to_date=None
):
    params = {
        "q": f'"{topic}"',
        "apiKey": NEWS_API_KEY,
        "language": "en",
        "sortBy": "publishedAt",
        "pageSize": 100,
    }

    if from_date:
        params["from"] = from_date

    if to_date:
        params["to"] = to_date

    response = requests.get(
        NEWS_API_URL,
        params=params,
        timeout=15
    )

    response.raise_for_status()

    data = response.json()

    articles = []

    for article in data.get("articles", []):

        title = article.get("title") or ""
        description = article.get("description") or ""
        url = article.get("url") or ""

        if not title or not url:
            continue

        articles.append({
            "source": "news",
            "content_id": url,
            "title": title,
            "description": description,
            "author": article.get("author") or "Unknown",
            "published_at": article.get("publishedAt") or "",
            "engagement": 0,
            "url": url,
            "publisher": (
                article.get("source", {}).get("name")
                or "Unknown"
            )
        })

    return articles