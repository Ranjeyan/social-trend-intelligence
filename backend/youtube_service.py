import os
from googleapiclient.discovery import build
from dotenv import load_dotenv

load_dotenv()

YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY")


def get_youtube_client():
    return build(
        "youtube",
        "v3",
        developerKey=YOUTUBE_API_KEY
    )


def search_youtube(
    topic,
    published_after=None,
    published_before=None,
    max_pages=10
):
    youtube = get_youtube_client()

    videos = []
    next_page_token = None
    seen_video_ids = set()

    for _ in range(max_pages):

        request_params = {
            "part": "snippet",
            "q": topic,
            "type": "video",
            "order": "relevance",
            "maxResults": 50,
            "relevanceLanguage": "en",
            "regionCode": "IN"
        }

        if published_after:
            request_params["publishedAfter"] = published_after

        if published_before:
            request_params["publishedBefore"] = published_before

        if next_page_token:
            request_params["pageToken"] = next_page_token

        request = youtube.search().list(**request_params)

        response = request.execute()

        for item in response.get("items", []):

            video_id = item["id"]["videoId"]

            if video_id in seen_video_ids:
                continue

            seen_video_ids.add(video_id)

            videos.append({
                "video_id": item["id"]["videoId"],
                "title": item["snippet"]["title"],
                "description": item["snippet"]["description"],
                "channel": item["snippet"]["channelTitle"],
                "published_at": item["snippet"]["publishedAt"]
            })

        next_page_token = response.get("nextPageToken")

        if not next_page_token:
            break

    return videos


def get_video_statistics(video_ids):

    youtube = get_youtube_client()

    statistics = {}

    for i in range(0, len(video_ids), 50):

        batch = video_ids[i:i + 50]

        request = youtube.videos().list(
            part="statistics",
            id=",".join(batch)
        )

        response = request.execute()

        for item in response.get("items", []):

            stats = item.get("statistics", {})

            statistics[item["id"]] = {
                "views": int(
                    stats.get("viewCount", 0)
                ),
                "likes": int(
                    stats.get("likeCount", 0)
                ),
                "comments": int(
                    stats.get("commentCount", 0)
                )
            }

    return statistics

def normalize_youtube_video(video, statistics):

    video_id = video["video_id"]

    stats = statistics.get(
        video_id,
        {
            "views": 0,
            "likes": 0,
            "comments": 0
        }
    )

    return {
        "source": "youtube",
        "content_id": video_id,
        "title": video["title"],
        "description": video["description"],
        "author": video["channel"],
        "published_at": video["published_at"],
        "engagement": (
            stats["likes"] +
            stats["comments"]
        ),
        "url": f"https://www.youtube.com/watch?v={video_id}"
    }