"use client";

import { useEffect, useState, type ReactNode } from "react";
import {
  LineChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  SourceVolumeChart,
  EngagementChart,
  SentimentBySourceChart,
  SourceMixChart,
  TopVideosChart,
  ReachVsEngagementChart,
} from "./Charts";

type AnalysisResult = {
  topic: string;
  analysis_period: { from: string; to: string };

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

    key_themes: string[];
    positive_topics: string[];
    negative_topics: string[];
    emerging_trends: string[];
    content_patterns: string[];
    summary: string;
  };
};

/*
 * Google Trends only returns the topic.
 *
 * We intentionally do NOT keep:
 * trend_score
 * trend_status
 * total_videos
 * total_views
 *
 * Those are analysis metrics and belong to /analyze,
 * not the landing-page Trending Now section.
 */
type TrendTopic = {
  topic: string;
};

export default function Home() {
  const [topic, setTopic] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [trendingTopics, setTrendingTopics] = useState<TrendTopic[]>([]);
  const [trendingLoading, setTrendingLoading] = useState(true);

  const [recentTopics, setRecentTopics] = useState<string[]>([]);

  const [youtubePage, setYoutubePage] = useState(1);
  const [newsPage, setNewsPage] = useState(1);

  const itemsPerPage = 8;

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

  /*
   * Load real-time Google Trends topics.
   *
   * Backend:
   *
   * GET /trending
   *
   * Returns:
   *
   * {
   *   "topics": [
   *     { "topic": "novak djokovic" },
   *     { "topic": "sa vs aus" }
   *   ]
   * }
   */
  useEffect(() => {
    async function loadTrendingTopics() {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL;

        if (!API_URL) {
          throw new Error(
            "NEXT_PUBLIC_API_URL is not configured."
          );
        }

        const response = await fetch(
          `${API_URL}/trending`
        );

        if (!response.ok) {
          throw new Error(
            "Failed to load trending topics"
          );
        }

        const data = await response.json();

        setTrendingTopics(
          Array.isArray(data.topics)
            ? data.topics
            : []
        );
      } catch (err) {
        console.error(
          "Trending topics error:",
          err
        );

        setTrendingTopics([]);
      } finally {
        setTrendingLoading(false);
      }
    }

    loadTrendingTopics();
  }, []);

  async function analyzeTopic() {
    if (!topic.trim() || loading) {
      return;
    }

    await analyzeWithTopic(
      topic.trim()
    );
  }

  async function analyzeWithTopic(
    selectedTopic: string
  ) {
    setTopic(selectedTopic);

    setLoading(true);
    setError("");
    setResult(null);

    setYoutubePage(1);
    setNewsPage(1);

    try {
      const API_URL =
        process.env.NEXT_PUBLIC_API_URL;

      if (!API_URL) {
        throw new Error(
          "NEXT_PUBLIC_API_URL is not configured."
        );
      }

      const response = await fetch(
        `${API_URL}/analyze`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            topic: selectedTopic,
          }),
        }
      );

      if (!response.ok) {
        let message =
          "Analysis failed.";

        try {
          const body =
            await response.json();

          if (body?.detail) {
            message = body.detail;
          }
        } catch {}

        throw new Error(message);
      }

      const data: AnalysisResult =
        await response.json();

      setResult(data);

      setRecentTopics(
        (previous) =>
          [
            selectedTopic,
            ...previous.filter(
              (item) =>
                item !== selectedTopic
            ),
          ].slice(0, 5)
      );
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Could not connect to the backend."
      );
    } finally {
      setLoading(false);
    }
  }

  function resetSearch() {
    setResult(null);
    setError("");

    setYoutubePage(1);
    setNewsPage(1);
  }

  return (
    <main className="min-h-screen bg-[#08090b] text-zinc-100 selection:bg-lime-300 selection:text-black">
      <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-12">
        <Header
          onHome={resetSearch}
          hasResult={!!result}
        />

        {!result ? (
          <HomeView
            topic={topic}
            setTopic={setTopic}
            loading={loading}
            error={error}
            trendingTopics={trendingTopics}
            trendingLoading={trendingLoading}
            recentTopics={recentTopics}
            onAnalyze={analyzeTopic}
            onSelectTopic={analyzeWithTopic}
          />
        ) : (
          <ResultsView
            result={result}
            sentiment={sentiment}
            youtubePage={youtubePage}
            setYoutubePage={
              setYoutubePage
            }
            newsPage={newsPage}
            setNewsPage={setNewsPage}
            itemsPerPage={itemsPerPage}
            onBack={resetSearch}
            onSelectTopic={
              analyzeWithTopic
            }
          />
        )}
      </div>
    </main>
  );
}

/* =========================================================
   HEADER
========================================================= */

function Header({
  onHome,
  hasResult,
}: {
  onHome: () => void;
  hasResult: boolean;
}) {
  return (
    <header className="mb-20 flex items-center justify-between">
      <button
        onClick={onHome}
        className="group text-left"
        aria-label="Go home"
      >
        <div className="flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-full border border-zinc-700 text-xs font-semibold text-lime-300 transition group-hover:border-lime-300">
            S
          </span>

          <span className="text-sm font-semibold tracking-tight">
            Social Trend Analysis
          </span>
        </div>
      </button>

      <div className="flex items-center gap-4 text-[11px] uppercase tracking-[0.18em] text-zinc-600">
        <span className="hidden sm:block">
          YouTube + News
        </span>

        <span className="h-1 w-1 rounded-full bg-lime-300" />

        <span>30 days</span>

        {hasResult && (
          <button
            onClick={onHome}
            className="ml-2 text-zinc-400 transition hover:text-white"
          >
            New search
          </button>
        )}
      </div>
    </header>
  );
}

/* =========================================================
   HOME VIEW
========================================================= */

function HomeView({
  topic,
  setTopic,
  loading,
  error,
  trendingTopics,
  trendingLoading,
  recentTopics,
  onAnalyze,
  onSelectTopic,
}: {
  topic: string;
  setTopic: (
    value: string
  ) => void;

  loading: boolean;

  error: string;

  trendingTopics: TrendTopic[];

  trendingLoading: boolean;

  recentTopics: string[];

  onAnalyze: () => void;

  onSelectTopic: (
    topic: string
  ) => void;
}) {
  return (
    <section>
      <div className="max-w-4xl pt-4 sm:pt-10">
        <p className="mb-6 text-[11px] font-medium uppercase tracking-[0.24em] text-lime-300">
          Trend Analysis
        </p>

        <h1 className="max-w-3xl text-5xl font-medium leading-[0.98] tracking-[-0.045em] text-white sm:text-7xl">
          What is moving
          <br />
          <span className="text-zinc-600">
            right now?
          </span>
        </h1>

        <p className="mt-7 max-w-xl text-base leading-7 text-zinc-500">
          Search a topic and see where attention is growing across video, news, engagement and AI signals.
        </p>

        <SearchBox
          topic={topic}
          setTopic={setTopic}
          loading={loading}
          onAnalyze={onAnalyze}
        />

        {error && (
          <div className="mt-4 border-l border-red-400/70 pl-4 text-sm text-red-300">
            {error}
          </div>
        )}
      </div>

      <div className="mt-24 grid gap-16 lg:grid-cols-[1fr_280px]">
        <section>
          <div className="flex items-center justify-between">
            <SectionLabel>
              Trending now
            </SectionLabel>

            {!trendingLoading &&
              trendingTopics.length > 0 && (
                <span className="text-[10px] uppercase tracking-wider text-zinc-700">
                  India · Live
                </span>
              )}
          </div>

          <div className="mt-5 divide-y divide-zinc-900 border-y border-zinc-900">
            {trendingLoading ? (
              Array.from({
                length: 5,
              }).map((_, i) => (
                <TrendSkeleton
                  key={i}
                />
              ))
            ) : trendingTopics.length ? (
              trendingTopics
                .slice(0, 8)
                .map(
                  (
                    item,
                    index
                  ) => (
                    <button
                      key={`${item.topic}-${index}`}
                      onClick={() =>
                        onSelectTopic(
                          item.topic
                        )
                      }
                      className="group grid w-full grid-cols-[34px_1fr_auto] items-center gap-4 py-4 text-left transition hover:bg-white/[0.02]"
                    >
                      {/* Ranking */}
                      <span className="text-xs font-mono text-zinc-700 transition group-hover:text-lime-300">
                        {String(
                          index + 1
                        ).padStart(
                          2,
                          "0"
                        )}
                      </span>

                      {/* Topic */}
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-zinc-200 transition group-hover:text-white">
                          {
                            item.topic
                          }
                        </p>

                        <p className="mt-1 text-xs text-zinc-600">
                          Google Trends
                        </p>
                      </div>

                      {/* Action */}
                      <div className="flex items-center">
                        <span className="text-sm text-zinc-700 transition group-hover:translate-x-1 group-hover:text-lime-300">
                          →
                        </span>
                      </div>
                    </button>
                  )
                )
            ) : (
              <div className="py-8 text-sm text-zinc-600">
                Trending topics are temporarily unavailable.
              </div>
            )}
          </div>
        </section>

        <aside>
          <SectionLabel>
            How it works
          </SectionLabel>

          <div className="mt-5 space-y-6">
            {[
              [
                "01",
                "Discover",
                "Find topics gaining attention.",
              ],
              [
                "02",
                "Measure",
                "Compare reach and momentum.",
              ],
              [
                "03",
                "Understand",
                "Surface patterns with AI.",
              ],
            ].map(
              ([
                number,
                title,
                description,
              ]) => (
                <div key={number}>
                  <span className="text-[10px] text-zinc-700">
                    {number}
                  </span>

                  <p className="mt-1 text-sm text-zinc-300">
                    {title}
                  </p>

                  <p className="mt-1 text-xs leading-5 text-zinc-600">
                    {description}
                  </p>
                </div>
              )
            )}
          </div>

          {recentTopics.length >
            0 && (
            <div className="mt-12">
              <SectionLabel>
                Recent
              </SectionLabel>

              <div className="mt-4 space-y-2">
                {recentTopics.map(
                  (item) => (
                    <button
                      key={item}
                      onClick={() =>
                        onSelectTopic(
                          item
                        )
                      }
                      className="block max-w-full truncate text-left text-sm text-zinc-500 transition hover:text-white"
                    >
                      {item}{" "}
                      <span className="text-zinc-700">
                        ↗
                      </span>
                    </button>
                  )
                )}
              </div>
            </div>
          )}
        </aside>
      </div>
    </section>
  );
}

/* =========================================================
   SEARCH BOX
========================================================= */

function SearchBox({
  topic,
  setTopic,
  loading,
  onAnalyze,
}: {
  topic: string;
  setTopic: (
    value: string
  ) => void;

  loading: boolean;

  onAnalyze: () => void;
}) {
  return (
    <div className="mt-10 flex max-w-2xl items-center border-b border-zinc-700 pb-2 transition focus-within:border-lime-300">
      <span className="mr-3 text-lg text-zinc-700">
        ⌕
      </span>

      <input
        value={topic}
        onChange={(e) =>
          setTopic(e.target.value)
        }
        onKeyDown={(e) =>
          e.key === "Enter" &&
          onAnalyze()
        }
        disabled={loading}
        placeholder="Search a topic..."
        className="min-w-0 flex-1 bg-transparent py-3 text-base text-white outline-none placeholder:text-zinc-700 disabled:opacity-50"
      />

      <button
        onClick={onAnalyze}
        disabled={
          loading ||
          !topic.trim()
        }
        className="ml-3 rounded-full bg-lime-300 px-5 py-2.5 text-xs font-semibold text-black transition hover:bg-lime-200 disabled:cursor-not-allowed disabled:opacity-30"
      >
        {loading
          ? "Analyzing"
          : "Analyze"}
      </button>
    </div>
  );
}

/* =========================================================
   RESULTS VIEW
========================================================= */

function ResultsView({
  result,
  sentiment,
  youtubePage,
  setYoutubePage,
  newsPage,
  setNewsPage,
  itemsPerPage,
  onBack,
  onSelectTopic,
}: {
  result: AnalysisResult;

  sentiment: NonNullable<
    AnalysisResult["ai_analysis"]["sentiment"]
  >;

  youtubePage: number;

  setYoutubePage: (
    value:
      | number
      | ((v: number) => number)
  ) => void;

  newsPage: number;

  setNewsPage: (
    value:
      | number
      | ((v: number) => number)
  ) => void;

  itemsPerPage: number;

  onBack: () => void;

  onSelectTopic: (
    topic: string
  ) => void;
}) {
  const videos = [
    ...result.youtube.analytics
      .videos,
  ].sort(
    (a, b) =>
      b.views_per_day -
      a.views_per_day
  );

  const topVideos = [
    ...result.youtube.analytics
      .videos,
  ]
    .sort(
      (a, b) =>
        b.views - a.views
    )
    .slice(0, 5);

  const videoPages =
    Math.max(
      1,
      Math.ceil(
        videos.length /
          itemsPerPage
      )
    );

  const newsPages =
    Math.max(
      1,
      Math.ceil(
        result.news.articles
          .length /
          itemsPerPage
      )
    );

  const visibleVideos =
    videos.slice(
      (youtubePage - 1) *
        itemsPerPage,
      youtubePage *
        itemsPerPage
    );

  const visibleNews =
    result.news.articles.slice(
      (newsPage - 1) *
        itemsPerPage,
      newsPage *
        itemsPerPage
    );

  return (
    <section className="pb-16">
      <button
        onClick={onBack}
        className="mb-12 text-xs text-zinc-600 transition hover:text-white"
      >
        ← Back to trends
      </button>

      <div className="grid gap-12 lg:grid-cols-[1fr_240px] lg:items-end">
        <div>
          <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.2em] text-zinc-600">
            <span>
              Analysis
            </span>

            <span className="h-1 w-1 rounded-full bg-lime-300" />

            <span>
              {
                result
                  .analysis_period
                  .from
              }{" "}
              —{" "}
              {
                result
                  .analysis_period
                  .to
              }
            </span>
          </div>

          <h1 className="mt-5 max-w-4xl break-words text-5xl font-medium tracking-[-0.045em] text-white sm:text-7xl">
            {result.topic}
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-7 text-zinc-500">
            {result.ai_analysis.summary}
          </p>
        </div>

        <div className="border-l border-zinc-900 pl-6 lg:mb-2">
          <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-600">
            Trend score
          </p>

          <p className="mt-2 text-5xl font-medium tracking-tight text-lime-300">
            {formatNumber(
              result.youtube
                .analytics
                .trend_score
            )}
          </p>

          <p className="mt-2 text-xs uppercase tracking-wider text-zinc-500">
            {
              result
                .cross_source_signal
                .status
            }
          </p>
        </div>
      </div>

      <div className="mt-16 grid border-y border-zinc-900 sm:grid-cols-4">
        <Stat
          label="Content"
          value={formatNumber(
            result.sources
              .total_content
          )}
        />

        <Stat
          label="YouTube"
          value={`${result.sources.youtube_percentage}%`}
        />

        <Stat
          label="News"
          value={`${result.sources.news_percentage}%`}
        />

        <Stat
          label="Cross-source"
          value={`${result.cross_source_signal.score}`}
        />
      </div>

      <div className="mt-20 grid gap-20 lg:grid-cols-[1.25fr_.75fr]">
        <div>
          <SectionLabel>
            AI read
          </SectionLabel>

          <p className="mt-5 max-w-3xl text-2xl font-normal leading-relaxed tracking-tight text-zinc-200">
            {
              result.ai_analysis
                .trend_explanation
            }
          </p>

          <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3">
            {result.ai_analysis.key_themes.map(
              (theme) => (
                <span
                  key={theme}
                  className="text-sm text-zinc-500"
                >
                  #{theme}
                </span>
              )
            )}
          </div>
        </div>

        <div>
          <SectionLabel>
            Sentiment
          </SectionLabel>

          <div className="mt-6 space-y-5">
            <SentimentRow
              label="Positive"
              value={
                sentiment.overall
                  .positive
              }
            />

            <SentimentRow
              label="Neutral"
              value={
                sentiment.overall
                  .neutral
              }
            />

            <SentimentRow
              label="Negative"
              value={
                sentiment.overall
                  .negative
              }
            />
          </div>
        </div>
      </div>

      {/* =====================================================
          ATTENTION
      ===================================================== */}

      <section className="mt-24">
        <div className="flex items-end justify-between">
          <div>
            <SectionLabel>
              Attention
            </SectionLabel>

            <h2 className="mt-3 text-2xl font-medium tracking-tight">
              30-day activity
            </h2>
          </div>

          <span className="text-xs text-zinc-600">
            YouTube views · content volume
          </span>
        </div>

        <div className="mt-8 h-[320px] w-full">
          <ResponsiveContainer
            width="100%"
            height="100%"
          >
            <LineChart
              data={
                result.daily_trend
              }
              margin={{
                top: 10,
                right: 5,
                left: -20,
                bottom: 0,
              }}
            >
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tick={{
                  fill: "#52525b",
                  fontSize: 10,
                }}
                tickFormatter={(
                  value
                ) =>
                  new Date(
                    String(value)
                  ).toLocaleDateString(
                    "en-IN",
                    {
                      day: "2-digit",
                      month: "short",
                    }
                  )
                }
              />

              <YAxis hide />

              <Tooltip
                contentStyle={{
                  background:
                    "#111214",
                  border:
                    "1px solid #27272a",
                  borderRadius: 8,
                  color: "#fff",
                }}
                labelStyle={{
                  color: "#71717a",
                }}
                formatter={(
                  value,
                  name
                ) => [
                  formatNumber(
                    Number(value)
                  ),
                  name ===
                  "youtube_views"
                    ? "Views"
                    : "Content",
                ]}
              />

              <Line
                type="monotone"
                dataKey="youtube_views"
                stroke="#c8ff68"
                strokeWidth={2}
                dot={false}
              />

              <Line
                type="monotone"
                dataKey="total_content"
                stroke="#52525b"
                strokeWidth={1.5}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* =====================================================
          BREAKDOWN
      ===================================================== */}

      <section className="mt-24">
        <SectionLabel>
          Breakdown
        </SectionLabel>

        <div className="mt-8 grid gap-x-16 gap-y-14 lg:grid-cols-2">
          <SourceVolumeChart
            data={
              result.daily_trend
            }
          />

          <EngagementChart
            data={
              result.daily_trend
            }
          />

          <SentimentBySourceChart
            sentiment={
              sentiment
            }
          />

          <SourceMixChart
            youtube={
              result.sources
                .youtube_count
            }
            news={
              result.sources
                .news_count
            }
          />

          <TopVideosChart
            videos={
              result.youtube
                .analytics
                .videos
            }
          />

          <ReachVsEngagementChart
            videos={
              result.youtube
                .analytics
                .videos
            }
          />
        </div>
      </section>

      {/* =====================================================
          YOUTUBE CONTENT
      ===================================================== */}

      <section className="mt-24">
        <div className="flex items-end justify-between">
          <div>
            <SectionLabel>
              Content
            </SectionLabel>

            <h2 className="mt-3 text-2xl font-medium tracking-tight">
              What is driving attention
            </h2>
          </div>

          <span className="text-xs text-zinc-600">
            {videos.length} videos
          </span>
        </div>

        <div className="mt-8 divide-y divide-zinc-900 border-y border-zinc-900">
          {visibleVideos.map(
            (
              video,
              index
            ) => (
              <a
                key={
                  video.video_id
                }
                href={
                  video.youtube_url
                }
                target="_blank"
                rel="noopener noreferrer"
                className="grid grid-cols-[30px_1fr_auto] gap-4 py-5 transition hover:bg-white/[0.02]"
              >
                <span className="text-xs text-zinc-700">
                  {String(
                    (youtubePage -
                      1) *
                      itemsPerPage +
                      index +
                      1
                  ).padStart(
                    2,
                    "0"
                  )}
                </span>

                <div className="min-w-0">
                  <p className="line-clamp-2 text-sm font-medium leading-6 text-zinc-200 hover:text-white">
                    {
                      video.title
                    }
                  </p>

                  <p className="mt-1 text-xs text-zinc-600">
                    {
                      video.channel
                    }
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-sm text-zinc-300">
                    {formatNumber(
                      video.views
                    )}
                  </p>

                  <p className="mt-1 text-xs text-lime-300">
                    {formatNumber(
                      video.views_per_day
                    )}
                    /day
                  </p>
                </div>
              </a>
            )
          )}
        </div>

        <Pagination
          page={youtubePage}
          pages={videoPages}
          setPage={setYoutubePage}
        />
      </section>

      {/* =====================================================
          NEWS
      ===================================================== */}

      <section className="mt-24 grid gap-16 lg:grid-cols-[1fr_280px]">
        <div>
          <SectionLabel>
            News
          </SectionLabel>

          <h2 className="mt-3 text-2xl font-medium tracking-tight">
            What is being reported
          </h2>

          <div className="mt-8 divide-y divide-zinc-900 border-y border-zinc-900">
            {visibleNews.map(
              (article) => (
                <a
                  key={
                    article.content_id
                  }
                  href={
                    article.url
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block py-5 transition hover:bg-white/[0.02]"
                >
                  <div className="flex items-center justify-between gap-4 text-[10px] uppercase tracking-wider text-zinc-600">
                    <span>
                      {
                        article.publisher
                      }
                    </span>

                    <span>
                      {new Date(
                        article.published_at
                      ).toLocaleDateString(
                        "en-IN"
                      )}
                    </span>
                  </div>

                  <p className="mt-2 text-sm font-medium leading-6 text-zinc-200">
                    {
                      article.title
                    }
                  </p>

                  {article.description && (
                    <p className="mt-2 line-clamp-2 text-xs leading-5 text-zinc-600">
                      {
                        article.description
                      }
                    </p>
                  )}
                </a>
              )
            )}
          </div>

          <Pagination
            page={newsPage}
            pages={newsPages}
            setPage={setNewsPage}
          />
        </div>

        <aside>
          <SectionLabel>
            Signals
          </SectionLabel>

          <div className="mt-6 space-y-8">
            <Signal
              label="YouTube"
              value={
                result
                  .cross_source_signal
                  .youtube_signal
              }
            />

            <Signal
              label="News"
              value={
                result
                  .cross_source_signal
                  .news_signal
              }
            />

            <div>
              <p className="text-xs text-zinc-600">
                Fastest growing
              </p>

              <p className="mt-2 text-sm leading-6 text-zinc-300">
                {
                  result.youtube
                    .analytics
                    .fastest_growing_video
                    .title
                }
              </p>

              <p className="mt-1 text-xs text-lime-300">
                {formatNumber(
                  result.youtube
                    .analytics
                    .fastest_growing_video
                    .views_per_day
                )}{" "}
                views/day
              </p>
            </div>
          </div>
        </aside>
      </section>

      {/* =====================================================
          EMERGING
      ===================================================== */}

      <section className="mt-24 border-t border-zinc-900 pt-10">
        <SectionLabel>
          Emerging
        </SectionLabel>

        <div className="mt-6 grid gap-x-10 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
          {result.ai_analysis.emerging_trends.map(
            (item) => (
              <p
                key={item}
                className="text-sm leading-6 text-zinc-400"
              >
                {item}
              </p>
            )
          )}
        </div>

        {result.ai_analysis
          .content_patterns.length >
          0 && (
          <div className="mt-12">
            <SectionLabel>
              Content patterns
            </SectionLabel>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {result.ai_analysis.content_patterns.map(
                (item) => (
                  <p
                    key={item}
                    className="border-l border-zinc-800 pl-4 text-sm leading-6 text-zinc-500"
                  >
                    {item}
                  </p>
                )
              )}
            </div>
          </div>
        )}
      </section>

      {/* =====================================================
          TOP REACH
      ===================================================== */}

      {topVideos.length >
        0 && (
        <section className="mt-24 border-t border-zinc-900 pt-10">
          <SectionLabel>
            Top reach
          </SectionLabel>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {topVideos.map(
              (
                video,
                index
              ) => (
                <a
                  key={
                    video.video_id
                  }
                  href={
                    video.youtube_url
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group"
                >
                  <span className="text-[10px] text-zinc-700">
                    0
                    {index +
                      1}
                  </span>

                  <p className="mt-2 line-clamp-3 text-sm leading-5 text-zinc-400 transition group-hover:text-white">
                    {
                      video.title
                    }
                  </p>

                  <p className="mt-3 text-xs text-zinc-600">
                    {formatNumber(
                      video.views
                    )}{" "}
                    views
                  </p>
                </a>
              )
            )}
          </div>
        </section>
      )}

      <div className="mt-24 border-t border-zinc-900 pt-8 text-xs text-zinc-700">
        This dashboard combines quantitative trend data with AI-generated interpretation. Quantitative trend scores are calculated by the backend.
      </div>
    </section>
  );
}

/* =========================================================
   SHARED COMPONENTS
========================================================= */

function SectionLabel({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-zinc-600">
      {children}
    </p>
  );
}

function Stat({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="border-b border-zinc-900 px-1 py-5 sm:border-b-0 sm:border-r sm:px-5 first:sm:pl-0 last:sm:border-r-0">
      <p className="text-[10px] uppercase tracking-wider text-zinc-600">
        {label}
      </p>

      <p className="mt-2 text-xl font-medium text-zinc-200">
        {value}
      </p>
    </div>
  );
}

function SentimentRow({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div>
      <div className="mb-2 flex justify-between text-xs">
        <span className="text-zinc-500">
          {label}
        </span>

        <span className="text-zinc-300">
          {value}%
        </span>
      </div>

      <div className="h-1 bg-zinc-900">
        <div
          className="h-full bg-lime-300 transition-all"
          style={{
            width: `${Math.min(
              100,
              Math.max(
                0,
                value
              )
            )}%`,
          }}
        />
      </div>
    </div>
  );
}

function Signal({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="text-xs text-zinc-600">
          {label}
        </span>

        <span className="text-sm text-zinc-300">
          {value > 0
            ? "+"
            : ""}
          {formatNumber(
            value
          )}
        </span>
      </div>

      <div className="mt-2 h-px bg-zinc-900">
        <div
          className="h-px bg-lime-300"
          style={{
            width: `${Math.min(
              100,
              Math.abs(value)
            )}%`,
          }}
        />
      </div>
    </div>
  );
}

function Pagination({
  page,
  pages,
  setPage,
}: {
  page: number;
  pages: number;
  setPage: (
    value:
      | number
      | ((v: number) => number)
  ) => void;
}) {
  if (pages <= 1) {
    return null;
  }

  return (
    <div className="mt-5 flex items-center justify-between text-xs">
      <span className="text-zinc-700">
        {page} / {pages}
      </span>

      <div className="flex gap-4">
        <button
          disabled={page === 1}
          onClick={() =>
            setPage(
              (p) =>
                Math.max(
                  1,
                  p - 1
                )
            )
          }
          className="text-zinc-500 transition hover:text-white disabled:opacity-20"
        >
          Previous
        </button>

        <button
          disabled={
            page === pages
          }
          onClick={() =>
            setPage(
              (p) =>
                Math.min(
                  pages,
                  p + 1
                )
            )
          }
          className="text-zinc-500 transition hover:text-white disabled:opacity-20"
        >
          Next
        </button>
      </div>
    </div>
  );
}

function TrendSkeleton() {
  return (
    <div className="grid grid-cols-[34px_1fr_auto] items-center gap-4 py-5 animate-pulse">
      <span className="h-3 w-4 rounded bg-zinc-900" />

      <div>
        <span className="block h-4 w-40 rounded bg-zinc-900" />

        <span className="mt-2 block h-3 w-24 rounded bg-zinc-900" />
      </div>

      <span className="h-4 w-4 rounded bg-zinc-900" />
    </div>
  );
}

function formatNumber(
  value: number
) {
  return new Intl.NumberFormat(
    "en-US",
    {
      notation: "compact",
      maximumFractionDigits: 1,
    }
  ).format(value);
}