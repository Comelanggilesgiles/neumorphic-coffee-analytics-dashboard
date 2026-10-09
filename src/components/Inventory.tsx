import { useState } from "react";
import { cn } from "../utils/cn";
import {
  INSIGHTS,
  INVENTORY,
  stockStatus,
  type InventoryItem,
  type StockStatus,
} from "../lib/data";
import { IconSpark, IconBox } from "./Icons";

const STATUS_META: Record<StockStatus, { label: string; cls: string }> = {
  critical: { label: "Reorder now", cls: "font-bold" },
  low: { label: "Low stock", cls: "font-semibold" },
  healthy: { label: "Healthy", cls: "" },
};

function StatusBadge({ status }: { status: StockStatus }) {
  const meta = STATUS_META[status];
  return (
    <span
      className={cn(
        "rounded-full px-2.5 py-1 text-[10px] uppercase tracking-wider",
        meta.cls,
        status === "critical" ? "pill-active" : "neu-inset t2"
      )}
    >
      {meta.label}
    </span>
  );
}

function InventoryCard({ item, index }: { item: InventoryItem; index: number }) {
  const { status, daysLeft } = stockStatus(item);
  const pct = Math.min(100, (item.stock / item.capacity) * 100);

  return (
    <article
      className="neu-card neu-card-hover fade-up flex flex-col gap-3 rounded-2xl p-5"
      style={{ animationDelay: `${440 + index * 50}ms` }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-bold t1">{item.name}</h3>
          <p className="mt-0.5 truncate text-[11px] t3">{item.detail}</p>
        </div>
        <StatusBadge status={status} />
      </div>

      <div>
        <div className="mb-1.5 flex items-baseline justify-between text-xs">
          <span className="t2 tabular-nums">
            {item.stock.toLocaleString()} / {item.capacity.toLocaleString()} {item.unit}
          </span>
          <span className="t3 tabular-nums">{pct.toFixed(0)}%</span>
        </div>
        <div
          className="bar-track h-2.5 w-full"
          role="progressbar"
          aria-valuenow={Math.round(pct)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${item.name} stock level`}
        >
          <div
            className="bar-fill"
            style={{ width: `${pct}%`, opacity: status === "healthy" ? 1 : 0.85 }}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="neu-inset rounded-xl px-1 py-2">
          <p className="text-sm font-bold t1 tabular-nums">{daysLeft}d</p>
          <p className="text-[9px] uppercase tracking-wider t3">Cover</p>
        </div>
        <div className="neu-inset rounded-xl px-1 py-2">
          <p className="text-sm font-bold t1 tabular-nums">
            {item.dailyUse >= 10 ? Math.round(item.dailyUse) : item.dailyUse}
          </p>
          <p className="text-[9px] uppercase tracking-wider t3">Use/day</p>
        </div>
        <div className="neu-inset rounded-xl px-1 py-2">
          <p className="text-sm font-bold t1 tabular-nums">
            ${item.costPerUnit < 1 ? item.costPerUnit.toFixed(2) : item.costPerUnit.toFixed(1)}
          </p>
          <p className="text-[9px] uppercase tracking-wider t3">Cost/{item.unit}</p>
        </div>
      </div>

      {status !== "healthy" && (
        <p className="text-[11px] leading-relaxed t2">
          <span className="font-semibold t1">Suggestion:</span> reorder{" "}
          {Math.ceil((item.capacity - item.stock) * 0.8).toLocaleString()} {item.unit} within{" "}
          {Math.max(1, daysLeft - 2)} days to avoid a stock-out.
        </p>
      )}
    </article>
  );
}

export function InventorySection() {
  const [showAll, setShowAll] = useState(false);
  const items = showAll ? INVENTORY : INVENTORY.slice(0, 6);
  const lowCount = INVENTORY.filter((i) => stockStatus(i).status !== "healthy").length;

  return (
    <section id="inventory" aria-label="Inventory" className="fade-up" style={{ animationDelay: "420ms" }}>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="neu-raised-sm flex h-10 w-10 items-center justify-center rounded-2xl t1">
            <IconBox size={18} />
          </div>
          <div>
            <h2 className="text-base font-bold tracking-tight t1">Inventory &amp; Supplies</h2>
            <p className="text-xs t3">
              {INVENTORY.length} tracked items ·{" "}
              <span className="t1 font-semibold">{lowCount} need attention</span>
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowAll((v) => !v)}
          data-pressed={showAll}
          className="neu-btn rounded-full px-4 py-2 text-xs font-semibold t1"
        >
          {showAll ? "Show less" : `Show all ${INVENTORY.length}`}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((item, i) => (
          <InventoryCard key={item.name} item={item} index={i} />
        ))}
      </div>
    </section>
  );
}

export function InsightsPanel() {
  return (
    <section
      id="reports"
      aria-label="AI business insights"
      className="neu-card fade-up rounded-2xl p-5 sm:p-6"
      style={{ animationDelay: "480ms" }}
    >
      <div className="mb-5 flex items-center gap-3">
        <div className="neu-raised-sm flex h-10 w-10 items-center justify-center rounded-2xl t1">
          <IconSpark size={18} />
        </div>
        <div>
          <h2 className="text-base font-bold tracking-tight t1">AI Business Insights</h2>
          <p className="text-xs t3">Auto-generated from the last 90 days of sales &amp; inventory data</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {INSIGHTS.map((ins) => (
          <article key={ins.title} className="neu-inset flex flex-col gap-2 rounded-2xl p-4">
            <span className="pill-active self-start rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider">
              {ins.tag}
            </span>
            <h3 className="text-sm font-bold leading-snug t1">{ins.title}</h3>
            <p className="text-xs leading-relaxed t2">{ins.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
