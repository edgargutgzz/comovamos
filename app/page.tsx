"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { ShieldCheck, Leaf, Bus, TrendingUp, Heart, BookOpen, Building2, Landmark } from "lucide-react";
import dynamic from "next/dynamic";
import rawData from "@/data/survey.json";
import airQualityData from "@/data/air-quality.json";

import ChartSkeleton from "@/components/ChartSkeleton";

const TimeSeriesChart = dynamic(() => import("@/components/TimeSeriesChart"), { ssr: false, loading: () => <ChartSkeleton /> });
const StackedBarChart = dynamic(() => import("@/components/StackedBarChart"), { ssr: false, loading: () => <ChartSkeleton /> });

type SurveyRow = {
  year: number;
  municipio: string;
  dimension: string;
  indicator: string;
  value: number;
  label: string;
};

const data: SurveyRow[] = rawData as SurveyRow[];

const MUNICIPIOS = [
  "AMM",
  "Apodaca",
  "Escobedo",
  "García",
  "Guadalupe",
  "Juárez",
  "Monterrey",
  "San Nicolás",
  "San Pedro",
  "Santa Catarina",
];

const PARTIAL_DATA = new Set(["San Nicolás", "San Pedro"]);

import type { LucideIcon } from "lucide-react";

const ALL_DIMENSIONS: { label: string; enabled: boolean; color: string; Icon: LucideIcon }[] = [
  { label: "Seguridad",         enabled: true,  color: "#fc6656", Icon: ShieldCheck },
  { label: "Medio Ambiente",    enabled: true,  color: "#29c19b", Icon: Leaf        },
  { label: "Movilidad",         enabled: false, color: "#7e33c3", Icon: Bus         },
  { label: "Economía",          enabled: false, color: "#ffba00", Icon: TrendingUp  },
  { label: "Salud",             enabled: false, color: "#fb7e50", Icon: Heart       },
  { label: "Educación",         enabled: false, color: "#7e33c3", Icon: BookOpen    },
  { label: "Desarrollo Urbano", enabled: false, color: "#ffba00", Icon: Building2   },
  { label: "Gobierno",          enabled: false, color: "#fc6656", Icon: Landmark    },
];

type DimensionLabel = "Seguridad" | "Medio Ambiente";

const INDICATORS = [
  { label: "Confianza en policía",          dimension: "Seguridad"      as DimensionLabel, color: "#fc6656", dataLabel: "Confianza en policía municipal", question: "¿Confía en la policía de su colonia?",                                     enabled: true  },
  { label: "Percepción de inseguridad",     dimension: "Seguridad"      as DimensionLabel, color: "#fc6656", dataLabel: "Percepción de inseguridad",    question: "¿Qué tan seguro(a) se siente en su municipio?",                            enabled: true  },
  { label: "Satisfacción con áreas verdes", dimension: "Medio Ambiente" as DimensionLabel, color: "#29c19b", dataLabel: "Satisfacción con áreas verdes",   question: "¿Los parques y jardines de su municipio están limpios y tienen buena imagen?", enabled: true  },
  { label: "Calidad del aire",              dimension: "Medio Ambiente" as DimensionLabel, color: "#29c19b", dataLabel: "Calidad del aire percibida",       question: "¿Qué tan limpio o contaminado estuvo el aire en su municipio?",                    enabled: true  },
] as const;


type IndicatorLabel = (typeof INDICATORS)[number]["label"];

function getIndicator(label: IndicatorLabel) {
  return INDICATORS.find((i) => i.label === label)!;
}

function getDataLabel(label: IndicatorLabel): string {
  return (getIndicator(label) as { dataLabel: string }).dataLabel;
}

function getQuestion(label: IndicatorLabel): string {
  return (getIndicator(label) as { question: string }).question;
}

const FIRST_BY_DIMENSION: Record<DimensionLabel, IndicatorLabel> = {
  Seguridad:        "Percepción de inseguridad",
  "Medio Ambiente": "Calidad del aire",
};

function buildChartData(
  indicatorLabel: IndicatorLabel,
  selectedMunicipios: string[]
): { data: Array<Record<string, number>>; municipios: string[] } {
  const ind = getIndicator(indicatorLabel);
  const municipios = selectedMunicipios;
  const dataLabel = getDataLabel(indicatorLabel);

  const chartData = [2023, 2024, 2025].map((year) => {
    const point: Record<string, number> = { year };
    for (const mun of municipios) {
      const row = data.find(
        (d) => d.year === year && d.municipio === mun &&
               d.dimension === ind.dimension && d.indicator === dataLabel
      );
      if (row) point[mun] = row.value;
    }
    return point;
  });

  return { data: chartData, municipios };
}

function MunicipioSelect({ values, onChange }: { values: string[]; onChange: (v: string[]) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const toggle = (m: string) => {
    onChange(values.includes(m) ? values.filter((v) => v !== m) : [...values, m]);
  };

  const remove = (e: React.MouseEvent, m: string) => {
    e.stopPropagation();
    onChange(values.filter((v) => v !== m));
  };

  return (
    <div ref={ref} className="relative w-full">
      {/* Chip input bar — horizontal scroll */}
      <div
        className="flex items-center w-full rounded-xl bg-white overflow-hidden"
        style={{ border: open ? "1.5px solid #7e33c3" : "1.5px solid #e8e8e8", transition: "border-color 0.15s", height: "42px" }}
      >
        {/* Scrollable chips area */}
        <div
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-2 flex-1 overflow-x-auto cursor-pointer px-4"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none", minWidth: 0 }}
        >
          {values.length === 0 && (
            <span className="text-sm whitespace-nowrap" style={{ color: "#b2b2b2" }}>Selecciona uno o varios municipios…</span>
          )}
          {values.map((m) => (
            <span
              key={m}
              className="flex items-center gap-1.5 text-xs font-semibold rounded-full px-3 py-1 flex-shrink-0"
              style={{ backgroundColor: "#7e33c312", color: "#7e33c3" }}
            >
              {m === "AMM" ? "Área Metropolitana" : m}
              <button
                onClick={(e) => remove(e, m)}
                className="cursor-pointer leading-none"
                style={{ color: "#7e33c3", opacity: 0.6 }}
              >
                ×
              </button>
            </span>
          ))}
        </div>
        {/* Chevron */}
        <button
          onClick={() => setOpen((o) => !o)}
          className="flex-shrink-0 px-3 cursor-pointer h-full flex items-center"
          style={{ borderLeft: "1.5px solid #e8e8e8" }}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"
            style={{ color: "#9a9a9a", transform: open ? "rotate(180deg)" : "none", transition: "transform 0.15s" }}
          >
            <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {/* Dropdown */}
      {open && (
        <div
          className="absolute left-0 right-0 mt-1 z-50 rounded-xl overflow-hidden"
          style={{ backgroundColor: "#fff", border: "1px solid rgba(0,0,0,0.08)", boxShadow: "0 8px 24px rgba(0,0,0,0.1)" }}
        >
          {MUNICIPIOS.map((m) => {
            const isSelected = values.includes(m);
            const optLabel = m === "AMM" ? "Área Metropolitana (AMM)" : m;
            return (
              <button
                key={m}
                onClick={() => toggle(m)}
                className="w-full text-left px-4 py-2.5 text-sm transition-colors cursor-pointer flex items-center gap-3"
                style={{
                  color: isSelected ? "#7e33c3" : "#161616",
                  fontWeight: isSelected ? 600 : 400,
                  backgroundColor: isSelected ? "#7e33c312" : "transparent",
                }}
                onMouseEnter={(e) => { if (!isSelected) (e.currentTarget as HTMLElement).style.backgroundColor = "#f3ebfa"; }}
                onMouseLeave={(e) => { if (!isSelected) (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"; }}
              >
                <span
                  className="w-4 h-4 rounded flex-shrink-0 flex items-center justify-center"
                  style={{ border: isSelected ? "none" : "1.5px solid #e8e8e8", backgroundColor: isSelected ? "#7e33c3" : "transparent" }}
                >
                  {isSelected && (
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M2 5l2.5 2.5L8 3" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </span>
                {optLabel}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function Home() {
  const [dimension, setDimension] = useState<DimensionLabel>("Medio Ambiente");
  const [selected, setSelected] = useState<IndicatorLabel>("Calidad del aire");
  const [municipios, setMunicipios] = useState<string[]>(["AMM"]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showHero, setShowHero] = useState(true);

  const ind = getIndicator(selected);
  const dataLabel = getDataLabel(selected);

  const { data: chartData, municipios: chartMunicipios } = useMemo(
    () => buildChartData(selected, municipios),
    [selected, municipios]
  );

  const handleDimensionClick = (label: DimensionLabel) => {
    setDimension(label);
    setSelected(FIRST_BY_DIMENSION[label]);
  };

  const currentIndicators = INDICATORS.filter((i) => i.dimension === dimension);

  if (showHero) return (
    <div className="min-h-screen flex flex-col items-center justify-center font-sans px-10 lg:px-6" style={{ backgroundColor: "#fcefe4" }}>
      <div className="max-w-lg w-full text-center">
        <img src="/cvnl-logo.png" alt="Cómo Vamos Nuevo León" className="h-20 w-auto mx-auto mb-8" />
        <h1 className="text-4xl font-bold tracking-tight mb-4" style={{ color: "#161616" }}>
          <span className="block lg:inline">Encuesta</span>
          <span className="block lg:inline"> Así Vamos</span>
        </h1>
        <p className="text-lg mb-3" style={{ color: "#9a9a9a" }}>
          Explora cómo perciben los ciudadanos del AMM su ciudad: seguridad, medio ambiente y más.
        </p>
        <p className="text-sm mb-10" style={{ color: "#bebebe" }}>
          9 municipios · 2023–2025
        </p>
        <button
          onClick={() => setShowHero(false)}
          className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-base font-semibold text-white transition-opacity hover:opacity-90 cursor-pointer"
          style={{ backgroundColor: "#7e33c3" }}
        >
          Explorar datos
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <p className="text-xs mt-12" style={{ color: "#bebebe" }}>
          Fuente: Encuesta Así Vamos, Cómo Vamos Nuevo León · comovamosnl.org
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col lg:flex-row font-sans" style={{ backgroundColor: "#fcefe4", color: "#161616" }}>


      {/* Sidebar — desktop only */}
      <aside className="hidden lg:flex w-72 flex-shrink-0 bg-white flex-col" style={{ borderRight: "1px solid rgba(0,0,0,0.08)", minHeight: "100vh" }}>

        {/* Logo */}
        <div className="px-5 py-6" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
          <img src="/cvnl-logo.png" alt="Cómo Vamos Nuevo León" className="h-12 w-auto cursor-pointer" onClick={() => setShowHero(true)} />
        </div>

        {/* Title */}
        <div className="px-5 py-4" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
          <p className="text-sm font-bold" style={{ color: "#161616" }}>Encuesta Así Vamos</p>
          <p className="text-xs mt-0.5" style={{ color: "#9a9a9a" }}>2023–2025</p>
        </div>

        {/* Dimension nav */}
        <nav className="flex-1 py-3">
          <p className="px-5 pb-2 text-xs font-semibold uppercase tracking-widest" style={{ color: "#bebebe" }}>
            Dimensiones
          </p>
          {ALL_DIMENSIONS.map((dim) => {
            const isActive = dim.label === dimension;
            const isEnabled = dim.enabled;
            return (
              <div key={dim.label} className="group">
                <button
                  onClick={() => isEnabled && handleDimensionClick(dim.label as DimensionLabel)}
                  className="w-full text-left px-5 py-2.5 text-sm transition-all flex items-center gap-3"
                  style={{
                    color: isActive ? dim.color : isEnabled ? "#161616" : "#bebebe",
                    cursor: isEnabled ? "pointer" : "default",
                    backgroundColor: isActive ? dim.color + "12" : "transparent",
                    borderLeft: isActive ? `3px solid ${dim.color}` : "3px solid transparent",
                    fontWeight: isActive ? 600 : 400,
                  }}
                  onMouseEnter={(e) => { if (isEnabled && !isActive) (e.currentTarget as HTMLElement).style.backgroundColor = dim.color + "0a"; }}
                  onMouseLeave={(e) => { if (!isActive) (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"; }}
                >
                  <dim.Icon size={17} className="flex-shrink-0" style={{ opacity: isEnabled ? 1 : 0.4 }} />
                  {dim.label}
                  {!isEnabled && (
                    <span className="ml-auto text-xs hidden group-hover:inline px-2 py-0.5 rounded-md" style={{ backgroundColor: "#f4ece0", color: "#b2b2b2" }}>
                      próximamente
                    </span>
                  )}
                </button>
              </div>
            );
          })}
        </nav>

        <div className="px-5 py-4" style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}>
          <p className="text-xs mb-1" style={{ color: "#bebebe" }}>Conoce más en</p>
          <a href="https://comovamosnl.org" target="_blank" rel="noopener noreferrer"
            className="text-xs font-medium hover:underline" style={{ color: "#7e33c3" }}>
            comovamosnl.org
          </a>
        </div>

      </aside>

      {/* Mobile header */}
      <header className="lg:hidden bg-white flex items-center justify-between px-4 py-3" style={{ borderBottom: "1px solid rgba(0,0,0,0.08)" }}>
        <div className="flex items-center gap-3">
          <img src="/cvnl-logo.png" alt="Cómo Vamos Nuevo León" className="h-10 w-auto cursor-pointer" onClick={() => setShowHero(true)} />
          <div>
            <p className="text-sm font-bold whitespace-nowrap" style={{ color: "#161616" }}>Encuesta Así Vamos</p>
            <p className="text-xs" style={{ color: "#9a9a9a" }}>2023–2025</p>
          </div>
        </div>
        <button onClick={() => setDrawerOpen(true)} className="cursor-pointer p-2 rounded-lg" style={{ color: "#161616" }}>
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <path d="M3 6h16M3 11h16M3 16h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
        </button>
      </header>

      {/* Mobile drawer overlay */}
      {drawerOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div className="absolute inset-0 drawer-backdrop" style={{ backgroundColor: "rgba(0,0,0,0.4)" }} onClick={() => setDrawerOpen(false)} />
          {/* Drawer */}
          <div className="relative w-72 bg-white flex flex-col h-full drawer-slide" style={{ boxShadow: "4px 0 24px rgba(0,0,0,0.12)" }}>
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
              <p className="text-sm font-semibold" style={{ color: "#161616" }}>Dimensiones</p>
              <button onClick={() => setDrawerOpen(false)} className="cursor-pointer p-1" style={{ color: "#9a9a9a" }}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M4 4l12 12M16 4L4 16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
            {/* Dimensions */}
            <nav className="flex-1 py-3">
              {ALL_DIMENSIONS.map((dim) => {
                const isActive = dim.label === dimension;
                const isEnabled = dim.enabled;
                return (
                  <button
                    key={dim.label}
    
                    onClick={() => { if (isEnabled) { handleDimensionClick(dim.label as DimensionLabel); setDrawerOpen(false); } }}
                    className="w-full text-left px-5 py-3 text-sm transition-all flex items-center gap-3"
                    style={{
                      color: isActive ? dim.color : isEnabled ? "#161616" : "#bebebe",
                      cursor: isEnabled ? "pointer" : "not-allowed",
                      backgroundColor: isActive ? dim.color + "12" : "transparent",
                      borderLeft: isActive ? `3px solid ${dim.color}` : "3px solid transparent",
                      fontWeight: isActive ? 600 : 400,
                    }}
                  >
                    <dim.Icon size={17} className="flex-shrink-0" style={{ opacity: isEnabled ? 1 : 0.4 }} />
                {dim.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Top bar: indicator tabs */}
        <div className="bg-white px-4 lg:px-8 pt-3 pb-0" style={{ borderBottom: "1px solid rgba(0,0,0,0.08)" }}>
          {/* Indicator tabs */}
          <div className="flex gap-1 mt-3">
            {currentIndicators.map((i) => {
              const active = selected === i.label;
              const enabled = (i as { enabled: boolean }).enabled;
              return (
                <button
                  key={i.label}
                  disabled={!enabled}
                  onClick={() => enabled && setSelected(i.label)}
                  className="px-4 py-3 text-sm font-medium whitespace-nowrap transition-all"
                  style={{
                    color: active ? i.color : enabled ? "#161616" : "#bebebe",
                    borderBottom: active ? `2.5px solid ${i.color}` : "2.5px solid transparent",
                    background: "transparent",
                    cursor: enabled ? "pointer" : "not-allowed",
                  }}
                >
                  {i.label}
                </button>
              );
            })}
          </div>
        </div>

        <main className="flex-1 px-4 lg:px-8 py-4 lg:py-6 space-y-4 lg:space-y-6">

          {/* Chart panel */}
          <section className="bg-white rounded-2xl p-6 shadow-sm" style={{ border: "1px solid rgba(0,0,0,0.08)" }}>

            {/* Municipio selector + subtitle */}
            <div className="flex flex-col lg:flex-row lg:items-start gap-3 mb-8">
              <div className="flex-1">
                <p className="text-base font-semibold" style={{ color: "#161616" }}>{getQuestion(selected)}</p>
                <p className="text-sm mt-0.5" style={{ color: "#9a9a9a" }}>
                  {selected === "Percepción de inseguridad" && "% que se siente seguro o muy seguro · "}
                  {selected === "Confianza en policía" && "% que confía en la policía de su colonia · "}
                  {selected === "Satisfacción con áreas verdes" && "% que considera los parques limpios y con buena imagen · "}
                  2023–2025
                </p>
              </div>
              <div className="w-full lg:w-1/2">
                <MunicipioSelect values={municipios} onChange={setMunicipios} />
              </div>
            </div>

            {chartMunicipios.length === 0 ? (
              <div className="flex items-center justify-center rounded-xl" style={{ height: 480, backgroundColor: "#fcefe4" }}>
                <p className="text-sm" style={{ color: "#b2b2b2" }}>Selecciona al menos un municipio para ver la gráfica</p>
              </div>
            ) : selected === "Calidad del aire" ? (
              <StackedBarChart
                data={airQualityData as { year: number; municipio: string; Contaminado: number; Neutral: number; Limpio: number }[]}
                municipios={chartMunicipios}
              />
            ) : (
              <TimeSeriesChart data={chartData} municipios={chartMunicipios} lineColor={chartMunicipios.length === 1 ? ind.color : undefined} />
            )}

            <div className="mt-4 flex flex-col gap-1.5">
              <div className="flex items-start justify-between gap-4">
                <p className="text-xs" style={{ color: "#b2b2b2" }}>
                  Fuente: Encuesta Así Vamos, Cómo Vamos Nuevo León.
                </p>
                {chartMunicipios.some((m) => PARTIAL_DATA.has(m)) && (
                  <p className="text-xs text-right flex-shrink-0" style={{ color: "#b2b2b2" }}>
                    * {chartMunicipios.filter((m) => PARTIAL_DATA.has(m)).join(" y ")} solo {chartMunicipios.filter((m) => PARTIAL_DATA.has(m)).length > 1 ? "cuentan" : "cuenta"} con datos de 2025.
                  </p>
                )}
              </div>
              {selected === "Calidad del aire" && (
                <p className="text-xs" style={{ color: "#b2b2b2" }}>
                  * En 2023 la escala de respuesta era diferente (Pésima→Excelente). Los datos fueron normalizados a tres categorías para permitir comparación entre años.
                </p>
              )}
            </div>
          </section>

        </main>
      </div>
    </div>
  );
}
