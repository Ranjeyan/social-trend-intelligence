from datetime import datetime, timezone
from collections import defaultdict
from statistics import mean, median


def calculate_analytics(videos, statistics):

    enriched_videos = []

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

        published_at = datetime.fromisoformat(
            video["published_at"].replace("Z", "+00:00")
        )

        age_days = (
            datetime.now(timezone.utc) - published_at
        ).total_seconds() / 86400

        age_days = max(age_days, 1)

        views = stats["views"]
        likes = stats["likes"]
        comments = stats["comments"]

        engagement_rate = 0

        if views > 0:
            engagement_rate = (
                (likes + comments) / views
            ) * 100

        views_per_day = views / age_days

        enriched_videos.append({
            **video,
            "views": views,
            "likes": likes,
            "comments": comments,
            "age_days": round(age_days, 1),
            "views_per_day": round(views_per_day, 2),
            "engagement_rate": round(engagement_rate, 2),
            "youtube_url": f"https://www.youtube.com/watch?v={video_id}",
        })

    if not enriched_videos:
        return {
            "total_videos": 0,
            "total_views": 0,
            "average_views": 0,
            "median_views": 0,
            "total_likes": 0,
            "total_comments": 0,
            "average_engagement_rate": 0,
            "trend_status": "unclear",
            "trend_score": 0,
            "top_video": None,
            "fastest_growing_video": None,
            "videos": []
        }

    views = [
        video["views"]
        for video in enriched_videos
    ]

    likes = [
        video["likes"]
        for video in enriched_videos
    ]

    comments = [
        video["comments"]
        for video in enriched_videos
    ]

    engagement_rates = [
        video["engagement_rate"]
        for video in enriched_videos
    ]

    sorted_by_age = sorted(
        enriched_videos,
        key=lambda video: video["age_days"]
    )

    split_index = max(1, len(sorted_by_age) // 2)

    newer_videos = sorted_by_age[:split_index]
    older_videos = sorted_by_age[split_index:]

    newer_velocity = mean(
        video["views_per_day"]
        for video in newer_videos
    )

    older_velocity = mean(
        video["views_per_day"]
        for video in older_videos
    )

    if older_velocity > 0:

        trend_score = (
            (newer_velocity - older_velocity)
            / older_velocity
        ) * 100

    else:
        trend_score = 0


    trend_score = max(
        -100,
        min(100, trend_score)
    )

    if trend_score >= 25:
        trend_status = "rising"

    elif trend_score <= -25:
        trend_status = "declining"

    else:
        trend_status = "stable"

    top_video = max(
        enriched_videos,
        key=lambda video: video["views"]
    )

    fastest_growing_video = max(
        enriched_videos,
        key=lambda video: video["views_per_day"]
    )

    return {
        "total_videos": len(enriched_videos),

        "total_views": sum(views),

        "average_views": round(
            mean(views),
            2
        ),

        "median_views": round(
            median(views),
            2
        ),

        "total_likes": sum(likes),

        "total_comments": sum(comments),

        "average_engagement_rate": round(
            mean(engagement_rates),
            2
        ),

        "trend_status": trend_status,

        "trend_score": round(
            trend_score,
            2
        ),

        "top_video": {
            "title": top_video["title"],
            "views": top_video["views"]
        },

        "fastest_growing_video": {
            "title": fastest_growing_video["title"],
            "views_per_day": fastest_growing_video["views_per_day"]
        },

        "videos": enriched_videos
    }

def calculate_sentiment_percentages(sentiments):
    total = len(sentiments)

    if total == 0:
        return {
            "positive": 0,
            "neutral": 0,
            "negative": 0
        }

    counts = {
        "positive": 0,
        "neutral": 0,
        "negative": 0
    }

    for item in sentiments:
        sentiment = item.get("sentiment", "").strip().lower()

        if sentiment in counts:
            counts[sentiment] += 1

    return {
        "positive": round(counts["positive"] / total * 100),
        "neutral": round(counts["neutral"] / total * 100),
        "negative": round(counts["negative"] / total * 100)
    }

def calculate_combined_sentiment(
    video_sentiments,
    news_sentiments
):
    youtube_sentiment = calculate_sentiment_percentages(
        video_sentiments
    )

    news_sentiment = calculate_sentiment_percentages(
        news_sentiments
    )

    all_sentiments = video_sentiments + news_sentiments

    overall_sentiment = calculate_sentiment_percentages(
        all_sentiments
    )

    return {
        "youtube": youtube_sentiment,
        "news": news_sentiment,
        "overall": overall_sentiment
    }

def calculate_cross_source_signal(
    youtube_trend_score,
    news_count,
    youtube_count
):
    """
    Creates a simple cross-source signal using:

    - YouTube momentum
    - News coverage volume

    This is an MVP signal, not a statistical prediction.
    """

    youtube_signal = max(
        -100,
        min(100, youtube_trend_score)
    )


    if youtube_count > 0:
        news_ratio = news_count / youtube_count
    else:
        news_ratio = 0

    news_signal = min(
        100,
        news_ratio * 500
    )

    overall_score = (
        youtube_signal * 0.7
        + news_signal * 0.3
    )

    overall_score = round(
        overall_score,
        2
    )

    if overall_score >= 25:
        status = "rising"
    elif overall_score <= -25:
        status = "declining"
    else:
        status = "stable"

    return {
        "score": overall_score,
        "status": status,
        "youtube_signal": round(
            youtube_signal,
            2
        ),
        "news_signal": round(
            news_signal,
            2
        )
    }




def calculate_daily_trend(videos, statistics, news_articles):
    """
    Aggregate YouTube and News activity by publication date.
    """

    daily = defaultdict(
        lambda: {
            "youtube_count": 0,
            "youtube_views": 0,
            "youtube_likes": 0,
            "youtube_comments": 0,
            "news_count": 0
        }
    )

    # YouTube


    for video in videos:

        published_at = video.get("published_at")

        if not published_at:
            continue

        date = published_at[:10]

        video_id = video["video_id"]

        stats = statistics.get(
            video_id,
            {
                "views": 0,
                "likes": 0,
                "comments": 0
            }
        )

        daily[date]["youtube_count"] += 1

        daily[date]["youtube_views"] += stats["views"]

        daily[date]["youtube_likes"] += stats["likes"]

        daily[date]["youtube_comments"] += stats["comments"]

    # News

    for article in news_articles:

        published_at = article.get("published_at")

        if not published_at:
            continue

        date = published_at[:10]

        daily[date]["news_count"] += 1

    # Format result

    trend = []

    for date in sorted(daily.keys()):

        data = daily[date]

        total_content = (
            data["youtube_count"]
            + data["news_count"]
        )

        trend.append({
            "date": date,
            "youtube_count": data["youtube_count"],
            "youtube_views": data["youtube_views"],
            "youtube_likes": data["youtube_likes"],
            "youtube_comments": data["youtube_comments"],
            "news_count": data["news_count"],
            "total_content": total_content
        })

    return trend