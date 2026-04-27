import { useState, useEffect, useRef } from 'react';
import { PageHeader } from './PageHeader';
import { DownloadControls } from './DownloadControls';
import { StatsCards } from './StatusCards';
import { DownloadTable } from './DownloadTable';

// Export so TableRow and other components can import the same base URL
// .replace strips the trailing slash from .env values like "https://example.com/"
const RAW_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
export const API_BASE_URL = RAW_API_URL.replace(/\/$/, '');

export interface DownloadItem {
  id: number;
  url: string;
  status: string;
  progress: number;
  error?: string;
  filename?: string;
  filepath?: string;
  size?: string;
  duration?: string;
  format?: string;
}

export interface StatsData {
  total: number;
  completed: number;
  downloading: number;
  queue: DownloadItem[];
}

export default function VideoDownloader() {
  // ✅ ALL hooks are inside the component function
  const [activeTab, setActiveTab] = useState<'video' | 'audio'>('video');
  const [videoLink, setVideoLink] = useState('');
  const [selectedDirectory, setSelectedDirectory] = useState<FileSystemDirectoryHandle | null>(null);
  const [stats, setStats] = useState<StatsData>({
    total: 0,
    completed: 0,
    downloading: 0,
    queue: [],
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const downloadedItemsRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 2000);
    return () => clearInterval(interval);
  }, []);

  // Auto-trigger browser download when an item reaches Completed
  useEffect(() => {
    stats.queue.forEach(async (item) => {
      if (item.status === 'Completed' && item.filename && !downloadedItemsRef.current.has(item.id)) {
        downloadedItemsRef.current.add(item.id);

        if (selectedDirectory) {
          try {
            const response = await fetch(`${API_BASE_URL}/download/${item.id}`);
            if (!response.ok) throw new Error('Failed to fetch file');
            const blob = await response.blob();
            const fileHandle = await selectedDirectory.getFileHandle(item.filename, { create: true });
            const writable = await fileHandle.createWritable();
            await writable.write(blob);
            await writable.close();
            console.log(`✓ Saved to folder: ${item.filename}`);
          } catch (error) {
            console.error('Directory save failed, falling back to browser download:', error);
            triggerBrowserDownload(item.id, item.filename);
          }
        } else {
          triggerBrowserDownload(item.id, item.filename);
        }
      }
    });
  }, [stats.queue, selectedDirectory]);

  const triggerBrowserDownload = (itemId: number, filename: string) => {
    const link = document.createElement('a');
    link.href = `${API_BASE_URL}/download/${itemId}`;
    link.download = filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const fetchStatus = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/status`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch status:', error);
    }
  };

  const queueSingle = async () => {
    const link = videoLink.trim();
    if (!link) {
      alert('Please enter a link');
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/queue`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urls: [link], format: activeTab }),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      setStats(data);
      setVideoLink('');
    } catch (error) {
      console.error('Failed to queue download:', error);
    }
  };

  const uploadList = async () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      alert('Choose .txt file');
      return;
    }
    const formData = new FormData();
    formData.append('file', file);
    formData.append('format', activeTab);
    try {
      const response = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      setStats(data);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (error) {
      console.error('Failed to upload file:', error);
    }
  };

  const clearDownloads = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/clear`, { method: 'POST' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      setStats(data);
      setCurrentPage(1);
    } catch (error) {
      console.error('Failed to clear downloads:', error);
    }
  };

  const queuedCount = stats.queue.filter((q) => q.status === 'Queued').length;

  return (
    <div className='min-h-screen bg-[#f7f3eb] p-4 text-zinc-900 sm:p-6'>
      <div className='pointer-events-none fixed inset-0 -z-0 opacity-60 [background:radial-gradient(circle_at_85%_12%,#ffd3a6_0%,transparent_28%),radial-gradient(circle_at_12%_90%,#ffe9b8_0%,transparent_24%)]' />
      <div className='relative z-10 mx-auto w-[95%] max-w-[1240px] space-y-5'>
        <PageHeader />

        <div className='rounded-[28px] border-[3px] border-zinc-900 bg-[#fffdfa] p-4 shadow-[8px_8px_0_0_#111827] sm:p-6'>
          <div className='mb-4 flex flex-wrap items-end justify-between gap-2 border-b-2 border-zinc-900/10 pb-3'>
            <div>
              <p className='text-xs font-semibold uppercase tracking-widest text-zinc-600'>Quick Add</p>
              <h2 className='text-lg font-black text-zinc-900 sm:text-xl'>Paste links and start downloading</h2>
            </div>
            <p className='text-xs text-zinc-600'>Tip: Press Enter to submit quickly</p>
          </div>
          <DownloadControls
            videoLink={videoLink}
            setVideoLink={setVideoLink}
            selectedDirectory={selectedDirectory}
            setSelectedDirectory={setSelectedDirectory}
            queueSingle={queueSingle}
            uploadList={uploadList}
            fileInputRef={fileInputRef}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
        </div>

        <div>
          <StatsCards total={stats.total} completed={stats.completed} downloading={stats.downloading} queued={queuedCount} />
        </div>

        <div className='rounded-[28px] border-[3px] border-zinc-900 bg-[#fffdfa] p-4 shadow-[8px_8px_0_0_#111827] sm:p-6'>
          <div className='mb-4 border-b-2 border-zinc-900/10 pb-3'>
            <p className='text-xs font-semibold uppercase tracking-widest text-zinc-600'>Activity</p>
            <h2 className='text-lg font-black text-zinc-900 sm:text-xl'>Download Queue</h2>
          </div>
          <DownloadTable
            queue={stats.queue}
            currentPage={currentPage}
            rowsPerPage={rowsPerPage}
            setCurrentPage={setCurrentPage}
            clearDownloads={clearDownloads}
            setRowsPerPage={setRowsPerPage}
          />
        </div>
      </div>
    </div>
  );
}
