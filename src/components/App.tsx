import { useState, useEffect, useRef } from 'react';
import { PageHeader } from './PageHeader';
import { DownloadControls } from './DownloadControls';
import { StatsCards } from './StatusCards';
import { DownloadTable } from './DownloadTable';

const API_BASE_URL = import.meta.env.VITE_API_URL;

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
}

export interface StatsData {
  total: number;
  completed: number;
  downloading: number;
  queue: DownloadItem[];
}

export default function VideoDownloader() {
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
    const interval = setInterval(fetchStatus, 1000);
    return () => clearInterval(interval);
  }, []);

  // Auto-download when items become completed
  useEffect(() => {
    stats.queue.forEach(async (item) => {
      if (item.status === 'Completed' && item.filename && !downloadedItemsRef.current.has(item.id)) {
        downloadedItemsRef.current.add(item.id);

        // If user selected a directory, write directly to it
        if (selectedDirectory) {
          try {
            // Fetch the file from server
            const response = await fetch(`${API_BASE_URL}/download/${item.id}`);
            if (!response.ok) throw new Error('Failed to fetch file');

            const blob = await response.blob();

            // Write to selected directory using File System Access API
            const fileHandle = await selectedDirectory.getFileHandle(item.filename, { create: true });
            const writable = await fileHandle.createWritable();
            await writable.write(blob);
            await writable.close();

            console.log(`✓ Saved to selected folder: ${item.filename}`);
          } catch (error) {
            console.error('Error saving to selected directory:', error);
            // Fallback to browser download
            triggerBrowserDownload(item.id, item.filename);
          }
        } else {
          // No directory selected, use browser download
          triggerBrowserDownload(item.id, item.filename);
        }
      }
    });
  }, [stats.queue, selectedDirectory]);

  const triggerBrowserDownload = (itemId: number, filename: string) => {
    const downloadUrl = `${API_BASE_URL}/download/${itemId}`;
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const fetchStatus = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/status`);
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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ urls: [link] }),
      });
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

    try {
      const response = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      setStats(data);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Failed to upload file:', error);
    }
  };

  const clearDownloads = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/clear`, {
        method: 'POST',
      });
      const data = await response.json();
      setStats(data);
      setCurrentPage(1); // Reset to first page after clearing
    } catch (error) {
      console.error('Failed to clear downloads:', error);
    }
  };

  const queuedCount = stats.queue.filter((q) => q.status === 'Queued').length;

  return (
    <div className='min-h-screen bg-[#f7f3eb] p-4 text-zinc-900 sm:p-6'>
      <div className='pointer-events-none fixed inset-0 -z-0 opacity-60 [background:radial-gradient(circle_at_85%_12%,#ffd3a6_0%,transparent_28%),radial-gradient(circle_at_12%_90%,#ffe9b8_0%,transparent_24%)]' />
      <div className='relative z-10 mx-auto w-[95%] max-w-[1600px]'>
        <PageHeader />

        <div className='rounded-[28px] border-[3px] border-zinc-900 bg-[#fffdfa] p-4 shadow-[8px_8px_0_0_#111827] sm:p-6'>
          <DownloadControls
            videoLink={videoLink}
            setVideoLink={setVideoLink}
            selectedDirectory={selectedDirectory}
            setSelectedDirectory={setSelectedDirectory}
            queueSingle={queueSingle}
            uploadList={uploadList}
            fileInputRef={fileInputRef}
          />
        </div>

        <div className='mt-5'>
          <StatsCards total={stats.total} completed={stats.completed} downloading={stats.downloading} queued={queuedCount} />
        </div>

        <div className='rounded-[28px] border-[3px] border-zinc-900 bg-[#fffdfa] p-4 shadow-[8px_8px_0_0_#111827] sm:p-6'>
          <DownloadTable
            queue={stats.queue}
            currentPage={currentPage}
            rowsPerPage={rowsPerPage}
            setCurrentPage={setCurrentPage}
            clearDownloads={clearDownloads}
            setRowsPerPage={setRowsPerPage}
          />
        </div>

        {/* Footer */}
        <div className='mt-6 border-t-2 border-zinc-900/20 pt-6 text-center'>
          <p className='text-sm text-zinc-700'>
            Auto-refresh every <span className='font-semibold text-zinc-900'>1s</span> • Processing{' '}
            <span className='font-semibold text-zinc-900'>one by one</span> • Supports <span className='font-semibold text-zinc-900'>500+ links</span>
          </p>
          <p className='mt-2 select-none text-sm text-zinc-600'>&copy; {new Date().getFullYear()} MMO &bull; All rights reserved</p>
        </div>
      </div>
    </div>
  );
}
