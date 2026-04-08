import {
  AnonymousIcon,
  Cancel01Icon,
  Loading03Icon,
  HourglassIcon,
  Link05Icon,
  Rocket01Icon,
  Tick02Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';

interface StatusBadgeProps {
  status: string;
  icon?: React.ReactNode;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const getStatusStyle = (status: string) => {
    const statusLower = status.toLowerCase();

    switch (statusLower) {
      case 'queued':
        return {
          bg: 'bg-zinc-100',
          text: 'text-zinc-700',
          border: 'border-zinc-400',
          icon: HourglassIcon,
        };
      case 'starting':
        return {
          bg: 'bg-sky-100',
          text: 'text-sky-700',
          border: 'border-sky-400',
          icon: Rocket01Icon,
        };
      case 'downloading':
        return {
          bg: 'bg-orange-100',
          text: 'text-orange-700',
          border: 'border-orange-400',
          icon: Loading03Icon,
        };
      case 'merging':
        return {
          bg: 'bg-amber-100',
          text: 'text-amber-700',
          border: 'border-amber-400',
          icon: Link05Icon,
        };
      case 'completed':
        return {
          bg: 'bg-emerald-100',
          text: 'text-emerald-700',
          border: 'border-emerald-400',
          icon: Tick02Icon,
        };
      case 'error':
        return {
          bg: 'bg-rose-100',
          text: 'text-rose-700',
          border: 'border-rose-400',
          icon: Cancel01Icon,
        };
      default:
        return {
          bg: 'bg-zinc-100',
          text: 'text-zinc-700',
          border: 'border-zinc-400',
          icon: AnonymousIcon,
        };
    }
  };

  const style = getStatusStyle(status);

  const isDownloading = status.toLowerCase() === 'downloading';

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-medium ${style.bg} ${style.text} ${style.border}`}
    >
      {isDownloading ? (
        <div className='h-4 w-4 animate-spin rounded-full border-2 border-orange-300 border-t-orange-600'></div>
      ) : (
        <HugeiconsIcon icon={style.icon} size={16} />
      )}
      {status}
    </span>
  );
}
