import { cn } from "../utils/cn";
import {
  IconGrid,
  IconChart,
  IconCup,
  IconUsers,
  IconBox,
  IconTrend,
  IconDoc,
  IconGear,
  IconCollapse,
  IconClose,
} from "./Icons";

export interface NavItem {
  id: string;
  label: string;
  icon: (p: { size?: number }) => React.ReactNode;
}

export const NAV_ITEMS: NavItem[] = [
  { id: "overview", label: "Overview", icon: (p) => <IconGrid {...p} /> },
  { id: "sales", label: "Sales Analytics", icon: (p) => <IconChart {...p} /> },
  { id: "products", label: "Products", icon: (p) => <IconCup {...p} /> },
  { id: "customers", label: "Customers", icon: (p) => <IconUsers {...p} /> },
  { id: "inventory", label: "Inventory", icon: (p) => <IconBox {...p} /> },
  { id: "trends", label: "Market Trends", icon: (p) => <IconTrend {...p} /> },
  { id: "reports", label: "Reports", icon: (p) => <IconDoc {...p} /> },
  { id: "settings", label: "Settings", icon: (p) => <IconGear {...p} /> },
];

interface Props {
  collapsed: boolean;
  onToggleCollapse: () => void;
  active: string;
  onNavigate: (id: string) => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

function Logo({ collapsed }: { collapsed: boolean }) {
  return (
    <div className="flex items-center gap-3 px-1">
      <div
        className="neu-raised-sm flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl"
        style={{ color: "var(--accent)" }}
      >
        <IconCup size={20} />
      </div>
      {!collapsed && (
        <div className="overflow-hidden whitespace-nowrap">
          <p className="text-lg font-bold leading-tight tracking-tight t1" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
            Beanora<span className="taccent">.</span>
          </p>
          <p className="text-[10px] uppercase tracking-[0.18em] t3">Market Intelligence</p>
        </div>
      )}
    </div>
  );
}

function NavList({
  collapsed,
  active,
  onNavigate,
}: {
  collapsed: boolean;
  active: string;
  onNavigate: (id: string) => void;
}) {
  return (
    <nav aria-label="Primary" className="mt-8 flex flex-col gap-2">
      {NAV_ITEMS.map((item) => {
        const isActive = active === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            aria-current={isActive ? "page" : undefined}
            title={collapsed ? item.label : undefined}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
              collapsed && "justify-center px-0",
              isActive
                ? "neu-inset t1"
                : "t2 hover:t1 hover:translate-x-0.5"
            )}
            style={isActive ? undefined : { color: undefined }}
          >
            <span className={cn("shrink-0", isActive ? "t1" : "")}>{item.icon({ size: 18 })}</span>
            {!collapsed && <span className="whitespace-nowrap">{item.label}</span>}
          </button>
        );
      })}
    </nav>
  );
}

export default function Sidebar({
  collapsed,
  onToggleCollapse,
  active,
  onNavigate,
  mobileOpen,
  onCloseMobile,
}: Props) {
  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "sticky top-0 hidden h-screen shrink-0 flex-col justify-between py-6 transition-all duration-300 lg:flex",
          collapsed ? "w-[88px] px-4" : "w-[248px] px-5"
        )}
        style={{ borderRight: "1px solid var(--line)" }}
      >
        <div>
          <Logo collapsed={collapsed} />
          <NavList collapsed={collapsed} active={active} onNavigate={onNavigate} />
        </div>

        <button
          onClick={onToggleCollapse}
          className="neu-btn flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-xs font-semibold t2"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <span
            className="transition-transform duration-300"
            style={{ transform: collapsed ? "rotate(180deg)" : "none" }}
          >
            <IconCollapse size={16} />
          </span>
          {!collapsed && "Collapse"}
        </button>
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <div
            className="drawer-in absolute left-0 top-0 flex h-full w-[260px] flex-col justify-between px-5 py-6"
            style={{ background: "var(--bg)", borderRight: "1px solid var(--line)" }}
          >
            <div>
              <div className="flex items-center justify-between">
                <Logo collapsed={false} />
                <button
                  onClick={onCloseMobile}
                  className="neu-btn flex h-9 w-9 items-center justify-center rounded-xl t2"
                  aria-label="Close menu"
                >
                  <IconClose size={16} />
                </button>
              </div>
              <NavList
                collapsed={false}
                active={active}
                onNavigate={(id) => {
                  onNavigate(id);
                  onCloseMobile();
                }}
              />
            </div>
            <p className="text-[10px] uppercase tracking-[0.2em] t3">© 2026 Beanora</p>
          </div>
        </div>
      )}
    </>
  );
}
