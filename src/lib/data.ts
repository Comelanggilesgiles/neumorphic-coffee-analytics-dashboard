/* ------------------------------------------------------------------ */
/*  Beanora — deterministic sample dataset                             */
/* ------------------------------------------------------------------ */

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  cost: number;
  popularity: number;
}

export interface Day {
  date: Date;
  label: string;
  revenue: number;
  cost: number;
  orders: number;
  newCustomers: number;
  returningCustomers: number;
  units: Record<string, number>;
}

export const PRODUCTS: Product[] = [
  { id: "espresso", name: "Espresso", category: "Espresso Bar", price: 3.2, cost: 0.7, popularity: 1.0 },
  { id: "americano", name: "Americano", category: "Espresso Bar", price: 3.8, cost: 0.8, popularity: 0.92 },
  { id: "latte", name: "Latte", category: "Espresso Bar", price: 4.9, cost: 1.4, popularity: 1.28 },
  { id: "cappuccino", name: "Cappuccino", category: "Espresso Bar", price: 4.6, cost: 1.3, popularity: 1.06 },
  { id: "flatwhite", name: "Flat White", category: "Espresso Bar", price: 4.7, cost: 1.3, popularity: 0.58 },
  { id: "mocha", name: "Mocha", category: "Espresso Bar", price: 5.3, cost: 1.7, popularity: 0.6 },
  { id: "coldbrew", name: "Cold Brew", category: "Cold Drinks", price: 5.2, cost: 1.1, popularity: 0.86 },
  { id: "nitro", name: "Nitro Cold Brew", category: "Cold Drinks", price: 5.9, cost: 1.4, popularity: 0.46 },
  { id: "matcha", name: "Matcha Latte", category: "Tea & Matcha", price: 5.6, cost: 1.9, popularity: 0.72 },
  { id: "chai", name: "Chai Latte", category: "Tea & Matcha", price: 4.9, cost: 1.5, popularity: 0.52 },
  { id: "croissant", name: "Butter Croissant", category: "Bakery", price: 3.6, cost: 1.25, popularity: 0.78 },
  { id: "muffin", name: "Blueberry Muffin", category: "Bakery", price: 3.4, cost: 1.1, popularity: 0.55 },
  { id: "banana", name: "Banana Bread", category: "Bakery", price: 3.9, cost: 1.3, popularity: 0.44 },
  { id: "avotoast", name: "Avocado Toast", category: "Food", price: 8.5, cost: 3.3, popularity: 0.38 },
  { id: "granola", name: "Granola Bowl", category: "Food", price: 7.2, cost: 2.6, popularity: 0.3 },
];

export const CATEGORIES = Array.from(new Set(PRODUCTS.map((p) => p.category)));

/* Seeded PRNG (mulberry32) — same data on every load */
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(20260207);
const TOTAL_DAYS = 200;

function buildDays(): Day[] {
  const days: Day[] = [];
  const end = new Date();
  end.setHours(0, 0, 0, 0);

  for (let i = 0; i < TOTAL_DAYS; i++) {
    const date = new Date(end);
    date.setDate(end.getDate() - (TOTAL_DAYS - 1 - i));
    const dow = date.getDay();
    const weekend = dow === 0 || dow === 6;
    const dayFactor =
      (weekend ? 1.24 : dow === 5 ? 1.12 : dow === 1 ? 0.88 : 1.0) *
      (1 + i * 0.0021) *
      (0.9 + rand() * 0.2);

    const units: Record<string, number> = {};
    let revenue = 0;
    let cost = 0;
    let totalUnits = 0;

    for (const p of PRODUCTS) {
      const u = Math.max(0, Math.round(p.popularity * 36 * dayFactor * (0.8 + rand() * 0.4)));
      units[p.id] = u;
      totalUnits += u;
      revenue += u * p.price;
      cost += u * p.cost;
    }

    const orders = Math.round(totalUnits / (1.75 + rand() * 0.25));
    const newCustomers = Math.round(orders * (0.16 + rand() * 0.07) * (1 + i * 0.0014));
    const returningCustomers = orders - newCustomers;

    days.push({
      date,
      label: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      revenue: Math.round(revenue),
      cost: Math.round(cost),
      orders,
      newCustomers,
      returningCustomers,
      units,
    });
  }
  return days;
}

export const DAYS: Day[] = buildDays();

/* ------------------------------ ranges ------------------------------ */

export type RangeKey = "7d" | "30d" | "90d";

export const RANGE_OPTIONS: { key: RangeKey; label: string; days: number }[] = [
  { key: "7d", label: "Last 7 days", days: 7 },
  { key: "30d", label: "Last 30 days", days: 30 },
  { key: "90d", label: "Last 90 days", days: 90 },
];

export function rangeDays(key: RangeKey): Day[] {
  const n = RANGE_OPTIONS.find((r) => r.key === key)!.days;
  return DAYS.slice(TOTAL_DAYS - n);
}

export function prevRangeDays(key: RangeKey): Day[] {
  const n = RANGE_OPTIONS.find((r) => r.key === key)!.days;
  return DAYS.slice(TOTAL_DAYS - 2 * n, TOTAL_DAYS - n);
}

/* ------------------------------ KPI math ---------------------------- */

export interface Totals {
  revenue: number;
  orders: number;
  aov: number;
  profit: number;
  newCustomers: number;
}

export function totals(days: Day[]): Totals {
  const revenue = days.reduce((s, d) => s + d.revenue, 0);
  const orders = days.reduce((s, d) => s + d.orders, 0);
  const cost = days.reduce((s, d) => s + d.cost, 0);
  const newCustomers = days.reduce((s, d) => s + d.newCustomers, 0);
  // fixed overhead per day (rent, staff, utilities) for realistic profit
  const overhead = days.length * 410;
  return {
    revenue,
    orders,
    aov: orders ? revenue / orders : 0,
    profit: revenue - cost - overhead,
    newCustomers,
  };
}

export function pctChange(cur: number, prev: number): number {
  if (!prev) return 0;
  return ((cur - prev) / Math.abs(prev)) * 100;
}

/* --------------------------- aggregation ---------------------------- */

export type Granularity = "daily" | "weekly" | "monthly";

export function aggregateRevenue(days: Day[], g: Granularity) {
  if (g === "daily") {
    return days.map((d) => ({ label: d.label, revenue: d.revenue, orders: d.orders }));
  }
  const buckets = new Map<string, { label: string; revenue: number; orders: number }>();
  for (const d of days) {
    let key: string;
    let label: string;
    if (g === "weekly") {
      const monday = new Date(d.date);
      const diff = (d.date.getDay() + 6) % 7;
      monday.setDate(d.date.getDate() - diff);
      key = monday.toISOString().slice(0, 10);
      label = "Wk " + monday.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    } else {
      key = `${d.date.getFullYear()}-${d.date.getMonth()}`;
      label = d.date.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
    }
    const b = buckets.get(key) ?? { label, revenue: 0, orders: 0 };
    b.revenue += d.revenue;
    b.orders += d.orders;
    buckets.set(key, b);
  }
  return Array.from(buckets.values());
}

export function aggregateCustomers(days: Day[]) {
  // bucket into at most ~12 points
  const step = Math.max(1, Math.ceil(days.length / 12));
  const out: { label: string; newC: number; returning: number }[] = [];
  for (let i = 0; i < days.length; i += step) {
    const slice = days.slice(i, i + step);
    out.push({
      label: slice[0].label,
      newC: slice.reduce((s, d) => s + d.newCustomers, 0),
      returning: slice.reduce((s, d) => s + d.returningCustomers, 0),
    });
  }
  return out;
}

/* ------------------------- product stats ---------------------------- */

export interface ProductStat {
  id: string;
  name: string;
  category: string;
  units: number;
  revenue: number;
  costs: number;
  profit: number;
  margin: number;
}

export function productStats(days: Day[]): ProductStat[] {
  return PRODUCTS.map((p) => {
    const units = days.reduce((s, d) => s + (d.units[p.id] ?? 0), 0);
    const revenue = units * p.price;
    const costs = units * p.cost;
    const profit = revenue - costs;
    return {
      id: p.id,
      name: p.name,
      category: p.category,
      units,
      revenue: Math.round(revenue),
      costs: Math.round(costs),
      profit: Math.round(profit),
      margin: revenue ? (profit / revenue) * 100 : 0,
    };
  });
}

export const BEVERAGE_IDS = ["espresso", "americano", "latte", "cappuccino", "coldbrew", "matcha"];

/* -------------------------- peak hours ------------------------------ */

export const PEAK_HOURS = [
  { hour: "7a", orders: 46 },
  { hour: "8a", orders: 88 },
  { hour: "9a", orders: 74 },
  { hour: "10a", orders: 52 },
  { hour: "11a", orders: 44 },
  { hour: "12p", orders: 63 },
  { hour: "1p", orders: 58 },
  { hour: "2p", orders: 41 },
  { hour: "3p", orders: 49 },
  { hour: "4p", orders: 38 },
  { hour: "5p", orders: 33 },
  { hour: "6p", orders: 27 },
  { hour: "7p", orders: 18 },
  { hour: "8p", orders: 11 },
];

export const BEHAVIOR = [
  { label: "Morning rush (7–11a)", value: 47 },
  { label: "Lunch window (11a–2p)", value: 29 },
  { label: "Afternoon (2–6p)", value: 18 },
  { label: "Evening (6–9p)", value: 6 },
];

export const BEHAVIOR_FACTS = [
  { k: "Avg. items / order", v: "1.9" },
  { k: "Mobile pre-orders", v: "34%" },
  { k: "Takeaway share", v: "61%" },
  { k: "Loyalty members", v: "42%" },
];

/* ---------------------------- inventory ----------------------------- */

export interface InventoryItem {
  name: string;
  detail: string;
  stock: number;
  capacity: number;
  unit: string;
  dailyUse: number;
  costPerUnit: number;
}

export const INVENTORY: InventoryItem[] = [
  { name: "Arabica Beans", detail: "Single-origin, medium roast", stock: 38, capacity: 120, unit: "kg", dailyUse: 7.4, costPerUnit: 18.5 },
  { name: "Robusta Blend", detail: "Espresso backbone blend", stock: 54, capacity: 80, unit: "kg", dailyUse: 3.1, costPerUnit: 12.2 },
  { name: "Whole Milk", detail: "Local dairy, 1L cartons", stock: 42, capacity: 160, unit: "L", dailyUse: 21.0, costPerUnit: 1.1 },
  { name: "Oat Milk", detail: "Barista edition", stock: 64, capacity: 100, unit: "L", dailyUse: 9.5, costPerUnit: 2.3 },
  { name: "Vanilla Syrup", detail: "750ml bottles", stock: 9, capacity: 40, unit: "btl", dailyUse: 1.4, costPerUnit: 6.8 },
  { name: "Caramel Syrup", detail: "750ml bottles", stock: 17, capacity: 40, unit: "btl", dailyUse: 1.1, costPerUnit: 6.8 },
  { name: "Matcha Powder", detail: "Ceremonial grade", stock: 3.2, capacity: 12, unit: "kg", dailyUse: 0.45, costPerUnit: 54.0 },
  { name: "12oz Cups", detail: "Double-wall, recyclable", stock: 2600, capacity: 6000, unit: "pcs", dailyUse: 310, costPerUnit: 0.09 },
  { name: "16oz Cups", detail: "Cold-drink PET", stock: 740, capacity: 4000, unit: "pcs", dailyUse: 150, costPerUnit: 0.11 },
  { name: "Pastry Boxes", detail: "Kraft, printed logo", stock: 410, capacity: 1200, unit: "pcs", dailyUse: 46, costPerUnit: 0.22 },
];

export type StockStatus = "critical" | "low" | "healthy";

export function stockStatus(item: InventoryItem): { status: StockStatus; daysLeft: number } {
  const daysLeft = Math.floor(item.stock / item.dailyUse);
  if (daysLeft <= 5) return { status: "critical", daysLeft };
  if (daysLeft <= 10) return { status: "low", daysLeft };
  return { status: "healthy", daysLeft };
}

/* ----------------------------- insights ----------------------------- */

export const INSIGHTS = [
  {
    tag: "Best seller",
    title: "Latte dominates the espresso bar",
    body: "Latte generates the highest revenue of any single item (~22% of drink sales) and sustains a 71% margin. Protect milk supply and barista capacity during the 8–10a window.",
  },
  {
    tag: "High margin",
    title: "Cold Brew is your quiet profit engine",
    body: "At a 79% profit margin, Cold Brew outperforms every hot drink per unit. A 10% volume push via counter placement could add ~$540/mo in net profit.",
  },
  {
    tag: "Peak period",
    title: "8–9a drives 19% of daily orders",
    body: "The morning rush accounts for nearly half of daily volume. Adding one floating barista from 7:30–10:00 would cut queue abandonment at peak.",
  },
  {
    tag: "Preference",
    title: "Oat milk requests up 23% QoQ",
    body: "A third of milk-based orders now specify oat milk. Negotiating a bulk contract would trim dairy-alternative costs by an estimated 11%.",
  },
  {
    tag: "Cost saving",
    title: "16oz cup stock is running hot",
    body: "Cold-drink cup burn rate rose with Cold Brew demand; current stock covers under 5 days. Consolidating cup SKUs could save ~$180/mo in packaging spend.",
  },
  {
    tag: "Opportunity",
    title: "Food attach rate has headroom",
    body: "Only 24% of drink orders attach a bakery or food item. A croissant + espresso morning bundle at a 9% discount should lift average order value by ~$0.60.",
  },
];

/* ---------------------------- formatting ----------------------------- */

export const fmtMoney = (n: number) =>
  "$" + Math.round(n).toLocaleString("en-US");

export const fmtMoneyPrecise = (n: number) =>
  "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const fmtNum = (n: number) => Math.round(n).toLocaleString("en-US");
