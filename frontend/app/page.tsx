"use client";

import { useState } from "react";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type AnalysisResult = {
  topic: string;

    analysis_period: {
    from: string;
    to: string;
  };

  daily_trend: {
    date: string;
    youtube_count: number;
    youtube_views: number;
    youtube_likes: number;
    youtube_comments: number;
    news_count: number;
    total_content: number;
  }[];

  sources: {
    total_content: number;
    youtube_count: number;
    news_count: number;
    youtube_percentage: number;
    news_percentage: number;
  };

  cross_source_signal: {
    score: number;
    status: string;
    youtube_signal: number;
    news_signal: number;
  };

  youtube: {
    analytics: {
      total_videos: number;
      total_views: number;
      average_views: number;
      median_views: number;
      total_likes: number;
      total_comments: number;
      average_engagement_rate: number;
      trend_status: string;
      trend_score: number;

      top_video: {
        title: string;
        views: number;
      };

      fastest_growing_video: {
        title: string;
        views_per_day: number;
      };

      videos: {
        video_id: string;
        title: string;
        channel: string;
        published_at: string;
        views: number;
        likes: number;
        comments: number;
        views_per_day: number;
        engagement_rate: number;
        youtube_url: string;
      }[];
    };
  };

  news: {
    total_articles: number;

    articles: {
      source: string;
      content_id: string;
      title: string;
      description: string;
      author: string;
      published_at: string;
      engagement: number;
      url: string;
      publisher: string;
    }[];
  };

  ai_analysis: {
    trend_explanation: string;

    sentiment?: {
      youtube: {
        positive: number;
        neutral: number;
        negative: number;
      };
      news: {
        positive: number;
        neutral: number;
        negative: number;
      };
      overall: {
        positive: number;
        neutral: number;
        negative: number;
      };
    };

    video_sentiments?: {
      video_id: string;
      sentiment: string;
    }[];

    key_themes: string[];
    positive_topics: string[];
    negative_topics: string[];
    emerging_trends: string[];
    content_patterns: string[];
    summary: string;
  };
};

export default function Home() {
  const [topic, setTopic] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [youtubePage, setYoutubePage] = useState(1);
  const [newsPage, setNewsPage] = useState(1);

  const itemsPerPage = 10;

  const sentiment = result?.ai_analysis?.sentiment ?? {
    youtube: {
      positive: 0,
      neutral: 0,
      negative: 0,
    },
    news: {
      positive: 0,
      neutral: 0,
      negative: 0,
    },
    overall: {
      positive: 0,
      neutral: 0,
      negative: 0,
    },
  };

  async function analyzeTopic() {
    if (!topic.trim()) {
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);
    setYoutubePage(1);
    setNewsPage(1);


      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL;

        const response = await fetch(`${API_URL}/analyze`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            topic: topic.trim(),
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to analyze topic");
        }

        const data: AnalysisResult = await response.json();

        setResult(data);
      } catch (err) {
        console.error(err);
        setError(
          "Could not connect to the backend. Make sure FastAPI is running."
        );
      } finally {
        setLoading(false);
      }
    }


  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-6xl px-6 py-16">

        {/* Header */}

        <div className="mb-12 text-center">

          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Social Trend Intelligence
          </h1>

          <p className="mt-4 text-slate-400">
            Discover what people are talking about and understand
            emerging trends with AI.
          </p>

        </div>


        {/* Search */}

        <div className="mx-auto flex max-w-2xl gap-3">

          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            disabled={loading}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                analyzeTopic();
              }
            }}
            placeholder="Search a topic..."
            className="flex-1 rounded-xl border border-slate-700 bg-slate-900 px-5 py-3 outline-none placeholder:text-slate-500 focus:border-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
          />

          <button
            onClick={analyzeTopic}
            disabled={loading}
            className="rounded-xl bg-indigo-600 px-6 py-3 font-medium transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Analyzing...
              </span>
            ) : (
              "Analyze"
            )}
          </button>

        </div>

      <div className="mx-auto mt-6 flex max-w-2xl flex-wrap items-center justify-center gap-3 text-xs text-slate-500">
        <span className="rounded-full border border-slate-800 bg-slate-900 px-3 py-1.5">
          Sources: YouTube + News
        </span>

        <span className="rounded-full border border-slate-800 bg-slate-900 px-3 py-1.5">
          30-day trend analysis
        </span>

        <span className="rounded-full border border-slate-800 bg-slate-900 px-3 py-1.5">
          AI-powered insights
        </span>
      </div>


        {/* Error */}

        {error && (
          <div className="mx-auto mt-6 max-w-2xl rounded-xl border border-red-900 bg-red-950/40 p-4 text-red-300">
            {error}
          </div>
        )}

        {loading && (
          <div className="mx-auto mt-12 max-w-2xl text-center">
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-700 border-t-indigo-500" />

              <h3 className="mt-5 text-lg font-semibold">
                Analyzing "{topic}"
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Collecting YouTube and news data, then generating AI insights...
              </p>
            </div>
          </div>
        )}

        {result && (
          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">
                Cross-Source Trend Signal
              </p>

              <h3 className="mt-2 text-3xl font-bold">
                {result.cross_source_signal.score > 0 ? "+" : ""}
                {result.cross_source_signal.score}
              </h3>
            </div>

            <span
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                result.cross_source_signal.status === "rising"
                  ? "bg-emerald-500/10 text-emerald-400"
                  : result.cross_source_signal.status === "declining"
                  ? "bg-red-500/10 text-red-400"
                  : "bg-yellow-500/10 text-yellow-400"
              }`}
            >
              {result.cross_source_signal.status}
            </span>
          </div>

          <p className="mt-4 text-sm leading-6 text-slate-400">
            Combines YouTube momentum with news coverage to provide
            a broader indication of current topic attention.
          </p>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl bg-slate-800/50 p-4">
              <p className="text-xs text-slate-500">
                YouTube Signal
              </p>

              <p className="mt-1 text-lg font-semibold">
                {result.cross_source_signal.youtube_signal > 0 ? "+" : ""}
                {result.cross_source_signal.youtube_signal}
              </p>
            </div>

            <div className="rounded-xl bg-slate-800/50 p-4">
              <p className="text-xs text-slate-500">
                News Signal
              </p>

              <p className="mt-1 text-lg font-semibold">
                +{result.cross_source_signal.news_signal}
              </p>
            </div>
          </div>
          </section>
        )}


        {/* Results */}

        {result && (
          <div className="mt-12 space-y-8">

            <h2 className="text-2xl font-semibold">
              Analysis for "{result.topic}"
            </h2>

            <div className="grid gap-4 sm:grid-cols-3">
              <Metric
                label="Total Content"
                value={formatNumber(result.sources.total_content)}
              />

              <Metric
                label="YouTube Share"
                value={`${result.sources.youtube_percentage}%`}
              />

              <Metric
                label="News Share"
                value={`${result.sources.news_percentage}%`}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
                <p className="text-sm text-slate-500">
                  YouTube Coverage
                </p>

                <p className="mt-2 text-3xl font-bold">
                  {result.youtube.analytics.total_videos}
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  videos analyzed
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
                <p className="text-sm text-slate-500">
                  News Coverage
                </p>

                <p className="mt-2 text-3xl font-bold">
                  {result.news.total_articles}
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  articles analyzed
                </p>
              </div>
            </div>


            {/* Metrics */}

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
              <Metric
                label="Total Views"
                value={formatNumber(result.youtube.analytics.total_views)}
              />

              <Metric
                label="Average Views"
                value={formatNumber(result.youtube.analytics.average_views)}
              />

              <Metric
                label="Median Views"
                value={formatNumber(result.youtube.analytics.median_views)}
              />

              <Metric
                label="Total Likes"
                value={formatNumber(result.youtube.analytics.total_likes)}
              />

              <Metric
                label="Comments"
                value={formatNumber(result.youtube.analytics.total_comments)}
              />

              <Metric
                label="Videos Analyzed"
                value={String(result.youtube.analytics.total_videos)}
              />

              <Metric
                label="Engagement"
                value={`${result.youtube.analytics.average_engagement_rate}%`}
              />
            </div>

      <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">
              Content Performance
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Performance of videos found for this topic
            </p>
          </div>

          <span className="text-sm text-slate-500">
            {result.youtube.analytics.videos.length} videos
          </span>
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-slate-500">
                <th className="px-4 py-3 font-medium">
                  Video
                </th>

                <th className="px-4 py-3 font-medium">
                  Views
                </th>

                <th className="px-4 py-3 font-medium">
                  Views / Day
                </th>

                <th className="px-4 py-3 font-medium">
                  Likes
                </th>

                <th className="px-4 py-3 font-medium">
                  Comments
                </th>

                <th className="px-4 py-3 font-medium">
                  Engagement
                </th>
              </tr>
            </thead>

            <tbody>
              {[...result.youtube.analytics.videos]
                .sort((a, b) => b.views_per_day - a.views_per_day)
                .slice(
                  (youtubePage - 1) * itemsPerPage,
                  youtubePage * itemsPerPage
                )
                .map((video, index) => (
                  <tr
                    key={video.video_id}
                    className="border-b border-slate-800/60 transition hover:bg-slate-800/40"
                  >
                    <td className="max-w-[350px] px-4 py-4">
                      <a
                        href={video.youtube_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group font-medium text-white transition hover:text-indigo-400"
                      >
                        <span className="group-hover:underline">
                          {video.title}
                        </span>

                        <span className="ml-2 text-xs text-slate-600">
                          ↗
                        </span>
                      </a>

                      <div className="mt-1 text-xs text-slate-500">
                        {video.channel}
                      </div>
                    </td>

                    <td className="px-4 py-4 text-slate-300">
                      {formatNumber(video.views)}
                    </td>

                    <td className="px-4 py-4 text-indigo-400">
                      {formatNumber(video.views_per_day)}
                    </td>

                    <td className="px-4 py-4 text-slate-300">
                      {formatNumber(video.likes)}
                    </td>

                    <td className="px-4 py-4 text-slate-300">
                      {formatNumber(video.comments)}
                    </td>

                    <td className="px-4 py-4 text-emerald-400">
                      {video.engagement_rate}%
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
          <div className="mt-6 flex items-center justify-between border-t border-slate-800 pt-5">

              <p className="text-sm text-slate-500">
                Page {youtubePage} of{" "}
                {Math.ceil(
                  result.youtube.analytics.videos.length / itemsPerPage
                )}
              </p>

              <div className="flex gap-2">

                <button
                  onClick={() =>
                    setYoutubePage((page) => Math.max(1, page - 1))
                  }
                  disabled={youtubePage === 1}
                  className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Previous
                </button>

                <button
                  onClick={() =>
                    setYoutubePage((page) =>
                      Math.min(
                        Math.ceil(
                          result.youtube.analytics.videos.length /
                            itemsPerPage
                        ),
                        page + 1
                      )
                    )
                  }
                  disabled={
                    youtubePage >=
                    Math.ceil(
                      result.youtube.analytics.videos.length /
                        itemsPerPage
                    )
                  }
                  className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                </button>

              </div>

            </div>
        </div>
      </section>

       {/* YouTube Views */}

        {/* 30-Day Trend Activity */}

          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

            <div className="flex items-start justify-between gap-4">

              <div>
                <p className="text-sm text-slate-500">
                  Trend Activity
                </p>

                <h3 className="mt-2 text-xl font-semibold text-white">
                  30-Day Activity
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  YouTube views across the analysis period
                </p>
              </div>

              <div className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2">
                <p className="text-xs text-slate-500">
                  Analysis Period
                </p>

                <p className="mt-1 text-sm font-semibold text-white">
                  {result.analysis_period.from} → {result.analysis_period.to}
                </p>
              </div>

            </div>


            <div className="mt-6 h-80">

              <ResponsiveContainer width="100%" height="100%">

                <LineChart
                  data={result.daily_trend}
                  margin={{
                    top: 10,
                    right: 10,
                    left: 0,
                    bottom: 10,
                  }}
                >

                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#1e293b"
                  />

                  <XAxis
                    dataKey="date"
                    stroke="#64748b"
                    tickFormatter={(value) =>
                      new Date(String(value)).toLocaleDateString(
                        "en-IN",
                        {
                          day: "2-digit",
                          month: "short",
                        }
                      )
                    }
                  />

                  <YAxis
                    stroke="#64748b"
                    tickFormatter={(value) =>
                      formatNumber(Number(value))
                    }
                  />

                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#020617",
                      border: "1px solid #1e293b",
                      borderRadius: "8px",
                      color: "#fff",
                    }}

                    labelFormatter={(value) =>
                      new Date(String(value)).toLocaleDateString(
                        "en-IN",
                        {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                        }
                      )
                    }

                    formatter={(value) =>
                      formatNumber(Number(value))
                    }
                  />

                  <Line
                    type="monotone"
                    dataKey="youtube_views"
                    name="YouTube Views"
                    strokeWidth={2}
                    dot={false}
                  />

                </LineChart>

              </ResponsiveContainer>

            </div>

          </section>


      {/* News Coverage */}

      <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">
              News Coverage
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Recent articles related to "{result.topic}"
            </p>
          </div>

          <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-400">
            {result.news.total_articles} articles
          </span>
        </div>

        <div className="mt-6 space-y-4">
          {result.news.articles
          .slice(
            (newsPage - 1) * itemsPerPage,
            newsPage * itemsPerPage
          )
          .map((article, index) => (
            <a
              key={index}
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-xl border border-slate-800 p-4 transition hover:border-indigo-500/50 hover:bg-slate-800/40"
            >
              <div className="flex items-center justify-between gap-4">
                <span className="text-xs font-medium uppercase tracking-wide text-indigo-400">
                  {article.publisher}
                </span>

                <span className="text-xs text-slate-600">
                  {new Date(
                    article.published_at
                  ).toLocaleDateString()}
                </span>
              </div>

              <h4 className="mt-2 font-medium leading-6 text-white">
                {article.title}
              </h4>

              {article.description && (
                <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-400">
                  {article.description}
                </p>
              )}

              <p className="mt-3 text-xs text-slate-600">
                Read article ↗
              </p>
            </a>
          ))}
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-slate-800 pt-5">

              <p className="text-sm text-slate-500">
                Page {newsPage} of{" "}
                {Math.max(
                  1,
                  Math.ceil(
                    result.news.articles.length / itemsPerPage
                  )
                )}
              </p>

              <div className="flex gap-2">

                <button
                  onClick={() =>
                    setNewsPage((page) => Math.max(1, page - 1))
                  }
                  disabled={newsPage === 1}
                  className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Previous
                </button>

                <button
                  onClick={() =>
                    setNewsPage((page) =>
                      Math.min(
                        Math.ceil(
                          result.news.articles.length /
                            itemsPerPage
                        ),
                        page + 1
                      )
                    )
                  }
                  disabled={
                    newsPage >=
                    Math.ceil(
                      result.news.articles.length /
                        itemsPerPage
                    )
                  }
                  className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                </button>

              </div>

            </div>
      </section>

<section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
  <div>
    <h3 className="text-lg font-semibold">Sentiment Analysis</h3>
    <p className="mt-1 text-sm text-slate-500">
      AI-classified sentiment across YouTube and news coverage
    </p>
  </div>

  <div className="mt-6 grid gap-6 lg:grid-cols-3">

    {/* Overall */}
    <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">
      <p className="text-sm font-medium text-slate-400">
        Overall Sentiment
      </p>

      <div className="mt-5 space-y-4">
        <SentimentBar
          label="Positive"
          value={sentiment.overall.positive}
        />

        <SentimentBar
          label="Neutral"
          value={sentiment.overall.neutral}
        />

        <SentimentBar
          label="Negative"
          value={sentiment.overall.negative}
        />
      </div>
    </div>

    {/* YouTube */}
    <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">
      <p className="text-sm font-medium text-slate-400">
        YouTube
      </p>

      <div className="mt-5 space-y-4">
        <SentimentBar
          label="Positive"
          value={sentiment.youtube.positive}
        />

        <SentimentBar
          label="Neutral"
          value={sentiment.youtube.neutral}
        />

        <SentimentBar
          label="Negative"
          value={sentiment.youtube.negative}
        />
      </div>
    </div>

    {/* News */}
    <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">
      <p className="text-sm font-medium text-slate-400">
        News
      </p>

      <div className="mt-5 space-y-4">
        <SentimentBar
          label="Positive"
          value={sentiment.news.positive}
        />

        <SentimentBar
          label="Neutral"
          value={sentiment.news.neutral}
        />

        <SentimentBar
          label="Negative"
          value={sentiment.news.negative}
        />
      </div>
    </div>

  </div>
</section>


          {/* Trend Analysis */}

        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">
                Trend Analysis
              </p>

              <h3 className="mt-2 text-2xl font-semibold">
                {result.youtube.analytics.trend_status === "rising"
                  ? "Rising Trend"
                  : result.youtube.analytics.trend_status === "declining"
                  ? "Declining Trend"
                  : "Stable Trend"}
              </h3>
            </div>

            <span
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                result.youtube.analytics.trend_status === "rising"
                  ? "bg-emerald-500/10 text-emerald-400"
                  : result.youtube.analytics.trend_status === "declining"
                  ? "bg-red-500/10 text-red-400"
                  : "bg-yellow-500/10 text-yellow-400"
              }`}
            >
              {result.youtube.analytics.trend_status}
            </span>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl bg-slate-950 p-5">
              <p className="text-sm text-slate-500">
                YouTube Momentum
              </p>

              <p className="mt-2 text-3xl font-bold">
                {result.youtube.analytics.trend_score > 0 ? "+" : ""}
                {result.youtube.analytics.trend_score}%
              </p>

              <p className="mt-2 text-xs leading-5 text-slate-600">
                Change in average views per day between newer
                and older videos.
              </p>
            </div>

            <div className="rounded-xl bg-slate-950 p-5">
              <p className="text-sm text-slate-500">
                Cross-Source Signal
              </p>

              <p className="mt-2 text-3xl font-bold">
                {result.cross_source_signal.score > 0 ? "+" : ""}
                {result.cross_source_signal.score}
              </p>

              <p className="mt-2 text-xs leading-5 text-slate-600">
                Combined signal from YouTube momentum and news
                coverage.
              </p>
            </div>
          </div>

          <div className="mt-6 border-t border-slate-800 pt-5">
            <p className="text-sm font-medium text-slate-400">
              AI Interpretation
            </p>

            <p className="mt-2 leading-7 text-slate-300">
              {result.ai_analysis.trend_explanation}
            </p>
          </div>
        </section>

            {/* Themes */}

            <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

              <h3 className="text-lg font-semibold">
                Key Themes
              </h3>

              <div className="mt-4 flex flex-wrap gap-3">

                {result.ai_analysis.key_themes.map(
                  (theme, index) => (
                    <span
                      key={index}
                      className="rounded-full bg-slate-800 px-4 py-2 text-sm text-slate-300"
                    >
                      {theme}
                    </span>
                  )
                )}

              </div>

            </section>


            {/* Emerging Trends */}

            <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

              <h3 className="text-lg font-semibold">
                Emerging Trends
              </h3>

              <ul className="mt-4 space-y-3 text-slate-300">

                {result.ai_analysis.emerging_trends.map(
                  (trend, index) => (
                    <li key={index}>
                      • {trend}
                    </li>
                  )
                )}

              </ul>

            </section>


            {/* Summary */}

            <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

              <h3 className="text-lg font-semibold">
                AI Summary
              </h3>

              <p className="mt-4 leading-7 text-slate-300">
                {result.ai_analysis.summary}
              </p>

            </section>

          </div>
        )}

      </div>
    </main>
  );
}


function Metric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
      <p className="text-sm text-slate-500">
        {label}
      </p>

      <p className="mt-2 text-2xl font-bold">
        {value}
      </p>
    </div>
  );
}


function Sentiment({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-center justify-between">

      <span className="text-slate-400">
        {label}
      </span>

      <span className="font-semibold">
        {value}%
      </span>

    </div>
  );
}


function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

function SentimentBar({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="text-slate-400">{label}</span>
        <span className="font-medium text-white">{value}%</span>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-slate-800">
        <div
          className="h-full rounded-full bg-indigo-500 transition-all"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}