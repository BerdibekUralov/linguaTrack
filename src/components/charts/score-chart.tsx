"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface ScoreChartProps {
  data: { range: string; count: number }[];
}

export function ScoreChart({ data }: ScoreChartProps) {
  return (
    <div
      className="rounded-2xl p-6 shadow-sm"
      style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
    >
      <h3 className="mb-4 text-sm font-semibold" style={{ color: "var(--text-2)" }}>Score distribution</h3>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis dataKey="range" tick={{ fontSize: 11, fill: "var(--text-3)" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 12, fill: "var(--text-3)" }} axisLine={false} tickLine={false} allowDecimals={false} />
          <Tooltip
            contentStyle={{
              borderRadius: 12,
              border: "1px solid var(--border)",
              background: "var(--surface)",
              color: "var(--text)",
              boxShadow: "var(--shadow)",
            }}
            cursor={{ fill: "var(--surface-2)" }}
          />
          <Bar dataKey="count" name="Students" fill="var(--success)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
