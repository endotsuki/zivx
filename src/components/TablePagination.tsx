import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { ArrowLeft01Icon, ArrowRight01Icon, Tick02Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';

interface TablePaginationProps {
  currentPage: number;
  totalPages: number;
  rowsPerPage: number;
  setCurrentPage: (page: number) => void;
  setRowsPerPage: (rows: number) => void;
  totalItems: number;
}

export function TablePagination({
  currentPage,
  totalPages,
  rowsPerPage,
  setCurrentPage,
  setRowsPerPage,
  totalItems,
}: TablePaginationProps) {
  const handleRowsChange = (value: number) => {
    setRowsPerPage(value);
    setCurrentPage(1);
  };

  const startItem = (currentPage - 1) * rowsPerPage + 1;
  const endItem = Math.min(currentPage * rowsPerPage, totalItems);

  return (
    <div className='flex flex-wrap items-center justify-between gap-4'>
      <div className='flex items-center gap-3'>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='archived' className='gap-2 border-2 border-zinc-900 bg-white text-zinc-700 hover:bg-orange-100'>
              Show <span className='font-semibold text-zinc-900'>{rowsPerPage}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='start' className='w-36 border-2 border-zinc-900 bg-[#fffdfa]'>
            <DropdownMenuLabel className='text-zinc-700'>Rows per page</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {[25, 50, 100, 200].map((value) => (
              <DropdownMenuItem key={value} onClick={() => handleRowsChange(value)} className='flex justify-between'>
                {value}
                {rowsPerPage === value && <HugeiconsIcon icon={Tick02Icon} size={16} className='text-emerald-500' />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <span className='hidden text-sm text-zinc-600 sm:inline'>
          {totalItems > 0 ? (
            <>
              <span className='text-zinc-800'>{startItem}</span>–<span className='text-zinc-800'>{endItem}</span> of{' '}
              <span className='font-medium text-zinc-800'>{totalItems}</span>
            </>
          ) : (
            'No items'
          )}
        </span>
      </div>

      <div className='flex items-center gap-2'>
        <Button
          variant='archived'
          onClick={() => setCurrentPage(currentPage - 1)}
          disabled={currentPage <= 1}
          className='h-9 border-2 border-zinc-900 bg-white px-3 text-zinc-800 hover:bg-orange-100'
        >
          <HugeiconsIcon size={16} icon={ArrowLeft01Icon} />
          <span className='ml-1 hidden sm:inline'>Previous</span>
        </Button>
        <div className='flex h-9 items-center gap-1.5 rounded-xl border-2 border-zinc-900 bg-white px-3 text-sm'>
          <span className='text-zinc-600'>Page</span>
          <span className='font-bold text-orange-600'>{currentPage}</span>
          <span className='text-zinc-400'>/</span>
          <span className='font-medium text-zinc-800'>{totalPages}</span>
        </div>
        <Button
          variant='archived'
          onClick={() => setCurrentPage(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className='h-9 border-2 border-zinc-900 bg-white px-3 text-zinc-800 hover:bg-orange-100'
        >
          <span className='mr-1 hidden sm:inline'>Next</span>
          <HugeiconsIcon size={16} icon={ArrowRight01Icon} />
        </Button>
      </div>
    </div>
  );
}
