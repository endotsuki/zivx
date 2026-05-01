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
    { label: 'Queued', value: queued, color: 'text-yellow-700', border: 'border-yellow-500', bg: 'bg-yellow-50' },
    {
      label: 'Failed',
      value: total - completed - downloading - queued,
      color: 'text-pink-700',
      border: 'border-pink-600',
      bg: 'bg-pink-50',
    },
  ];

  return (
    <div className='mb-4 grid grid-cols-2 gap-2 sm:mb-6 sm:grid-cols-3 sm:gap-3 md:grid-cols-5'>
      {stats.map((stat) => (
        <div
          key={stat.label}
          className={`group relative rounded-2xl border-[3px] p-2.5 shadow-[2px_2px_0_0_#111827] transition-all sm:rounded-3xl sm:p-5 sm:shadow-[4px_4px_0_0_#111827] ${stat.border} ${stat.bg}`}
        >
          <div className='mb-0.5 text-xs font-semibold uppercase tracking-[0.08em] text-zinc-600 sm:mb-1 sm:tracking-[0.16em]'>
            {stat.label}
          </div>
          <div className={`text-2xl font-black tabular-nums sm:text-5xl ${stat.color}`}>{stat.value}</div>
        </div>
      ))}
    </div>
  );
}
