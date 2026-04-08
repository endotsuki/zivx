interface StatsCardsProps {
  total: number;
  completed: number;
  downloading: number;
  queued: number;
}

interface StatsCardsProps {
  total: number;
  completed: number;
  downloading: number;
  queued: number;
}
export function StatsCards({ total, completed, downloading, queued }: StatsCardsProps) {
  const stats = [
    { label: 'Total', value: total, color: 'text-zinc-900', border: 'border-zinc-900' },
    { label: 'Completed', value: completed, color: 'text-emerald-600', border: 'border-emerald-600' },
    { label: 'Downloading', value: downloading, color: 'text-sky-600', border: 'border-sky-600' },
    { label: 'Queued', value: queued, color: 'text-amber-600', border: 'border-amber-600' },
    { label: 'Failed', value: total - completed - downloading - queued, color: 'text-rose-600', border: 'border-rose-600' },
  ];

  return (
    <div className='mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5'>
      {stats.map((stat) => (
        <div
          key={stat.label}
          className={`group relative rounded-3xl border-2 bg-[#fffdfa] p-6 shadow-[4px_4px_0_0_#111827] transition-all hover:-translate-y-0.5 ${stat.border}`}
        >
          <div className='mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-600'>{stat.label}</div>
          <div className={`text-5xl font-black tabular-nums ${stat.color}`}>{stat.value}</div>
        </div>
      ))}
    </div>
  );
}
