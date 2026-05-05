import { type RefObject } from 'react';
import { Button } from '../ui/button';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Delete01Icon,
  CloudDownloadIcon,
  Folder03Icon,
  Task02Icon,
  MusicNote03Icon,
  AiVideoIcon,
  Image01Icon,
} from '@hugeicons/core-free-icons';
import { AnimatePresence, motion } from 'framer-motion';

interface DownloadControlsProps {
  videoLink: string;
  setVideoLink: (v: string) => void;
  selectedDirectory: FileSystemDirectoryHandle | null;
  setSelectedDirectory: (h: FileSystemDirectoryHandle | null) => void;
  queueSingle: (format: 'video' | 'audio' | 'image') => void;
  uploadList: () => void;
  fileInputRef: RefObject<HTMLInputElement>;
}

const inputBase =
  'w-full rounded-2xl border-2 border-zinc-900 bg-white px-4 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 outline-none transition-colors focus:border-sky-500';

export function DownloadControls({
  videoLink,
  setVideoLink,
  selectedDirectory,
  setSelectedDirectory,
  queueSingle,
  uploadList,
  fileInputRef,
}: DownloadControlsProps) {
  const handleSelectDirectory = async () => {
    if (!('showDirectoryPicker' in window)) return alert('Directory picker not supported. Use Chrome, Edge, or Opera.');
    try {
      setSelectedDirectory(await (window as any).showDirectoryPicker({ mode: 'readwrite' }));
    } catch (e: any) {
      if (e.name !== 'AbortError') alert('Failed to select directory.');
    }
  };

  const handlePaste = async () => {
    try {
      setVideoLink(await navigator.clipboard.readText());
    } catch {
      /* silent */
    }
  };

  return (
    <div className='space-y-6'>
      {/* URL Input */}
      <div>
        <label className='mb-1.5 block text-sm font-black uppercase tracking-wider sm:text-base'>URL</label>
        <div className='flex flex-col gap-2 sm:flex-row sm:gap-3'>
          <div className='relative flex-1'>
            <input
              className={`h-11 min-w-0 pr-24 sm:h-12 sm:pr-28 ${inputBase}`}
              type='text'
              placeholder='Paste video, audio, or image URL…'
              value={videoLink}
              onChange={(e) => setVideoLink(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && queueSingle('video')}
            />
            <Button
              variant='ghost'
              onClick={handlePaste}
              className='absolute right-1 top-1/2 h-8 -translate-y-1/2 gap-1.5 rounded-xl border border-sky-500 bg-sky-50 px-2.5 text-xs font-semibold text-sky-600 hover:border-sky-600 hover:bg-sky-100 sm:right-1.5 sm:h-9 sm:px-3 sm:text-sm'
            >
              <HugeiconsIcon icon={Task02Icon} size={16} className='text-sky-500 sm:size-5' />
              <span>Paste</span>
            </Button>
          </div>

          {/* Format buttons */}
          <div className='flex'>
            {[
              {
                fmt: 'video' as const,
                icon: AiVideoIcon,
                label: 'MP4',
                cls: 'rounded-l-xl rounded-r-none border-r-0 border-rose-700 bg-rose-500 hover:bg-rose-600',
              },
              {
                fmt: 'audio' as const,
                icon: MusicNote03Icon,
                label: 'MP3',
                cls: 'rounded-none border-x-0 border-violet-700 bg-violet-500 hover:bg-violet-600',
              },
              {
                fmt: 'image' as const,
                icon: Image01Icon,
                label: 'IMG',
                cls: 'rounded-r-xl border-l-0 rounded-l-none border-emerald-700 bg-emerald-500 hover:bg-emerald-600',
              },
            ].map(({ fmt, icon, label, cls }) => (
              <Button
                key={fmt}
                variant='on-hold'
                onClick={() => queueSingle(fmt)}
                className={`h-10 flex-1 border-2 px-3 text-xs font-semibold text-white sm:h-12 sm:px-5 sm:text-base ${cls}`}
              >
                <HugeiconsIcon icon={icon} size={16} className='sm:size-5' />
                <span className='ml-1'>{label}</span>
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Save Folder + Batch Upload */}
      <div className='grid gap-3 border-t-2 border-zinc-900/20 pt-4 sm:gap-3 sm:pt-5 lg:grid-cols-2'>
        <div className='space-y-2 rounded-xl border-2 border-zinc-900 bg-zinc-50 p-2.5 sm:rounded-2xl sm:p-3'>
          <div>
            <p className='text-xs font-black uppercase tracking-wider text-zinc-700 sm:text-sm'>Save Location</p>
            <p className='text-xs font-medium text-zinc-500 sm:text-sm'>Choose where completed files are saved.</p>
          </div>
          <div className='flex min-w-0 flex-col gap-2 sm:flex-row sm:gap-2'>
            <motion.button
              layout
              type='button'
              onClick={handleSelectDirectory}
              className='flex min-h-10 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg border-2 border-zinc-900 bg-white px-2 text-xs text-zinc-600 transition-colors hover:bg-rose-50 hover:text-rose-600 sm:min-h-11 sm:rounded-xl sm:px-4 sm:text-sm'
            >
              <AnimatePresence mode='popLayout'>
                {selectedDirectory ? (
                  <motion.span
                    key='sel'
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className='flex min-w-0 items-center truncate'
                  >
                    <HugeiconsIcon icon={Folder03Icon} size={16} className='mr-1 shrink-0 text-sky-500 sm:size-5' />
                    <span className='truncate font-semibold'>{selectedDirectory.name}</span>
                  </motion.span>
                ) : (
                  <motion.span
                    key='def'
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className='flex items-center gap-1.5 font-semibold text-zinc-800'
                  >
                    <HugeiconsIcon icon={Folder03Icon} size={16} className='sm:size-5' />
                    <span className='hidden sm:inline'>Choose</span> Folder
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
            <AnimatePresence>
              {selectedDirectory && (
                <motion.button
                  key='clr'
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  onClick={() => setSelectedDirectory(null)}
                  className='flex h-10 items-center justify-center gap-1 rounded-lg border-2 border-zinc-900 bg-white px-2 text-xs text-zinc-600 transition-colors hover:bg-rose-50 hover:text-red-500 sm:h-11 sm:rounded-xl sm:px-3 sm:text-sm'
                >
                  <HugeiconsIcon icon={Delete01Icon} size={16} className='sm:size-5' />
                  <span className='hidden sm:inline'>Clear</span>
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className='space-y-2 rounded-xl border-2 border-zinc-900 bg-zinc-50 p-2.5 sm:space-y-2.5 sm:rounded-2xl sm:p-3'>
          <div>
            <p className='text-xs font-black uppercase tracking-wider text-zinc-700 sm:text-sm'>Batch Upload</p>
            <p className='text-xs font-medium text-zinc-500 sm:text-sm'>
              Drop a <code className='rounded bg-zinc-200 px-1 py-0.5'>.txt</code> file with many URLs.
            </p>
          </div>
          <input ref={fileInputRef} type='file' accept='.txt' className='hidden' id='batch-file' onChange={uploadList} />
          <label
            htmlFor='batch-file'
            onDragOver={(e) => {
              e.preventDefault();
              e.currentTarget.classList.add('border-rose-400', 'bg-rose-50');
            }}
            onDragLeave={(e) => e.currentTarget.classList.remove('border-rose-400', 'bg-rose-50')}
            onDrop={(e) => {
              e.preventDefault();
              e.currentTarget.classList.remove('border-rose-400', 'bg-rose-50');
              if (fileInputRef.current && e.dataTransfer.files.length > 0) {
                fileInputRef.current.files = e.dataTransfer.files;
                fileInputRef.current.dispatchEvent(new Event('change', { bubbles: true }));
              }
            }}
            className='flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-zinc-400 p-4 text-center transition-colors hover:border-sky-400 hover:bg-sky-50 sm:rounded-xl sm:p-6'
          >
            <div className='flex items-center justify-center rounded-xl bg-zinc-200 p-3'>
              <HugeiconsIcon icon={CloudDownloadIcon} size={30} className='text-zinc-500' />
            </div>
            <div>
              <p className='text-xs font-semibold text-zinc-800 sm:text-sm'>Drop file here</p>
              <p className='text-xs font-semibold text-zinc-500'>or click to browse</p>
            </div>
          </label>
        </div>
      </div>
    </div>
  );
}
