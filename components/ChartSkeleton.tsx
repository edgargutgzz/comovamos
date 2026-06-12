export default function ChartSkeleton() {
  return (
    <div className="w-full animate-pulse" style={{ height: 480 }}>
      {/* Y axis lines */}
      <div className="flex flex-col justify-between h-full pb-8 pr-6 pl-10">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-6 h-2 rounded" style={{ backgroundColor: "#e8e8e8" }} />
            <div className="flex-1 h-px" style={{ backgroundColor: "#f0f0f0" }} />
          </div>
        ))}
      </div>
    </div>
  );
}
