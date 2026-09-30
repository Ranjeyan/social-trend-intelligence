import requests
import xml.etree.ElementTree as ET


GOOGLE_TRENDS_RSS = (
    "https://trends.google.com/trending/rss?geo=IN"
)


def get_trending_topics(limit=10):
    """
    Get current trending searches in India from Google Trends.

    Google Trends Trending Now is refreshed frequently.
    """

    response = requests.get(
        GOOGLE_TRENDS_RSS,
        timeout=15,
        headers={
            "User-Agent": "Mozilla/5.0"
        }
    )

    response.raise_for_status()

    root = ET.fromstring(response.content)

    topics = []

    for item in root.findall("./channel/item"):

        title = item.findtext("title")

        if not title:
            continue

        title = title.strip()

        if title and title not in topics:
            topics.append(title)

        if len(topics) >= limit:
            break

    return topics