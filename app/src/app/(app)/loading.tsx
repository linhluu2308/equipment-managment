export default function DangTai() {
  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="kpi-card animate-pulse">
            <div className="h-3 w-20 rounded bg-[var(--border-color)] mb-3" />
            <div className="h-6 w-16 rounded bg-[var(--border-color)]" />
          </div>
        ))}
      </div>
      <div className="table-container animate-pulse">
        <div className="p-4 flex flex-col gap-3">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="h-8 rounded bg-[var(--border-color)]" style={{ opacity: 1 - i * 0.12 }} />
          ))}
        </div>
      </div>
    </div>
  );
}
