import { TableRow } from './TableRow';
import { TablePagination } from './TablePagination';
import type { DownloadItem } from './App';
import { Delete01Icon, Download04Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Button } from '../ui/button';

interface DownloadTableProps {
  queue: DownloadItem[];
  currentPage: number;
  rowsPerPage: number;
  setCurrentPage: (p: number) => void;
  setRowsPerPage: (r: number) => void;
  clearDownloads: () => void;
  cancelDownload: (id: number) => void;
}

export function DownloadTable({
  queue,
  currentPage,
  rowsPerPage,
  setCurrentPage,
  setRowsPerPage,
  clearDownloads,
  cancelDownload,
}: DownloadTableProps) {
  const start = (currentPage - 1) * rowsPerPage;
  const paginated = queue.slice(start, start + rowsPerPage);
  const totalPages = Math.max(1, Math.ceil(queue.length / rowsPerPage));

  return (
    <div className='space-y-3 sm:space-y-4'>
      <div className='flex flex-wrap items-center justify-between gap-2 rounded-lg border-2 border-zinc-900/15 bg-white px-2 py-1.5 sm:gap-3 sm:rounded-2xl sm:px-3 sm:py-2'>
        <p className='text-xs font-semibold text-zinc-700 sm:text-sm'>
          {queue.length > 0 ? `${queue.length} item${queue.length > 1 ? 's' : ''} in queue` : 'Queue is empty'}
        </p>
        <Button
          variant='ghost'
          onClick={clearDownloads}
          size='icon'
          className='h-8 w-8 text-zinc-700 hover:bg-rose-100 hover:text-rose-600 sm:h-10 sm:w-10'
        >
          <HugeiconsIcon icon={Delete01Icon} size={16} className='sm:size-5' />
        </Button>
      </div>
      {paginated.length === 0 ? (
        <div className='flex flex-col items-center gap-3 py-6 sm:py-8'>
          <div className='flex h-16 w-16 items-center justify-center rounded-full border-2 border-zinc-900 bg-zinc-100 text-zinc-500 sm:h-20 sm:w-20'>
            <HugeiconsIcon icon={Download04Icon} size={32} strokeWidth={1} className='sm:size-10' />
          </div>
          <div className='text-center'>
            <p className='text-sm font-semibold text-zinc-900 sm:text-base'>No downloads yet</p>
            <p className='mt-0.5 text-xs text-zinc-600 sm:text-sm'>Paste a URL above to start</p>
          </div>
        </div>
      ) : (
        <div className='space-y-2'>
          {paginated.map((item, i) => (
            <TableRow key={item.id} item={item} index={i} onCancel={cancelDownload} />
          ))}
        </div>
      )}
      <TablePagination
        currentPage={currentPage}
        totalPages={totalPages}
        rowsPerPage={rowsPerPage}
        setCurrentPage={setCurrentPage}
        setRowsPerPage={setRowsPerPage}
        totalItems={queue.length}
      />
    </div>
  );
}
