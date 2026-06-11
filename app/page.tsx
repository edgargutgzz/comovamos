"use client";

import { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import rawData from "@/data/survey.json";

const TimeSeriesChart = dynamic(() => import("@/components/TimeSeriesChart"), { ssr: false });

type SurveyRow = {
  year: number;
  municipio: string;
  dimension: string;
  indicator: string;
  value: number;
  label: string;
};

const data: SurveyRow[] = rawData as SurveyRow[];

const DIMENSIONS = ["Movilidad", "Seguridad", "Medio Ambiente"] as const;
type Dimension = (typeof DIMENSIONS)[number];

const MUNICIPIOS = [
  "AMM",
  "Monterrey",
  "San Nicolás",
  "Guadalupe",
  "San Pedro",
  "Apodaca",
  "Santa Catarina",
  "García",
  "Escobedo",
];

const INDICATORS: Record<Dimension, string[]> = {
  Movilidad: ["Satisfacción con transporte público"],
  Seguridad: ["Percepción de inseguridad", "Confianza en policía municipal"],
  "Medio Ambiente": ["Satisfacción con áreas verdes", "Calidad del aire percibida"],
};


function buildChartData(
  dimension: Dimension,
  indicator: string,
  municipioFilter: string
): { data: Array<Record<string, number>>; municipios: string[] } {
  const municipios = municipioFilter === "AMM" ? ["AMM"] : [municipioFilter];
  const years = [2023, 2024, 2025];

  const chartData = years.map((year) => {
    const point: Record<string, number> = { year };
    for (const mun of municipios) {
      const row = data.find(
        (d) =>
          d.year === year &&
          d.municipio === mun &&
          d.dimension === dimension &&
          d.indicator === indicator
      );
      if (row) point[mun] = row.value;
    }
    return point;
  });

  return { data: chartData, municipios };
}


export default function Home() {
  const [dimension, setDimension] = useState<Dimension>("Movilidad");
  const [indicator, setIndicator] = useState<string>(INDICATORS.Movilidad[0]);
  const [municipio, setMunicipio] = useState<string>("AMM");

  const handleDimensionChange = (d: Dimension) => {
    setDimension(d);
    setIndicator(INDICATORS[d][0]);
  };

  const { data: chartData, municipios } = useMemo(
    () => buildChartData(dimension, indicator, municipio),
    [dimension, indicator, municipio]
  );

  return (
    <div className="min-h-screen bg-stone-50 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-stone-200">
        <div className="max-w-5xl mx-auto px-6 py-5 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold uppercase tracking-widest text-stone-400">
                Cómo Vamos Nuevo León
              </span>
            </div>
            <h1 className="text-xl font-bold text-stone-900 tracking-tight">
              Así Vamos Explorer
            </h1>
            <p className="text-sm text-stone-500 mt-0.5">
              Encuesta de percepción ciudadana · AMM 2023–2025
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        {/* Chart Panel */}
        <section className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
          {/* Filters row */}
          <div className="flex flex-wrap gap-4 mb-6 items-end">
            {/* Dimension */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-stone-400">
                Dimensión
              </label>
              <div className="flex gap-1.5">
                {DIMENSIONS.map((d) => (
                  <button
                    key={d}
                    onClick={() => handleDimensionChange(d)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border ${
                      dimension === d
                        ? "bg-stone-900 text-white border-stone-900"
                        : "bg-white text-stone-600 border-stone-200 hover:border-stone-400"
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Indicator */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-stone-400">
                Indicador
              </label>
              <select
                value={indicator}
                onChange={(e) => setIndicator(e.target.value)}
                className="text-sm border border-stone-200 rounded-lg px-3 py-1.5 bg-white text-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-300 cursor-pointer"
              >
                {INDICATORS[dimension].map((ind) => (
                  <option key={ind} value={ind}>
                    {ind}
                  </option>
                ))}
              </select>
            </div>

            {/* Municipio */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-stone-400">
                Municipio
              </label>
              <select
                value={municipio}
                onChange={(e) => setMunicipio(e.target.value)}
                className="text-sm border border-stone-200 rounded-lg px-3 py-1.5 bg-white text-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-300 cursor-pointer"
              >
                {MUNICIPIOS.map((m) => (
                  <option key={m} value={m}>
                    {m === "AMM" ? "Área Metropolitana (AMM)" : m}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Chart title */}
          <div className="mb-4">
            <h2 className="text-base font-semibold text-stone-800">{indicator}</h2>
            <p className="text-sm text-stone-500">
              {municipio === "AMM" ? "Área Metropolitana de Monterrey" : municipio} · 2023–2025
            </p>
          </div>

          <TimeSeriesChart data={chartData} municipios={municipios} />

          <p className="text-xs text-stone-400 mt-4">
            Valores expresados en porcentaje de ciudadanos encuestados. Fuente: Encuesta Así Vamos, Cómo Vamos Nuevo León.
          </p>
        </section>

        {/* Compare panel */}
        <section className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-stone-700 mb-4">
            Comparativa por municipio — {indicator} · 2025
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {MUNICIPIOS.filter((m) => m !== "AMM").map((mun) => {
              const row = data.find(
                (d) =>
                  d.year === 2025 &&
                  d.municipio === mun &&
                  d.dimension === dimension &&
                  d.indicator === indicator
              );
              const ammRow = data.find(
                (d) =>
                  d.year === 2025 &&
                  d.municipio === "AMM" &&
                  d.dimension === dimension &&
                  d.indicator === indicator
              );
              const diff = row && ammRow ? row.value - ammRow.value : null;

              return (
                <div
                  key={mun}
                  className="rounded-xl border border-stone-100 bg-stone-50 px-3 py-3"
                >
                  <p className="text-xs text-stone-500 font-medium truncate">{mun}</p>
                  <p className="text-xl font-bold text-stone-900 mt-0.5">
                    {row ? `${row.value}%` : "—"}
                  </p>
                  {diff !== null && (
                    <p
                      className={`text-xs font-medium mt-0.5 ${
                        diff > 0
                          ? "text-blue-600"
                          : diff < 0
                          ? "text-red-500"
                          : "text-stone-400"
                      }`}
                    >
                      {diff > 0 ? `+${diff}` : diff} vs AMM
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </main>

      <footer className="border-t border-stone-200 mt-12">
        <div className="max-w-5xl mx-auto px-6 py-6 flex flex-wrap items-center justify-between gap-2 text-xs text-stone-400">
          <span>© 2025 Cómo Vamos Nuevo León · comovamosnl.org</span>
          <span>Encuesta Así Vamos · 9 municipios · 2023–2025</span>
        </div>
      </footer>
    </div>
  );
}
