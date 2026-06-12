"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

type DataPoint = {
  year: number;
  municipio: string;
  Contaminado: number;
  Neutral: number;
  Limpio: number;
};

type Props = {
  data: DataPoint[];
  municipios: string[];
};

const CATEGORY_COLORS = {
  Contaminado: "#ffba00",
  Neutral:     "#e8e8e8",
  Limpio:      "#29c19b",
};

// Per-municipio opacity so stacks are visually distinct
const MUN_OPACITY = [1, 0.6, 0.35, 0.2];

const CustomTooltip = ({
  active, payload, label,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; fill: string }>;
  label?: string;
}) => {
  if (!active || !payload?.length) return null;

  // Group by municipio
  const byMun: Record<string, { Contaminado?: number; Neutral?: number; Limpio?: number }> = {};
  for (const p of payload) {
    const [mun, cat] = p.name.split("__");
    if (!byMun[mun]) byMun[mun] = {};
    (byMun[mun] as Record<string, number>)[cat] = p.value;
  }

  return (
    <div className="bg-white rounded-xl px-4 py-3 text-sm" style={{ border: "1px solid rgba(0,0,0,0.1)", boxShadow: "0 4px 16px rgba(0,0,0,0.08)", minWidth: "200px" }}>
      <p className="font-semibold mb-3" style={{ color: "#9a9a9a" }}>{label}</p>
      {Object.entries(byMun).map(([mun, cats]) => (
        <div key={mun} className="mb-2">
          <p className="text-xs font-semibold mb-1" style={{ color: "#161616" }}>{mun === "AMM" ? "Área Metropolitana" : mun}</p>
          <div className="flex gap-3">
            {(["Contaminado", "Neutral", "Limpio"] as const).map((cat) =>
              cats[cat] !== undefined ? (
                <div key={cat} className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-sm flex-shrink-0" style={{ backgroundColor: CATEGORY_COLORS[cat] }} />
                  <span className="font-semibold text-xs" style={{ color: CATEGORY_COLORS[cat] }}>{cats[cat]}%</span>
                </div>
              ) : null
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default function StackedBarChart({ data, municipios }: Props) {
  const activeMuns = municipios.length === 0 ? ["AMM"] : municipios;
  const years = [2023, 2024, 2025];

  // Build flat data: one row per year, keys like "AMM__Contaminado"
  const chartData = years.map((year) => {
    const point: Record<string, number> = { year };
    for (const mun of activeMuns) {
      const row = data.find((d) => d.year === year && d.municipio === mun);
      if (row) {
        point[`${mun}__Contaminado`] = row.Contaminado;
        point[`${mun}__Neutral`]     = row.Neutral;
        point[`${mun}__Limpio`]      = row.Limpio;
      }
    }
    return point;
  });

  const barSize = activeMuns.length === 1 ? 56 : activeMuns.length === 2 ? 36 : 24;

  return (
    <ResponsiveContainer width="100%" height={480}>
      <BarChart data={chartData} margin={{ top: 8, right: 24, left: 0, bottom: 16 }} barSize={barSize} barCategoryGap="30%">
        <CartesianGrid strokeDasharray="3 3" stroke="#e8e8e8" vertical={false} />
        <XAxis
          dataKey="year"
          tick={{ fontSize: 12, fill: "#9a9a9a", dy: 10 }}
          tickLine={false}
          axisLine={{ stroke: "#e8e8e8" }}
        />
        <YAxis
          domain={[0, 100]}
          tick={{ fontSize: 12, fill: "#9a9a9a" }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => `${v}%`}
          width={42}
        />
        <Tooltip content={<CustomTooltip />} cursor={false} />
        <Legend
          content={() => (
            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 pt-4 text-xs">
              {activeMuns.length > 1 ? (
                // Multi: show one entry per municipio with opacity swatch
                activeMuns.map((mun, i) => (
                  <span key={mun} className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-sm inline-block" style={{ backgroundColor: CATEGORY_COLORS.Contaminado, opacity: MUN_OPACITY[i] }} />
                    <span style={{ color: "#161616" }}>{mun === "AMM" ? "Área Metropolitana" : mun}</span>
                  </span>
                ))
              ) : (
                // Single: show one entry per category
                (["Contaminado", "Neutral", "Limpio"] as const).map((cat) => (
                  <span key={cat} className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-sm inline-block" style={{ backgroundColor: CATEGORY_COLORS[cat] }} />
                    <span style={{ color: "#161616" }}>{cat}</span>
                  </span>
                ))
              )}
            </div>
          )}
        />
        {activeMuns.map((mun, munIdx) =>
          (["Contaminado", "Neutral", "Limpio"] as const).map((cat, catIdx) => (
            <Bar
              key={`${mun}__${cat}`}
              dataKey={`${mun}__${cat}`}
              name={`${mun}__${cat}`}
              stackId={mun}
              fill={CATEGORY_COLORS[cat]}
              fillOpacity={MUN_OPACITY[munIdx] ?? 0.2}
              radius={catIdx === 2 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
            />
          ))
        )}
      </BarChart>
    </ResponsiveContainer>
  );
}
