"use client";

import type { ReactNode } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts";

// Minimal shapes so this file is self-contained; they match AnalysisResult in page.tsx.
type Daily = {
  date: string;
  youtube_count: number;
  youtube_likes: number;
  youtube_comments: number;
  news_count: number;
};
type Sent = { positive: number; neutral: number; negative: number };
type Video = { title: string; views: number; engagement_rate: number; views_per_day: number };

const C = { lime: "#c8ff68", zinc: "#71717a", dim: "#3f3f46", red: "#f87171", blue: "#7dd3fc" };
const tick = { fill: "#52525b", fontSize: 10 };
const tooltipStyle = {
  contentStyle: { background: "#111214", border: "1px solid #27272a", borderRadius: 8, color: "#fff" },
  labelStyle: { color: "#71717a" },
};
const fmt = (v: number) => new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(v);
const day = (v: unknown) => new Date(String(v)).toLocaleDateString("en-IN", { day: "2-digit", month: "short" });

function Panel({ title, note, children }: { title: string; note?: string; children: ReactNode }) {
  return (
    <div>
      <div className="flex items-end justify-between">
        <h3 className="text-base font-medium tracking-tight text-zinc-200">{title}</h3>
        {note && <span className="text-xs text-zinc-600">{note}</span>}
      </div>
      <div className="mt-6 h-[260px] w-full">{children}</div>
    </div>
  );
}

/** Daily YouTube vs news volume, stacked */
export function SourceVolumeChart({ data }: { data: Daily[] }) {
  return (
    <Panel title="Volume by source" note="items per day">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
          <XAxis dataKey="date" tickLine={false} axisLine={false} tick={tick} tickFormatter={day} minTickGap={24} />
          <YAxis tickLine={false} axisLine={false} tick={tick} />
          <Tooltip {...tooltipStyle} labelFormatter={day} />
          <Area type="monotone" stackId="1" dataKey="youtube_count" name="YouTube" stroke={C.lime} fill={C.lime} fillOpacity={0.25} />
          <Area type="monotone" stackId="1" dataKey="news_count" name="News" stroke={C.blue} fill={C.blue} fillOpacity={0.2} />
        </AreaChart>
      </ResponsiveContainer>
    </Panel>
  );
}

/** Likes and comments over time */
export function EngagementChart({ data }: { data: Daily[] }) {
  return (
    <Panel title="Engagement over time" note="likes · comments">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
          <CartesianGrid stroke="#18181b" vertical={false} />
          <XAxis dataKey="date" tickLine={false} axisLine={false} tick={tick} tickFormatter={day} minTickGap={24} />
          <YAxis tickLine={false} axisLine={false} tick={tick} tickFormatter={fmt} />
          <Tooltip {...tooltipStyle} labelFormatter={day} formatter={(v, n) => [fmt(Number(v)), n]} />
          <Line type="monotone" dataKey="youtube_likes" name="Likes" stroke={C.lime} strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="youtube_comments" name="Comments" stroke={C.zinc} strokeWidth={1.5} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </Panel>
  );
}

/** Sentiment split per source, 100% stacked horizontal bars */
export function SentimentBySourceChart({ sentiment }: { sentiment: { youtube: Sent; news: Sent; overall: Sent } }) {
  const data = (["youtube", "news", "overall"] as const).map((k) => ({
    name: k === "youtube" ? "YouTube" : k === "news" ? "News" : "Overall",
    ...sentiment[k],
  }));
  return (
    <Panel title="Sentiment by source" note="% of content">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 10, left: 0, bottom: 0 }} barSize={22}>
          <XAxis type="number" domain={[0, 100]} hide />
          <YAxis type="category" dataKey="name" tickLine={false} axisLine={false} tick={{ ...tick, fontSize: 12 }} width={64} />
          <Tooltip {...tooltipStyle} cursor={{ fill: "rgba(255,255,255,0.03)" }} formatter={(v, n) => [`${v}%`, n]} />
          <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, color: "#71717a" }} />
          <Bar dataKey="positive" name="Positive" stackId="s" fill={C.lime} />
          <Bar dataKey="neutral" name="Neutral" stackId="s" fill={C.dim} />
          <Bar dataKey="negative" name="Negative" stackId="s" fill={C.red} />
        </BarChart>
      </ResponsiveContainer>
    </Panel>
  );
}

/** Content mix donut */
export function SourceMixChart({ youtube, news }: { youtube: number; news: number }) {
  const data = [
    { name: "YouTube", value: youtube, color: C.lime },
    { name: "News", value: news, color: C.blue },
  ];
  return (
    <Panel title="Content mix" note="YouTube vs news">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Tooltip {...tooltipStyle} formatter={(v, n) => [fmt(Number(v)), n]} />
          <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, color: "#71717a" }} />
          <Pie data={data} dataKey="value" nameKey="name" innerRadius={62} outerRadius={90} paddingAngle={3} stroke="none">
            {data.map((d) => (
              <Cell key={d.name} fill={d.color} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </Panel>
  );
}

/** Top videos by total views, horizontal bars */
export function TopVideosChart({ videos }: { videos: Video[] }) {
  const data = [...videos]
    .sort((a, b) => b.views - a.views)
    .slice(0, 6)
    .map((v) => ({ ...v, label: v.title.length > 26 ? v.title.slice(0, 25) + "…" : v.title }));
  return (
    <Panel title="Top videos by views">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 10, left: 0, bottom: 0 }} barSize={14}>
          <XAxis type="number" hide />
          <YAxis type="category" dataKey="label" tickLine={false} axisLine={false} tick={{ ...tick, fontSize: 11 }} width={150} />
          <Tooltip
            {...tooltipStyle}
            cursor={{ fill: "rgba(255,255,255,0.03)" }}
            labelFormatter={(_, p) => p?.[0]?.payload?.title ?? ""}
            formatter={(v) => [fmt(Number(v)), "Views"]}
          />
          <Bar dataKey="views" fill={C.lime} radius={[0, 3, 3, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Panel>
  );
}

/** Reach vs engagement rate: finds videos that punch above their view count */
export function ReachVsEngagementChart({ videos }: { videos: Video[] }) {
  const data = videos.map((v) => ({ views: v.views, engagement: v.engagement_rate, vpd: v.views_per_day, title: v.title }));
  return (
    <Panel title="Reach vs engagement" note="bubble size = views/day">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
          <CartesianGrid stroke="#18181b" />
          <XAxis type="number" dataKey="views" name="Views" scale="log" domain={["auto", "auto"]} tickLine={false} axisLine={false} tick={tick} tickFormatter={fmt} />
          <YAxis type="number" dataKey="engagement" name="Engagement" tickLine={false} axisLine={false} tick={tick} tickFormatter={(v) => `${v}%`} />
          <ZAxis type="number" dataKey="vpd" range={[30, 260]} />
          <Tooltip
            {...tooltipStyle}
            cursor={{ stroke: "#27272a" }}
            formatter={(v, n) => [n === "Views" ? fmt(Number(v)) : `${Number(v).toFixed(2)}%`, n]}
          />
          <Scatter data={data} fill={C.lime} fillOpacity={0.55} />
        </ScatterChart>
      </ResponsiveContainer>
    </Panel>
  );
}
