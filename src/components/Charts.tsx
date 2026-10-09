import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { cn } from "../utils/cn";
import {
  aggregateCustomers,
  aggregateRevenue,
  BEHAVIOR,
  BEHAVIOR_FACTS,
  BEVERAGE_IDS,
  fmtMoney,
  fmtNum,
  PEAK_HOURS,
  PRODUCTS,
  productStats,
  type Day,
  type Granularity,
} from "../lib/data";
import { useTheme } from "../lib/theme";

/* ------------------------- shared pieces --------------------------- */

function NeuTooltip({
  active,
  payload,
  label,
  money,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; unit?: string }>;
  label?: string;
  money?: boolean;
}) {
  const { palette } = useTheme();
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-xl px-3.5 py-2.5 text-xs shadow-xl"
      style={{
        background: palette.tooltipBg,
        border: `1px solid ${palette.tooltipBorder}`,
        color: palette.text,
      }}
    >
      <p className="mb-1 font-semibold">{label}</p>
      {payload.map((p) => (
        <p key={p.name} className="flex items-center justify-between gap-5 tabular-nums" style={{ color: palette.muted }}>
          <span>{p.name}</span>
          <span style={{ color: palette.text, fontWeight: 600 }}>
            {p.unit === "%"
              ? `${p.value.toFixed(1)}%`
              : money
                ? fmtMoney(p.value)
                : fmtNum(p.value)}
          </span>
        </p>
      ))}
    </div>
  );
}

export function PillGroup<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: { key: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  label: string;
}) {
  return (
    <div role="tablist" aria-label={label} className="neu-inset flex gap-1 rounded-full p-1">
      {options.map((o) => (
        <button
          key={o.key}
          role="tab"
          aria-selected={value === o.key}
          onClick={() => onChange(o.key)}
          className={cn(
            "rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all duration-200",
            value === o.key ? "pill-active" : "t3 hover:t1"
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function ChartCard({
  title,
  subtitle,
  right,
  children,
  delay = 0,
  className,
  id,
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
  delay?: number;
  className?: string;
  id?: string;
}) {
  return (
    <section
      id={id}
      className={cn("neu-card fade-up rounded-2xl p-5 sm:p-6", className)}
      style={{ animationDelay: `${delay}ms` }}
      aria-label={title}
    >
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold tracking-tight t1">{title}</h2>
          {subtitle && <p className="mt-0.5 text-xs t3">{subtitle}</p>}
        </div>
        {right}
      </div>
      {children}
    </section>
  );
}

const AXIS_FONT = { fontSize: 11 };

/* ------------------------- revenue chart --------------------------- */

export function RevenueChart({ days }: { days: Day[] }) {
  const { palette } = useTheme();
  const [gran, setGran] = useState<Granularity>("daily");
  const data = useMemo(() => {
    const d = aggregateRevenue(days, gran);
    // thin out dense daily labels
    return d;
  }, [days, gran]);

  const interval = Math.max(0, Math.ceil(data.length / 10) - 1);

  return (
    <ChartCard
      id="sales"
      title="Revenue Overview"
      subtitle="Gross revenue across the selected period"
      delay={80}
      right={
        <PillGroup
          label="Revenue granularity"
          value={gran}
          onChange={setGran}
          options={[
            { key: "daily", label: "Daily" },
            { key: "weekly", label: "Weekly" },
            { key: "monthly", label: "Monthly" },
          ]}
        />
      }
    >
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -8 }}>
            <defs>
              <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={palette.line} stopOpacity={0.16} />
                <stop offset="100%" stopColor={palette.line} stopOpacity={0.01} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke={palette.grid} strokeDasharray="3 6" vertical={false} />
            <XAxis
              dataKey="label"
              stroke={palette.axis}
              tick={{ ...AXIS_FONT, fill: palette.axis }}
              tickLine={false}
              axisLine={false}
              interval={interval}
            />
            <YAxis
              stroke={palette.axis}
              tick={{ ...AXIS_FONT, fill: palette.axis }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v: number) => (v >= 1000 ? `$${(v / 1000).toFixed(0)}k` : `$${v}`)}
            />
            <Tooltip content={<NeuTooltip money />} cursor={{ stroke: palette.axis, strokeDasharray: "3 3" }} />
            <Area
              type="monotone"
              dataKey="revenue"
              name="Revenue"
              stroke={palette.line}
              strokeWidth={2}
              fill="url(#revFill)"
              animationDuration={700}
              dot={false}
              activeDot={{ r: 4, fill: palette.line, stroke: palette.tooltipBg, strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}

/* ----------------------- beverage comparison ----------------------- */

export function BeverageChart({ days }: { days: Day[] }) {
  const { palette } = useTheme();
  const [metric, setMetric] = useState<"units" | "revenue">("units");

  const data = useMemo(() => {
    const stats = productStats(days);
    return BEVERAGE_IDS.map((id) => {
      const s = stats.find((x) => x.id === id)!;
      const name = PRODUCTS.find((p) => p.id === id)!.name.replace(" Latte", "");
      return { name: id === "matcha" ? "Matcha" : name, units: s.units, revenue: s.revenue };
    }).sort((a, b) => b[metric] - a[metric]);
  }, [days, metric]);

  return (
    <ChartCard
      title="Beverage Comparison"
      subtitle="Core drink lineup, sorted by performance"
      delay={140}
      right={
        <PillGroup
          label="Beverage metric"
          value={metric}
          onChange={setMetric}
          options={[
            { key: "units", label: "Units" },
            { key: "revenue", label: "Revenue" },
          ]}
        />
      }
    >
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -8 }}>
            <CartesianGrid stroke={palette.grid} strokeDasharray="3 6" vertical={false} />
            <XAxis
              dataKey="name"
              stroke={palette.axis}
              tick={{ ...AXIS_FONT, fill: palette.axis }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke={palette.axis}
              tick={{ ...AXIS_FONT, fill: palette.axis }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v: number) =>
                metric === "revenue" ? (v >= 1000 ? `$${(v / 1000).toFixed(0)}k` : `$${v}`) : `${v}`
              }
            />
            <Tooltip content={<NeuTooltip money={metric === "revenue"} />} cursor={{ fill: palette.cursor }} />
            <Bar
              dataKey={metric}
              name={metric === "units" ? "Units sold" : "Revenue"}
              radius={[8, 8, 0, 0]}
              animationDuration={700}
              maxBarSize={44}
            >
              {data.map((_, i) => (
                <Cell key={i} fill={palette.bars[Math.min(i, palette.bars.length - 1)]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}

/* --------------------- product performance ------------------------- */

export function ProductPerformanceChart({ days }: { days: Day[] }) {
  const { palette } = useTheme();
  const data = useMemo(
    () =>
      productStats(days)
        .sort((a, b) => b.units - a.units)
        .slice(0, 8)
        .map((s) => ({
          name: s.name.length > 12 ? s.name.slice(0, 11) + "…" : s.name,
          units: s.units,
          margin: +s.margin.toFixed(1),
        })),
    [days]
  );

  return (
    <ChartCard
      title="Product Performance"
      subtitle="Units sold vs. profit margin — top 8 products"
      delay={200}
    >
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 8, right: -6, bottom: 0, left: -8 }}>
            <CartesianGrid stroke={palette.grid} strokeDasharray="3 6" vertical={false} />
            <XAxis
              dataKey="name"
              stroke={palette.axis}
              tick={{ fontSize: 10, fill: palette.axis }}
              tickLine={false}
              axisLine={false}
              interval={0}
              angle={-18}
              textAnchor="end"
              height={46}
            />
            <YAxis
              yAxisId="units"
              stroke={palette.axis}
              tick={{ ...AXIS_FONT, fill: palette.axis }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              yAxisId="margin"
              orientation="right"
              domain={[0, 100]}
              stroke={palette.axis}
              tick={{ ...AXIS_FONT, fill: palette.axis }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v: number) => `${v}%`}
            />
            <Tooltip content={<NeuTooltip />} cursor={{ fill: palette.cursor }} />
            <Bar
              yAxisId="units"
              dataKey="units"
              name="Units sold"
              fill={palette.bars[2]}
              radius={[7, 7, 0, 0]}
              animationDuration={700}
              maxBarSize={34}
            />
            <Line
              yAxisId="margin"
              type="monotone"
              dataKey="margin"
              name="Profit margin"
              unit="%"
              stroke={palette.line}
              strokeWidth={2}
              dot={{ r: 3, fill: palette.line, strokeWidth: 0 }}
              activeDot={{ r: 4.5 }}
              animationDuration={700}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-3 flex items-center gap-5 text-[11px] t3">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm" style={{ background: palette.bars[2] }} /> Units sold
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-[2px] w-4 rounded-full" style={{ background: palette.line }} /> Profit margin
        </span>
      </div>
    </ChartCard>
  );
}

/* ----------------------- customer growth --------------------------- */

export function CustomerGrowthChart({ days }: { days: Day[] }) {
  const { palette } = useTheme();
  const data = useMemo(() => aggregateCustomers(days), [days]);

  return (
    <ChartCard
      id="customers"
      title="Customer Growth"
      subtitle="New vs. returning customers over time"
      delay={260}
    >
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -8 }}>
            <CartesianGrid stroke={palette.grid} strokeDasharray="3 6" vertical={false} />
            <XAxis
              dataKey="label"
              stroke={palette.axis}
              tick={{ ...AXIS_FONT, fill: palette.axis }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke={palette.axis}
              tick={{ ...AXIS_FONT, fill: palette.axis }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<NeuTooltip />} cursor={{ stroke: palette.axis, strokeDasharray: "3 3" }} />
            <Area
              type="monotone"
              dataKey="returning"
              name="Returning"
              stackId="c"
              stroke={palette.bars[3]}
              strokeWidth={1.6}
              fill={palette.areaFaint}
              animationDuration={700}
            />
            <Area
              type="monotone"
              dataKey="newC"
              name="New"
              stackId="c"
              stroke={palette.line}
              strokeWidth={2}
              fill={palette.area}
              animationDuration={700}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-3 flex items-center gap-5 text-[11px] t3">
        <span className="flex items-center gap-1.5">
          <span className="h-[2px] w-4 rounded-full" style={{ background: palette.line }} /> New customers
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-[2px] w-4 rounded-full" style={{ background: palette.bars[3] }} /> Returning
        </span>
      </div>
    </ChartCard>
  );
}

/* ------------------------- market trends --------------------------- */

export function MarketTrends() {
  const { palette } = useTheme();
  const peak = Math.max(...PEAK_HOURS.map((h) => h.orders));

  return (
    <ChartCard
      id="trends"
      title="Market Trends"
      subtitle="Purchasing behavior & peak business hours"
      delay={320}
    >
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Peak hours */}
        <div>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] t3">
            Orders by hour
          </h3>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={PEAK_HOURS} margin={{ top: 4, right: 4, bottom: 0, left: -18 }}>
                <CartesianGrid stroke={palette.grid} strokeDasharray="3 6" vertical={false} />
                <XAxis
                  dataKey="hour"
                  stroke={palette.axis}
                  tick={{ fontSize: 10, fill: palette.axis }}
                  tickLine={false}
                  axisLine={false}
                  interval={1}
                />
                <YAxis
                  stroke={palette.axis}
                  tick={{ fontSize: 10, fill: palette.axis }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip content={<NeuTooltip />} cursor={{ fill: palette.cursor }} />
                <Bar dataKey="orders" name="Avg. orders" radius={[5, 5, 0, 0]} animationDuration={700} maxBarSize={20}>
                  {PEAK_HOURS.map((h, i) => (
                    <Cell
                      key={i}
                      fill={h.orders === peak ? palette.line : palette.bars[3]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-2 text-[11px] t3">
            Peak hour: <span className="t1 font-semibold">8–9a</span> — staff up before the rush.
          </p>
        </div>

        {/* Purchasing behavior */}
        <div>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] t3">
            Purchasing behavior
          </h3>
          <div className="flex flex-col gap-4">
            {BEHAVIOR.map((b) => (
              <div key={b.label}>
                <div className="mb-1.5 flex items-baseline justify-between text-xs">
                  <span className="t2">{b.label}</span>
                  <span className="t1 font-semibold tabular-nums">{b.value}%</span>
                </div>
                <div className="bar-track h-2.5 w-full" role="img" aria-label={`${b.label}: ${b.value}% of orders`}>
                  <div className="bar-fill" style={{ width: `${b.value}%` }} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3">
            {BEHAVIOR_FACTS.map((f) => (
              <div key={f.k} className="neu-inset rounded-xl px-3.5 py-3">
                <p className="text-lg font-bold t1 tabular-nums">{f.v}</p>
                <p className="mt-0.5 text-[11px] t3">{f.k}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ChartCard>
  );
}
