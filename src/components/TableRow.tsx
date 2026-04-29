import { Icon } from 'iconza';
import { API_BASE_URL, type DownloadItem } from './App';
import { StatusBadge } from './StatusBadge';
import { HugeiconsIcon } from '@hugeicons/react';
import { ProgressBar } from './Progressbar';
import { useState, useEffect, useRef } from 'react';
import { getPlatformIcon } from './PlatformIcon';

interface TableRowProps {
  item: DownloadItem;
  index: number;
}

export function TableRow({ item }: TableRowProps) {
  const [thumbnail, setThumbnail] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [thumbnailLoading, setThumbnailLoading] = useState(false);
  const [thumbnailError, setThumbnailError] = useState(false);
  const fetchedUrls = useRef(new Set<string>());

  const fetchThumbnail = async (url: string) => {
    if (fetchedUrls.current.has(url)) return;

    setThumbnailLoading(true);
    setThumbnailError(false);

    try {
      // ✅ Uses the same backend as the rest of the app — no more hardcoded koyeb URL
      const response = await fetch(`${API_BASE_URL}/thumbnail`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.thumbnail) {
          setThumbnail(data.thumbnail);
          setTitle(data.title || '');
          fetchedUrls.current.add(url);
          setThumbnailLoading(false);
          return;
        }
      }

      setThumbnailError(true);
      setThumbnailLoading(false);
    } catch (error) {
      console.error('Failed to fetch thumbnail:', error);
      setThumbnailError(true);
      setThumbnailLoading(false);
    }
  };

  useEffect(() => {
    if (!fetchedUrls.current.has(item.url)) {
      fetchThumbnail(item.url);
    }
  }, [item.url]);

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

  // Show format badge (MP3 / ZIP / MP4)
  const getFormatBadge = () => {
    if (item.format === 'audio') return { label: 'MP3', color: 'bg-violet-100 text-violet-700 border-violet-300' };
    if (item.filename?.endsWith('.zip')) return { label: 'Images ZIP', color: 'bg-blue-100 text-blue-700 border-blue-300' };
    return null;
  };

  const formatBadge = getFormatBadge();
  const platformIcon = getPlatformIcon(item.url);

  return (
    <div className='group relative flex items-center gap-3 rounded-2xl border-2 border-zinc-900/90 bg-[#fffdfa] p-3 transition-all hover:-translate-y-0.5'>
      {/* Thumbnail */}
      <div className='relative h-24 w-24 shrink-0 overflow-hidden rounded-xl border-2 border-zinc-900/80 bg-zinc-100'>
        {thumbnailLoading ? (
          <div className='flex h-full w-full items-center justify-center'>
            <div className='h-8 w-8 animate-spin rounded-full border-2 border-zinc-400 border-t-rose-500' />
          </div>
        ) : thumbnailError || !thumbnail ? (
          <div className='flex h-full w-full items-center justify-center bg-zinc-100'>
            <svg className='h-full w-full p-6 text-zinc-500' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={1.5}
                d='M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z'
              />
            </svg>
          </div>
        ) : (
          <img src={thumbnail} alt='Thumbnail' className='h-full w-full object-cover' onError={() => setThumbnailError(true)} />
        )}

        {/* Platform icon overlay */}
        <div className='absolute left-1.5 top-1.5 flex h-5 w-5 items-center justify-center'>
          {platformIcon.type === 'iconza' ? (
            <Icon name={platformIcon.name} size={23} className='text-white drop-shadow-lg' />
          ) : (
            <HugeiconsIcon icon={platformIcon.icon} size={23} className='text-yellow-400 drop-shadow-lg' />
          )}
        </div>
      </div>

      {/* Content */}
      <div className='min-w-0 flex-1'>
        <div className='mb-1.5 flex items-start justify-between gap-2'>
          <a
            href={item.url}
            target='_blank'
            rel='noopener noreferrer'
            className='line-clamp-2 block text-xs font-semibold text-zinc-900 transition-colors hover:text-rose-600 hover:underline sm:text-sm'
            title={title ?? undefined}
            aria-label={title || item.url}
          >
            {title || item.url}
          </a>
          {/* Format badge */}
          {formatBadge && (
            <span className={`shrink-0 rounded-lg border px-1.5 py-0.5 text-[10px] font-bold ${formatBadge.color}`}>
              {formatBadge.label}
            </span>
          )}
        </div>

        <div className='mb-2'>
          <ProgressBar progress={item.progress ?? 0} />
        </div>

        <div className='flex items-center justify-between text-xs text-zinc-600'>
          <div className='flex items-center gap-3'>
            <StatusBadge status={item.status} />
            <span>{getDownloadSpeed()}</span>
          </div>
          <span>{item.progress?.toFixed(1) || '0.0'}%</span>
        </div>
      </div>
    </div>
  );
}
