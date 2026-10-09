import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

export type Theme = "dark" | "light";

export interface ChartPalette {
  grid: string;
  axis: string;
  line: string;
  area: string;
  areaFaint: string;
  tooltipBg: string;
  tooltipBorder: string;
  text: string;
  muted: string;
  bars: string[]; // grayscale ramp, strongest first
  cursor: string;
}

/* Beanora — deep forest dark theme */
const DARK: ChartPalette = {
  grid: "#2e4737",
  axis: "#8fa487",
  line: "#f1e5d2",
  area: "rgba(241,229,210,0.13)",
  areaFaint: "rgba(241,229,210,0.05)",
  tooltipBg: "#243d2d",
  tooltipBorder: "#3a5845",
  text: "#faf7f0",
  muted: "#a8b49b",
  bars: ["#c98246", "#f1e5d2", "#a8b49b", "#8c6a4e", "#6e8266", "#4c6353"],
  cursor: "rgba(241,229,210,0.07)",
};

/* Beanora — warm ivory light theme */
const LIGHT: ChartPalette = {
  grid: "#ded3ba",
  axis: "#8a7a62",
  line: "#243d2d",
  area: "rgba(36,61,45,0.14)",
  areaFaint: "rgba(36,61,45,0.05)",
  tooltipBg: "#faf7f0",
  tooltipBorder: "#dfd4bc",
  text: "#243d2d",
  muted: "#75513b",
  bars: ["#243d2d", "#c98246", "#75513b", "#a8b49b", "#8ca081", "#cbbfa4"],
  cursor: "rgba(36,61,45,0.07)",
};

interface ThemeCtx {
  theme: Theme;
  toggle: () => void;
  palette: ChartPalette;
}

const Ctx = createContext<ThemeCtx>({ theme: "dark", toggle: () => {}, palette: DARK });

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    document.documentElement.classList.toggle("light", theme === "light");
  }, [theme]);

  const toggle = useCallback(() => setTheme((t) => (t === "dark" ? "light" : "dark")), []);
  const value = useMemo(
    () => ({ theme, toggle, palette: theme === "dark" ? DARK : LIGHT }),
    [theme, toggle]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useTheme = () => useContext(Ctx);

/* ----------------------- count-up animation ------------------------ */

export function useCountUp(target: number, duration = 1100, enabled = true) {
  const [value, setValue] = useState(0);
  const fromRef = useRef(0);
  const raf = useRef<number>(0);

  useEffect(() => {
    if (!enabled) return;
    const from = fromRef.current;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const v = from + (target - from) * eased;
      setValue(v);
      if (t < 1) raf.current = requestAnimationFrame(tick);
      else fromRef.current = target;
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [target, duration, enabled]);

  return value;
}
