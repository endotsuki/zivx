import { type RefObject } from 'react';
import { Button } from '../ui/button';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Delete01Icon,
  Download01Icon,
  Download05Icon,
  Folder01Icon,
  Task02Icon,
  MusicNote03Icon,
  Video01Icon,
} from '@hugeicons/core-free-icons';
import { AnimatePresence, motion } from 'framer-motion';

interface DownloadControlsProps {
  videoLink: string;
  setVideoLink: (value: string) => void;
  selectedDirectory: FileSystemDirectoryHandle | null;
  setSelectedDirectory: (handle: FileSystemDirectoryHandle | null) => void;
  queueSingle: () => void;
  uploadList: () => void;
  fileInputRef: RefObject<HTMLInputElement>;
  activeTab: 'video' | 'audio';
  setActiveTab: (tab: 'video' | 'audio') => void;
}

const inputBase =
  'w-full rounded-2xl border-2 border-zinc-900 bg-white px-4 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 outline-none transition-colors focus:border-orange-500 focus:ring-2 focus:ring-orange-200';

export function DownloadControls({
  videoLink,
  setVideoLink,
  selectedDirectory,
  setSelectedDirectory,
  queueSingle,
  uploadList,
  fileInputRef,
  activeTab,
  setActiveTab,
}: DownloadControlsProps) {
  const isAudio = activeTab === 'audio';

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
      {/* ── Video / Audio Tab Switcher ── */}
      <div className='flex w-fit gap-2 rounded-2xl border-2 border-zinc-900 bg-zinc-100 p-1'>
        {(['video', 'audio'] as const).map((tab) => (
          <motion.button
            key={tab}
            type='button'
            onClick={() => setActiveTab(tab)}
            className={`relative flex items-center gap-2 rounded-xl px-5 py-2 text-sm font-bold transition-colors ${
              activeTab === tab ? 'text-white' : 'text-zinc-500 hover:text-zinc-800'
            }`}
          >
            {activeTab === tab && (
              <motion.div
                layoutId='activeTabBg'
                className={`absolute inset-0 rounded-xl ${tab === 'audio' ? 'bg-violet-600' : 'bg-orange-500'}`}
                transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
              />
            )}
            <span className='relative z-10 flex items-center gap-1.5'>
              <HugeiconsIcon icon={tab === 'video' ? Video01Icon : MusicNote03Icon} size={16} />
              {tab === 'video' ? 'Video' : 'Audio (MP3)'}
            </span>
          </motion.button>
        ))}
      </div>

      {/* ── URL Input + Action Button ── */}
      <div>
        <label className='mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-700'>
          {isAudio ? 'Audio URL' : 'Single URL'}
        </label>
        <div className='relative flex flex-col gap-2 sm:flex-row sm:items-stretch sm:gap-3'>
          <div className='relative flex-1'>
            <input
              className={`h-12 w-full min-w-0 rounded-2xl pr-24 ${inputBase}`}
              type='text'
              placeholder={isAudio ? 'Paste URL to extract MP3…' : 'Paste video URL…'}
              value={videoLink}
              onChange={(e) => setVideoLink(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && queueSingle()}
            />
            {/* Paste from clipboard */}
            <div className='absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1 rounded-xl border border-zinc-200 bg-zinc-50 px-1 py-1'>
              <Button variant='ghost' size='icon' onClick={handlePasteFromClipboard} className='h-7 w-7 rounded-lg'>
                <HugeiconsIcon icon={Task02Icon} size={16} className='text-orange-500' />
              </Button>
            </div>
          </div>

          <Button
            variant='on-hold'
            onClick={queueSingle}
            className={`h-12 shrink-0 rounded-2xl border-2 border-zinc-900 px-6 text-base font-semibold text-white sm:w-auto ${
              isAudio ? 'bg-violet-600 hover:bg-violet-700' : 'bg-orange-500 hover:bg-orange-600'
            }`}
          >
            <HugeiconsIcon icon={isAudio ? MusicNote03Icon : Download01Icon} size={20} />
            {isAudio ? 'Extract MP3' : 'Download'}
          </Button>
        </div>

        {/* Hint text */}
        <p className='mt-1.5 text-xs text-zinc-500'>
          {isAudio
            ? 'Works with YouTube, SoundCloud, and most video sites — audio only, no video.'
            : 'Supports YouTube, TikTok (video & photo posts), and 1000+ sites.'}
        </p>
      </div>

      {/* ── Save Folder + Batch Upload ── */}
      <div className='flex flex-col gap-4 border-t-2 border-zinc-900/20 pt-5 sm:flex-row sm:items-center'>
        <motion.div layout className='flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:gap-3'>
          <span className='shrink-0 text-xs font-semibold uppercase tracking-wider text-zinc-700'>Save to</span>

          <motion.div layout className='flex min-w-0 flex-1 flex-col gap-2 sm:flex-row'>
            {/* Directory picker */}
            <motion.button
              layout
              type='button'
              onClick={handleSelectDirectory}
              className={`flex min-h-[46px] min-w-0 flex-1 items-center ${inputBase} cursor-pointer`}
            >
              <AnimatePresence mode='popLayout'>
                {selectedDirectory ? (
                  <motion.span
                    key='selected'
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className='flex min-w-0 items-center truncate text-zinc-700'
                  >
                    <HugeiconsIcon icon={Folder01Icon} size={20} className='mr-1 fill-orange-500 text-transparent' />
                    {selectedDirectory.name}
                  </motion.span>
                ) : (
                  <motion.span
                    key='default'
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className='text-zinc-500'
                  >
                    Browser default
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>

            {/* Clear directory */}
            <AnimatePresence>
              {selectedDirectory && (
                <motion.button
                  key='clear'
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  onClick={() => setSelectedDirectory(null)}
                  className='flex h-[46px] items-center gap-1 rounded-xl border-2 border-zinc-900 bg-white px-3 text-zinc-600 transition-colors hover:bg-rose-50 hover:text-red-500'
                >
                  <HugeiconsIcon icon={Delete01Icon} size={20} />
                  Clear
                </motion.button>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>

        <div className='hidden h-8 w-px shrink-0 bg-zinc-300 sm:block' />

        {/* Batch .txt upload */}
        <div className='flex flex-wrap items-center gap-2'>
          <input ref={fileInputRef} type='file' accept='.txt' className='hidden' id='batch-file' onChange={uploadList} />
          <Button variant='archived' className='h-[46px] rounded-2xl px-4'>
            <label htmlFor='batch-file' className='inline-flex cursor-pointer items-center justify-center gap-2'>
              <HugeiconsIcon icon={Download05Icon} size={20} />
              Batch link .txt
            </label>
          </Button>
        </div>
      </div>
    </div>
  );
}
