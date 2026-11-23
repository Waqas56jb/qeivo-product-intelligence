"use client";

import {
  Area,
  AreaChart as RAreaChart,
  Bar,
  BarChart as RBarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart as RLineChart,
  Pie,
  PieChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipProps,
} from "recharts";
import { cn } from "@/lib/utils";

/** Fixed categorical order — validated for CVD/contrast in both themes. Never cycle. */
export const SERIES_COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"] as const;

export interface Series {
  key: string;
  label: string;
  /** index into SERIES_COLORS — tie colour to the entity, not its rank */
  color?: number;
}

type Row = Record<string, string | number>;
type Formatter = (v: number) => string;

const axisProps = {
  tick: { fill: "var(--chart-axis)", fontSize: 11 },
  tickLine: false,
  axisLine: false,
} as const;

function ChartTooltip({ active, payload, label, valueFormatter, labelFormatter }: TooltipProps<number, string> & { valueFormatter?: Formatter; labelFormatter?: (l: string) => string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="min-w-[140px] rounded-[10px] border border-border bg-popover px-3 py-2 text-[12px] shadow-lg">
      <p className="mb-1.5 font-medium text-muted-foreground">{labelFormatter ? labelFormatter(String(label)) : label}</p>
      <div className="space-y-1">
        {payload.map((p) => (
          <div key={String(p.dataKey)} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <span className="size-2 rounded-full" style={{ background: p.color ?? (p.payload as { fill?: string })?.fill }} />
              {p.name}
            </span>
            <span className="font-semibold tabular text-foreground">{valueFormatter ? valueFormatter(Number(p.value)) : Number(p.value).toLocaleString("en-US")}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ChartLegend({ series, className }: { series: Series[]; className?: string }) {
  if (series.length < 2) return null;
  return (
    <div className={cn("flex flex-wrap gap-x-4 gap-y-1.5", className)}>
      {series.map((s, i) => (
        <span key={s.key} className="inline-flex items-center gap-1.5 text-[12px] text-muted-foreground">
          <span className="h-2 w-3 rounded-full" style={{ background: SERIES_COLORS[s.color ?? i] }} />
          {s.label}
        </span>
      ))}
    </div>
  );
}

/** Card frame used by every analytics chart. */
export function ChartCard({ title, description, action, children, className, legend }: { title: string; description?: string; action?: React.ReactNode; children: React.ReactNode; className?: string; legend?: Series[] }) {
  return (
    <section className={cn("rounded-[14px] border border-border bg-card p-4 shadow-xs sm:p-5", className)}>
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-[15px] font-semibold tracking-tight">{title}</h3>
          {description && <p className="mt-0.5 text-[12px] text-muted-foreground">{description}</p>}
        </div>
        {action}
      </div>
      {legend && <ChartLegend series={legend} className="mb-3" />}
      {children}
    </section>
  );
}

interface XYProps {
  data: Row[];
  xKey: string;
  series: Series[];
  height?: number;
  valueFormatter?: Formatter;
  xFormatter?: (v: string) => string;
  yWidth?: number;
  className?: string;
}

export function LineChart({ data, xKey, series, height = 260, valueFormatter, xFormatter, yWidth = 44, className, referenceY }: XYProps & { referenceY?: { value: number; label: string } }) {
  return (
    <div className={cn("w-full", className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RLineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="var(--chart-grid)" />
          <XAxis dataKey={xKey} {...axisProps} tickFormatter={xFormatter} minTickGap={24} />
          <YAxis {...axisProps} width={yWidth} tickFormatter={valueFormatter} domain={["auto", "auto"]} />
          <Tooltip cursor={{ stroke: "var(--border-strong)", strokeDasharray: "3 3" }} content={<ChartTooltip valueFormatter={valueFormatter} labelFormatter={xFormatter} />} />
          {referenceY && <ReferenceLine y={referenceY.value} stroke="var(--chart-axis)" strokeDasharray="4 4" label={{ value: referenceY.label, position: "insideTopRight", fill: "var(--chart-axis)", fontSize: 11 }} />}
          {series.map((s, i) => (
            <Line key={s.key} type="monotone" dataKey={s.key} name={s.label} stroke={SERIES_COLORS[s.color ?? i]} strokeWidth={2} dot={false} activeDot={{ r: 4.5, strokeWidth: 2, stroke: "var(--card)" }} />
          ))}
        </RLineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function AreaChart({ data, xKey, series, height = 260, valueFormatter, xFormatter, yWidth = 44, className, stacked }: XYProps & { stacked?: boolean }) {
  return (
    <div className={cn("w-full", className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RAreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            {series.map((s, i) => (
              <linearGradient key={s.key} id={`area-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={SERIES_COLORS[s.color ?? i]} stopOpacity={0.22} />
                <stop offset="100%" stopColor={SERIES_COLORS[s.color ?? i]} stopOpacity={0} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid vertical={false} stroke="var(--chart-grid)" />
          <XAxis dataKey={xKey} {...axisProps} tickFormatter={xFormatter} minTickGap={24} />
          <YAxis {...axisProps} width={yWidth} tickFormatter={valueFormatter} />
          <Tooltip cursor={{ stroke: "var(--border-strong)", strokeDasharray: "3 3" }} content={<ChartTooltip valueFormatter={valueFormatter} labelFormatter={xFormatter} />} />
          {series.map((s, i) => (
            <Area key={s.key} type="monotone" dataKey={s.key} name={s.label} stackId={stacked ? "a" : undefined} stroke={SERIES_COLORS[s.color ?? i]} strokeWidth={2} fill={`url(#area-${s.key})`} activeDot={{ r: 4.5, strokeWidth: 2, stroke: "var(--card)" }} />
          ))}
        </RAreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function BarChart({ data, xKey, series, height = 260, valueFormatter, xFormatter, yWidth = 44, className, layout = "vertical-bars", stacked, highlightIndex }: XYProps & { layout?: "vertical-bars" | "horizontal-bars"; stacked?: boolean; highlightIndex?: number }) {
  const horizontal = layout === "horizontal-bars";
  return (
    <div className={cn("w-full", className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RBarChart data={data} layout={horizontal ? "vertical" : "horizontal"} margin={{ top: 4, right: 8, left: 0, bottom: 0 }} barCategoryGap={horizontal ? "28%" : "30%"} barGap={2}>
          <CartesianGrid vertical={horizontal} horizontal={!horizontal} stroke="var(--chart-grid)" />
          {horizontal ? (
            <>
              <XAxis type="number" {...axisProps} tickFormatter={valueFormatter} />
              <YAxis type="category" dataKey={xKey} {...axisProps} width={yWidth} tickFormatter={xFormatter} />
            </>
          ) : (
            <>
              <XAxis dataKey={xKey} {...axisProps} tickFormatter={xFormatter} minTickGap={8} />
              <YAxis {...axisProps} width={yWidth} tickFormatter={valueFormatter} />
            </>
          )}
          <Tooltip cursor={{ fill: "var(--surface-2)" }} content={<ChartTooltip valueFormatter={valueFormatter} labelFormatter={xFormatter} />} />
          {series.map((s, i) => (
            <Bar key={s.key} dataKey={s.key} name={s.label} stackId={stacked ? "a" : undefined} fill={SERIES_COLORS[s.color ?? i]} radius={stacked && i < series.length - 1 ? 0 : horizontal ? [0, 4, 4, 0] : [4, 4, 0, 0]} maxBarSize={horizontal ? 18 : 28} stroke="var(--card)" strokeWidth={stacked ? 1 : 0}>
              {highlightIndex !== undefined && series.length === 1 && data.map((_, di) => <Cell key={di} fillOpacity={di === highlightIndex ? 1 : 0.45} />)}
            </Bar>
          ))}
        </RBarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function DonutChart({ data, height = 200, valueFormatter, centerLabel, centerValue, className }: { data: { name: string; value: number; color?: number | string }[]; height?: number; valueFormatter?: Formatter; centerLabel?: string; centerValue?: string; className?: string }) {
  return (
    <div className={cn("flex flex-col items-center gap-4 sm:flex-row", className)}>
      <div className="relative shrink-0" style={{ width: height, height }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip content={<ChartTooltip valueFormatter={valueFormatter} />} />
            <Pie data={data} dataKey="value" nameKey="name" innerRadius="68%" outerRadius="100%" paddingAngle={2} stroke="var(--card)" strokeWidth={2} cornerRadius={4}>
              {data.map((d, i) => (
                <Cell key={d.name} fill={typeof d.color === "string" ? d.color : SERIES_COLORS[d.color ?? i]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        {centerValue && (
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="tabular text-[22px] font-semibold">{centerValue}</span>
            {centerLabel && <span className="text-[11px] text-muted-foreground">{centerLabel}</span>}
          </div>
        )}
      </div>
      <ul className="w-full space-y-2">
        {data.map((d, i) => (
          <li key={d.name} className="flex items-center justify-between gap-3 text-[13px]">
            <span className="flex items-center gap-2 text-muted-foreground">
              <span className="size-2.5 rounded-full" style={{ background: typeof d.color === "string" ? d.color : SERIES_COLORS[d.color ?? i] }} />
              {d.name}
            </span>
            <span className="font-semibold tabular">{valueFormatter ? valueFormatter(d.value) : d.value.toLocaleString("en-US")}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Single-series sparkline for stat tiles (no axes, no tooltip). */
export function Sparkline({ values, className, color = 0, height = 36 }: { values: number[]; className?: string; color?: number; height?: number }) {
  const data = values.map((v, i) => ({ i, v }));
  return (
    <div className={cn("w-full", className)} style={{ height }} aria-hidden>
      <ResponsiveContainer width="100%" height="100%">
        <RAreaChart data={data} margin={{ top: 2, right: 0, left: 0, bottom: 2 }}>
          <defs>
            <linearGradient id={`spark-${color}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={SERIES_COLORS[color]} stopOpacity={0.25} />
              <stop offset="100%" stopColor={SERIES_COLORS[color]} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area type="monotone" dataKey="v" stroke={SERIES_COLORS[color]} strokeWidth={1.75} fill={`url(#spark-${color})`} isAnimationActive={false} />
        </RAreaChart>
      </ResponsiveContainer>
    </div>
  );
}
