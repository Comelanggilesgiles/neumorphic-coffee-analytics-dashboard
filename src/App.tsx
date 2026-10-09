import { useEffect, useMemo, useState } from "react";
import { ThemeProvider, useTheme } from "./lib/theme";
import {
  prevRangeDays,
  productStats,
  rangeDays,
  RANGE_OPTIONS,
  type RangeKey,
} from "./lib/data";
import Sidebar, { NAV_ITEMS } from "./components/Sidebar";
import Header from "./components/Header";
import Kpis from "./components/Kpis";
import {
  BeverageChart,
  CustomerGrowthChart,
  MarketTrends,
  ProductPerformanceChart,
  RevenueChart,
} from "./components/Charts";
import ProductTable from "./components/ProductTable";
import { InsightsPanel, InventorySection } from "./components/Inventory";
import { IconDoc, IconMoon, IconSun } from "./components/Icons";

/* ----------------------------- skeleton ----------------------------- */

function Skeleton() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true" aria-label="Loading dashboard">
      <div className="flex items-center gap-4">
        <div className="skeleton h-10 w-64" />
        <div className="ml-auto skeleton h-11 w-40 rounded-full" />
        <div className="skeleton h-11 w-11 rounded-full" />
      </div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-5">
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="skeleton h-40" style={{ animationDelay: `${i * 120}ms` }} />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="skeleton h-80" />
        <div className="skeleton h-80" style={{ animationDelay: "200ms" }} />
      </div>
      <div className="skeleton h-72" style={{ animationDelay: "350ms" }} />
    </div>
  );
}

/* ----------------------------- settings ----------------------------- */

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      className="neu-inset relative h-7 w-13 rounded-full transition-all"
      style={{ width: 52 }}
    >
      <span
        className="pill-active absolute top-1 flex h-5 w-5 items-center justify-center rounded-full transition-all duration-300"
        style={{ left: checked ? 26 : 4 }}
      />
    </button>
  );
}

function SettingsSection({
  collapsed,
  onToggleCollapse,
  range,
}: {
  collapsed: boolean;
  onToggleCollapse: () => void;
  range: RangeKey;
}) {
  const { theme, toggle } = useTheme();
  const [exported, setExported] = useState(false);

  const exportCsv = () => {
    const days = rangeDays(range);
    const stats = productStats(days);
    const header = "Product,Category,Units Sold,Revenue,Costs,Profit,Margin %";
    const lines = stats.map(
      (s) => `${s.name},${s.category},${s.units},${s.revenue},${s.costs},${s.profit},${s.margin.toFixed(1)}`
    );
    const blob = new Blob([header + "\n" + lines.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `beanora-report-${range}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setExported(true);
    setTimeout(() => setExported(false), 2500);
  };

  return (
    <section
      id="settings"
      aria-label="Settings"
      className="neu-card fade-up rounded-2xl p-5 sm:p-6"
      style={{ animationDelay: "520ms" }}
    >
      <h2 className="text-base font-bold tracking-tight t1">Settings &amp; Reports</h2>
      <p className="mt-0.5 text-xs t3">Workspace preferences and data exports</p>

      <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="neu-inset flex items-center justify-between gap-3 rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <span className="t1">{theme === "dark" ? <IconMoon size={18} /> : <IconSun size={18} />}</span>
            <div>
              <p className="text-sm font-semibold t1">Warm ivory theme</p>
              <p className="text-[11px] t3">Switch between ivory &amp; forest green</p>
            </div>
          </div>
          <Toggle checked={theme === "light"} onChange={toggle} label="Toggle light theme" />
        </div>

        <div className="neu-inset flex items-center justify-between gap-3 rounded-2xl p-4">
          <div>
            <p className="text-sm font-semibold t1">Compact sidebar</p>
            <p className="text-[11px] t3">Collapse navigation to icons</p>
          </div>
          <Toggle checked={collapsed} onChange={onToggleCollapse} label="Toggle compact sidebar" />
        </div>

        <button
          onClick={exportCsv}
          className="neu-btn flex items-center justify-between gap-3 rounded-2xl p-4 text-left"
        >
          <div className="flex items-center gap-3">
            <span className="t1"><IconDoc size={18} /></span>
            <div>
              <p className="text-sm font-semibold t1">
                {exported ? "Report downloaded ✓" : "Export CSV report"}
              </p>
              <p className="text-[11px] t3">
                Product performance · {RANGE_OPTIONS.find((r) => r.key === range)!.label.toLowerCase()}
              </p>
            </div>
          </div>
        </button>
      </div>
    </section>
  );
}

/* ------------------------------- shell ------------------------------ */

function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [active, setActive] = useState("overview");
  const [range, setRange] = useState<RangeKey>("30d");
  const [search, setSearch] = useState("");

  const days = useMemo(() => rangeDays(range), [range]);
  const prev = useMemo(() => prevRangeDays(range), [range]);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 850);
    return () => clearTimeout(t);
  }, []);

  // scroll spy
  useEffect(() => {
    if (loading) return;
    const ids = NAV_ITEMS.map((n) => n.id);
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setActive(e.target.id);
        }
      },
      { rootMargin: "-25% 0px -60% 0px" }
    );
    for (const id of ids) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [loading]);

  const navigate = (id: string) => {
    setActive(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((v) => !v)}
        active={active}
        onNavigate={navigate}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-[1400px] flex-col gap-6">
          {loading ? (
            <Skeleton />
          ) : (
            <>
              <Header
                range={range}
                onRangeChange={setRange}
                search={search}
                onSearchChange={setSearch}
                onOpenMobileNav={() => setMobileOpen(true)}
              />

              <div id="overview" className="scroll-mt-6">
                <Kpis days={days} prevDays={prev} />
              </div>

              <div className="scroll-mt-6">
                <RevenueChart days={days} />
              </div>

              <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                <BeverageChart days={days} />
                <ProductPerformanceChart days={days} />
              </div>

              <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                <CustomerGrowthChart days={days} />
                <MarketTrends />
              </div>

              <ProductTable
                days={days}
                range={range}
                onRangeChange={setRange}
                globalSearch={search}
              />

              <InventorySection />

              <InsightsPanel />

              <SettingsSection
                collapsed={collapsed}
                onToggleCollapse={() => setCollapsed((v) => !v)}
                range={range}
              />

              <footer className="fade-up flex flex-wrap items-center justify-between gap-2 pb-4 pt-2 text-[11px] t3" style={{ animationDelay: "560ms" }}>
                <p>
                  © 2026 <span className="taccent font-semibold">Beanora</span> Market Intelligence — all data is simulated.
                </p>
                <p>Good coffee brings better days.</p>
              </footer>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <Dashboard />
    </ThemeProvider>
  );
}
