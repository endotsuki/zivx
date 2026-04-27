import { Icon } from 'iconza';
import { Button } from '../ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Clapping02Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';

const supportedPlatforms = [
  { name: 'Facebook', icon: 'FacebookSquare' },
  { name: 'TikTok', icon: 'TikTok' },
  { name: 'Instagram', icon: 'Instagram' },
  { name: 'Pinterest', icon: 'Pinterest' },
  { name: 'Vimeo', icon: 'Vimeo' },
  { name: 'X', icon: 'X Dark' },
  { name: 'Twitch', icon: 'Twitch' },
  { name: 'Reddit', icon: 'Reddit' },
  { name: 'LinkedIn', icon: 'LinkedIn' },
  { name: 'Bilibili', icon: 'Bilibili' },
  { name: 'Snapchat', icon: 'Snapchat' },
  { name: 'VK', icon: 'VK' },
  { name: 'RedNote', icon: 'RedNote' },
];

export function PageHeader() {
  return (
    <div className='mb-6 flex flex-wrap items-center justify-between gap-4'>
      <div className='flex items-center gap-3'>
        <img src='/logo.png' alt='Logo' className='h-11 w-11' />
        <div>
          <h1 className='text-3xl font-black tracking-tight text-zinc-900'>Dovio</h1>
          <p className='text-xs font-semibold uppercase tracking-wider text-zinc-600'>Playful video downloader</p>
        </div>
      </div>

      <div className='flex items-center'>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='outline' className='select-none border-2 border-zinc-900 bg-white text-zinc-900 hover:bg-rose-100'>
              <HugeiconsIcon icon={Clapping02Icon} size={23} />
              Supported Services
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className='w-80 border-2 border-zinc-900 bg-[#fffdfa]'>
            <DropdownMenuLabel className='text-zinc-800'>Supported Platforms</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className='grid grid-cols-4 gap-2 p-2'>
              {supportedPlatforms.map((platform) => (
                <div
                  key={platform.name}
                  className='flex cursor-pointer flex-col items-center gap-1 rounded-xl p-2 transition-colors hover:bg-rose-100'
                >
                  <Icon name={platform.icon} className='h-6 w-6 text-zinc-700' />
                  <span className='text-xs text-zinc-700'>{platform.name}</span>
                </div>
              ))}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
