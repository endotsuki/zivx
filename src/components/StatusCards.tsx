interface StatsCardsProps {
  total: number;
  completed: number;
  downloading: number;
  queued: number;
}
export function StatsCards({ total, completed, downloading, queued }: StatsCardsProps) {
  const stats = [
    { label: 'Total', value: total, color: 'text-zinc-900', border: 'border-zinc-900', bg: 'bg-white' },
    { label: 'Completed', value: completed, color: 'text-emerald-700', border: 'border-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Downloading', value: downloading, color: 'text-blue-700', border: 'border-blue-600', bg: 'bg-blue-50' },
    { label: 'Queued', value: queued, color: 'text-orange-700', border: 'border-orange-500', bg: 'bg-orange-50' },
    { label: 'Failed', value: total - completed - downloading - queued, color: 'text-pink-700', border: 'border-pink-600', bg: 'bg-pink-50' },
  ];

  return (
    <div className='mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5'>
      {stats.map((stat) => (
        <div
          key={stat.label}
          className={`group relative rounded-3xl border-[3px] p-5 shadow-[4px_4px_0_0_#111827] transition-all hover:-translate-y-0.5 ${stat.border} ${stat.bg}`}
        >
          <div className='mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-600'>{stat.label}</div>
          <div className={`text-5xl font-black tabular-nums ${stat.color}`}>{stat.value}</div>
        </div>
      ))}
    </div>
  );
}
