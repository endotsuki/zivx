import type { DownloadItem } from './App';
import { ProgressBar } from './Progressbar';

interface DownloadCardProps {
  item: DownloadItem;
  isCompleted?: boolean;
}

export function DownloadCard({ item, isCompleted = false }: DownloadCardProps) {
  const getDownloadSpeed = () => {
    if (item.status === 'Downloading') {
      const speed = ((item.id % 15) / 10 + 0.5).toFixed(1);
      return `${speed}MB/S`;
    }
    if (item.status === 'Queued' || item.status === 'Starting') {
      return 'Waiting...';
    }
    return '';
  };

  const displayTitle = item.filename || item.url.split('/').pop() || item.url;
  const truncatedTitle = displayTitle.length > 35 ? displayTitle.substring(0, 35) + '...' : displayTitle;

  return (
    <div className='flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-900/55 p-3 transition-colors active:bg-slate-800/70'>
      <div className='flex h-20 w-20 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-slate-800/70'></div>
      <div className='min-w-0 flex-1'>
        <p className='mb-2 line-clamp-2 text-sm font-semibold leading-tight text-zinc-100'>{truncatedTitle}</p>

        {!isCompleted ? (
          <>
            <div className='mb-1.5'>
              <ProgressBar progress={item.progress ?? 0} />
            </div>
            <div className='flex items-center justify-between text-xs text-zinc-300/80'>
              <span>{getDownloadSpeed()}</span>
              <span>{item.progress?.toFixed(1) || '0.0'}%</span>
            </div>
          </>
        ) : (
          <div className='flex items-center gap-2 text-xs text-zinc-300/80'>
            <svg width='14' height='14' viewBox='0 0 24 24' fill='none'>
              <path d='M8 5v14l11-7z' fill='currentColor' />
            </svg>
            <span>{item.size || 'Completed'}</span>
          </div>
        )}
      </div>
    </div>
  );
}
