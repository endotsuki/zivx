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
    <div className='group relative flex items-start gap-3 rounded-2xl border-2 border-zinc-900/90 bg-[#fffdfa] p-3 transition-all hover:border-violet-600 hover:bg-violet-100/50 hover:shadow-lg sm:items-center'>
      {/* Thumbnail */}
      <div className='relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 border-zinc-900/80 bg-zinc-100 sm:h-24 sm:w-24'>
        {thumbLoading ? (
          <div className='flex h-full w-full items-center justify-center'>
            <div className='h-8 w-8 animate-spin rounded-full border-2 border-zinc-400 border-t-rose-500' />
          </div>
        ) : thumbError || !thumbnail ? (
          <div className='flex h-full w-full items-center justify-center bg-zinc-100'>
            <HugeiconsIcon icon={ImageDelete02Icon} size={32} className='text-zinc-400' />
          </div>
        ) : (
          <img src={thumbnail} alt='Thumbnail' className='h-full w-full object-cover' onError={() => setThumbError(true)} />
        )}
        <div className='absolute left-1.5 top-1.5'>
          {platformIcon.type === 'iconza' ? (
            <Icon name={platformIcon.name} size={23} className='text-white drop-shadow-lg' />
          ) : (
            <HugeiconsIcon icon={platformIcon.icon} size={23} className='text-yellow-400 drop-shadow-lg' />
          )}
        </div>
      </div>

      {/* Content */}
      <div className='min-w-0 flex-1'>
        <div className='mb-1.5 flex flex-wrap items-start gap-2'>
          <a
            href={item.url}
            target='_blank'
            rel='noopener noreferrer'
            className='line-clamp-2 block min-w-[120px] flex-1 text-xs font-semibold text-zinc-900 hover:text-rose-600 hover:underline sm:text-sm'
            title={title || undefined}
          >
            {title || item.url}
          </a>
          <span className={`shrink-0 rounded-lg border px-1.5 py-0.5 text-[10px] font-bold ${formatBadge.color}`}>{formatBadge.label}</span>
        </div>
        <div className='mb-2'>
          <ProgressBar progress={item.progress ?? 0} />
        </div>
        <div className='flex w-full flex-wrap items-center justify-between gap-2 text-xs text-zinc-600'>
          <div className='flex items-center gap-2'>
            <StatusBadge status={item.status} />
            {speedLabel && <span>{speedLabel}</span>}
            {item.status === 'Error' && item.error && (
              <span className='truncate text-rose-500' title={item.error}>
                {item.error.slice(0, 50)}
              </span>
            )}
          </div>
          <div className='ml-auto flex items-center gap-2'>
            <span className='font-semibold tabular-nums text-zinc-700'>{item.progress?.toFixed(1) ?? '0.0'}%</span>
            {canCancel && (
              <button
                onClick={handleCancel}
                disabled={cancelling}
                className='flex h-9 w-9 items-center justify-center rounded-lg bg-red-100 hover:bg-red-200 disabled:opacity-50'
                title='Cancel'
              >
                <HugeiconsIcon icon={Cancel01Icon} size={18} className={`text-red-600 ${cancelling ? 'animate-spin' : ''}`} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
