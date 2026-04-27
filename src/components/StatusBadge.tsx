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
          bg: 'bg-yellow-50',
          text: 'text-yellow-700',
          border: 'border-yellow-300',
          icon: HourglassIcon,
        };
      case 'starting':
        return {
          bg: 'bg-blue-50',
          text: 'text-blue-700',
          border: 'border-blue-300',
          icon: Rocket01Icon,
        };
      case 'downloading':
        return {
          bg: 'bg-blue-50',
          text: 'text-blue-700',
          border: 'border-blue-300',
          icon: Loading03Icon,
        };
      case 'merging':
        return {
          bg: 'bg-amber-50',
          text: 'text-amber-700',
          border: 'border-amber-300',
          icon: Link05Icon,
        };
      case 'completed':
        return {
          bg: 'bg-emerald-50',
          text: 'text-emerald-700',
          border: 'border-emerald-300',
          icon: Tick02Icon,
        };
      case 'error':
        return {
          bg: 'bg-pink-50',
          text: 'text-pink-700',
          border: 'border-pink-300',
          icon: Cancel01Icon,
        };
      default:
        return {
          bg: 'bg-zinc-50',
          text: 'text-zinc-700',
          border: 'border-zinc-300',
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
        <div className='h-4 w-4 animate-spin rounded-full border-2 border-yellow-300 border-t-yellow-600'></div>
      ) : (
        <HugeiconsIcon icon={style.icon} size={16} />
      )}
      {status}
    </span>
  );
}
