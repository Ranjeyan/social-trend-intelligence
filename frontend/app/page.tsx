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
  PieChart,
  Pie,
  Cell,
  Legend,
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
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
    <main className="min-h-screen bg-[#07090d] text-white">
      <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">

        {/* Header */}

        <header className="mb-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-3 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.8)]" />
                <span className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
                  AI Trend Intelligence
                </span>
              </div>

              <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                Social Trend
                <span className="text-slate-500"> Intelligence</span>
              </h1>

              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-400">
                Discover what people are talking about, measure attention,
                and identify emerging trends across YouTube and News.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <span className="rounded-full border border-slate-800 bg-slate-900/70 px-3 py-1.5 text-xs text-slate-400">
                YouTube + News
              </span>

              <span className="rounded-full border border-slate-800 bg-slate-900/70 px-3 py-1.5 text-xs text-slate-400">
                30-day analysis
              </span>

              <span className="rounded-full border border-slate-800 bg-slate-900/70 px-3 py-1.5 text-xs text-slate-400">
                AI insights
              </span>
            </div>
          </div>
        </header>

        {/* Search */}

        <section className="mb-10">
          <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-2 shadow-2xl shadow-black/20">
            <div className="flex flex-col gap-2 sm:flex-row">
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
                placeholder="Search a topic, keyword, product, or trend..."
                className="min-w-0 flex-1 rounded-xl bg-slate-900 px-5 py-4 text-sm text-white outline-none placeholder:text-slate-600 focus:ring-1 focus:ring-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
              />

              <button
                onClick={analyzeTopic}
                disabled={loading || !topic.trim()}
                className="rounded-xl bg-white px-7 py-4 text-sm font-medium text-slate-950 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-400 border-t-slate-950" />
                    Analyzing...
                  </span>
                ) : (
                  "Analyze trend"
                )}
              </button>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between px-1">
            <p className="text-xs text-slate-600">
              Search across recent content and generate AI-powered insights.
            </p>

            {loading && (
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                Collecting data...
              </div>
            )}
          </div>
        </section>


        {/* Error */}

        {error && (
          <div className="mx-auto mt-6 max-w-2xl rounded-xl border border-red-900 bg-red-950/40 p-4 text-red-300">
            {error}
          </div>
        )}

        {loading && (
            <section className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 px-6 py-14">
              {/* Background grid */}
              <div
                className="pointer-events-none absolute inset-0 opacity-30"
                style={{
                  backgroundImage:
                    "linear-gradient(#1e293b 1px, transparent 1px), linear-gradient(90deg, #1e293b 1px, transparent 1px)",
                  backgroundSize: "40px 40px",
                }}
              />

              {/* Animated glow */}
              <div className="pointer-events-none absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-500/10 blur-3xl" />

              <div className="relative mx-auto max-w-4xl">
                {/* Status */}
                <div className="text-center">
                  <div className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/80 px-3 py-1.5">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                    </span>

                    <span className="text-xs font-medium tracking-wide text-slate-400">
                      LIVE ANALYSIS
                    </span>
                  </div>

                  <h3 className="mt-5 text-2xl font-semibold text-white">
                    Analyzing signals
                  </h3>

                  <p className="mt-2 text-sm text-slate-500">
                    Collecting content and detecting patterns across multiple sources
                  </p>
                </div>

                {/* Data visualization */}
                <div className="relative mt-10 h-40 overflow-hidden rounded-xl border border-slate-800 bg-slate-900/60 px-6">
                  {/* Moving signal line */}
                  <div className="absolute left-0 right-0 top-1/2 h-px bg-slate-800" />

                  <div className="flex h-full items-center justify-center gap-2">
                    {[32, 58, 42, 78, 52, 91, 47, 68, 36, 84, 55, 72, 44, 96, 61, 38, 76, 52, 88, 45, 67, 93, 54, 73].map(
                      (height, index) => (
                        <div
                          key={index}
                          className="flex h-24 flex-1 items-center justify-center"
                        >
                          <div
                            className="w-full max-w-[10px] rounded-full bg-indigo-400/70 animate-pulse"
                            style={{
                              height: `${height}%`,
                              animationDelay: `${index * 70}ms`,
                              animationDuration: `${900 + (index % 4) * 180}ms`,
                            }}
                          />
                        </div>
                      )
                    )}
                  </div>

                  {/* Scanning line */}
                  <div className="absolute inset-y-0 left-0 w-px animate-[scan_2.5s_linear_infinite] bg-indigo-400 shadow-[0_0_15px_3px_rgba(129,140,248,0.5)]" />
                </div>

                {/* Processing stages */}
                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10">
                        <span className="text-sm">◉</span>
                      </div>

                      <div>
                        <p className="text-xs font-medium text-white">
                          Collecting
                        </p>
                        <p className="text-xs text-slate-500">
                          YouTube + News
                        </p>
                      </div>

                      <span className="ml-auto h-2 w-2 animate-pulse rounded-full bg-indigo-400" />
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10">
                        <span className="text-sm">◈</span>
                      </div>

                      <div>
                        <p className="text-xs font-medium text-white">
                          Processing
                        </p>
                        <p className="text-xs text-slate-500">
                          Engagement signals
                        </p>
                      </div>

                      <span className="ml-auto h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10">
                        <span className="text-sm">✦</span>
                      </div>

                      <div>
                        <p className="text-xs font-medium text-white">
                          Intelligence
                        </p>
                        <p className="text-xs text-slate-500">
                          AI trend analysis
                        </p>
                      </div>

                      <span className="ml-auto h-2 w-2 animate-pulse rounded-full bg-purple-400" />
                    </div>
                  </div>
                </div>

                {/* Bottom status */}
                <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-600">
                  <span className="h-1 w-1 rounded-full bg-slate-600" />
                  <span>Building your trend intelligence report</span>
                  <span className="h-1 w-1 rounded-full bg-slate-600" />
                </div>
              </div>
            </section>
          )}

        {result && (
          <section className="rounded-2xl border border-slate-800/80 bg-slate-950/60 p-6 shadow-xl shadow-black/10">
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

            <div>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-600">
                Analysis report
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">
                "{result.topic}"
              </h2>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="group rounded-2xl border border-slate-800 bg-slate-950/60 p-6 transition hover:border-slate-700">
                <div className="flex items-start justify-between">
                  <p className="text-sm text-slate-500">Total content</p>

                  <span className="rounded-lg bg-slate-900 px-2 py-1 text-[10px] uppercase tracking-wider text-slate-500">
                    30 days
                  </span>
                </div>

                <p className="mt-5 text-3xl font-semibold tracking-tight text-white">
                  {formatNumber(result.sources.total_content)}
                </p>

                <p className="mt-2 text-xs text-slate-600">
                  YouTube videos + news articles
                </p>
              </div>

              <div className="group rounded-2xl border border-slate-800 bg-slate-950/60 p-6 transition hover:border-slate-700">
                <div className="flex items-start justify-between">
                  <p className="text-sm text-slate-500">YouTube share</p>

                  <span className="rounded-lg bg-slate-900 px-2 py-1 text-[10px] uppercase tracking-wider text-slate-500">
                    Video
                  </span>
                </div>

                <p className="mt-5 text-3xl font-semibold tracking-tight text-white">
                  {result.sources.youtube_percentage}%
                </p>

                <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-900">
                  <div
                    className="h-full rounded-full bg-white transition-all"
                    style={{
                      width: `${result.sources.youtube_percentage}%`,
                    }}
                  />
                </div>

                <p className="mt-2 text-xs text-slate-600">
                  {formatNumber(result.sources.youtube_count)} videos analyzed
                </p>
              </div>

              <div className="group rounded-2xl border border-slate-800 bg-slate-950/60 p-6 transition hover:border-slate-700">
                <div className="flex items-start justify-between">
                  <p className="text-sm text-slate-500">News share</p>

                  <span className="rounded-lg bg-slate-900 px-2 py-1 text-[10px] uppercase tracking-wider text-slate-500">
                    News
                  </span>
                </div>

                <p className="mt-5 text-3xl font-semibold tracking-tight text-white">
                  {result.sources.news_percentage}%
                </p>

                <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-900">
                  <div
                    className="h-full rounded-full bg-slate-400 transition-all"
                    style={{
                      width: `${result.sources.news_percentage}%`,
                    }}
                  />
                </div>

                <p className="mt-2 text-xs text-slate-600">
                  {formatNumber(result.sources.news_count)} articles analyzed
                </p>
              </div>
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

      <section className="rounded-2xl border border-slate-800/80 bg-slate-950/60 p-6 shadow-xl shadow-black/10">
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

      {/* 30-Day Attention Trend */}

          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Attention Trend
                </p>

                <h3 className="mt-2 text-xl font-semibold text-white">
                  30-Day Activity
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  How attention around this topic changed across YouTube and News.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="flex items-center gap-2 rounded-full border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs text-slate-400">
                  <span className="h-2 w-2 rounded-full bg-indigo-400" />
                  YouTube views
                </span>

                <span className="flex items-center gap-2 rounded-full border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs text-slate-400">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  Content volume
                </span>
              </div>
            </div>

            <div className="mt-8 h-80">
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
                    vertical={false}
                  />

                  <XAxis
                    dataKey="date"
                    stroke="#475569"
                    tickLine={false}
                    axisLine={false}
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
                    yAxisId="views"
                    stroke="#475569"
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) =>
                      formatNumber(Number(value))
                    }
                  />

                  <YAxis
                    yAxisId="content"
                    orientation="right"
                    stroke="#475569"
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) =>
                      formatNumber(Number(value))
                    }
                  />

                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#020617",
                      border: "1px solid #1e293b",
                      borderRadius: "12px",
                      color: "#fff",
                    }}
                    labelStyle={{
                      color: "#94a3b8",
                      marginBottom: "6px",
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
                    formatter={(value, name) => [
                      formatNumber(Number(value)),
                      name,
                    ]}
                  />

                  <Line
                    yAxisId="views"
                    type="monotone"
                    dataKey="youtube_views"
                    name="YouTube Views"
                    stroke="#818cf8"
                    strokeWidth={3}
                    dot={false}
                    activeDot={{
                      r: 5,
                    }}
                  />

                  <Line
                    yAxisId="content"
                    type="monotone"
                    dataKey="total_content"
                    name="Content Volume"
                    stroke="#34d399"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{
                      r: 4,
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl bg-slate-950 p-4">
                <p className="text-xs text-slate-500">
                  Total YouTube Views
                </p>

                <p className="mt-1 text-lg font-semibold text-white">
                  {formatNumber(result.youtube.analytics.total_views)}
                </p>
              </div>

              <div className="rounded-xl bg-slate-950 p-4">
                <p className="text-xs text-slate-500">
                  Videos Analyzed
                </p>

                <p className="mt-1 text-lg font-semibold text-white">
                  {formatNumber(result.youtube.analytics.total_videos)}
                </p>
              </div>

              <div className="rounded-xl bg-slate-950 p-4">
                <p className="text-xs text-slate-500">
                  News Articles
                </p>

                <p className="mt-1 text-lg font-semibold text-white">
                  {formatNumber(result.news.total_articles)}
                </p>
              </div>
            </div>
          </section>


          {/* Source Composition */}

<section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
  <div>
    <p className="text-sm font-medium text-slate-500">
      Source Composition
    </p>

    <h3 className="mt-2 text-xl font-semibold text-white">
      Where the conversation is happening
    </h3>

    <p className="mt-1 text-sm text-slate-500">
      Distribution of analyzed content across YouTube and News.
    </p>
  </div>

  <div className="mt-6 grid items-center gap-8 lg:grid-cols-2">
    {/* Donut chart */}

    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={[
              {
                name: "YouTube",
                value: result.sources.youtube_count,
              },
              {
                name: "News",
                value: result.sources.news_count,
              },
            ]}
            cx="50%"
            cy="50%"
            innerRadius={75}
            outerRadius={105}
            paddingAngle={3}
            dataKey="value"
            stroke="none"
          >
            <Cell fill="#818cf8" />
            <Cell fill="#34d399" />
          </Pie>

          <Tooltip
            contentStyle={{
              backgroundColor: "#020617",
              border: "1px solid #1e293b",
              borderRadius: "12px",
              color: "#fff",
            }}
            formatter={(value) => [
              formatNumber(Number(value)),
              "Items",
            ]}
          />

          <Legend
            verticalAlign="bottom"
            iconType="circle"
            wrapperStyle={{
              color: "#94a3b8",
              fontSize: "12px",
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>

    {/* Source breakdown */}

        <div className="space-y-4">
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="h-3 w-3 rounded-full bg-indigo-400" />

                <span className="text-sm font-medium text-slate-300">
                  YouTube
                </span>
              </div>

              <span className="text-lg font-semibold text-white">
                {result.sources.youtube_percentage}%
              </span>
            </div>

            <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full rounded-full bg-indigo-400"
                style={{
                  width: `${result.sources.youtube_percentage}%`,
                }}
              />
            </div>

            <p className="mt-2 text-xs text-slate-500">
              {formatNumber(result.sources.youtube_count)} videos analyzed
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="h-3 w-3 rounded-full bg-emerald-400" />

                <span className="text-sm font-medium text-slate-300">
                  News
                </span>
              </div>

              <span className="text-lg font-semibold text-white">
                {result.sources.news_percentage}%
              </span>
            </div>

            <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full rounded-full bg-emerald-400"
                style={{
                  width: `${result.sources.news_percentage}%`,
                }}
              />
            </div>

            <p className="mt-2 text-xs text-slate-500">
              {formatNumber(result.sources.news_count)} articles analyzed
            </p>
          </div>

          <div className="rounded-xl bg-slate-950 p-5">
            <p className="text-xs text-slate-500">
              Total content
            </p>

            <p className="mt-1 text-2xl font-semibold text-white">
              {formatNumber(result.sources.total_content)}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Across both sources
            </p>
          </div>
        </div>
      </div>
    </section>

    {/* Sentiment Distribution */}

      <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <div>
          <p className="text-sm font-medium text-slate-500">
            Audience Sentiment
          </p>

          <h3 className="mt-2 text-xl font-semibold text-white">
            Sentiment across sources
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            How YouTube and News discussions are distributed across positive,
            neutral, and negative sentiment.
          </p>
        </div>

        <div className="mt-8 h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={[
                {
                  source: "YouTube",
                  Positive: result.ai_analysis.sentiment?.youtube.positive ?? 0,
                  Neutral: result.ai_analysis.sentiment?.youtube.neutral ?? 0,
                  Negative: result.ai_analysis.sentiment?.youtube.negative ?? 0,
                },
                {
                  source: "News",
                  Positive: result.ai_analysis.sentiment?.news.positive ?? 0,
                  Neutral: result.ai_analysis.sentiment?.news.neutral ?? 0,
                  Negative: result.ai_analysis.sentiment?.news.negative ?? 0,
                },
                {
                  source: "Overall",
                  Positive: result.ai_analysis.sentiment?.overall.positive ?? 0,
                  Neutral: result.ai_analysis.sentiment?.overall.neutral ?? 0,
                  Negative: result.ai_analysis.sentiment?.overall.negative ?? 0,
                },
              ]}
              margin={{ top: 10, right: 10, left: 0, bottom: 10 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#1e293b"
                vertical={false}
              />

              <XAxis
                dataKey="source"
                stroke="#475569"
                tickLine={false}
                axisLine={false}
              />

              <YAxis
                stroke="#475569"
                tickLine={false}
                axisLine={false}
                domain={[0, 100]}
                tickFormatter={(value) => `${value}%`}
              />

              <Tooltip
                contentStyle={{
                  backgroundColor: "#020617",
                  border: "1px solid #1e293b",
                  borderRadius: "12px",
                  color: "#fff",
                }}
                formatter={(value, name) => [
                  `${Number(value).toFixed(0)}%`,
                  name,
                ]}
              />

              <Legend
                verticalAlign="top"
                align="right"
                iconType="circle"
                wrapperStyle={{
                  color: "#94a3b8",
                  fontSize: "12px",
                  paddingBottom: "20px",
                }}
              />

              <Bar
                dataKey="Positive"
                fill="#34d399"
                radius={[4, 4, 0, 0]}
              />

              <Bar
                dataKey="Neutral"
                fill="#64748b"
                radius={[4, 4, 0, 0]}
              />

              <Bar
                dataKey="Negative"
                fill="#f87171"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Overall sentiment summary */}

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl bg-slate-950 p-4">
            <p className="text-xs text-slate-500">
              Positive
            </p>

            <p className="mt-1 text-xl font-semibold text-emerald-400">
              {result.ai_analysis.sentiment?.overall.positive ?? 0}%
            </p>
          </div>

          <div className="rounded-xl bg-slate-950 p-4">
            <p className="text-xs text-slate-500">
              Neutral
            </p>

            <p className="mt-1 text-xl font-semibold text-slate-300">
              {result.ai_analysis.sentiment?.overall.neutral ?? 0}%
            </p>
          </div>

          <div className="rounded-xl bg-slate-950 p-4">
            <p className="text-xs text-slate-500">
              Negative
            </p>

            <p className="mt-1 text-xl font-semibold text-red-400">
              {result.ai_analysis.sentiment?.overall.negative ?? 0}%
            </p>
          </div>
        </div>
      </section>

      {/* Top Content Ranking */}

      <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <div>
          <p className="text-sm font-medium text-slate-500">
            Content Performance
          </p>

          <h3 className="mt-2 text-xl font-semibold text-white">
            Top YouTube Content
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            The most viewed videos driving attention around this topic.
          </p>
        </div>

        <div className="mt-8 h-[520px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={result.youtube.analytics.videos
                .slice()
                .sort((a, b) => b.views - a.views)
                .slice(0, 10)
                .reverse()}
              layout="vertical"
              margin={{
                top: 10,
                right: 30,
                left: 10,
                bottom: 10,
              }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#1e293b"
                horizontal={false}
              />

              <XAxis
                type="number"
                stroke="#475569"
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) =>
                  formatNumber(Number(value))
                }
              />

              <YAxis
                type="category"
                dataKey="title"
                width={220}
                stroke="#475569"
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => {
                  const title = String(value);
                  return title.length > 32
                    ? `${title.slice(0, 32)}...`
                    : title;
                }}
              />

              <Tooltip
                contentStyle={{
                  backgroundColor: "#020617",
                  border: "1px solid #1e293b",
                  borderRadius: "12px",
                  color: "#fff",
                }}
                formatter={(value) => [
                  formatNumber(Number(value)),
                  "Views",
                ]}
                labelFormatter={(value) => String(value)}
              />

              <Bar
                dataKey="views"
                fill="#818cf8"
                radius={[0, 6, 6, 0]}
                barSize={24}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top video highlight */}

        {result.youtube.analytics.top_video && (
          <div className="mt-5 rounded-xl border border-slate-800 bg-slate-950 p-5">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
              #1 Most Viewed
            </p>

            <p className="mt-2 text-sm font-medium text-white">
              {result.youtube.analytics.top_video.title}
            </p>

            <p className="mt-1 text-sm text-slate-500">
              {formatNumber(result.youtube.analytics.top_video.views)} views
            </p>
          </div>
        )}
      </section>

      {/* Views vs Engagement */}

      <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <div>
          <p className="text-sm font-medium text-slate-500">
            Content Quality
          </p>

          <h3 className="mt-2 text-xl font-semibold text-white">
            Views vs Engagement
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            Identify content that combines reach with audience interaction.
          </p>
        </div>

        <div className="mt-8 h-96">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart
              margin={{
                top: 20,
                right: 20,
                bottom: 20,
                left: 10,
              }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#1e293b"
              />

              <XAxis
                type="number"
                dataKey="views"
                name="Views"
                stroke="#475569"
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) =>
                  formatNumber(Number(value))
                }
              />

              <YAxis
                type="number"
                dataKey="engagement_rate"
                name="Engagement"
                stroke="#475569"
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}%`}
              />

              <Tooltip
                cursor={{
                  strokeDasharray: "4 4",
                  stroke: "#475569",
                }}
                contentStyle={{
                  backgroundColor: "#020617",
                  border: "1px solid #1e293b",
                  borderRadius: "12px",
                  color: "#fff",
                }}
                formatter={(value, name) => {
                  if (name === "Views") {
                    return [
                      formatNumber(Number(value)),
                      "Views",
                    ];
                  }

                  return [
                    `${Number(value).toFixed(2)}%`,
                    "Engagement",
                  ];
                }}
                labelFormatter={() => ""}
              />

              <Scatter
                name="Videos"
                data={result.youtube.analytics.videos}
                fill="#818cf8"
              />
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl bg-slate-950 p-4">
            <p className="text-xs text-slate-500">
              High Reach
            </p>

            <p className="mt-1 text-sm font-medium text-white">
              High views
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Content reaching a large audience.
            </p>
          </div>

          <div className="rounded-xl bg-slate-950 p-4">
            <p className="text-xs text-slate-500">
              Strong Engagement
            </p>

            <p className="mt-1 text-sm font-medium text-white">
              High interaction
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Content generating stronger audience response.
            </p>
          </div>

          <div className="rounded-xl bg-slate-950 p-4">
            <p className="text-xs text-slate-500">
              Potential Emerging
            </p>

            <p className="mt-1 text-sm font-medium text-white">
              Low reach + high engagement
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Smaller content with promising engagement.
            </p>
          </div>
        </div>
      </section>


      {/* News Coverage */}

      <section className="rounded-2xl border border-slate-800/80 bg-slate-950/60 p-6 shadow-xl shadow-black/10">
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

<section className="rounded-2xl border border-slate-800/80 bg-slate-950/60 p-6 shadow-xl shadow-black/10">
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

        <section className="rounded-2xl border border-slate-800/80 bg-slate-950/60 p-6 shadow-xl shadow-black/10">
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

            <section className="rounded-2xl border border-slate-800/80 bg-slate-950/60 p-6 shadow-xl shadow-black/10">

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

            <section className="rounded-2xl border border-slate-800/80 bg-slate-950/60 p-6 shadow-xl shadow-black/10">

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

            <section className="rounded-2xl border border-slate-800/80 bg-slate-950/60 p-6 shadow-xl shadow-black/10">

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
    <div className="rounded-2xl border border-slate-800/80 bg-slate-950/60 p-6 shadow-xl shadow-black/10">
      <p className="text-sm text-slate-500">
        {label}
      </p>

      <p className="mt-2 text-2xl font-bold">
        {value}
      </p>
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