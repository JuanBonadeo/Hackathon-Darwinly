'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { ExternalLink, Github } from "lucide-react"
import type { GitHubData } from "@/lib/apis/github"

interface GitHubActivityProps {
  data: GitHubData
}

function formatStars(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`
  return n.toString()
}

export function GitHubActivity({ data }: GitHubActivityProps) {
  const { repo, starHistory } = data

  // Use year as label — show only unique years to avoid clutter
  const seenYears = new Set<string>()
  const chartData = starHistory.map((point) => {
    const year = point.date.slice(0, 4)
    const label = seenYears.has(year) ? "" : year
    seenYears.add(year)
    return { ...point, label }
  })

  return (
    <Card className="border-purple-500/20 bg-purple-900/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Github className="h-5 w-5" />
          Star History
        </CardTitle>
        <CardDescription>Cumulative GitHub stars over time</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">

        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="label" stroke="#9CA3AF" tick={{ fontSize: 11 }} />
            <YAxis
              stroke="#9CA3AF"
              tick={{ fontSize: 11 }}
              tickFormatter={formatStars}
            />
            <Tooltip
              contentStyle={{ backgroundColor: "#1F2937", border: "1px solid #374151" }}
              labelStyle={{ color: "#F3F4F6" }}
              formatter={(v: number) => [formatStars(v), "stars"]}
              labelFormatter={(_, payload) => payload?.[0]?.payload?.date ?? ""}
            />
            <Area
              type="monotone"
              dataKey="stars"
              stroke="#8B5CF6"
              fill="#8B5CF6"
              fillOpacity={0.3}
            />
          </AreaChart>
        </ResponsiveContainer>

        <div className="flex gap-6 text-sm text-muted-foreground">
          <span>
            Stars:{" "}
            <span className="font-bold text-foreground">{repo.stars.toLocaleString()}</span>
          </span>
          {repo.forks > 0 && (
            <span>
              Forks:{" "}
              <span className="font-bold text-foreground">{repo.forks.toLocaleString()}</span>
            </span>
          )}
          {repo.language && (
            <span>
              Lang:{" "}
              <span className="font-bold text-foreground">{repo.language}</span>
            </span>
          )}
        </div>

        <div className="border rounded-lg p-3 bg-card">
          <p className="text-xs text-muted-foreground mb-1">Repository</p>
          <a
            href={repo.url}
            target="_blank"
            rel="noreferrer"
            className="font-semibold text-sm text-primary hover:underline flex items-center gap-1"
          >
            📦 {repo.fullName}
            <ExternalLink className="h-3 w-3" />
          </a>
          {repo.description && (
            <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{repo.description}</p>
          )}
        </div>

      </CardContent>
    </Card>
  )
}
