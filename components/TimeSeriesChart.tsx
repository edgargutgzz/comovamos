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
  AMM: "#1d4ed8",
  Monterrey: "#0891b2",
  "San Nicolás": "#7c3aed",
  Guadalupe: "#b45309",
  "San Pedro": "#059669",
  Apodaca: "#dc2626",
  "Santa Catarina": "#d97706",
  García: "#6b7280",
  Escobedo: "#be185d",
};

type DataPoint = Record<string, number>;

type Props = {
  data: DataPoint[];
  municipios: string[];
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
    <div className="bg-white border border-stone-200 rounded-lg px-4 py-3 shadow-lg text-sm">
      <p className="font-semibold text-stone-700 mb-2">{label}</p>
      {payload.map((entry) => (
        <p key={entry.name} style={{ color: entry.color }} className="flex items-center gap-2">
          <span className="font-medium">{entry.name}</span>
          <span className="ml-auto font-semibold">{entry.value}%</span>
        </p>
      ))}
    </div>
  );
};

export default function TimeSeriesChart({ data, municipios }: Props) {
  return (
    <ResponsiveContainer width="100%" height={380}>
      <LineChart data={data} margin={{ top: 8, right: 24, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
        <XAxis
          dataKey="year"
          tick={{ fontSize: 12, fill: "#78716c" }}
          tickLine={false}
          axisLine={{ stroke: "#d6d3d1" }}
        />
        <YAxis
          domain={[0, 100]}
          tick={{ fontSize: 12, fill: "#78716c" }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => `${v}%`}
          width={42}
        />
        <Tooltip content={<CustomTooltip />} />
        {municipios.length > 1 && (
          <Legend
            wrapperStyle={{ fontSize: 12, paddingTop: 16 }}
            iconType="circle"
            iconSize={8}
          />
        )}
        {municipios.map((mun) => (
          <Line
            key={mun}
            type="monotone"
            dataKey={mun}
            stroke={MUNICIPIO_COLORS[mun] ?? "#1d4ed8"}
            strokeWidth={municipios.length === 1 ? 2.5 : 2}
            dot={{ r: municipios.length === 1 ? 4 : 3, strokeWidth: 0 }}
            activeDot={{ r: 6, strokeWidth: 0 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
