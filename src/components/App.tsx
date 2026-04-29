import { useState, useEffect, useRef, useCallback } from 'react';
import { PageHeader } from './PageHeader';
import { DownloadControls } from './DownloadControls';
import { StatsCards } from './StatusCards';
import { DownloadTable } from './DownloadTable';

const RAW_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
export const API_BASE_URL = RAW_API_URL.replace(/\/$/, '');

// ---------------------------------------------------------------------------
// Session ID — created once per browser, persisted in localStorage
// This isolates each user's queue from everyone else's
// ---------------------------------------------------------------------------
function getSessionId(): string {
  const key = 'vd_session_id';
  let id = localStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(key, id);
  }
  return id;
}

export const SESSION_ID = getSessionId();

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

// IDs of items already auto-downloaded — persisted so page reloads don't re-trigger
function getDownloadedIds(): Set<number> {
  try {
    const raw = localStorage.getItem('vd_downloaded_ids');
    return raw ? new Set(JSON.parse(raw) as number[]) : new Set();
  } catch {
    return new Set();
  }
}

function saveDownloadedId(id: number) {
  const ids = getDownloadedIds();
  ids.add(id);
  // Keep only last 200 to prevent unbounded growth
  const arr = [...ids].slice(-200);
  localStorage.setItem('vd_downloaded_ids', JSON.stringify(arr));
}

export function apiFetch(path: string, init?: RequestInit) {
  return fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      ...(init?.headers ?? {}),
      'X-Session-ID': SESSION_ID,
    },
  });
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface DownloadItem {
  id: number;
  url: string;
  status: string;
  progress: number;
  error?: string;
  filename?: string;
  filepath?: string;
  format?: string;
}

export interface StatsData {
  total: number;
  completed: number;
  downloading: number;
  queue: DownloadItem[];
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function App() {
  const [activeTab, setActiveTab] = useState<'video' | 'audio'>('video');
  const [videoLink, setVideoLink] = useState('');
  const [selectedDirectory, setSelectedDirectory] = useState<FileSystemDirectoryHandle | null>(null);
  const [stats, setStats] = useState<StatsData>({ total: 0, completed: 0, downloading: 0, queue: [] });
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ---------------------------------------------------------------------------
  // Fetch status on mount + poll every 2s
  // ---------------------------------------------------------------------------
  const fetchStatus = useCallback(async () => {
    try {
      const res = await apiFetch('/api/status');
      if (!res.ok) return;
      setStats(await res.json());
    } catch {
      /* network error, ignore */
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    const t = setInterval(fetchStatus, 2000);
    return () => clearInterval(t);
  }, [fetchStatus]);

  // ---------------------------------------------------------------------------
  // Auto-download completed items to browser — persisted across reloads
  // ---------------------------------------------------------------------------
  useEffect(() => {
    stats.queue.forEach(async (item) => {
      if (item.status !== 'Completed' || !item.filename) return;
      if (getDownloadedIds().has(item.id)) return; // already downloaded this session or before

      saveDownloadedId(item.id); // mark immediately to prevent double-trigger

      if (selectedDirectory) {
        try {
          const res = await apiFetch(`/api/download/${item.id}`);
          if (!res.ok) throw new Error('fetch failed');
          const blob = await res.blob();
          const fh = await selectedDirectory.getFileHandle(item.filename, { create: true });
          const w = await fh.createWritable();
          await w.write(blob);
          await w.close();
          return;
        } catch {
          // fall through to browser download
        }
      }

      // Browser download via hidden <a>
      const a = document.createElement('a');
      a.href = `${API_BASE_URL}/api/download/${item.id}`;
      a.download = item.filename;
      a.style.display = 'none';
      // Add session header isn't possible on <a> tags, so use fetch + blob URL instead
      try {
        const res = await apiFetch(`/api/download/${item.id}`);
        if (!res.ok) throw new Error('fetch failed');
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        a.href = url;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 10000);
      } catch {
        // last-resort fallback without session header
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    });
  }, [stats.queue, selectedDirectory]);

  // ---------------------------------------------------------------------------
  // Actions
  // ---------------------------------------------------------------------------

  const queueSingle = async () => {
    const link = videoLink.trim();
    if (!link) return alert('Please enter a link');
    try {
      const res = await apiFetch('/api/queue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urls: [link], format: activeTab }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setStats(await res.json());
      setVideoLink('');
    } catch (e) {
      console.error('Queue failed:', e);
    }
  };

  const uploadList = async () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) return alert('Choose a .txt file');
    const fd = new FormData();
    fd.append('file', file);
    fd.append('format', activeTab);
    try {
      const res = await apiFetch('/api/upload', { method: 'POST', body: fd });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setStats(await res.json());
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (e) {
      console.error('Upload failed:', e);
    }
  };

  const cancelItem = async (itemId: number) => {
    try {
      const res = await apiFetch(`/api/cancel/${itemId}`, { method: 'POST' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setStats(await res.json());
    } catch (e) {
      console.error('Cancel failed:', e);
    }
  };

  const clearDownloads = async () => {
    try {
      const res = await apiFetch('/api/clear', { method: 'POST' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setStats(await res.json());
      setCurrentPage(1);
      // Clear persisted download IDs when user explicitly clears queue
      localStorage.removeItem('vd_downloaded_ids');
    } catch (e) {
      console.error('Clear failed:', e);
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

        <StatsCards total={stats.total} completed={stats.completed} downloading={stats.downloading} queued={queuedCount} />

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
            cancelItem={cancelItem}
          />
        </div>
      </div>
    </div>
  );
}
