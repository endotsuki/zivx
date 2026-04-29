import { Icon } from 'iconza';
import { apiFetch, type DownloadItem } from './App';
import { StatusBadge } from './StatusBadge';
import { HugeiconsIcon } from '@hugeicons/react';
import { Cancel01Icon } from '@hugeicons/core-free-icons';
import { ProgressBar } from './Progressbar';
import { useState, useEffect, useRef } from 'react';
import { getPlatformIcon } from './PlatformIcon';

interface TableRowProps {
  item: DownloadItem;
  onCancel: (id: number) => void;
}

const CANCELLABLE = new Set(['Queued', 'Starting', 'Downloading', 'Merging', 'Converting']);

export function TableRow({ item, onCancel }: TableRowProps) {
  const [thumbnail, setThumbnail] = useState('');
  const [title, setTitle] = useState('');
  const [thumbState, setThumbState] = useState<'loading' | 'ok' | 'error'>('loading');
  const fetchedRef = useRef(new Set<string>());

  useEffect(() => {
    if (fetchedRef.current.has(item.url)) return;
    fetchedRef.current.add(item.url);
    setThumbState('loading');

    apiFetch('/api/thumbnail', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: item.url }),
    })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data) => {
        if (data.thumbnail) {
          setThumbnail(data.thumbnail);
          setTitle(data.title || '');
          setThumbState('ok');
        } else {
          setThumbState('error');
        }
      })
      .catch(() => setThumbState('error'));
  }, [item.url]);

  const platformIcon = getPlatformIcon(item.url);
  const canCancel = CANCELLABLE.has(item.status);

  const formatBadge = item.format === 'audio' ? { label: 'MP3', cls: 'bg-violet-100 text-violet-700 border-violet-300' } : null;

  return (
    <div className='group relative flex items-center gap-3 rounded-2xl border-2 border-zinc-900/90 bg-[#fffdfa] p-3 transition-all hover:-translate-y-0.5'>
      {/* Thumbnail */}
      <div className='relative h-24 w-24 shrink-0 overflow-hidden rounded-xl border-2 border-zinc-900/80 bg-zinc-100'>
        {thumbState === 'loading' && (
          <div className='flex h-full w-full items-center justify-center'>
            <div className='h-8 w-8 animate-spin rounded-full border-2 border-zinc-300 border-t-orange-500' />
          </div>
        )}
        {thumbState === 'error' && (
          <div className='flex h-full w-full items-center justify-center'>
            <svg className='h-full w-full p-6 text-zinc-400' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={1.5}
                d='M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z'
              />
            </svg>
          </div>
        )}
        {thumbState === 'ok' && (
          <img src={thumbnail} alt='thumb' className='h-full w-full object-cover' onError={() => setThumbState('error')} />
        )}
        {/* Platform icon */}
        <div className='absolute left-1.5 top-1.5'>
          {platformIcon.type === 'iconza' ? (
            <Icon name={platformIcon.name} size={20} className='text-white drop-shadow' />
          ) : (
            <HugeiconsIcon icon={platformIcon.icon} size={20} className='text-yellow-400 drop-shadow' />
          )}
        </div>
      </div>

      {/* Info */}
      <div className='min-w-0 flex-1'>
        <div className='mb-1 flex items-start justify-between gap-2'>
          <a
            href={item.url}
            target='_blank'
            rel='noopener noreferrer'
            title={title || item.url}
            className='line-clamp-2 text-xs font-semibold text-zinc-900 hover:text-orange-600 hover:underline sm:text-sm'
          >
            {title || item.url}
          </a>
          <div className='flex shrink-0 items-center gap-1'>
            {formatBadge && (
              <span className={`rounded-lg border px-1.5 py-0.5 text-[10px] font-bold ${formatBadge.cls}`}>{formatBadge.label}</span>
            )}
            {canCancel && (
              <button
                onClick={() => onCancel(item.id)}
                className='rounded-lg border border-zinc-200 bg-zinc-50 p-1 text-zinc-400 transition hover:border-red-300 hover:bg-red-50 hover:text-red-500'
                title='Cancel download'
              >
                <HugeiconsIcon icon={Cancel01Icon} size={14} />
              </button>
            )}
          </div>
        </div>

        <div className='mb-1.5'>
          <ProgressBar progress={item.progress ?? 0} />
        </div>

        <div className='flex items-center justify-between text-xs text-zinc-500'>
          <StatusBadge status={item.status} />
          <span>{item.progress?.toFixed(1) ?? '0.0'}%</span>
        </div>

        {item.status === 'Error' && item.error && (
          <p className='mt-1 line-clamp-1 text-[10px] text-red-500' title={item.error}>
            {item.error}
          </p>
        )}
      </div>
    </div>
  );
}
