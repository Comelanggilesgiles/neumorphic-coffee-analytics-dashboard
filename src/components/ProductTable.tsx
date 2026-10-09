import { useEffect, useMemo, useState } from "react";
import { cn } from "../utils/cn";
import {
  CATEGORIES,
  fmtMoney,
  fmtNum,
  productStats,
  RANGE_OPTIONS,
  type Day,
  type ProductStat,
  type RangeKey,
} from "../lib/data";
import { IconSearch, IconArrowUp, IconArrowDown, IconSort, IconCalendar } from "./Icons";

type SortKey = keyof Pick<
  ProductStat,
  "name" | "category" | "units" | "revenue" | "costs" | "profit" | "margin"
>;

const COLUMNS: { key: SortKey; label: string; numeric?: boolean }[] = [
  { key: "name", label: "Product" },
  { key: "category", label: "Category" },
  { key: "units", label: "Units Sold", numeric: true },
  { key: "revenue", label: "Revenue", numeric: true },
  { key: "costs", label: "Costs", numeric: true },
  { key: "profit", label: "Profit", numeric: true },
  { key: "margin", label: "Margin", numeric: true },
];

const PAGE_SIZE = 6;

interface Props {
  days: Day[];
  range: RangeKey;
  onRangeChange: (r: RangeKey) => void;
  globalSearch: string;
}

export default function ProductTable({ days, range, onRangeChange, globalSearch }: Props) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("All");
  const [sortKey, setSortKey] = useState<SortKey>("revenue");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(0);

  // global header search also narrows the table
  useEffect(() => setQuery(globalSearch), [globalSearch]);
  useEffect(() => setPage(0), [query, category, range]);

  const rows = useMemo(() => {
    let data = productStats(days);
    const q = query.trim().toLowerCase();
    if (q) data = data.filter((r) => r.name.toLowerCase().includes(q) || r.category.toLowerCase().includes(q));
    if (category !== "All") data = data.filter((r) => r.category === category);
    data.sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      const cmp = typeof av === "string" ? av.localeCompare(bv as string) : (av as number) - (bv as number);
      return sortDir === "asc" ? cmp : -cmp;
    });
    return data;
  }, [days, query, category, sortKey, sortDir]);

  const pageCount = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount - 1);
  const visible = rows.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE);
  const maxMargin = Math.max(...rows.map((r) => r.margin), 1);

  const toggleSort = (key: SortKey) => {
    if (key === sortKey) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir(key === "name" || key === "category" ? "asc" : "desc");
    }
  };

  return (
    <section
      id="products"
      aria-label="Product performance table"
      className="neu-card fade-up rounded-2xl p-5 sm:p-6"
      style={{ animationDelay: "380ms" }}
    >
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold tracking-tight t1">Product Performance</h2>
          <p className="mt-0.5 text-xs t3">
            {rows.length} products · {RANGE_OPTIONS.find((r) => r.key === range)!.label.toLowerCase()}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* table search */}
          <label className="neu-input flex h-9 items-center gap-2 rounded-full px-3.5">
            <span className="t3"><IconSearch size={14} /></span>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter products…"
              aria-label="Filter products"
              className="w-36 bg-transparent text-xs t1 focus:outline-none sm:w-44"
            />
          </label>

          {/* date filter */}
          <label className="neu-inset flex h-9 items-center gap-2 rounded-full px-3 text-xs t2">
            <IconCalendar size={13} />
            <select
              value={range}
              onChange={(e) => onRangeChange(e.target.value as RangeKey)}
              aria-label="Table date range"
              className="bg-transparent text-xs font-medium t1 focus:outline-none"
              style={{ colorScheme: "inherit" }}
            >
              {RANGE_OPTIONS.map((o) => (
                <option key={o.key} value={o.key} style={{ background: "var(--surface)", color: "var(--text-1)" }}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {/* category pills */}
      <div className="mb-4 flex flex-wrap gap-2" role="group" aria-label="Category filter">
        {["All", ...CATEGORIES].map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            aria-pressed={category === c}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all duration-200",
              category === c ? "pill-active" : "neu-btn t2"
            )}
          >
            {c}
          </button>
        ))}
      </div>

      {/* table */}
      <div className="neu-inset overflow-x-auto rounded-2xl">
        <table className="w-full min-w-[720px] border-collapse text-sm">
          <thead>
            <tr style={{ borderBottom: "1px solid var(--line)" }}>
              {COLUMNS.map((col) => {
                const active = col.key === sortKey;
                return (
                  <th
                    key={col.key}
                    scope="col"
                    aria-sort={active ? (sortDir === "asc" ? "ascending" : "descending") : "none"}
                    className={cn("px-4 py-3 text-[11px] font-semibold uppercase tracking-wider t3", col.numeric ? "text-right" : "text-left")}
                  >
                    <button
                      onClick={() => toggleSort(col.key)}
                      className={cn(
                        "inline-flex items-center gap-1 transition-colors hover:t1",
                        active && "t1",
                        col.numeric && "flex-row-reverse"
                      )}
                    >
                      {col.label}
                      <span className="opacity-70">
                        {active ? (
                          sortDir === "asc" ? <IconArrowUp size={11} /> : <IconArrowDown size={11} />
                        ) : (
                          <IconSort size={11} />
                        )}
                      </span>
                    </button>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {visible.map((r) => (
              <tr key={r.id} className="row-hover" style={{ borderBottom: "1px solid var(--line)" }}>
                <td className="px-4 py-3.5 font-semibold t1">{r.name}</td>
                <td className="px-4 py-3.5">
                  <span className="neu-raised-sm rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider t2">
                    {r.category}
                  </span>
                </td>
                <td className="px-4 py-3.5 text-right tabular-nums t2">{fmtNum(r.units)}</td>
                <td className="px-4 py-3.5 text-right font-semibold tabular-nums t1">{fmtMoney(r.revenue)}</td>
                <td className="px-4 py-3.5 text-right tabular-nums t2">{fmtMoney(r.costs)}</td>
                <td className="px-4 py-3.5 text-right font-semibold tabular-nums t1">{fmtMoney(r.profit)}</td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center justify-end gap-2.5">
                    <div className="bar-track h-1.5 w-14" aria-hidden="true">
                      <div className="bar-fill" style={{ width: `${(r.margin / maxMargin) * 100}%` }} />
                    </div>
                    <span className="w-11 text-right text-xs font-semibold tabular-nums t1">
                      {r.margin.toFixed(1)}%
                    </span>
                  </div>
                </td>
              </tr>
            ))}
            {visible.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-sm t3">
                  No products match “{query}”.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* pagination */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs t3">
          Showing{" "}
          <span className="t1 font-semibold">
            {rows.length === 0 ? 0 : safePage * PAGE_SIZE + 1}–{Math.min(rows.length, (safePage + 1) * PAGE_SIZE)}
          </span>{" "}
          of <span className="t1 font-semibold">{rows.length}</span>
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={safePage === 0}
            className="neu-btn rounded-full px-4 py-2 text-xs font-semibold t1 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Previous
          </button>
          {Array.from({ length: pageCount }, (_, i) => (
            <button
              key={i}
              onClick={() => setPage(i)}
              aria-label={`Page ${i + 1}`}
              aria-current={i === safePage ? "page" : undefined}
              className={cn(
                "h-8 w-8 rounded-full text-xs font-semibold transition-all",
                i === safePage ? "pill-active" : "neu-btn t2"
              )}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
            disabled={safePage >= pageCount - 1}
            className="neu-btn rounded-full px-4 py-2 text-xs font-semibold t1 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
    </section>
  );
}
