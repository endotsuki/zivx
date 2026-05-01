import { useState, useEffect, useRef } from 'react';
import { PageHeader } from './PageHeader';
import { DownloadControls } from './DownloadControls';
import { StatsCards } from './StatusCards';
import { DownloadTable } from './DownloadTable';

const RAW = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
export const API_BASE_URL = RAW.replace(/\/api$/, '').replace(/\/$/, '');

function getSessionId(): string {
  const key = 'vd_sid';
  let sid = sessionStorage.getItem(key);
  if (!sid) {
    sid = crypto.randomUUID();
    sessionStorage.setItem(key, sid);
  }
  return sid;
}
export const SESSION_ID = getSessionId();

export const apiFetch = (path: string, init?: RequestInit) =>
  fetch(`${API_BASE_URL}${path}${path.includes('?') ? '&' : '?'}session_id=${SESSION_ID}`, {
    ...init,
    headers: { 'X-Session-ID': SESSION_ID, ...(init?.headers ?? {}) },
  });

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

function getDownloadedIds(): Set<number> {
  try {
    return new Set(JSON.parse(sessionStorage.getItem('vd_dl_ids') || '[]'));
  } catch {
    return new Set();
  }
}
function markDownloaded(id: number) {
  const ids = getDownloadedIds();
  ids.add(id);
  sessionStorage.setItem('vd_dl_ids', JSON.stringify([...ids]));
}

export default function VideoDownloader() {
  const [videoLink, setVideoLink] = useState('');
  const [selectedDirectory, setSelectedDirectory] = useState<FileSystemDirectoryHandle | null>(null);
  const [stats, setStats] = useState<StatsData>({ total: 0, completed: 0, downloading: 0, queue: [] });
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let es: EventSource;
    let retry: ReturnType<typeof setTimeout>;
    const connect = () => {
      es = new EventSource(`${API_BASE_URL}/api/events?session_id=${SESSION_ID}`);
      es.onmessage = (e) => {
        try {
          setStats(JSON.parse(e.data));
        } catch {}
      };
      es.onerror = () => {
        es.close();
        retry = setTimeout(connect, 3000);
      };
    };
    connect();
    return () => {
      es?.close();
      clearTimeout(retry);
    };
  }, []);

  useEffect(() => {
    stats.queue.forEach(async (item) => {
      if (item.status !== 'Completed' || !item.filename) return;
      if (getDownloadedIds().has(item.id)) return;
      markDownloaded(item.id);

      if (selectedDirectory) {
        try {
          const res = await apiFetch(`/api/download/${item.id}`);
          if (!res.ok) throw new Error();
          const blob = await res.blob();
          const fh = await selectedDirectory.getFileHandle(item.filename, { create: true });
          const w = await fh.createWritable();
          await w.write(blob);
          await w.close();
          return;
        } catch {}
      }
      const a = document.createElement('a');
      a.href = `${API_BASE_URL}/api/download/${item.id}?session_id=${SESSION_ID}`;
      a.download = item.filename;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    });
  }, [stats.queue, selectedDirectory]);

  const queueSingle = async (format: 'video' | 'audio') => {
    const link = videoLink.trim();
    if (!link) return alert('Please enter a link');
    const res = await apiFetch('/api/queue', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ urls: [link], format }),
    });
    if (res.ok) {
      setStats(await res.json());
      setVideoLink('');
    }
  };

  const uploadList = async () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) return alert('Choose a .txt file');
    const fd = new FormData();
    fd.append('file', file);
    // Batch uploads default to video; adjust if you need format selection for batch too
    fd.append('format', 'video');
    const res = await apiFetch('/api/upload', { method: 'POST', body: fd });
    if (res.ok) {
      setStats(await res.json());
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const clearDownloads = async () => {
    const res = await apiFetch('/api/clear', { method: 'POST' });
    if (res.ok) {
      setStats(await res.json());
      setCurrentPage(1);
      sessionStorage.removeItem('vd_dl_ids');
    }
  };

  const cancelDownload = async (id: number) => {
    await apiFetch(`/api/cancel/${id}`, { method: 'POST' });
  };

  return (
    <div className='min-h-screen bg-[#f7f3eb] p-3 text-zinc-900 sm:p-4 md:p-6'>
      <div className='pointer-events-none fixed inset-0 -z-0 opacity-60 [background:radial-gradient(circle_at_85%_12%,#ffd3a6_0%,transparent_28%),radial-gradient(circle_at_12%_90%,#ffe9b8_0%,transparent_24%)]' />
      <div className='relative z-10 mx-auto w-full max-w-[1240px] space-y-3 px-2 sm:space-y-4 sm:px-4 md:space-y-5'>
        <PageHeader />
        <div className='rounded-xl border-[3px] border-zinc-900 bg-[#fffdfa] p-3 shadow-[4px_4px_0_0_#111827] sm:rounded-2xl sm:p-4 md:rounded-[28px] md:p-6 md:shadow-[8px_8px_0_0_#111827]'>
          <div className='mb-3 flex flex-wrap items-end justify-between gap-2 border-b-2 border-zinc-900/10 pb-2 sm:mb-4 sm:pb-3'>
            <h2 className='text-base font-black text-zinc-900 sm:text-lg md:text-xl'>Paste links and start downloading</h2>
          </div>
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
        <StatsCards
          total={stats.total}
          completed={stats.completed}
          downloading={stats.downloading}
          queued={stats.queue.filter((q) => q.status === 'Queued').length}
        />
        <div className='rounded-xl border-[3px] border-zinc-900 bg-[#fffdfa] p-3 shadow-[4px_4px_0_0_#111827] sm:rounded-2xl sm:p-4 md:rounded-[28px] md:p-6 md:shadow-[8px_8px_0_0_#111827]'>
          <div className='mb-3 border-b-2 border-zinc-900/10 pb-2 sm:mb-4 sm:pb-3'>
            <h2 className='text-base font-black text-zinc-900 sm:text-lg md:text-xl'>Download Queue</h2>
          </div>
          <DownloadTable
            queue={stats.queue}
            currentPage={currentPage}
            rowsPerPage={rowsPerPage}
            setCurrentPage={setCurrentPage}
            clearDownloads={clearDownloads}
            setRowsPerPage={setRowsPerPage}
            cancelDownload={cancelDownload}
          />
        </div>
      </div>
    </div>
  );
}
