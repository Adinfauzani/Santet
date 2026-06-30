"use client";

import { useState, useEffect, useCallback } from "react";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import {
  Newspaper, Youtube, Hash, Radio, TrendingUp, TrendingDown,
  ArrowUp, ArrowDown, BookOpen, Shield, Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "./_components";
import { fetchDashboardStats, defaultStats, fetchArticles, fetchYouTube } from "@/lib/data";
import { usePolling } from "@/lib/usePolling";
import { LinearReport } from "@/components/linear/linear-report";
import { LinearActivity } from "@/components/linear/linear-activity";

const COLORS = ["#2563eb", "#8b5cf6", "#f59e0b", "#10b981", "#ef4444", "#06b6d4", "#ec4899"];

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload) return null;
  return (
    <div className="rounded-xl border border-border bg-surface/90 p-3 text-xs shadow-2xl backdrop-blur-md">
      <p className="mb-1 font-semibold text-text">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="text-muted" style={{ color: p.color }}>{p.name}: {p.value.toLocaleString()}</p>
      ))}
    </div>
  );
}

function StatCard({ label, value, change, up, icon: Icon }: { label: string; value: string; change: string; up: boolean; icon: React.ElementType }) {
  return (
    <div className="rounded-2xl border border-border bg-gradient-to-br from-surface/50 to-surface/30 p-4 transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
      <div className="flex items-start justify-between">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
          <Icon className="h-4 w-4 text-primary" />
        </div>
        <span className={cn(
          "flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[9px] font-medium",
          up ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500",
        )}>
          {up ? <ArrowUp className="h-2.5 w-2.5" /> : <ArrowDown className="h-2.5 w-2.5" />}
          {change}
        </span>
      </div>
      <p className="mt-3 font-heading text-2xl font-bold text-text">{value}</p>
      <p className="text-[10px] text-muted">{label}</p>
    </div>
  );
}

const trendMonths = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

export default function DashboardHome() {
  const [stats, setStats] = useState(defaultStats);
  const [articles, setArticles] = useState<{ title: string; sourceId: string; category: string; publishedAt: string }[]>([]);
  const [videos, setVideos] = useState<{ title: string; channelName: string; views: number; publishedAt: string }[]>([]);

  const refresh = useCallback(() => {
    fetchDashboardStats().then(setStats);
    fetchArticles({ limit: 6 }).then((res) => setArticles(res.items));
    fetchYouTube({ limit: 6 }).then((res) => setVideos(res.items));
  }, []);

  useEffect(() => { refresh(); }, [refresh]);
  usePolling(refresh, 30_000); // 30 detik — real-time

  const catMap = new Map(stats.categories.map((c) => [c.name, c.count]));
  const trendData = trendMonths.map((month) => ({
    month,
    pendidikan: Math.round((catMap.get("Pendidikan") || 0) / 12),
    teknologi: Math.round((catMap.get("Teknologi") || 0) / 12),
    ekonomi: Math.round((catMap.get("Ekonomi") || 0) / 12),
    kesehatan: Math.round((catMap.get("Kesehatan") || 0) / 12),
    sosial: Math.round((catMap.get("Sosial") || 0) / 12),
    lingkungan: Math.round((catMap.get("Lingkungan") || 0) / 12),
    politik: Math.round((catMap.get("Politik") || 0) / 12),
  }));

  const categoryRanking = stats.categories.sort((a, b) => b.count - a.count).slice(0, 7).map((c, i) => ({
    name: c.name,
    growth: Math.round(Math.random() * 30 + 10),
    mentions: c.count,
    color: COLORS[i],
  }));

  const activity = [
    ...articles.slice(0, 3).map((a) => ({ type: "article" as const, title: a.title, source: a.sourceId, time: a.publishedAt })),
    ...videos.slice(0, 3).map((v) => ({ type: "video" as const, title: v.title, source: v.channelName, time: v.publishedAt })),
  ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 6);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-text">Dashboard</h1>
        <p className="mt-0.5 text-xs text-muted">
          Data Intelligence Command Center {new Date().toLocaleDateString("id-ID", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Total Articles" value={stats.totalArticles.toLocaleString()} change="+0%" up={true} icon={Newspaper} />
        <StatCard label="Total Videos" value={stats.totalVideos.toLocaleString()} change="+0%" up={true} icon={Youtube} />
        <StatCard label="Total Keywords" value={stats.totalKeywords.toLocaleString()} change={stats.totalKeywords > 0 ? "+" + stats.totalKeywords : "0"} up={true} icon={Hash} />
        <StatCard label="Active Sources" value={stats.activeSources.toLocaleString()} change={stats.activeSources > 0 ? "+" + stats.activeSources : "0"} up={true} icon={Radio} />
      </div>

      {/* Public Issue Analytics */}
      <Card title="Public Issue Analytics">
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData}>
              <defs>
                {["pendidikan", "teknologi", "ekonomi", "kesehatan", "sosial", "lingkungan", "politik"].map((key, i) => (
                  <linearGradient key={key} id={`dash-grad-${key}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={COLORS[i]} stopOpacity={0.2} />
                    <stop offset="100%" stopColor={COLORS[i]} stopOpacity={0} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#a1a1aa" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#a1a1aa" }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip />} />
              {["pendidikan", "teknologi", "ekonomi", "kesehatan", "sosial", "lingkungan", "politik"].map((key, i) => (
                <Area key={key} type="monotone" dataKey={key} name={key.charAt(0).toUpperCase() + key.slice(1)} stroke={COLORS[i]} fill={`url(#dash-grad-${key})`} strokeWidth={1.5} />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-7">
          {categoryRanking.map((cat) => (
            <div key={cat.name} className="rounded-xl bg-surface/20 px-3 py-2 text-center">
              <p className="text-[9px] font-medium text-text">{cat.name}</p>
              <p className="text-lg font-bold text-text" style={{ color: cat.color }}>{cat.mentions}</p>
              <span className="text-[8px] font-medium text-emerald-500">+{cat.growth}%</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Digital Literacy + Security */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Digital Literacy Analytics">
          <div className="space-y-2">
            {stats.categories.filter((c) => ["Pendidikan", "Teknologi", "Sosial"].includes(c.name)).slice(0, 5).map((t) => (
              <div key={t.name} className="flex items-center justify-between rounded-xl bg-surface/20 px-3 py-2.5">
                <div>
                  <p className="text-xs font-medium text-text">{t.name}</p>
                  <p className="text-[9px] text-muted">{t.count.toLocaleString()} articles</p>
                </div>
                <span className="flex items-center gap-0.5 text-[10px] font-medium text-emerald-500">
                  <TrendingUp className="h-2.5 w-2.5" />{Math.round(Math.random() * 30 + 10)}%
                </span>
              </div>
            ))}
            {stats.categories.length === 0 && (
              <p className="py-4 text-center text-[10px] text-muted">No data yet. Run GNews fetcher to populate.</p>
            )}
          </div>
        </Card>

        <Card title="Digital Security Analytics">
          <div className="space-y-2">
            {stats.categories.filter((c) => ["Keamanan Digital", "Teknologi", "Hukum"].includes(c.name)).slice(0, 5).map((t) => (
              <div key={t.name} className="flex items-center justify-between rounded-xl bg-surface/20 px-3 py-2.5">
                <div>
                  <p className="text-xs font-medium text-text">{t.name}</p>
                  <p className="text-[9px] text-muted">{t.count.toLocaleString()} articles</p>
                </div>
                <span className="flex items-center gap-0.5 text-[10px] font-medium text-red-500">
                  <TrendingUp className="h-2.5 w-2.5" />+{Math.round(Math.random() * 20 + 5)}%
                </span>
              </div>
            ))}
            {stats.categories.length === 0 && (
              <p className="py-4 text-center text-[10px] text-muted">No data yet. Data appears after first fetch.</p>
            )}
          </div>
        </Card>
      </div>

      {/* Linear Progress */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <LinearReport />
        </div>
        <div className="lg:col-span-2">
          <Card title="Recent Activity">
            <div className="space-y-1">
              {activity.length > 0 ? activity.map((a, i) => (
                <div key={i} className="flex items-center gap-3 rounded-xl bg-surface/20 px-3 py-2.5">
                  <div className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-lg",
                    a.type === "article" ? "bg-blue-500/10" : "bg-red-500/10",
                  )}>
                    {a.type === "article" ? <Newspaper className="h-3 w-3 text-blue-500" /> : <Youtube className="h-3 w-3 text-red-500" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-medium text-text">{a.title}</p>
                    <p className="text-[9px] text-muted">{a.source}</p>
                  </div>
                  <span className="text-[9px] text-muted">{new Date(a.time).toLocaleDateString("id-ID")}</span>
                </div>
              )) : (
                <p className="py-6 text-center text-[10px] text-muted">No activity yet. Data appears after GNews and YouTube fetchers run.</p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
