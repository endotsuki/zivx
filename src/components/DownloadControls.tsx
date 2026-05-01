import { type RefObject } from 'react';
import { Button } from '../ui/button';
import { HugeiconsIcon } from '@hugeicons/react';
import { Delete01Icon, CloudDownloadIcon, Folder03Icon, Task02Icon, MusicNote03Icon, VideoAiIcon } from '@hugeicons/core-free-icons';
import { AnimatePresence, motion } from 'framer-motion';

interface DownloadControlsProps {
  videoLink: string;
  setVideoLink: (value: string) => void;
  selectedDirectory: FileSystemDirectoryHandle | null;
  setSelectedDirectory: (handle: FileSystemDirectoryHandle | null) => void;
  queueSingle: (format: 'video' | 'audio') => void;
  uploadList: () => void;
  fileInputRef: RefObject<HTMLInputElement>;
}

const inputBase =
  'w-full rounded-2xl border-2 border-zinc-900 bg-white px-4 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 outline-none transition-colors focus:border-rose-500 focus:ring-2 focus:ring-rose-200';

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
    if (!('showDirectoryPicker' in window)) {
      alert('Directory picker is not supported in this browser. Please use Chrome, Edge, or Opera.');
      return;
    }
    try {
      const directoryHandle = await (window as any).showDirectoryPicker({ mode: 'readwrite' });
      setSelectedDirectory(directoryHandle);
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error('Error selecting directory:', error);
        alert('Failed to select directory. Please try again.');
      }
    }
  };

  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setVideoLink(text);
    } catch (error) {
      console.error('Failed to read clipboard:', error);
    }
  };

  return (
    <div className='space-y-6'>
      {/* ── URL Input + Action Buttons ── */}
      <div>
        <label className='mb-1.5 block font-black uppercase tracking-wider'>URL</label>
        <div className='flex flex-col gap-2'>
          {/* Input row */}
          <div className='relative flex-1'>
            <input
              className={`h-14 w-full min-w-0 rounded-2xl pr-24 ${inputBase}`}
              type='text'
              placeholder='Paste video or audio URL…'
              value={videoLink}
              onChange={(e) => setVideoLink(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && queueSingle('video')}
            />
            <div className='absolute right-1.5 top-1/2 flex -translate-y-1/2 items-center rounded-xl border border-zinc-400 bg-zinc-100 p-1.5'>
              <Button variant='ghost' size='icon' onClick={handlePasteFromClipboard} className='h-7 w-auto rounded-lg'>
                <HugeiconsIcon icon={Task02Icon} size={16} className='text-sky-500' />
                Paste link
              </Button>
            </div>
          </div>

          {/* Two action buttons */}
          <div className='flex gap-2'>
            <Button
              variant='on-hold'
              onClick={() => queueSingle('video')}
              className='h-12 flex-1 rounded-2xl border-2 border-zinc-900 bg-rose-500 px-6 text-base font-semibold text-white hover:bg-rose-600'
            >
              <HugeiconsIcon icon={VideoAiIcon} size={20} />
              Download MP4
            </Button>

            <Button
              variant='on-hold'
              onClick={() => queueSingle('audio')}
              className='h-12 flex-1 rounded-2xl border-2 border-zinc-900 bg-violet-600 px-6 text-base font-semibold text-white hover:bg-violet-700'
            >
              <HugeiconsIcon icon={MusicNote03Icon} size={20} />
              Extract MP3
            </Button>
          </div>
        </div>
      </div>

      {/* ── Save Folder + Batch Upload ── */}
      <div className='grid gap-3 border-t-2 border-zinc-900/20 pt-5 lg:grid-cols-2'>
        <div className='space-y-2 rounded-2xl border-2 border-zinc-900 bg-zinc-50 p-3'>
          <div>
            <p className='text-sm font-black uppercase tracking-wider text-zinc-700'>Save Location</p>
            <p className='text-sm text-zinc-500'>Choose where completed files are saved.</p>
          </div>
          <div className='flex min-w-0 flex-col gap-2 sm:flex-row'>
            <motion.button
              layout
              type='button'
              onClick={handleSelectDirectory}
              className='flex min-h-[46px] min-w-0 flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-zinc-900 bg-white px-4 text-zinc-600 transition-colors hover:bg-rose-50 hover:text-rose-600'
            >
              <AnimatePresence mode='popLayout'>
                {selectedDirectory ? (
                  <motion.span
                    key='selected'
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className='flex min-w-0 items-center justify-center truncate'
                  >
                    <HugeiconsIcon icon={Folder03Icon} size={20} className='mr-1 flex-shrink-0 text-sky-500 text-transparent' />
                    <span className='truncate font-semibold'>{selectedDirectory.name}</span>
                  </motion.span>
                ) : (
                  <motion.span
                    key='default'
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className='flex items-center gap-2 font-semibold'
                  >
                    <HugeiconsIcon icon={Folder03Icon} size={20} />
                    Choose Folder
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>

            <AnimatePresence>
              {selectedDirectory && (
                <motion.button
                  key='clear'
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  onClick={() => setSelectedDirectory(null)}
                  className='flex h-[46px] items-center justify-center gap-1 rounded-xl border-2 border-zinc-900 bg-white px-3 text-zinc-600 transition-colors hover:bg-rose-50 hover:text-red-500 sm:min-w-[96px]'
                >
                  <HugeiconsIcon icon={Delete01Icon} size={20} />
                  Clear
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className='space-y-2.5 rounded-2xl border-2 border-zinc-900 bg-zinc-50 p-3'>
          <div>
            <p className='text-sm font-black uppercase tracking-wider text-zinc-700'>Batch Upload</p>
            <p className='text-sm text-zinc-500'>
              Drop a <code className='rounded bg-zinc-200 px-1 py-0.5 text-xs'>.txt</code> file with one URL per line.
            </p>
          </div>

          <input ref={fileInputRef} type='file' accept='.txt' className='hidden' id='batch-file' onChange={uploadList} />

          <label
            htmlFor='batch-file'
            onDragOver={(e) => {
              e.preventDefault();
              e.currentTarget.classList.add('border-rose-400', 'bg-rose-50');
            }}
            onDragLeave={(e) => {
              e.currentTarget.classList.remove('border-rose-400', 'bg-rose-50');
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.currentTarget.classList.remove('border-rose-400', 'bg-rose-50');
              if (fileInputRef.current && e.dataTransfer.files.length > 0) {
                fileInputRef.current.files = e.dataTransfer.files;
                const event = new Event('change', { bubbles: true });
                fileInputRef.current.dispatchEvent(event);
              }
            }}
            className='flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-zinc-400 p-6 text-center transition-colors hover:border-rose-400 hover:bg-rose-50'
          >
            <div className='flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-200'>
              <HugeiconsIcon icon={CloudDownloadIcon} size={18} className='text-zinc-500' />
            </div>
            <div>
              <p className='text-sm font-semibold text-zinc-800'>Drop file here</p>
              <p className='text-xs text-zinc-500'>or click to browse</p>
            </div>
          </label>
        </div>
      </div>
    </div>
  );
}
