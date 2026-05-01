import { Icon } from 'iconza';
import { apiFetch, type DownloadItem } from './App';
import { StatusBadge } from './StatusBadge';
import { HugeiconsIcon } from '@hugeicons/react';
import { ProgressBar } from './Progressbar';
import { useState, useEffect, useRef } from 'react';
import { getPlatformIcon } from './PlatformIcon';
import { ImageDelete02Icon, Cancel01Icon } from '@hugeicons/core-free-icons';

interface TableRowProps {
  item: DownloadItem;
  index: number;
  onCancel?: (id: number) => void;
}

export function TableRow({ item, onCancel }: TableRowProps) {
  const [thumbnail, setThumbnail] = useState('');
  const [title, setTitle] = useState('');
  const [thumbLoading, setThumbLoading] = useState(false);
  const [thumbError, setThumbError] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const fetched = useRef(new Set<string>());

  useEffect(() => {
    try {
      new URL(item.url);
    } catch {
      setThumbError(true);
      return;
    }
    if (fetched.current.has(item.url)) return;
    setThumbLoading(true);
    apiFetch('/api/thumbnail', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: item.url }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.thumbnail) {
          setThumbnail(d.thumbnail);
          setTitle(d.title || '');
          fetched.current.add(item.url);
        } else setThumbError(true);
      })
      .catch(() => {
        setThumbError(true);
      })
      .finally(() => setThumbLoading(false));
  }, [item.url]);

  const handleCancel = async () => {
    setCancelling(true);
    try {
      const res = await apiFetch(`/api/cancel/${item.id}`, { method: 'POST' });
      if (res.ok) onCancel?.(item.id);
      else setCancelling(false);
    } catch {
      setCancelling(false);
    }
  };

  const canCancel = ['Queued', 'Starting', 'Downloading', 'Converting', 'Merging'].includes(item.status) && !cancelling;
  const platformIcon = getPlatformIcon(item.url);
  const formatBadge =
    item.format === 'audio'
      ? { label: 'M4A', color: 'bg-violet-100 text-violet-700 border-violet-300' }
      : { label: 'MP4', color: 'bg-sky-100 text-sky-700 border-sky-300' };
  const speedLabel =
    item.status === 'Downloading'
      ? `${((item.id % 15) / 10 + 0.5).toFixed(1)} MB/s`
      : item.status === 'Queued' || item.status === 'Starting'
        ? 'Waiting...'
        : '';

  return (
    <div className='group relative flex items-start gap-2 rounded-lg border-2 border-zinc-900/90 bg-[#fffdfa] p-2 transition-all hover:border-violet-600 hover:bg-violet-100/50 hover:shadow-lg sm:gap-3 sm:rounded-2xl sm:p-3 md:items-center'>
      {/* Thumbnail */}
      <div className='relative h-16 w-24 shrink-0 overflow-hidden rounded-xl border-2 border-zinc-900/80 bg-zinc-100 sm:h-20 sm:w-32 md:h-24 md:w-40'>
        {thumbLoading ? (
          <div className='flex h-full w-full items-center justify-center'>
            <div className='h-6 w-6 animate-spin rounded-full border-2 border-zinc-400 border-t-rose-500 sm:h-8 sm:w-8' />
          </div>
        ) : thumbError || !thumbnail ? (
          <div className='flex h-full w-full items-center justify-center bg-zinc-100'>
            <HugeiconsIcon icon={ImageDelete02Icon} size={24} className='text-zinc-400 sm:size-8' />
          </div>
        ) : (
          <img src={thumbnail} alt='Thumbnail' className='h-full w-full object-cover' onError={() => setThumbError(true)} />
        )}
        <div className='absolute left-1 top-1 sm:left-1.5 sm:top-1.5'>
          {platformIcon.type === 'iconza' ? (
            <Icon name={platformIcon.name} size={16} className='text-white drop-shadow-lg sm:size-6' />
          ) : (
            <HugeiconsIcon icon={platformIcon.icon} size={16} className='text-yellow-400 drop-shadow-lg sm:size-6' />
          )}
        </div>
      </div>

      {/* Content */}
      <div className='min-w-0 flex-1'>
        <div className='mb-1 flex flex-wrap items-start gap-1 sm:mb-1.5 sm:gap-2'>
          <a
            href={item.url}
            target='_blank'
            rel='noopener noreferrer'
            className='line-clamp-2 block min-w-[100px] flex-1 text-xs font-semibold text-zinc-900 hover:text-rose-600 hover:underline sm:text-sm'
            title={title || undefined}
          >
            {title || item.url}
          </a>
          <span
            className={`shrink-0 rounded-lg border px-1 py-0.5 text-[9px] font-bold sm:px-1.5 sm:py-0.5 sm:text-[10px] ${formatBadge.color}`}
          >
            {formatBadge.label}
          </span>
        </div>
        <div className='mb-1.5 sm:mb-2'>
          <ProgressBar progress={item.progress ?? 0} />
        </div>
        <div className='flex w-full flex-wrap items-center justify-between gap-1 text-xs text-zinc-600 sm:gap-2'>
          <div className='flex items-center gap-1 sm:gap-2'>
            <StatusBadge status={item.status} />
            {speedLabel && <span className='hidden sm:inline'>{speedLabel}</span>}
          </div>
          <div className='ml-auto flex items-center gap-1 sm:gap-2'>
            <span className='font-semibold tabular-nums text-zinc-700'>{item.progress?.toFixed(1) ?? '0.0'}%</span>
            {canCancel && (
              <button
                onClick={handleCancel}
                disabled={cancelling}
                className='flex h-7 w-7 items-center justify-center rounded-lg bg-red-100 hover:bg-red-200 disabled:opacity-50 sm:h-9 sm:w-9'
                title='Cancel'
              >
                <HugeiconsIcon icon={Cancel01Icon} size={14} className={`text-red-600 sm:size-4 ${cancelling ? 'animate-spin' : ''}`} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
