import { CalendarDays } from "lucide-react";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const activity = [
  { day: "Mon", minutes: 25 },
  { day: "Tue", minutes: 40 },
  { day: "Wed", minutes: 55 },
  { day: "Thu", minutes: 30 },
  { day: "Fri", minutes: 15 },
  { day: "Sat", minutes: 50 },
  { day: "Sun", minutes: 0 },
];

export function WeeklyActivity() {
  return (
    <section className="l-card h-full p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="l-readout">weekly activity</p>
          <h2 className="mt-2">Study Habits</h2>
        </div>
        <CalendarDays
          className="mt-1 h-4 w-4 shrink-0 text-muted"
          aria-hidden="true"
        />
      </div>

      <div className="mt-5 h-44">
        <ResponsiveContainer height="100%" width="100%">
          <BarChart data={activity}>
            <XAxis
              axisLine={false}
              dataKey="day"
              stroke="var(--color-rule)"
              tick={{ fontSize: 11 }}
              tickLine={false}
            />
            <YAxis hide domain={[0, 60]} />
            <Tooltip
              contentStyle={{
                background: "var(--color-paper-3)",
                border: "var(--rule-hair) solid var(--color-rule-2)",
                borderRadius: "8px",
                color: "var(--color-ink)",
                fontSize: "12px",
                fontFamily: "var(--font-outlier)",
              }}
              cursor={{
                fill: "color-mix(in oklab, var(--color-accent) 10%, transparent)",
              }}
              formatter={(value) => [`${String(value)} min`, "learning"]}
            />
            <Bar dataKey="minutes" maxBarSize={18} radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <p className="l-caption mt-4">
        Example activity until history is available.
      </p>
    </section>
  );
}
