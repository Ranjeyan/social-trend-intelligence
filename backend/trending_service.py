import requests
import xml.etree.ElementTree as ET


GOOGLE_TRENDS_RSS = (
    "https://trends.google.com/trending/rss?geo=IN"
)


def get_trending_topics(limit=10):

    print("====================================")
    print("Fetching Google Trends...")
    print("URL:", GOOGLE_TRENDS_RSS)

    try:

        response = requests.get(
            GOOGLE_TRENDS_RSS,
            timeout=20,
            headers={
                "User-Agent": (
                    "Mozilla/5.0 "
                    "(Windows NT 10.0; Win64; x64) "
                    "AppleWebKit/537.36 "
                    "(KHTML, like Gecko) "
                    "Chrome/131.0 Safari/537.36"
                ),
                "Accept": "application/rss+xml, application/xml, text/xml, */*",
                "Accept-Language": "en-US,en;q=0.9",
            }
        )

        print("Google Trends status:", response.status_code)
        print("Google Trends content type:", response.headers.get("content-type"))

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

        print("Google Trends topics:", topics)
        print("====================================")

        return topics

    except Exception as e:

        print("GOOGLE TRENDS ERROR:", repr(e))
        print("====================================")

        raise