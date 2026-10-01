from datetime import date, timedelta
import time
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from youtube_service import search_youtube, get_video_statistics
from analytics import (
    calculate_analytics,
    calculate_combined_sentiment,
    calculate_cross_source_signal,
    calculate_daily_trend
)
from gemini_service import analyze_content
from news_service import search_news
from trending_service import get_trending_topics


app = FastAPI(
    title="Social Trend Intelligence API"
)

trending_cache = {
    "topics": [],
    "updated_at": 0
}

TRENDING_CACHE_SECONDS = 600



app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://social-trend-intelligence-five.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class AnalyzeRequest(BaseModel):
    topic: str


@app.get("/")
def home():
    return {
        "message": "Social Trend Intelligence API is running"
    }



def select_content_for_ai(videos, statistics, news_articles):
    """
    Select representative content for Gemini.

    Python analyzes the complete dataset.
    Gemini receives only a smaller sample.
    """

    scored_videos = []

    for video in videos:

        video_id = video["video_id"]

        stats = statistics.get(
            video_id,
            {
                "views": 0,
                "likes": 0,
                "comments": 0
            }
        )

        scored_videos.append({
            **video,
            "views": stats["views"],
            "likes": stats["likes"],
            "comments": stats["comments"]
        })

    # Highest-view videos
    selected_videos = sorted(
        scored_videos,
        key=lambda video: video["views"],
        reverse=True
    )[:30]

    # Latest news
    selected_news = sorted(
        news_articles,
        key=lambda article: article.get(
            "published_at",
            ""
        ),
        reverse=True
    )[:20]

    return selected_videos, selected_news


@app.get("/trending")
def get_trending_topics_endpoint():

    global trending_cache

    now = time.time()

    # Return cached results
    if (
        trending_cache["topics"]
        and now - trending_cache["updated_at"]
        < TRENDING_CACHE_SECONDS
    ):
        return {
            "topics": trending_cache["topics"],
            "cached": True
        }

    try:

        topics = get_trending_topics(
            limit=10
        )

        formatted_topics = [
            {
                "topic": topic
            }
            for topic in topics
        ]

        trending_cache = {
            "topics": formatted_topics,
            "updated_at": now
        }

        return {
            "topics": formatted_topics,
            "cached": False
        }

    except Exception as e:

        print(
            f"Trending topics error: {repr(e)}"
        )

        # If Google Trends temporarily fails,
        # return previous cached data if available.

        if trending_cache["topics"]:

            return {
                "topics": trending_cache["topics"],
                "cached": True
            }

        return {
            "topics": []
        }


@app.post("/analyze")
def analyze(request: AnalyzeRequest):

    topic = request.topic

    # -------------------------
    # Analysis period
    # -------------------------

    today = date.today()

    thirty_days_ago = today - timedelta(days=30)

    tomorrow = today + timedelta(days=1)

    published_after = (
        f"{thirty_days_ago.isoformat()}T00:00:00Z"
    )

    published_before = (
        f"{tomorrow.isoformat()}T00:00:00Z"
    )

    # -------------------------
    # YouTube
    # -------------------------

    videos = search_youtube(
        topic,
        published_after=published_after,
        published_before=published_before,
        max_pages=10
    )

    video_ids = [
        video["video_id"]
        for video in videos
    ]

    statistics = get_video_statistics(
        video_ids
    )

    youtube_analytics = calculate_analytics(
        videos,
        statistics
    )

    

    # -------------------------
    # News
    # -------------------------

    news_articles = search_news(
        topic,
        from_date=thirty_days_ago.isoformat(),
        to_date=today.isoformat()
    )

    daily_trend = calculate_daily_trend(
        videos,
        statistics,
        news_articles
    )

    # -------------------------
    # Source statistics
    # -------------------------

    total_content = (
        youtube_analytics["total_videos"]
        + len(news_articles)
    )

    youtube_percentage = 0
    news_percentage = 0

    if total_content > 0:

        youtube_percentage = round(
            youtube_analytics["total_videos"]
            / total_content * 100
        )

        news_percentage = round(
            len(news_articles)
            / total_content * 100
        )

    # -------------------------
    # Cross-source signal
    # -------------------------

    cross_source_signal = calculate_cross_source_signal(
        youtube_analytics["trend_score"],
        len(news_articles),
        youtube_analytics["total_videos"]
    )

    # -------------------------
    # Gemini
    # -------------------------

    selected_videos, selected_news = select_content_for_ai(
        videos,
        statistics,
        news_articles
    )

    ai_analysis = analyze_content(
        topic,
        selected_videos,
        selected_news,
        youtube_analytics["trend_status"],
        youtube_analytics["trend_score"]
    )

    for item in ai_analysis.get("video_sentiments", []):

        item["video_id"] = (
            item["video_id"].strip()
        )

    for item in ai_analysis.get("news_sentiments", []):

        item["article_id"] = (
            item["article_id"].strip()
        )

    sentiment = calculate_combined_sentiment(
        ai_analysis["video_sentiments"],
        ai_analysis["news_sentiments"]
    )

    # -------------------------
    # Response
    # -------------------------

    return {

        "topic": topic,

        "analysis_period": {
            "from": thirty_days_ago.isoformat(),
            "to": today.isoformat()
        },

        "sources": {
            "total_content": total_content,
            "youtube_count": youtube_analytics["total_videos"],
            "news_count": len(news_articles),
            "youtube_percentage": youtube_percentage,
            "news_percentage": news_percentage
        },

         "daily_trend": daily_trend,

        "cross_source_signal": cross_source_signal,

        "youtube": {
            "analytics": youtube_analytics
        },

        "news": {
            "total_articles": len(news_articles),
            "articles": news_articles
        },

        "ai_analysis": {
            **ai_analysis,
            "sentiment": sentiment
        }
    }