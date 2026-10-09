import { useMemo } from "react";
import { Area, AreaChart, ResponsiveContainer } from "recharts";
import { pctChange, totals, type Day } from "../lib/data";
import { useCountUp, useTheme } from "../lib/theme";
import { IconArrowDown, IconArrowUp } from "./Icons";

interface KpiDef {
  label: string;
  value: number;
  prev: number;
  format: (n: number) => string;
  spark: number[];
}

function Sparkline({ data }: { data: number[] }) {
  const { palette } = useTheme();
  const chartData = useMemo(() => data.map((v, i) => ({ i, v })), [data]);
  return (
    <div className="h-10 w-full" aria-hidden="true">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
          <Area
            type="monotone"
            dataKey="v"
            stroke={palette.line}
            strokeWidth={1.4}
            fill={palette.area}
            isAnimationActive
            animationDuration={900}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function KpiCard({ kpi, index }: { kpi: KpiDef; index: number }) {
  const animated = useCountUp(kpi.value);
  const change = pctChange(kpi.value, kpi.prev);
  const up = change >= 0;

  return (
    <article
      className="neu-card neu-card-hover fade-up flex flex-col gap-3 rounded-2xl p-5"
      style={{ animationDelay: `${120 + index * 80}ms` }}
    >
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] t3">{kpi.label}</h3>
        <span
          className="neu-inset flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold t1"
          title={`${up ? "Up" : "Down"} ${Math.abs(change).toFixed(1)}% vs previous period`}
        >
          {up ? <IconArrowUp size={11} /> : <IconArrowDown size={11} />}
          {Math.abs(change).toFixed(1)}%
        </span>
      </div>

      <p className="text-[26px] font-bold leading-none tracking-tight t1 tabular-nums">
        {kpi.format(animated)}
      </p>

      <p className="text-[11px] t3">
        vs <span className="t2 font-medium">{kpi.format(kpi.prev)}</span> previous period
      </p>

      <Sparkline data={kpi.spark} />
    </article>
  );
}

export default function Kpis({ days, prevDays }: { days: Day[]; prevDays: Day[] }) {
  const kpis = useMemo<KpiDef[]>(() => {
    const cur = totals(days);
    const prev = totals(prevDays);
    const overheadPerDay = 410;
    return [
      {
        label: "Total Revenue",
        value: cur.revenue,
        prev: prev.revenue,
        format: (n) => "$" + Math.round(n).toLocaleString("en-US"),
        spark: days.map((d) => d.revenue),
      },
      {
        label: "Total Orders",
        value: cur.orders,
        prev: prev.orders,
        format: (n) => Math.round(n).toLocaleString("en-US"),
        spark: days.map((d) => d.orders),
      },
      {
        label: "Avg. Order Value",
        value: cur.aov,
        prev: prev.aov,
        format: (n) => "$" + n.toFixed(2),
        spark: days.map((d) => (d.orders ? d.revenue / d.orders : 0)),
      },
      {
        label: "Net Profit",
        value: cur.profit,
        prev: prev.profit,
        format: (n) => "$" + Math.round(n).toLocaleString("en-US"),
        spark: days.map((d) => d.revenue - d.cost - overheadPerDay),
      },
      {
        label: "Customer Growth",
        value: cur.newCustomers,
        prev: prev.newCustomers,
        format: (n) => "+" + Math.round(n).toLocaleString("en-US"),
        spark: days.map((d) => d.newCustomers),
      },
    ];
  }, [days, prevDays]);

  return (
    <section aria-label="Key performance indicators" className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-5">
      {kpis.map((k, i) => (
        <KpiCard key={k.label} kpi={k} index={i} />
      ))}
    </section>
  );
}
