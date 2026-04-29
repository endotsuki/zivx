import { Icon } from 'iconza';
import { API_BASE_URL, type DownloadItem } from './App';
import { StatusBadge } from './StatusBadge';
import { HugeiconsIcon } from '@hugeicons/react';
import { ProgressBar } from './Progressbar';
import { useState, useEffect, useRef } from 'react';
import { getPlatformIcon } from './PlatformIcon';
import { ImageDelete02Icon, Cancel01Icon } from '@hugeicons/core-free-icons';

interface TableRowProps {
  item: DownloadItem;
  index: number;
  onCancel?: (itemId: number) => void;
}

export function TableRow({ item, onCancel }: TableRowProps) {
  const [thumbnail, setThumbnail] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [thumbnailLoading, setThumbnailLoading] = useState(false);
  const [thumbnailError, setThumbnailError] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
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
    if (item.format === 'video') return { label: 'MP4', color: 'bg-green-100 text-green-700 border-green-300' };
    if (item.format === 'audio') return { label: 'MP3', color: 'bg-violet-100 text-violet-700 border-violet-300' };
    return null;
  };

  // Determine if cancel button should be shown
  const canCancel = () => {
    const cancellableStatuses = ['Queued', 'Starting', 'Downloading', 'Converting', 'Merging'];
    return cancellableStatuses.includes(item.status) && !isCancelling;
  };

  // Handle cancel action
  const handleCancel = async () => {
    setIsCancelling(true);
    try {
      const response = await fetch(`${API_BASE_URL}/cancel/${item.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        console.log(`Download ${item.id} cancelled successfully`);
        onCancel?.(item.id);
      } else {
        console.error('Failed to cancel download');
        setIsCancelling(false);
      }
    } catch (error) {
      console.error('Error cancelling download:', error);
      setIsCancelling(false);
    }
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
            <HugeiconsIcon icon={ImageDelete02Icon} size={32} className='text-zinc-400' />
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

      {/* Cancel Button */}
      {canCancel() && (
        <button
          onClick={handleCancel}
          disabled={isCancelling}
          className='shrink-0 rounded-lg bg-red-100 p-2 transition-all hover:bg-red-200 hover:shadow-lg active:scale-95 disabled:cursor-not-allowed disabled:opacity-50'
          title='Cancel this download'
          aria-label='Cancel download'
        >
          <HugeiconsIcon icon={Cancel01Icon} size={20} className={`text-red-600 transition-all ${isCancelling ? 'animate-spin' : ''}`} />
        </button>
      )}
    </div>
  );
}
