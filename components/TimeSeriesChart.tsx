"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const MUNICIPIO_COLORS: Record<string, string> = {
  AMM:             "#7e33c3",
  Monterrey:       "#fc6656",
  "San Nicolás":   "#0ea5e9",
  Guadalupe:       "#29c19b",
  "San Pedro":     "#f59e0b",
  Apodaca:         "#e879f9",
  "Santa Catarina":"#84cc16",
  García:          "#f97316",
  Escobedo:        "#64748b",
  Juárez:          "#ec4899",
};

type DataPoint = Record<string, number>;

type Props = {
  data: DataPoint[];
  municipios: string[];
  lineColor?: string;
};

const MUN_LABELS: Record<string, string> = {
  AMM: "Área Metropolitana (AMM)",
};

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white rounded-xl px-4 py-3 text-sm" style={{ border: "1px solid rgba(0,0,0,0.1)", boxShadow: "0 4px 16px rgba(0,0,0,0.08)", minWidth: "200px" }}>
      <p className="font-semibold mb-3" style={{ color: "#9a9a9a" }}>{label}</p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center justify-between gap-6 mb-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: entry.color }} />
            <span style={{ color: "#161616" }}>{MUN_LABELS[entry.name] ?? entry.name}</span>
          </div>
          <span className="font-bold" style={{ color: entry.color }}>{entry.value}%</span>
        </div>
      ))}
    </div>
  );
};

export default function TimeSeriesChart({ data, municipios, lineColor }: Props) {
  return (
    <ResponsiveContainer width="100%" height={480}>
      <LineChart data={data} margin={{ top: 8, right: 24, left: 0, bottom: 16 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e8e8e8" />
        <XAxis
          dataKey="year"
          tick={{ fontSize: 12, fill: "#9a9a9a", fontFamily: "var(--font-rubik, sans-serif)", dy: 10 }}
          tickLine={false}
          axisLine={{ stroke: "#e8e8e8" }}
        />
        <YAxis
          domain={[0, 100]}
          tick={{ fontSize: 12, fill: "#9a9a9a", fontFamily: "var(--font-rubik, sans-serif)" }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => `${v}%`}
          width={42}
        />
        <Tooltip content={<CustomTooltip />} />
        {municipios.length > 1 && (
          <Legend
            wrapperStyle={{ fontSize: 12, paddingTop: 16, fontFamily: "var(--font-rubik, sans-serif)" }}
            iconType="circle"
            iconSize={8}
          />
        )}
        {municipios.map((mun) => (
          <Line
            key={mun}
            type="monotone"
            dataKey={mun}
            stroke={lineColor ?? MUNICIPIO_COLORS[mun] ?? "#7e33c3"}
            strokeWidth={2.5}
            dot={{ r: 5, strokeWidth: 0, fill: lineColor ?? MUNICIPIO_COLORS[mun] ?? "#7e33c3" }}
            activeDot={{ r: 7, strokeWidth: 0 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
