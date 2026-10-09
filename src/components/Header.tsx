import { useEffect, useRef, useState } from "react";
import { cn } from "../utils/cn";
import { RANGE_OPTIONS, type RangeKey } from "../lib/data";
import { useTheme } from "../lib/theme";
import {
  IconSearch,
  IconBell,
  IconCalendar,
  IconChevron,
  IconMenu,
  IconSun,
  IconMoon,
} from "./Icons";

interface Props {
  range: RangeKey;
  onRangeChange: (r: RangeKey) => void;
  search: string;
  onSearchChange: (s: string) => void;
  onOpenMobileNav: () => void;
}

const NOTIFICATIONS = [
  { title: "Low stock: 16oz Cups", body: "Under 5 days of cover remaining.", time: "12m ago" },
  { title: "Vanilla Syrup reorder suggested", body: "Projected stock-out in 6 days.", time: "1h ago" },
  { title: "Weekly report ready", body: "Sales summary for last week is available.", time: "3h ago" },
];

export default function Header({ range, onRangeChange, search, onSearchChange, onOpenMobileNav }: Props) {
  const { theme, toggle } = useTheme();
  const [rangeOpen, setRangeOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [unread, setUnread] = useState(true);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setRangeOpen(false);
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const currentRange = RANGE_OPTIONS.find((r) => r.key === range)!;

  return (
    <header ref={wrapRef} className="fade-up flex flex-wrap items-center gap-3 lg:gap-4">
      {/* Mobile hamburger */}
      <button
        onClick={onOpenMobileNav}
        className="neu-btn flex h-11 w-11 items-center justify-center rounded-xl t1 lg:hidden"
        aria-label="Open navigation"
      >
        <IconMenu size={18} />
      </button>

      {/* Welcome */}
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-xl font-bold tracking-tight t1 sm:text-2xl">
          Good morning, Amelia ☕
        </h1>
        <p className="mt-0.5 hidden text-xs t2 sm:block">
          Here&apos;s how <span className="taccent font-semibold">Beanora</span> is performing — {currentRange.label.toLowerCase()}.
        </p>
      </div>

      {/* Global search */}
      <label className="neu-input relative hidden h-11 w-56 items-center gap-2 rounded-full px-4 md:flex xl:w-72">
        <span className="t3">
          <IconSearch size={16} />
        </span>
        <input
          type="search"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search products, insights…"
          aria-label="Global search"
          className="w-full bg-transparent text-sm t1 placeholder:t3 focus:outline-none"
        />
      </label>

      {/* Date range */}
      <div className="relative">
        <button
          onClick={() => {
            setRangeOpen((v) => !v);
            setNotifOpen(false);
          }}
          data-pressed={rangeOpen}
          aria-expanded={rangeOpen}
          aria-haspopup="listbox"
          className="neu-btn flex h-11 items-center gap-2 rounded-full px-4 text-sm font-medium t1"
        >
          <IconCalendar size={15} />
          <span className="hidden sm:inline">{currentRange.label}</span>
          <span className="sm:hidden">{currentRange.key.toUpperCase()}</span>
          <span
            className="t3 transition-transform duration-200"
            style={{ transform: rangeOpen ? "rotate(180deg)" : "none" }}
          >
            <IconChevron size={14} />
          </span>
        </button>
        {rangeOpen && (
          <ul
            role="listbox"
            aria-label="Date range"
            className="neu-card absolute right-0 top-[52px] z-40 w-44 overflow-hidden rounded-2xl p-1.5"
          >
            {RANGE_OPTIONS.map((opt) => (
              <li key={opt.key}>
                <button
                  role="option"
                  aria-selected={opt.key === range}
                  onClick={() => {
                    onRangeChange(opt.key);
                    setRangeOpen(false);
                  }}
                  className={cn(
                    "w-full rounded-xl px-3 py-2 text-left text-sm transition-colors",
                    opt.key === range ? "neu-inset t1 font-semibold" : "t2 hover:t1"
                  )}
                >
                  {opt.label}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Theme toggle */}
      <button
        onClick={toggle}
        className="neu-btn flex h-11 w-11 items-center justify-center rounded-full t1"
        aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
      >
        {theme === "dark" ? <IconSun size={17} /> : <IconMoon size={17} />}
      </button>

      {/* Notifications */}
      <div className="relative">
        <button
          onClick={() => {
            setNotifOpen((v) => !v);
            setRangeOpen(false);
            setUnread(false);
          }}
          data-pressed={notifOpen}
          aria-expanded={notifOpen}
          className="neu-btn relative flex h-11 w-11 items-center justify-center rounded-full t1"
          aria-label="Notifications"
        >
          <IconBell size={17} />
          {unread && (
            <span
              className="absolute right-3 top-3 h-1.5 w-1.5 rounded-full"
              style={{ background: "var(--text-1)" }}
            />
          )}
        </button>
        {notifOpen && (
          <div className="neu-card absolute right-0 top-[52px] z-40 w-80 rounded-2xl p-2">
            <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wider t3">
              Notifications
            </p>
            {NOTIFICATIONS.map((n) => (
              <div key={n.title} className="row-hover rounded-xl px-3 py-2.5">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="text-sm font-medium t1">{n.title}</p>
                  <span className="shrink-0 text-[10px] t3">{n.time}</span>
                </div>
                <p className="mt-0.5 text-xs t2">{n.body}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Avatar */}
      <button
        className="neu-btn flex h-11 w-11 items-center justify-center rounded-full text-xs font-bold t1"
        aria-label="Account: Amelia Hart"
        title="Amelia Hart — Owner"
      >
        AH
      </button>
    </header>
  );
}
