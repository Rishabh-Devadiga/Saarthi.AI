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
    <section className="h-full min-h-72 rounded-md border border-white/[0.08] bg-[#1A2235] p-5 shadow-sm sm:p-6">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-md bg-gradient-to-br from-violet-500 to-blue-500 text-white">
          <CalendarDays className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <h2 className="font-bold text-white">Weekly Learning Activity</h2>
          <p className="mt-0.5 text-xs text-slate-400">
            Example activity until history is available
          </p>
        </div>
      </div>

      <div className="mt-5 h-44">
        <ResponsiveContainer height="100%" width="100%">
          <BarChart data={activity}>
            <XAxis
              axisLine={false}
              dataKey="day"
              tick={{ fill: "#94a3b8", fontSize: 11 }}
              tickLine={false}
            />
            <YAxis hide domain={[0, 60]} />
            <Tooltip
              contentStyle={{
                background: "#111827",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 8,
                color: "#fff",
              }}
              cursor={{ fill: "rgba(255,255,255,0.03)" }}
              formatter={(value) => [`${String(value)} min`, "Learning"]}
            />
            <Bar
              dataKey="minutes"
              fill="#6366f1"
              maxBarSize={28}
              radius={[5, 5, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
